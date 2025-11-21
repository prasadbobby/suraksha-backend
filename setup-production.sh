#!/bin/bash

# Suraksha Backend Production Setup Script

echo "🏗️  Setting up Suraksha Backend for Production"
echo "=============================================="

# Check if environment variables are set
check_env_var() {
    if [ -z "${!1}" ]; then
        echo "❌ Environment variable $1 is not set"
        return 1
    else
        echo "✅ $1 is set"
        return 0
    fi
}

echo ""
echo "📋 Checking required environment variables..."

required_vars=("MONGODB_URI" "JWT_SECRET" "RESEND_API_KEY" "EMAIL_FROM")
all_set=true

for var in "${required_vars[@]}"; do
    if ! check_env_var "$var"; then
        all_set=false
    fi
done

# Check optional variables
optional_vars=("ELEVEN_LABS_API_KEY" "TWILIO_ACCOUNT_SID" "TWILIO_AUTH_TOKEN" "TWILIO_PHONE_NUMBER")
echo ""
echo "📋 Checking optional environment variables..."

for var in "${optional_vars[@]}"; do
    check_env_var "$var" || echo "⚠️  $var is not set (optional)"
done

echo ""
if [ "$all_set" = true ]; then
    echo "✅ All required environment variables are set!"
else
    echo "❌ Some required environment variables are missing."
    echo "Please set them and run this script again."
    echo ""
    echo "Required variables:"
    for var in "${required_vars[@]}"; do
        echo "  export $var=\"your-value-here\""
    done
    exit 1
fi

echo ""
echo "🔧 Installing dependencies..."
npm install

echo ""
echo "🧪 Running a quick test..."
timeout 10s npm start &
TEST_PID=$!
sleep 5

if kill -0 $TEST_PID 2>/dev/null; then
    echo "✅ Backend starts successfully!"
    kill $TEST_PID
else
    echo "❌ Backend failed to start. Check your configuration."
    exit 1
fi

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. For Vercel: Run './deploy.sh'"
echo "2. For Docker: Run 'docker-compose up --build'"
echo "3. For manual deployment: Use the DEPLOYMENT.md guide"
echo ""
echo "🌐 Your backend will be available at the deployed URL"
echo "📝 Remember to update the frontend API_BASE_URL after deployment"