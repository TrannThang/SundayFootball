/* ==========================================================================
   SUNDAY FOOTBALL - PAGE 5: TRANG BXH (TOP SCORERS & MATCH HISTORY)
   ========================================================================== */

class RankingPageController {
  render() {
    const container = document.getElementById('page-ranking');
    if (!container) return;

    const matches = Store.getMatches();
    const players = Store.getPlayers();

    // Computed live from real match history (not a stored counter), so it can
    // never drift out of sync with the matches shown below.
    const topScorers = this.calculateTopScorers(matches, players);

    container.innerHTML = `
      <!-- Golden Boot Section -->
      <div class="card">
        <div class="card-header-flex">
          <div class="card-title">
            <span class="card-title-icon">⚽</span>
            <span>Vua Phá Lưới</span>
          </div>
          <span style="font-size:0.72rem; color:var(--accent-gold); font-weight:800;">TOP GOALS</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:6px;">
          ${topScorers.length > 0 ? topScorers.map((p, idx) => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(9,13,22,0.6); padding:8px 12px; border-radius:8px; cursor:pointer;" onclick="PlayerDetail.show(${p.id})">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:900; font-size:0.85rem; color:var(--accent-gold); width:18px;">#${idx + 1}</span>
                <span style="font-weight:700; font-size:0.88rem;">${p.name}</span>
                <span class="team-badge team-badge-${p.teamId}" style="font-size:0.65rem;">Đội ${p.teamId}</span>
              </div>
              <span style="font-weight:900; font-size:0.95rem; color:var(--accent-cyan);">${p.matchGoals} bàn</span>
            </div>
          `).join('') : '<div style="text-align:center; color:var(--text-muted); padding:10px;">Chưa có dữ liệu bàn thắng</div>'}
        </div>
      </div>

      <!-- Match History List -->
      <div class="card" style="margin-top:14px;">
        <div class="card-title" style="margin-bottom:10px;">
          <span class="card-title-icon">📜</span>
          <span>Lịch Sử Tất Cả Các Trận Đã Đá</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${matches.filter(m => m.status === 'finished').length === 0 ? `
            <div style="text-align:center; color:var(--text-muted); padding:16px;">Chưa có trận nào được ghi nhận</div>
          ` : matches.filter(m => m.status === 'finished').map((m, idx) => `
            <div style="background:rgba(9,13,22,0.6); padding:10px 14px; border-radius:8px; border:1px solid var(--border-color);">
              <div style="display:flex; justify-content:space-between; font-size:0.88rem; font-weight:800;">
                <span>Trận ${idx + 1}: Đội ${m.homeTeam} vs Đội ${m.awayTeam}</span>
                <span style="color:var(--accent-cyan);">${m.homeScore} - ${m.awayScore}</span>
              </div>
              ${m.scorers && m.scorers.length > 0 ? `
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">
                  ⚽ ${m.scorers.map(s => s.name).join(', ')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  calculateTopScorers(matches, players) {
    // Start from the cumulative archive (goals from matches that were purged
    // from data.matches for decluttering/cycle-reset) then add whatever's
    // still live - so Vua Phá Lưới never resets just because old match rows
    // got cleaned up.
    const goalsByName = { ...Store.getArchivedGoals() };
    matches.forEach(m => {
      if (m.status === 'finished' && m.scorers) {
        m.scorers.forEach(s => {
          const key = s.name.toLowerCase();
          goalsByName[key] = (goalsByName[key] || 0) + (s.goals || 1);
        });
      }
    });

    return players
      .map(p => ({ ...p, matchGoals: goalsByName[p.name.toLowerCase()] || 0 }))
      .filter(p => p.matchGoals > 0)
      .sort((a, b) => b.matchGoals - a.matchGoals)
      .slice(0, 10);
  }
}

window.RankingPage = new RankingPageController();
