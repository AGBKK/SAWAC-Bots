# 🔄 SAWAC Telegram Bot - Restart Guide

## 🚀 **Quick Start (When You Return)**

### **1. Navigate to Project**
```bash
cd /Users/andregehrmann/sawac-workspace/sawac-bots/telegram-bot
```

### **2. Check Current Status**
```bash
# Check git status
git status

# Check if bot is running on Railway
# Go to: https://railway.app/dashboard
# Look for your SAWAC bot project
```

### **3. Verify Bot Token**
```bash
# Test current token (may be expired)
curl -s "https://api.telegram.org/bot8274836874:AAHXKZsTgilIxSh34IdRx1yy-m55aQTAINI/getMe"
```

**If token is invalid:**
1. Message @BotFather on Telegram
2. Use `/mybots` to see your bots
3. Get the current token for SAWAC bot
4. Update in Railway environment variables

---

## 🔧 **Common Tasks**

### **Test Bot Locally**
```bash
# Install dependencies
npm install

# Create .env file
cp env.example .env
# Edit .env with your bot token

# Run locally
npm start
```

### **Deploy Changes**
```bash
# Make your changes
git add .
git commit -m "Your change description"
git push origin main
# Railway auto-deploys
```

### **Check Railway Logs**
1. Go to https://railway.app/dashboard
2. Find your SAWAC bot project
3. Click on the deployment
4. Check "Logs" tab for any errors

### **Update Environment Variables**
1. Go to Railway dashboard
2. Select your project
3. Go to "Variables" tab
4. Update `TELEGRAM_BOT_TOKEN` if needed

---

## 📱 **Bot Testing Checklist**

### **Test Commands:**
- [ ] `/start` - Welcome message
- [ ] `/help` - Help menu
- [ ] `/rewards` - Rewards info
- [ ] `/tokens` - Token request
- [ ] `/setup` - Setup instructions
- [ ] `/report` - Bug report
- [ ] `/status` - Testing status
- [ ] `/github` - GitHub links
- [ ] `/privacy` - Privacy info

### **Test Privacy Features:**
- [ ] Send wallet address in group chat (should warn)
- [ ] Send wallet address in DM (should process)
- [ ] Send detailed bug report in group (should warn)
- [ ] Send short message in group (should work)

### **Test New User Flow:**
- [ ] New user sends "hello" (should get welcome)
- [ ] Existing user sends "hello" (should get default message)

---

## 🛠️ **Development Workflow**

### **Make Changes:**
1. Edit `src/index.js`
2. Test locally: `npm start`
3. Commit: `git add . && git commit -m "description"`
4. Deploy: `git push origin main`

### **Add New Commands:**
1. Add case in `handleCommand()` function
2. Create handler function
3. Add to help message
4. Test and deploy

### **Update Rewards:**
1. Edit `sendWelcomeMessage()` function
2. Edit `sendRewardsInfo()` function
3. Update token request message
4. Test and deploy

---

## 🔍 **Troubleshooting**

### **Bot Not Responding:**
1. Check Railway logs
2. Verify bot token is valid
3. Check if bot is added to group
4. Test with direct message

### **Deployment Issues:**
1. Check Railway dashboard
2. Look for build errors
3. Verify environment variables
4. Check package.json dependencies

### **Privacy Issues:**
1. Test group vs DM behavior
2. Check admin notifications
3. Verify data storage
4. Test wallet validation

---

## 📊 **Key Files Reference**

| File | Purpose |
|------|---------|
| `src/index.js` | Main bot logic |
| `railway.json` | Railway configuration |
| `package.json` | Dependencies and scripts |
| `env.example` | Environment variables template |
| `WORK_SUMMARY.md` | Complete work summary |
| `DEPLOYMENT_GUIDE.md` | Original deployment guide |

---

## 🎯 **Current Priorities**

### **High Priority:**
1. ✅ Fix Railway deployment
2. ✅ Enhance rewards messaging
3. ✅ Add privacy protection
4. ⚠️ Verify bot token
5. ⚠️ Test all functionality

### **Medium Priority:**
1. Add admin management commands
2. Implement reward tracking
3. Add user analytics
4. Create backup system

### **Low Priority:**
1. Add more bot commands
2. Enhance UI/UX
3. Add internationalization
4. Create mobile app

---

## 📞 **Quick Reference**

### **Bot Commands:**
- `/start` - Welcome
- `/help` - Commands
- `/rewards` - Rewards info
- `/tokens` - Get test tokens
- `/setup` - Wallet setup
- `/report` - Report bugs
- `/status` - Testing status
- `/github` - GitHub links
- `/privacy` - Privacy info

### **Key URLs:**
- **Railway:** https://railway.app/dashboard
- **GitHub:** https://github.com/AGBKK/sawac-telegram-bot
- **Testing Group:** https://t.me/SawacTesting
- **Website:** https://sawac.io

### **Contact:**
- **Email:** info@sawac.io
- **BotFather:** @BotFather (for token issues)

---

**Last Updated:** $(date)  
**Status:** ✅ Ready for continued development  
**Next Session:** Continue from where we left off 