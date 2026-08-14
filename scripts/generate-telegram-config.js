/* ==========================================================================
   Runs as Vercel's build command. Writes js/telegram-config.js from the
   TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID environment variables set in the
   Vercel project dashboard, so the real token never has to live in git.
   If the env vars aren't set, it writes harmless placeholders instead - the
   Telegram feature just stays disabled (TelegramNotify.isConfigured() checks
   for the PASTE_ prefix), everything else still works.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const botToken = process.env.TELEGRAM_BOT_TOKEN || 'PASTE_BOT_TOKEN_HERE';
const chatId = process.env.TELEGRAM_CHAT_ID || 'PASTE_CHAT_ID_HERE';

const content = `window.TELEGRAM_CONFIG = {
  botToken: "${botToken}",
  chatId: "${chatId}"
};
`;

const outPath = path.join(__dirname, '..', 'js', 'telegram-config.js');
fs.writeFileSync(outPath, content);
console.log(`Generated ${outPath} (Telegram ${botToken.includes('PASTE_') ? 'disabled - no env vars set' : 'configured'})`);
