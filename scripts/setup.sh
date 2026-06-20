#!/bin/bash
set -e
echo "🏨 Horizon Stays — Setup Script"
echo "================================"
echo "📦 Installing dependencies..."
npm install
echo "🔗 Linking Supabase (update YOUR_PROJECT_REF below)..."
# npx supabase link --project-ref YOUR_PROJECT_REF
# npx supabase db push
# npx supabase db seed
echo "✅ Setup complete! Run: npm run dev"
echo ""
echo "⚠️  Remember to:"
echo "  1. Copy .env.local.example to .env.local"
echo "  2. Fill in all environment variables"
echo "  3. Run: npx supabase link --project-ref YOUR_REF"
echo "  4. Run: npx supabase db push"
