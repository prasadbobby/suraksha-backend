#!/bin/bash

# Suraksha Backend Deployment Script

echo "🚀 Deploying Suraksha Backend to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to production with environment variables
vercel --prod \
  --name suraksha-backend \
  --env MONGODB_URI="$MONGODB_URI" \
  --env JWT_SECRET="$JWT_SECRET" \
  --env RESEND_API_KEY="$RESEND_API_KEY" \
  --env EMAIL_FROM="$EMAIL_FROM" \
  --env ELEVEN_LABS_API_KEY="$ELEVEN_LABS_API_KEY" \
  --env NODE_ENV="production" \
  --env PORT="3000"

echo "✅ Backend deployment completed!"
echo "🌐 Your API will be available at the Vercel URL provided above"
echo ""
echo "📝 Next steps:"
echo "1. Update the frontend API_BASE_URL in src/lib/api.ts"
echo "2. Test the deployed API endpoints"
echo "3. Deploy the frontend if needed"