require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

console.log('🤖 SAWAC Bot starting...');

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

// Create bot instance with error handling
const bot = new TelegramBot(token, { polling: true });

// Error handling
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.message);
});

bot.on('error', (error) => {
  console.error('❌ Bot error:', error.message);
});

// Message handler
bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const from = msg.from;
    
    console.log(`📨 Message from ${from.first_name} (@${from.username || 'no username'}): ${text}`);
    
    // Handle commands
    if (text.startsWith('/')) {
      await handleCommand(msg);
    } else {
      // Handle regular messages
      await handleMessage(msg);
    }
  } catch (error) {
    console.error('❌ Error handling message:', error.message);
  }
});

// Command handler
async function handleCommand(msg) {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();
  const from = msg.from;
  
  console.log(`🔧 Command received: ${text}`);
  
  switch (text.split(' ')[0]) {
    case '/start':
      await sendWelcomeMessage(chatId, from);
      break;
      
    case '/help':
      await sendHelpMessage(chatId);
      break;
      
    case '/tokens':
      await handleTokenRequest(chatId, from);
      break;
      
    case '/report':
      await handleBugReport(chatId, from);
      break;
      
    case '/status':
      await sendTestingStatus(chatId);
      break;
      
    case '/github':
      await sendGitHubLink(chatId);
      break;
      
    default:
      await bot.sendMessage(chatId, '❓ Unknown command. Use /help to see available commands.');
  }
}

// Welcome message
async function sendWelcomeMessage(chatId, from) {
  const welcomeText = `🎉 **Welcome to SAWAC Community Testing!**

Hi ${from.first_name}! 👋

## 🎁 **Testing Rewards:**
• **1000 SAWAC + 100 USDT** test tokens
• **Mainnet airdrop** for quality reports  
• **"SAWAC Pioneer" NFT** for top testers
• **Community recognition** and leadership

## 📋 **What to Test:**
• Wallet connection & token transactions
• Mobile experience & UI/UX
• Performance & edge cases

## 📊 **How to Report:**
• **Quick:** Use /report command
• **Detailed:** GitHub Issues
• **Quality reports = better rewards!**

## 🔒 **Privacy Protection:**
• Wallet addresses are processed privately
• Sensitive data is not stored in group chat
• Use direct messages for personal info

## 🚀 **Quick Start:**
1. Use /setup for wallet instructions
2. Use /tokens to request test tokens
3. Start testing at https://sawac.io
4. Report findings via /report or GitHub

**Testing Group:** [SAWAC Community Testing](https://t.me/SawacTesting)
**Email Support:** info@sawac.io

Let's make SAWAC better together! 🚀`;

  await bot.sendMessage(chatId, welcomeText, { parse_mode: 'Markdown' });
  console.log(`✅ Welcome message sent to ${from.first_name}`);
}

// Help message
async function sendHelpMessage(chatId) {
  const helpText = `📋 **Available Commands:**

/start - Welcome message and setup guide
/help - Show this help message
/tokens - Request test tokens (SAWAC + USDT)
/setup - BSC Testnet wallet setup instructions
/report - Report a bug or issue
/status - Check testing progress
/github - Link to GitHub issues

**Testing Resources:**
• [GitHub Issues](https://github.com/AGBKK/sawac-web/issues)
• [Testing Guide](https://github.com/AGBKK/sawac-web/blob/main/GITHUB_TESTING_GUIDE.md)
• [Website](https://sawac.io)

**Need Help?**
Email: info@sawac.io`;

  await bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
  console.log('✅ Help message sent');
}

// Token request handler
async function handleTokenRequest(chatId, from) {
  const responseText = `🪙 **Test Token Request**

Hi ${from.first_name}! 

To get test tokens, please:

1. **Provide your wallet address** (BSC Testnet)
2. **Wait for distribution** (usually within 24 hours)
3. **Check your wallet** for tokens

**You'll receive:**
• 1000 SAWAC tokens
• 100 USDT tokens
• Instructions for testing

**Please reply with your wallet address** (0x...)

**Note:** These are testnet tokens with no real value, used only for testing purposes.`;

  await bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
  console.log(`✅ Token request info sent to ${from.first_name}`);
}

// Bug report handler
async function handleBugReport(chatId, from) {
  const reportText = `🐛 **Bug Report**

Hi ${from.first_name}!

To report a bug, please provide:

1. **Brief description** of the issue
2. **Steps to reproduce**
3. **Expected vs actual result**
4. **Browser/device info** (optional)

**Preferred method:** Use [GitHub Issues](https://github.com/AGBKK/sawac-web/issues) for detailed reports.

**Quick report:** Reply with your bug description and I'll forward it to the team.

**For detailed reports:** Use the GitHub template for better tracking.`;

  await bot.sendMessage(chatId, reportText, { parse_mode: 'Markdown' });
  console.log(`✅ Bug report info sent to ${from.first_name}`);
}

// Testing status
async function sendTestingStatus(chatId) {
  const statusText = `📊 **Testing Status**

**Current Phase:** Community Testing
**Website:** https://sawac.io
**Testnet:** BSC Testnet

**Testing Areas:**
✅ Wallet Connection
✅ Token Purchase
✅ Token Sale
✅ Geo-blocking
🔄 UI/UX Testing
🔄 Mobile Testing

**Report Issues:** Use /report or [GitHub](https://github.com/AGBKK/sawac-web/issues)

**Get Tokens:** Use /tokens command

**Testing Rewards:**
• Test tokens for participation
• Mainnet airdrop for quality contributors
• Community recognition`;

  await bot.sendMessage(chatId, statusText, { parse_mode: 'Markdown' });
  console.log('✅ Testing status sent');
}

// GitHub link
async function sendGitHubLink(chatId) {
  const githubText = `🔗 **GitHub Resources**

**Main Repository:** https://github.com/AGBKK/sawac-web

**Testing Guide:** https://github.com/AGBKK/sawac-web/blob/main/GITHUB_TESTING_GUIDE.md

**Report Issues:** https://github.com/AGBKK/sawac-web/issues

**Use the issue templates** for structured bug reports and feature requests.

**Labels available:**
• 🐛 bug - Something isn't working
• 💡 enhancement - New feature request
• 🚨 critical - Blocks testing completely
• ⚡ high-priority - Important issue`;

  await bot.sendMessage(chatId, githubText, { parse_mode: 'Markdown' });
  console.log('✅ GitHub info sent');
}

// Message handler (non-commands)
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const from = msg.from;
  
  console.log(`💬 Regular message from ${from.first_name}: ${text}`);
  
  // Check if this looks like a wallet address
  if (text && text.startsWith('0x') && text.length === 42) {
    await handleWalletAddress(chatId, from, text);
    return;
  }
  
  // Check if this looks like a bug report
  if (text && text.length > 20) {
    await handleBugDescription(chatId, from, text);
    return;
  }
  
  // Default response
  await bot.sendMessage(chatId, 
    '💡 Use /help to see available commands or /tokens to request test tokens!');
  console.log(`✅ Default response sent to ${from.first_name}`);
}

// Storage for tracking requests
const fs = require("fs");
const path = require("path");
const STORAGE_FILE = path.join(__dirname, "../data/requests.json");

// Load storage data
function loadData() {
  try {
    const data = fs.readFileSync(STORAGE_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { requests: {}, users: {}, wallets: {} };
  }
}

// Save storage data
function saveData(data) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving storage:", error);
  }
}

// Check if user already requested
function hasUserRequested(userId) {
  const data = loadData();
  return data.users[userId] !== undefined;
}

// Check if wallet already used
function hasWalletBeenUsed(walletAddress) {
  const data = loadData();
  return data.wallets[walletAddress.toLowerCase()] !== undefined;
}

// Record new request
function recordRequest(userId, username, firstName, walletAddress) {
  const data = loadData();
  const timestamp = new Date().toISOString();
  const requestId = `req_${Date.now()}_${userId}`;
  
  data.users[userId] = { requestId, username, firstName, walletAddress, timestamp, status: "pending" };
  data.wallets[walletAddress.toLowerCase()] = { requestId, userId, username, firstName, timestamp, status: "pending" };
  data.requests[requestId] = { userId, username, firstName, walletAddress, timestamp, status: "pending" };
  
  saveData(data);
  return requestId;
}

// Handle wallet address with privacy protection
async function handleWalletAddress(chatId, from, address) {
  // Check if this is a group chat - if so, warn about privacy
  const isGroupChat = chatId < 0;
  
  if (isGroupChat) {
    const privacyWarning = `⚠️ **Privacy Notice**

I noticed you shared your wallet address in the group chat. For your privacy and security:

**🔒 Recommended:**
• Send wallet addresses via **direct message** to me
• This keeps your address private from other group members
• I\'ll process it the same way

**Current address:** \`${address.substring(0, 6)}...${address.substring(38)}\`

**To continue privately:** Send me a direct message with your full wallet address.`;

    await bot.sendMessage(chatId, privacyWarning, { parse_mode: \'Markdown\' });
    console.log(`⚠️ Privacy warning sent to ${from.first_name} in group chat`);
    return;
  }
  // Check if this is a group chat - if so, warn about privacy
  const isGroupChat = chatId < 0;
  
  if (isGroupChat) {
    const privacyWarning = `⚠️ **Privacy Notice**

I noticed you shared your wallet address in the group chat. For your privacy and security:

**🔒 Recommended:**
• Send wallet addresses via **direct message** to me
• This keeps your address private from other group members
• I'll process it the same way

**Current address:** \`${address.substring(0, 6)}...${address.substring(38)}\`

**To continue privately:** Send me a direct message with your full wallet address.`;

    await bot.sendMessage(chatId, privacyWarning, { parse_mode: 'Markdown' });
    console.log(`⚠️ Privacy warning sent to ${from.first_name} in group chat`);
    return;
  }

  // For direct messages, process normally
  const responseText = `✅ **Wallet Address Received**

Address: \`${address}\`

**Next Steps:**
1. I'll forward this to the team
2. Tokens will be distributed within 24 hours
3. You'll receive a confirmation message

**Testing Instructions:**
• Add BSC Testnet to your wallet
• Check for 1000 SAWAC + 100 USDT tokens
• Start testing at https://sawac.io

**Need help?** Email: info@sawac.io`;

  await bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
  console.log(`✅ Wallet address received from ${from.first_name}: ${address}`);
}

// Handle bug description
async function handleBugDescription(chatId, from, description) {
  const responseText = `🐛 **Bug Report Received**

**From:** ${from.first_name} (@${from.username || 'no username'})
**Description:** ${description}

**Next Steps:**
1. I'll forward this to the development team
2. You may be contacted for more details
3. Check [GitHub Issues](https://github.com/AGBKK/sawac-web/issues) for updates

**For detailed reports:** Use GitHub with the issue templates for better tracking.

Thank you for helping improve SAWAC! 🚀`;

  await bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
  console.log(`✅ Bug report received from ${from.first_name}: ${description.substring(0, 50)}...`);
}

// Bot startup message
console.log('🚀 SAWAC Telegram Bot is running...');
console.log('📱 Bot is ready to receive messages');
console.log(`🔑 Bot token: ${token ? '✅ Set' : '❌ Missing'}`);
console.log('📊 Logs will be displayed in console');
// Setup instructions function
async function sendSetupInstructions(chatId) {
  const setupText = `🔧 **BSC Testnet Wallet Setup**

Follow these steps to add BSC Testnet to your wallet:

**For MetaMask:**
1. Open MetaMask
2. Click the network dropdown (top)
3. Click "Add Network" → "Add Network Manually"
4. Fill in these details:
   • **Network Name:** BSC Testnet
   • **RPC URL:** https://data-seed-prebsc-1-s1.binance.org:8545/
   • **Chain ID:** 97
   • **Currency Symbol:** tBNB
   • **Block Explorer:** https://testnet.bscscan.com
5. Click "Save"

**For Other Wallets:**
• **Trust Wallet:** Already includes BSC Testnet
• **WalletConnect:** Use the same settings as MetaMask

**Get Test BNB:**
• Visit: https://testnet.binance.org/faucet-smart
• Enter your wallet address
• Receive 0.1 BNB for gas fees

**Need Help?** Email: info@sawac.io

Once set up, use /tokens to request your test tokens! 🚀`;

  await bot.sendMessage(chatId, setupText, { parse_mode: "Markdown" });
  console.log("✅ Setup instructions sent");
}
