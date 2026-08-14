/* ==========================================================================
   SUNDAY FOOTBALL - TELEGRAM VOTE NOTIFICATIONS
   Sends a Telegram message to the admin's chat every time a player's
   attendance changes. Pure client-side call to the Telegram Bot API - no
   backend needed. Silently does nothing if telegram-config.js isn't filled in.
   ========================================================================== */

class TelegramNotifyEngine {
  isConfigured() {
    const cfg = window.TELEGRAM_CONFIG;
    return !!(cfg && cfg.botToken && cfg.chatId &&
      !cfg.botToken.includes('PASTE_') && !cfg.chatId.includes('PASTE_'));
  }

  notifyVote(playerName, status, votedBy) {
    if (!this.isConfigured()) return;
    const statusLabel = status === 'going' ? '✅ ĐI' : status === 'absent' ? '❌ VẮNG' : '⏳ Chưa vote';
    const who = votedBy === 'admin' ? ' (Admin bấm giúp)' : '';
    this.send(`⚽ Sunday Football\n${playerName} vừa điểm danh: ${statusLabel}${who}`);
  }

  send(text) {
    const { botToken, chatId } = window.TELEGRAM_CONFIG;
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    }).catch((e) => {
      console.warn('Không gửi được thông báo Telegram (offline?)', e);
    });
  }
}

window.TelegramNotify = new TelegramNotifyEngine();
