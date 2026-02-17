#!/bin/bash
# Quick deploy script
# Replace HOOK_URL with your actual deploy hook URL from Vercel

HOOK_URL="https://api.vercel.com/v1/integrations/deploy/prj_cgduuK6raeJ7HrXsJOgeXZyzoZc4/4HiGZsOBmy"

echo "🚀 Triggering Vercel deployment..."
curl -X POST "$HOOK_URL"
echo ""
echo "✅ Deployment triggered! Check Vercel dashboard."
