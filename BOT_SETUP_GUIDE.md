# 🤖 SAWAC Telegram Bot Setup Guide

## 🎯 **What This Bot Does**

### **Core Functions:**
- **Welcome new testers** with setup instructions
- **Collect wallet addresses** for token distribution
- **Forward bug reports** to development team
- **Provide testing status** and resources
- **Manage community engagement**

### **Commands:**
- `/start` - Welcome and setup guide
- `/help` - Show all commands
- `/tokens` - Request test tokens
- `/report` - Report bugs/issues
- `/status` - Testing progress
- `/github` - GitHub resources

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Bot with @BotFather**

1. **Open Telegram** and search for `@BotFather`
2. **Start chat** with BotFather
3. **Send command**: `/newbot`
4. **Follow instructions**:
   - Choose a name: `SAWAC Testing Bot`
   - Choose a username: `@SawacTestingBot` (must end with 'bot')
5. **Save the token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### **Step 2: Configure Bot Settings**

1. **Send to @BotFather**: `/setdescription`
   - Description: `SAWAC Community Testing Bot - Get test tokens, report bugs, and help improve SAWAC!`
2. **Send to @BotFather**: `/setabouttext`
   - About: `SAWAC Testing Bot - Community testing assistant for SAWAC token project.`
3. **Send to @BotFather**: `/setcommands`
   - Commands:
   ```
   start - Welcome and setup guide
   help - Show all commands
   tokens - Request test tokens
   report - Report bugs/issues
   status - Testing progress
   github - GitHub resources
   ```

### **Step 3: Add Bot to Testing Group**

1. **Go to**: [SAWAC Community Testing](https://t.me/SawacTesting)
2. **Add bot** to the group
3. **Make bot admin** with permissions:
   - ✅ Send messages
   - ✅ Pin messages
   - ✅ Delete messages (optional)
   - ❌ Ban users (not needed)

### **Step 4: Get Group ID**

1. **Send a message** in the group
2. **Access**: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. **Find the group ID** in the response
4. **Save it** for configuration

### **Step 5: Configure Environment**

1. **Copy env.example**:
   ```bash
   cp env.example .env
   ```

2. **Edit .env file**:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_GROUP_ID=your_group_id_here
   TESTING_EMAIL=info@sawac.io
   TESTING_GROUP_LINK=https://t.me/SawacTesting
   ```

### **Step 6: Install Dependencies**

```bash
npm install
```

### **Step 7: Test the Bot**

```bash
npm start
```

**Test commands:**
- Send `/start` to the bot
- Send `/help` to see commands
- Send `/tokens` to test token request

---

## 🔧 **Advanced Configuration**

### **GitHub Integration** (Optional)
Add to `.env`:
```env
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=AGBKK/sawac-web
```

### **Token Distribution** (Optional)
Add to `.env`:
```env
SAWAC_TOKEN_ADDRESS=0xA9B266b3cee8691b0b3ecE2FdEF7e89C4e0d34F3
USDT_TOKEN_ADDRESS=0x101a13505A7ae2d2C72AC74a4c26732100852455
```

---

## 📊 **Bot Features**

### **Automatic Responses:**
- **Welcome messages** for new users
- **Token request handling** with wallet address collection
- **Bug report forwarding** to development team
- **Testing status updates**
- **Resource links** (GitHub, website, etc.)

### **Admin Functions:**
- **Monitor token requests** in logs
- **Review bug reports** before forwarding
- **Send announcements** to group
- **Track user engagement**

---

## 🚀 **Deployment Options**

### **Local Development:**
```bash
npm run dev  # Uses nodemon for auto-restart
```

### **VPS/Server:**
```bash
npm start
# Use PM2 for production:
pm2 start src/index.js --name "sawac-bot"
```

### **Cloud Platforms:**
- **Heroku**: Easy deployment
- **Railway**: Simple hosting
- **DigitalOcean**: Full control

---

## 📝 **Usage Examples**

### **Tester Requests Tokens:**
1. User sends: `/tokens`
2. Bot responds with instructions
3. User sends wallet address
4. Bot confirms and logs request
5. Admin processes distribution

### **Tester Reports Bug:**
1. User sends: `/report`
2. Bot asks for description
3. User describes the issue
4. Bot forwards to admin/team
5. Admin creates GitHub issue

### **Admin Sends Announcement:**
1. Admin uses bot API
2. Bot sends message to group
3. All testers get notified

---

## 🔍 **Troubleshooting**

### **Bot Not Responding:**
- Check if token is correct
- Verify bot is added to group
- Check logs for errors
- Ensure bot has admin permissions

### **Commands Not Working:**
- Verify bot commands are set with @BotFather
- Check if bot is admin in group
- Review bot permissions

### **Token Distribution Issues:**
- Verify wallet addresses are valid
- Check testnet token contracts
- Review distribution script

---

## 📞 **Support**

- **Email**: info@sawac.io
- **Telegram**: [SAWAC Community Testing](https://t.me/SawacTesting)
- **GitHub**: [Issues](https://github.com/AGBKK/sawac-web/issues)

---

**Your SAWAC Telegram Bot is ready to help manage community testing!** 🎉 