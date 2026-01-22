import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  // Derive a 32-byte key from the provided key using scrypt
  return scryptSync(key, 'salt', KEY_LENGTH)
}

export interface EncryptedData {
  encrypted: string
  iv: string
  authTag: string
}

/**
 * Encrypts data using AES-256-GCM
 */
export function encrypt(data: string): EncryptedData {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(data, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag()

  return {
    encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  }
}

/**
 * Decrypts data encrypted with AES-256-GCM
 */
export function decrypt(encryptedData: EncryptedData): string {
  const key = getKey()
  const iv = Buffer.from(encryptedData.iv, 'base64')
  const authTag = Buffer.from(encryptedData.authTag, 'base64')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Encrypts tokens object and returns data suitable for database storage
 */
export function encryptTokens(tokens: object): { tokens_encrypted: string; iv: string } {
  const tokenString = JSON.stringify(tokens)
  const { encrypted, iv, authTag } = encrypt(tokenString)

  // Combine encrypted data and auth tag for storage
  return {
    tokens_encrypted: `${encrypted}:${authTag}`,
    iv
  }
}

/**
 * Decrypts tokens from database storage format
 */
export function decryptTokens<T = object>(tokens_encrypted: string, iv: string): T {
  const [encrypted, authTag] = tokens_encrypted.split(':')

  const decrypted = decrypt({ encrypted, iv, authTag })
  return JSON.parse(decrypted) as T
}
