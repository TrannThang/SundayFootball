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

  // Builds and sends a text summary of a closed 4-session cycle ("1 tháng" =
  // 4 buổi đá thực tế, not a calendar month) - standings, top scorers/assists,
  // and any weeks the admin marked as skipped within those dates. Called from
  // Store.startNewWeek() once the 4th session in the cycle closes out.
  sendCycleArchive(dates, data) {
    if (!this.isConfigured()) return;

    const matches = (data.matches || []).filter(m => m.status === 'finished' && dates.includes(m.matchDate));
    const players = data.players || [];
    const skipped = (data.skippedWeeks || []).filter(s => dates.includes(s.date));
    const rangeLabel = dates.length > 1 ? `${dates[0]} → ${dates[dates.length - 1]}` : dates[0];

    if (matches.length === 0 && skipped.length === 0) return; // nothing happened this cycle, skip the noise

    const teams = {
      1: { name: 'Đội 1 (Đỏ)', played: 0, gf: 0, ga: 0, pts: 0 },
      2: { name: 'Đội 2 (Xanh)', played: 0, gf: 0, ga: 0, pts: 0 },
      3: { name: 'Đội 3 (Vàng)', played: 0, gf: 0, ga: 0, pts: 0 }
    };
    const goalsByName = {};
    const assistsByName = {};

    matches.forEach(m => {
      const home = teams[m.homeTeam], away = teams[m.awayTeam];
      if (home && away) {
        home.played++; away.played++;
        home.gf += m.homeScore; home.ga += m.awayScore;
        away.gf += m.awayScore; away.ga += m.homeScore;
        if (m.homeScore > m.awayScore) home.pts += 3;
        else if (m.homeScore < m.awayScore) away.pts += 3;
        else { home.pts += 1; away.pts += 1; }
      }
      (m.scorers || []).forEach(s => {
        const key = s.name.toLowerCase();
        goalsByName[key] = (goalsByName[key] || 0) + (s.goals || 1);
        if (s.assist) {
          const aKey = s.assist.toLowerCase();
          assistsByName[aKey] = (assistsByName[aKey] || 0) + 1;
        }
      });
    });

    const standings = Object.values(teams).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    const topScorers = players
      .map(p => ({ name: p.name, goals: goalsByName[p.name.toLowerCase()] || 0 }))
      .filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5);
    const topAssists = players
      .map(p => ({ name: p.name, assists: assistsByName[p.name.toLowerCase()] || 0 }))
      .filter(p => p.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 5);

    let text = `📊 TỔNG KẾT CHU KỲ (${dates.length} buổi đá)\n${rangeLabel}\n\n`;

    text += `🏆 Bảng xếp hạng:\n`;
    standings.forEach((t, i) => {
      text += `${i + 1}. ${t.name}: ${t.pts}đ (${t.played} trận, HS ${t.gf - t.ga >= 0 ? '+' : ''}${t.gf - t.ga})\n`;
    });

    if (topScorers.length > 0) {
      text += `\n⚽ Vua phá lưới:\n`;
      topScorers.forEach((p, i) => { text += `${i + 1}. ${p.name}: ${p.goals} bàn\n`; });
    }

    if (topAssists.length > 0) {
      text += `\n🎯 Vua kiến tạo:\n`;
      topAssists.forEach((p, i) => { text += `${i + 1}. ${p.name}: ${p.assists} kiến tạo\n`; });
    }

    if (skipped.length > 0) {
      text += `\n🌧 Tuần nghỉ:\n`;
      skipped.forEach(s => { text += `• ${s.date}: ${s.reason}\n`; });
    }

    text += `\n📅 Tổng ${matches.length} trận trong chu kỳ này. Bảng Vua Phá Lưới trên web sẽ tính lại từ đầu cho chu kỳ mới.`;

    this.send(text);
  }

  // Clean recap of a single match day: just who scored and who assisted that
  // day - no match list, no attendance, no fund numbers. Called when starting
  // a new week (see Store.startNewWeek), or on demand via "📤 Gửi Telegram".
  sendWeeklyReport(dateStr, data) {
    if (!this.isConfigured()) return;

    const matches = (data.matches || []).filter(m => m.status === 'finished' && m.matchDate === dateStr);
    const players = data.players || [];
    const skip = (data.skippedWeeks || []).find(s => s.date === dateStr);
    const [y, m, d] = dateStr.split('-');

    let text = `📅 NGÀY ${d}/${m}/${y}\n\n`;

    if (skip) {
      text += `🌧 Nghỉ: ${skip.reason}`;
      this.send(text);
      return;
    }

    if (matches.length === 0) {
      text += `Chưa có trận nào được ghi nhận cho ngày này.`;
      this.send(text);
      return;
    }

    const goalsByName = {};
    const assistsByName = {};
    matches.forEach(mm => {
      (mm.scorers || []).forEach(s => {
        const key = s.name.toLowerCase();
        goalsByName[key] = (goalsByName[key] || 0) + (s.goals || 1);
        if (s.assist) {
          const aKey = s.assist.toLowerCase();
          assistsByName[aKey] = (assistsByName[aKey] || 0) + 1;
        }
      });
    });

    const topScorers = Object.entries(goalsByName).sort((a, b) => b[1] - a[1]);
    if (topScorers.length > 0) {
      text += `🥅 Ghi bàn:\n`;
      topScorers.forEach(([name, goals]) => {
        const p = players.find(pl => pl.name.toLowerCase() === name);
        text += `• ${p ? p.name : name}: ${goals} bàn\n`;
      });
    } else {
      text += `Chưa có bàn thắng nào được ghi nhận.\n`;
    }

    const topAssists = Object.entries(assistsByName).sort((a, b) => b[1] - a[1]);
    if (topAssists.length > 0) {
      text += `\n🎯 Kiến tạo:\n`;
      topAssists.forEach(([name, count]) => {
        const p = players.find(pl => pl.name.toLowerCase() === name);
        text += `• ${p ? p.name : name}: ${count}\n`;
      });
    }

    this.send(text.trim());
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
