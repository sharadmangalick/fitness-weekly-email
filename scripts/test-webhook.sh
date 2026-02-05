#!/bin/bash
# Test script for Stripe webhook with comprehensive logging

set -e

echo "=== Stripe Webhook Testing Script ==="
echo ""

# Check if stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Install it with:"
    echo "   brew install stripe/stripe-cli/stripe"
    exit 1
fi

echo "✅ Stripe CLI found"
echo ""

# Check if server is running
echo "Checking if Next.js server is running on localhost:3000..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Server not running. Start it with: npm run dev"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Start listening to webhooks
echo "🎧 Starting webhook listener..."
echo "Press Ctrl+C to stop"
echo ""

stripe listen --forward-to localhost:3000/api/donate/webhook

# Note: To trigger test events in another terminal, use:
# stripe trigger checkout.session.completed
