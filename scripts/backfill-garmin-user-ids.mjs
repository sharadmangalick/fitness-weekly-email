#!/usr/bin/env node
/**
 * One-shot backfill: populate platform_connections.garmin_user_id for every
 * existing Garmin connection by decrypting its token blob and reading the
 * Garmin user id Garmin returned during OAuth token exchange.
 *
 * Run AFTER applying migration 20260427_garmin_routing_fix.sql, and BEFORE
 * deploying the new webhook routing code (the new router uses this column).
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   ENCRYPTION_KEY=... node scripts/backfill-garmin-user-ids.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createDecipheriv, scryptSync } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const encryptionKey = process.env.ENCRYPTION_KEY

if (!supabaseUrl || !supabaseServiceKey || !encryptionKey) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ENCRYPTION_KEY')
  process.exit(1)
}

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const derivedKey = scryptSync(encryptionKey, 'salt', KEY_LENGTH)

function decryptTokens(tokensEncrypted, iv) {
  const [encrypted, authTag] = tokensEncrypted.split(':')
  const decipher = createDecipheriv(ALGORITHM, derivedKey, Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(authTag, 'base64'))
  let decrypted = decipher.update(encrypted, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return JSON.parse(decrypted)
}

/**
 * Garmin's OAuth 2.0 token endpoint doesn't return a user id at the top
 * level — it's embedded in the access token JWT as the `garmin_guid`
 * claim. Pull it out by base64-decoding the middle segment.
 */
function extractGarminGuid(accessToken) {
  if (!accessToken || typeof accessToken !== 'string') return null
  const parts = accessToken.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
    return payload.garmin_guid || payload.sub || null
  } catch {
    return null
  }
}

function findGarminUserId(tokens) {
  // Direct field (rarely populated, but check first for forward compat).
  if (tokens?.user_id) return tokens.user_id
  // Current shape: top-level access_token JWT.
  const fromTop = extractGarminGuid(tokens?.access_token)
  if (fromTop) return fromTop
  // Legacy shape: oauth1+oauth2 nested.
  const fromNested = extractGarminGuid(tokens?.oauth2_token?.access_token)
  if (fromNested) return fromNested
  return null
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data: rows, error } = await supabase
    .from('platform_connections')
    .select('id, user_id, status, tokens_encrypted, iv, garmin_user_id')
    .eq('platform', 'garmin')

  if (error) {
    console.error('Failed to read platform_connections:', error.message)
    process.exit(1)
  }

  console.log(`Found ${rows.length} Garmin connections`)

  let updated = 0
  let alreadySet = 0
  let decryptFailed = 0
  let missingUserId = 0
  const conflicts = []

  for (const row of rows) {
    if (row.garmin_user_id) {
      alreadySet++
      continue
    }

    let tokens
    try {
      tokens = decryptTokens(row.tokens_encrypted, row.iv)
    } catch (err) {
      decryptFailed++
      console.warn(`✗ ${row.id} (${row.status}): decrypt failed — ${err.message}`)
      continue
    }

    const garminUserId = findGarminUserId(tokens)
    if (!garminUserId) {
      missingUserId++
      console.warn(`✗ ${row.id} (${row.status}): no garmin user id in tokens or access-token JWT`)
      continue
    }

    const { error: updateErr } = await supabase
      .from('platform_connections')
      .update({ garmin_user_id: garminUserId })
      .eq('id', row.id)

    if (updateErr) {
      // Most likely the partial-unique index on (garmin_user_id) WHERE active.
      conflicts.push({ id: row.id, user_id: row.user_id, garmin_user_id: garminUserId, error: updateErr.message })
      console.warn(`✗ ${row.id} (${row.status}): update failed — ${updateErr.message}`)
      continue
    }

    updated++
    console.log(`✓ ${row.id} (${row.status}): garmin_user_id = ${garminUserId}`)
  }

  console.log('')
  console.log('── Summary ──')
  console.log(`Total rows:       ${rows.length}`)
  console.log(`Already set:      ${alreadySet}`)
  console.log(`Updated:          ${updated}`)
  console.log(`Decrypt failed:   ${decryptFailed}`)
  console.log(`Missing user_id:  ${missingUserId}`)
  console.log(`Update conflicts: ${conflicts.length}`)

  if (conflicts.length > 0) {
    console.log('')
    console.log('Conflicts (likely duplicate active connections for the same Garmin account):')
    for (const c of conflicts) {
      console.log(`  - ${c.id} → ${c.garmin_user_id}: ${c.error}`)
    }
  }
}

main().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
