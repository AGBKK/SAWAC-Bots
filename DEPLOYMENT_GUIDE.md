# 🚀 SAWAC Telegram Bot - Railway Deployment Guide

## Quick Deployment Steps

### 1. Create GitHub Repository
```bash
# Create a new repository on GitHub called "sawac-telegram-bot"
# Then push this code:
git remote add origin https://github.com/YOUR_USERNAME/sawac-telegram-bot.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `sawac-telegram-bot` repository
6. Railway will automatically detect it's a Node.js app

### 3. Configure Environment Variables
In Railway dashboard, add these variables:
```
TELEGRAM_BOT_TOKEN=8274836874:AAHXKZsTgilIxSh34IdRx1yy-m55aQTAINI
TELEGRAM_GROUP_ID=YOUR_GROUP_ID
GITHUB_TOKEN=YOUR_GITHUB_TOKEN
GITHUB_REPO=AGBKK/sawac-web
TESTING_EMAIL=info@sawac.io
TESTING_GROUP_LINK=https://t.me/SawacTesting
SAWAC_TOKEN_ADDRESS=0xA9B266b3cee8691b0b3ecE2FdEF7e89C4e0d34F3
USDT_TOKEN_ADDRESS=0x101a13505A7ae2d2C72AC74a4c26732100852455
LOG_LEVEL=info
```

### 4. Get Telegram Group ID
```bash
# Send a message to your bot and check:
curl -s "https://api.telegram.org/bot8274836874:AAHXKZsTgilIxSh34IdRx1yy-m55aQTAINI/getUpdates"
```

### 5. Deploy
- Railway will automatically deploy when you push to GitHub
- Check the logs in Railway dashboard
- Bot will be running 24/7!

## Benefits of Railway Deployment

✅ **24/7 Operation** - No more local computer dependency  
✅ **Auto-restart** - Bot restarts if it crashes  
✅ **Better Performance** - No more timeouts  
✅ **Easy Updates** - Just push to GitHub  
✅ **Monitoring** - Built-in logs and metrics  
✅ **Free Tier** - 500 hours/month free  

## Local Development
```bash
# For testing locally:
npm install
cp env.example .env
# Edit .env with your values
npm start
```

## Troubleshooting

### Bot not responding:
1. Check Railway logs
2. Verify TELEGRAM_BOT_TOKEN is correct
3. Make sure bot is added to group

### Environment variables:
1. All variables must be set in Railway dashboard
2. No .env file needed in production
3. Restart deployment after changing variables

### Updates:
1. Edit code locally
2. `git add . && git commit -m "Update" && git push`
3. Railway auto-deploys

## Next Steps After Deployment

1. ✅ Test bot commands in Telegram
2. ✅ Add bot to SAWAC Community Testing group
3. ✅ Test privacy features
4. ✅ Verify token request handling
5. ✅ Monitor logs for any issues

The bot will now run 24/7 without depending on your local computer! 🎉 