require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

console.log('🧪 Testing bot configuration...');

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN || 'test_token';

console.log(`🔑 Token: ${token ? 'Set' : 'Missing'}`);
console.log(`🔑 Token length: ${token ? token.length : 0}`);

if (!token || token === 'test_token') {
  console.log('❌ No valid token found');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(token, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  },
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
    
    console.log(`📨 Message received: ${text}`);
    console.log(`👤 From: ${from.first_name} (@${from.username || 'no username'})`);
    
    // Simple response
    await bot.sendMessage(chatId, `Hello ${from.first_name}! I received your message: "${text}"`);
    console.log('✅ Response sent');
    
  } catch (error) {
    console.error('❌ Error handling message:', error.message);
  }
});

console.log('🤖 Test bot is running...');
console.log('📱 Send a message to test the bot');

// Keep running
setTimeout(() => {
  console.log('⏰ Test completed');
  process.exit(0);
}, 30000);

