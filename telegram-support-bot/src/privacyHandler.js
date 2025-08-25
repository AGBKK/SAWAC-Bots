// Privacy protection for sensitive data
const TelegramBot = require('node-telegram-bot-api');

// Check if message is in a group chat
function isGroupChat(chatId) {
  return chatId < 0;
}

// Handle wallet address with privacy protection
async function handleWalletAddressWithPrivacy(bot, chatId, from, address) {
  const isGroup = isGroupChat(chatId);
  
  if (isGroup) {
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
    return false; // Don't process in group
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
  return true; // Processed successfully
}

// Handle bug reports with privacy protection
async function handleBugReportWithPrivacy(bot, chatId, from, description) {
  const isGroup = isGroupChat(chatId);
  
  if (isGroup && description.length > 100) {
    const privacyWarning = `⚠️ **Privacy Notice**

I noticed you shared a detailed bug report in the group chat. For better privacy:

**🔒 Recommended:**
• Send detailed reports via **direct message** to me
• This keeps sensitive information private
• I'll process it the same way

**Brief summary:** ${description.substring(0, 100)}...

**To continue privately:** Send me a direct message with your full report.`;

    await bot.sendMessage(chatId, privacyWarning, { parse_mode: 'Markdown' });
    console.log(`⚠️ Privacy warning sent to ${from.first_name} for detailed report`);
    return false;
  }

  // For direct messages or short reports, process normally
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
  return true;
}

module.exports = {
  isGroupChat,
  handleWalletAddressWithPrivacy,
  handleBugReportWithPrivacy
}; 