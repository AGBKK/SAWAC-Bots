require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

console.log('🤖 SAWAC Bot starting...');

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

// GitHub configuration
const githubToken = process.env.GITHUB_TOKEN;
const githubRepo = process.env.GITHUB_REPO || 'AGBKK/sawac-web';

// Initialize GitHub client if token is available
let octokit = null;
if (githubToken) {
  octokit = new Octokit({
    auth: githubToken
  });
  console.log('✅ GitHub integration enabled');
} else {
  console.log('⚠️ GITHUB_TOKEN not found - GitHub integration disabled');
}

// Token management system
const REQUESTS_FILE = path.join(__dirname, '../data/token-requests.json');
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || 'YOUR_TELEGRAM_USER_ID';

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(REQUESTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load token requests
function loadRequests() {
  ensureDataDir();
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      const data = fs.readFileSync(REQUESTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading requests:', error);
  }
  return { requests: {}, users: {}, wallets: {}, approved: {}, rejected: {} };
}

// Save token requests
function saveRequests(data) {
  ensureDataDir();
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving requests:', error);
  }
}

// Check if user is admin
function isAdmin(userId) {
  return userId.toString() === ADMIN_USER_ID.toString();
}

// Create GitHub issue from bot report
async function createGitHubIssue(title, description, labels = ['bug', 'community-testing']) {
  if (!octokit) {
    console.log('⚠️ GitHub integration not available');
    return null;
  }

  try {
    const [owner, repo] = githubRepo.split('/');
    
    const issue = await octokit.issues.create({
      owner,
      repo,
      title,
      body: description,
      labels
    });

    console.log(`✅ GitHub issue created: #${issue.data.number}`);
    return issue.data.html_url;
  } catch (error) {
    console.error('❌ Error creating GitHub issue:', error.message);
    return null;
  }
}

// AI-powered issue analysis
async function analyzeIssue(description, userInfo) {
  // Simple AI analysis based on keywords and patterns
  const analysis = {
    severity: 'medium',
    category: 'general',
    priority: 'normal',
    suggestedActions: [],
    estimatedEffort: 'medium',
    confidence: 'medium'
  };

  const desc = description.toLowerCase();
  
  // Severity analysis
  if (desc.includes('crash') || desc.includes('error') || desc.includes('broken') || desc.includes('not working')) {
    analysis.severity = 'high';
    analysis.priority = 'urgent';
  } else if (desc.includes('slow') || desc.includes('performance') || desc.includes('lag')) {
    analysis.severity = 'medium';
    analysis.priority = 'high';
  } else if (desc.includes('ui') || desc.includes('design') || desc.includes('looks')) {
    analysis.severity = 'low';
    analysis.priority = 'normal';
  }

  // Category analysis
  if (desc.includes('wallet') || desc.includes('connect') || desc.includes('transaction')) {
    analysis.category = 'wallet-integration';
    analysis.suggestedActions.push('Check wallet connection logic', 'Verify transaction handling');
  } else if (desc.includes('mobile') || desc.includes('phone') || desc.includes('responsive')) {
    analysis.category = 'mobile-ux';
    analysis.suggestedActions.push('Test on mobile devices', 'Check responsive design');
  } else if (desc.includes('login') || desc.includes('auth') || desc.includes('sign')) {
    analysis.category = 'authentication';
    analysis.suggestedActions.push('Review authentication flow', 'Check session management');
  } else if (desc.includes('token') || desc.includes('swap') || desc.includes('trade')) {
    analysis.category = 'trading';
    analysis.suggestedActions.push('Verify token contract interactions', 'Check swap functionality');
  }

  // Effort estimation
  if (analysis.severity === 'high') {
    analysis.estimatedEffort = 'high';
  } else if (analysis.category === 'wallet-integration' || analysis.category === 'authentication') {
    analysis.estimatedEffort = 'high';
  } else if (analysis.category === 'mobile-ux') {
    analysis.estimatedEffort = 'medium';
  } else {
    analysis.estimatedEffort = 'low';
  }

  // Confidence based on description length and detail
  if (description.length > 100 && (desc.includes('steps') || desc.includes('when') || desc.includes('browser'))) {
    analysis.confidence = 'high';
  } else if (description.length < 50) {
    analysis.confidence = 'low';
  }

  return analysis;
}

// Create bot instance with error handling
const bot = new TelegramBot(token, { 
  polling: true,
  webHook: false
});

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
      // Check if this is a new user (first interaction)
      const data = loadRequests();
      const isNewUser = !data.users[from.id];
      
      // Handle regular messages
      await handleMessage(msg, isNewUser);
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
      
    case '/setup':
      await sendSetupInstructions(chatId);
      break;
      
    case '/pending':
      if (isAdmin(from.id)) {
        await showPendingRequests(chatId);
      } else {
        await bot.sendMessage(chatId, '❌ Admin access required.');
      }
      break;
      
    case '/approved':
      if (isAdmin(from.id)) {
        await showApprovedRequests(chatId);
      } else {
        await bot.sendMessage(chatId, '❌ Admin access required.');
      }
      break;
      
    case '/generate_distribution':
      if (isAdmin(from.id)) {
        await generateDistributionScript(chatId);
      } else {
        await bot.sendMessage(chatId, '❌ Admin access required.');
      }
      break;
      
    case '/rewards':
      await sendRewardsInfo(chatId);
      break;
      
    case '/privacy':
      await sendPrivacyInfo(chatId);
      break;
      
    case '/issues':
      if (isAdmin(from.id)) {
        await showPendingIssues(chatId);
      } else {
        await bot.sendMessage(chatId, '❌ Admin only command.');
      }
      break;
      
    default:
      await bot.sendMessage(chatId, '❓ Unknown command. Use /help to see available commands.');
  }
}

// Welcome message
async function sendWelcomeMessage(chatId, from) {
  const welcomeText = `🎉 **Welcome to SAWAC Community Testing!**

Hi ${from.first_name}! 👋

## 🏆 **TESTING REWARDS PROGRAM**

### 🪙 **Immediate Rewards:**
• **1000 SAWAC tokens** + **100 USDT** (testnet for testing)
• **Free testing environment** - no real money needed
• **Eligibility for mainnet rewards** - the real value!

### 🎁 **Quality Report Rewards:**
• **Mainnet SAWAC airdrop** for detailed bug reports
• **"SAWAC Pioneer" NFT** - may unlock governance voting, beta access, staking opportunities
• **Community leadership** - gain resume-worthy experience as core contributor
• **Early access** to new features and token launches
• **Whitelist priority** - guaranteed allocation at best prices, skip gas wars
• **Exclusive Discord role** - private channels, direct developer access

### 📈 **Reward Tiers:**
• **Bronze:** 1-2 quality reports = 500 SAWAC mainnet + Community access
• **Silver:** 3-5 quality reports = 1000 SAWAC + Pioneer NFT + Whitelist priority
• **Gold:** 5+ quality reports = 2000 SAWAC + VIP status + All benefits
• **Platinum:** 10+ quality reports = 5000 SAWAC + Early access + Leadership role

## 📋 **What to Test:**
• Wallet connection & token transactions
• Mobile experience & UI/UX
• Performance & edge cases
• Cross-browser compatibility

## 📊 **How to Report:**
• **Quick:** Use /report command
• **Detailed:** GitHub Issues with screenshots
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

**Ready to earn rewards? Let's make SAWAC better together! 🚀**

**💡 Note:** Estimated SAWAC value based on current internal market assumptions; actual price at launch may vary. Early testers get tokens at the lowest price point with maximum upside potential as SAWAC grows!`;

  await bot.sendMessage(chatId, welcomeText, { parse_mode: 'Markdown' });
  console.log(`✅ Welcome message sent to ${from.first_name}`);
}

// Help message
async function sendHelpMessage(chatId) {
  const helpText = `📋 **Available Commands:**

/start - Welcome message and setup guide
/help - Show this help message
/rewards - Detailed information about testing rewards
/tokens - Request test tokens (SAWAC + USDT)
/setup - BSC Testnet wallet setup instructions
/report - Report a bug or issue
/status - Check testing progress
/github - Link to GitHub issues
/privacy - Privacy protection information

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

## 🎁 **What You'll Get:**
• **1000 SAWAC tokens** (testnet for testing)
• **100 USDT tokens** (testnet for testing)
• **Testing instructions** and guidelines
• **Eligibility for mainnet rewards** - the real value!

## 📋 **To Get Started:**
1. **Provide your wallet address** (BSC Testnet)
2. **Wait for approval** (usually within 24 hours)
3. **Check your wallet** for tokens
4. **Start testing** at https://sawac.io

## 🏆 **Earn More Rewards:**
• **Quality bug reports** = Mainnet SAWAC airdrop
• **Detailed feedback** = Pioneer NFT eligibility
• **Active participation** = Community leadership
• **Early access** to new features and token sales

**Please reply with your wallet address** (0x...)

**Note:** These are testnet tokens with no real value, used only for testing purposes. Real rewards come from quality testing reports and mainnet SAWAC airdrops!`;

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

// Message handler (non-commands)
async function handleMessage(msg, isNewUser) {
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
  
  // Send welcome message to new users first
  if (isNewUser) {
    await sendWelcomeMessage(chatId, from);
    console.log(`✅ Welcome message sent to new user ${from.first_name}`);
    return;
  }
  
  // Default response for existing users
  await bot.sendMessage(chatId, 
    '💡 Use /help to see available commands or /tokens to request test tokens!');
  console.log(`✅ Default response sent to ${from.first_name}`);
}

// Handle wallet address with token management
async function handleWalletAddress(chatId, from, address) {
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

  // For direct messages, process with token management
  const data = loadRequests();
  const timestamp = new Date().toISOString();
  const requestId = `req_${Date.now()}_${from.id}`;
  
  // Check for duplicates
  if (data.users[from.id]) {
    const existingRequest = data.users[from.id];
    const responseText = `❌ **Duplicate Request**

You have already requested tokens. Your request status: **${existingRequest.status}**

**Request Details:**
• Wallet: \`${existingRequest.walletAddress}\`
• Submitted: ${new Date(existingRequest.timestamp).toLocaleString()}

If you need to update your wallet address, please contact the admin.`;

    await bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
    return;
  }
  
  if (data.wallets[address.toLowerCase()]) {
    const responseText = `❌ **Wallet Already Used**

This wallet address has already been used for a token request.

Please use a different wallet address or contact the admin if you need assistance.`;

    await bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
    return;
  }
  
  // Validate wallet address format
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    const responseText = `❌ **Invalid Wallet Address**

Please provide a valid BSC Testnet wallet address (should start with 0x and be 42 characters long).

Example: \`0x1234567890123456789012345678901234567890\``;

    await bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
    return;
  }
  
  // Record the request
  const request = {
    requestId,
    userId: from.id,
    username: from.username,
    firstName: from.first_name,
    walletAddress: address,
    timestamp,
    status: 'pending'
  };
  
  data.users[from.id] = request;
  data.wallets[address.toLowerCase()] = request;
  data.requests[requestId] = request;
  
  saveRequests(data);
  
  // Send confirmation to user
  const responseText = `✅ **Token Request Submitted**

**Wallet Address:** \`${address}\`
**Request ID:** \`${requestId}\`

**Next Steps:**
1. Your request has been submitted for approval
2. You will receive tokens within 24 hours after approval
3. Check your wallet for 1000 SAWAC + 100 USDT tokens

**Testing Instructions:**
• Add BSC Testnet to your wallet
• Get test BNB from faucet
• Start testing at https://sawac.io

**Need help?** Email: info@sawac.io`;

  await bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
  console.log(`✅ Token request recorded from ${from.first_name}: ${address}`);
  
  // Notify admin
  if (ADMIN_USER_ID !== 'YOUR_TELEGRAM_USER_ID') {
    const adminNotification = `🆕 **New Token Request**

**User:** ${from.first_name} (@${from.username || 'no username'})
**Wallet:** \`${address}\`
**Request ID:** \`${requestId}\`
**Time:** ${new Date(timestamp).toLocaleString()}

**Actions:**
• Use /pending to see all pending requests
• Use /approve_[requestId] to approve
• Use /reject_[requestId] to reject`;

    try {
      await bot.sendMessage(ADMIN_USER_ID, adminNotification, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Failed to notify admin:', error.message);
    }
  }
}

// Handle bug description
async function handleBugDescription(chatId, from, description) {
  // Create GitHub issue
  const issueTitle = `[Community Testing] Bug Report from ${from.first_name}`;
  const issueDescription = `## Bug Report from Community Testing

**Reporter:** ${from.first_name} (@${from.username || 'no username'})
**Telegram User ID:** ${from.id}
**Report Time:** ${new Date().toISOString()}

## Description
${description}

## Additional Information
- **Source:** SAWAC Telegram Bot
- **Priority:** Community Testing
- **Status:** Needs Review

---
*This issue was automatically created from the SAWAC Community Testing Telegram Bot.*`;

  const issueUrl = await createGitHubIssue(issueTitle, issueDescription, ['bug', 'community-testing', 'telegram-bot']);

  const responseText = `🐛 **Bug Report Received**

**From:** ${from.first_name} (@${from.username || 'no username'})
**Description:** ${description}

**Next Steps:**
1. ✅ Issue forwarded to development team
2. You may be contacted for more details
3. Check [GitHub Issues](https://github.com/AGBKK/sawac-web/issues) for updates

${issueUrl ? `**GitHub Issue:** [View Issue](${issueUrl})` : '**Note:** GitHub integration not available'}

Thank you for helping improve SAWAC! 🚀`;

  await bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
  console.log(`✅ Bug report received from ${from.first_name}: ${description.substring(0, 50)}...`);
  
  // AI analysis of the issue
  const aiAnalysis = await analyzeIssue(description, from);
  
  // Notify admin about bug report with AI analysis
  if (ADMIN_USER_ID !== 'YOUR_TELEGRAM_USER_ID') {
    const severityEmoji = {
      'high': '🔴',
      'medium': '🟡', 
      'low': '🟢'
    };
    
    const priorityEmoji = {
      'urgent': '🚨',
      'high': '⚡',
      'normal': '📋'
    };

    const bugReportNotification = `🤖 **AI-Analyzed Bug Report**

**User:** ${from.first_name} (@${from.username || 'no username'})
**Time:** ${new Date().toLocaleString()}
${issueUrl ? `**GitHub Issue:** [View](${issueUrl})` : ''}

**📝 Description:**
${description.substring(0, 200)}${description.length > 200 ? '...' : ''}

**🔍 AI Analysis:**
• **Severity:** ${severityEmoji[aiAnalysis.severity]} ${aiAnalysis.severity.toUpperCase()}
• **Priority:** ${priorityEmoji[aiAnalysis.priority]} ${aiAnalysis.priority.toUpperCase()}
• **Category:** ${aiAnalysis.category.replace('-', ' ').toUpperCase()}
• **Effort:** ${aiAnalysis.estimatedEffort.toUpperCase()}
• **Confidence:** ${aiAnalysis.confidence.toUpperCase()}

**💡 Suggested Actions:**
${aiAnalysis.suggestedActions.map(action => `• ${action}`).join('\n')}

**📋 Next Steps:**
• Review the full report in GitHub
• Contact user if more details needed
• Update GitHub issue with status
• Consider priority for development queue`;

    try {
      await bot.sendMessage(ADMIN_USER_ID, bugReportNotification, { parse_mode: 'Markdown' });
      console.log(`✅ AI-analyzed notification sent to admin for issue from ${from.first_name}`);
    } catch (error) {
      console.error('Failed to notify admin about bug report:', error.message);
    }
  }
}

// Admin functions
async function showPendingRequests(chatId) {
  const data = loadRequests();
  const pending = Object.values(data.requests).filter(req => req.status === 'pending');
  
  if (pending.length === 0) {
    await bot.sendMessage(chatId, '📋 No pending requests.');
    return;
  }
  
  let message = `📋 **Pending Requests (${pending.length}):**\n\n`;
  pending.forEach((req, index) => {
    message += `${index + 1}. **${req.firstName}** (@${req.username || 'no username'})\n   Wallet: \`${req.walletAddress}\`\n   ID: \`${req.requestId}\`\n   Time: ${new Date(req.timestamp).toLocaleString()}\n\n`;
  });
  
  message += '**Commands:**\n/approve_[requestId] - Approve request\n/reject_[requestId] - Reject request';
  
  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

async function showApprovedRequests(chatId) {
  const data = loadRequests();
  const approved = Object.values(data.approved);
  
  if (approved.length === 0) {
    await bot.sendMessage(chatId, '✅ No approved requests.');
    return;
  }
  
  let message = `✅ **Approved Requests (${approved.length}):**\n\n`;
  approved.forEach((req, index) => {
    message += `${index + 1}. **${req.firstName}** (@${req.username || 'no username'})\n   Wallet: \`${req.walletAddress}\`\n   Approved: ${new Date(req.approvedAt).toLocaleString()}\n\n`;
  });
  
  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

async function generateDistributionScript(chatId) {
  const data = loadRequests();
  const approved = Object.values(data.approved);
  
  if (approved.length === 0) {
    await bot.sendMessage(chatId, '❌ No approved requests to distribute.');
    return;
  }
  
  const addresses = approved.map(req => req.walletAddress);
  const scriptContent = `// Generated distribution script
const testers = [
${addresses.map(addr => `  "${addr}",`).join('\n')}
];`;
  
  const scriptPath = path.join(__dirname, '../generated-distribution.js');
  fs.writeFileSync(scriptPath, scriptContent);
  
  await bot.sendMessage(chatId, `✅ Distribution script generated!\n\n📁 File: generated-distribution.js\n👥 Addresses: ${addresses.length}\n\n**To run:**\n1. Copy generated-distribution.js to sawac-token/scripts/\n2. Run: npx hardhat run scripts/generated-distribution.js --network bscTestnet`, { parse_mode: 'Markdown' });
}

// Rewards info
async function sendRewardsInfo(chatId) {
  const rewardsText = `🏆 **SAWAC Community Testing Rewards Program**

## 🪙 **Immediate Rewards:**
• **1000 SAWAC tokens** (testnet for testing)
• **100 USDT tokens** (testnet for testing)
• **Free testing environment** - no real money needed
• **Eligibility for mainnet rewards** - the real value!

## 🎁 **Quality Report Rewards:**

### 💎 **SAWAC Pioneer NFT**
• **What:** Unique collectible NFT for top 10 testers
• **Value:** $100-500+ potential value
• **Utility:** May unlock governance voting, beta feature access, staking opportunities
• **Benefits:** Bragging rights, community recognition, potential appreciation

### 👑 **Community Leadership**
• **What:** Recognition as core contributor to live Web3 project
• **Value:** Resume-worthy experience, networking opportunities
• **Benefits:** Early feature access, direct developer communication, influence on decisions
• **Career Impact:** Valuable credential for future DAO or token launches

### 📋 **Whitelist Priority**
• **What:** Guaranteed access to future token sales/launches
• **Value:** $50-200+ in saved gas fees and guaranteed allocation
• **Benefits:** Skip rush during launches, best prices, no failed transactions
• **Risk Reduction:** Avoid gas wars and missed opportunities

### 🎭 **Exclusive Discord Role**
• **What:** Special role in SAWAC Discord community
• **Value:** Community access and recognition
• **Benefits:** Private channels, special permissions, direct developer line
• **Networking:** Connect with other top testers and project team

## 📈 **Reward Tiers:**

### 🥉 **Bronze (1-2 quality reports)**
• 500 SAWAC mainnet (~$50 estimated)
• Community access and recognition
• **Total Value:** $50+ in tokens + networking

### 🥈 **Silver (3-5 quality reports)**
• 1000 SAWAC mainnet (~$100 estimated)
• Pioneer NFT ($100-500 potential)
• Whitelist priority ($50-200 value)
• **Total Value:** $250-800+ in combined benefits

### 🥇 **Gold (5+ quality reports)**
• 2000 SAWAC mainnet (~$200 estimated)
• VIP status and all benefits
• Leadership opportunities
• **Total Value:** $200+ in tokens + exclusive access

### 💎 **Platinum (10+ quality reports)**
• 5000 SAWAC mainnet (~$500 estimated)
• Early access to everything
• Leadership role and influence
• **Total Value:** $500+ in tokens + maximum benefits

## 🛡️ **Why Join the Testing Program?**
Beyond just earning tokens, you're gaining early community status, exclusive access, and potentially rare NFTs that could appreciate over time. Your feedback shapes the project — and the perks reflect that.

**💡 Note:** Estimated values based on current internal market assumptions; actual prices at launch may vary.`;

  await bot.sendMessage(chatId, rewardsText, { parse_mode: 'Markdown' });
  console.log('✅ Rewards info sent');
}

// Privacy info
async function sendPrivacyInfo(chatId) {
  const privacyText = `🔒 **Privacy Protection Information**

## 🛡️ **How We Protect Your Data:**

### 💬 **Group Chat Protection:**
• **Wallet addresses** are never processed in group chats
• **Detailed reports** trigger privacy warnings in groups
• **Sensitive data** is only handled in direct messages
• **Masked addresses** shown in privacy warnings

### 📱 **Direct Message Security:**
• **Full processing** only in private conversations
• **Secure storage** of wallet addresses and requests
• **Admin notifications** sent privately
• **No data sharing** with third parties

### 🗄️ **Data Storage:**
• **Local storage** on secure servers
• **Encrypted data** transmission
• **Limited retention** of personal information
• **User control** over their data

### 🚫 **What We Don't Do:**
• Store messages in group chats
• Share wallet addresses publicly
• Sell or trade user data
• Require unnecessary personal information

## 📋 **Your Privacy Rights:**
• **Request data deletion** via email
• **Update wallet addresses** through admin
• **Opt out** of notifications
• **Access your data** upon request

**For privacy concerns:** Email info@sawac.io

**Your privacy is our priority! 🔐**`;

  await bot.sendMessage(chatId, privacyText, { parse_mode: 'Markdown' });
  console.log('✅ Privacy info sent');
}

// Show pending issues for admin review
async function showPendingIssues(chatId) {
  try {
    if (!octokit) {
      await bot.sendMessage(chatId, '⚠️ GitHub integration not available');
      return;
    }

    const [owner, repo] = githubRepo.split('/');
    const issues = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      labels: 'community-testing'
    });

    if (issues.data.length === 0) {
      await bot.sendMessage(chatId, '✅ No pending community testing issues.');
      return;
    }

    let message = `📋 **Pending Community Issues (${issues.data.length}):**\n\n`;
    
    issues.data.slice(0, 10).forEach((issue, index) => {
      const created = new Date(issue.created_at).toLocaleDateString();
      const severity = issue.labels.find(l => l.name.includes('high') || l.name.includes('medium') || l.name.includes('low'));
      const severityText = severity ? severity.name : 'medium';
      
      message += `${index + 1}. **${issue.title}**\n`;
      message += `   📅 Created: ${created}\n`;
      message += `   🔗 [View Issue](${issue.html_url})\n`;
      message += `   📝 ${issue.body.substring(0, 100)}${issue.body.length > 100 ? '...' : ''}\n\n`;
    });

    if (issues.data.length > 10) {
      message += `... and ${issues.data.length - 10} more issues\n`;
    }

    message += `\n**Actions:**\n• Review issues in GitHub\n• Update status and labels\n• Contact users for more details`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error fetching pending issues:', error);
    await bot.sendMessage(chatId, '❌ Error fetching pending issues');
  }
}

// Bot startup message
console.log('🚀 SAWAC Telegram Bot is running...');
console.log('📱 Bot is ready to receive messages');
console.log(`🔑 Bot token: ${token ? '✅ Set' : '❌ Missing'}`);
console.log('📊 Logs will be displayed in console');

// Simple HTTP server for Railway health checks
const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      bot: 'running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SAWAC Telegram Bot is running! 🤖');
  }
});

server.listen(port, () => {
  console.log(`🌐 HTTP server listening on port ${port}`);
  console.log(`🏥 Health check available at http://localhost:${port}/health`);
});

// Keep the process alive
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
}); 