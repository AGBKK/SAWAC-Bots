require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

console.log('🤖 SAWAC Bot starting...');

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

// Create bot instance with error handling
const bot = new TelegramBot(token, { polling: true });

// Health check server for Fly.io
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      bot: 'SAWAC Telegram Bot'
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
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
  
  // Check if this looks like a bug report
  if (text && text.length > 20) {
    await handleBugDescription(chatId, from, text);
    return;
}

// Save storage data
function saveData(data) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving storage:", error);
