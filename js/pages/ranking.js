/* ==========================================================================
   SUNDAY FOOTBALL - PAGE 5: TRANG BXH (LEADERBOARD & TOP SCORERS)
   ========================================================================== */

class RankingPageController {
  render() {
    const container = document.getElementById('page-ranking');
    if (!container) return;

    const matches = Store.getMatches();
    const players = Store.getPlayers();
    const standings = this.calculateStandings(matches);

    // Top Scorers sorted by goals descending
    const topScorers = [...players].filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5);

    container.innerHTML = `
      <!-- Standings Table Card -->
      <div class="card">
        <div class="card-header-flex">
          <div class="card-title">
            <span class="card-title-icon">🏆</span>
            <span>Bảng Xếp Hạng 3 Đội Luân Phiên</span>
          </div>
          <span class="section-badge">Mùa 2026</span>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Đội</th>
                <th style="text-align:center;">Trận</th>
                <th style="text-align:center;">T-H-B</th>
                <th style="text-align:center;">BT-BB</th>
                <th style="text-align:center;">HS</th>
                <th style="text-align:center;">Điểm</th>
              </tr>
            </thead>
            <tbody>
              ${standings.map((t, idx) => `
                <tr style="${idx === 0 ? 'background:rgba(6,182,212,0.1);' : ''}">
                  <td style="font-weight:800; display:flex; align-items:center; gap:6px;">
                    <span>${idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                    <span class="team-badge team-badge-${t.id}">${t.name}</span>
                  </td>
                  <td style="text-align:center; font-weight:700;">${t.played}</td>
                  <td style="text-align:center; color:var(--text-muted); font-size:0.8rem;">${t.won}-${t.drawn}-${t.lost}</td>
                  <td style="text-align:center; color:var(--text-muted); font-size:0.8rem;">${t.gf}-${t.ga}</td>
                  <td style="text-align:center; font-weight:700; color:${t.gd > 0 ? 'var(--accent-emerald)' : t.gd < 0 ? 'var(--accent-rose)' : 'var(--text-muted)'}">
                    ${t.gd > 0 ? `+${t.gd}` : t.gd}
                  </td>
                  <td style="text-align:center; font-weight:900; font-size:1.05rem; color:var(--accent-cyan);">
                    ${t.pts}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

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
              <span style="font-weight:900; font-size:0.95rem; color:var(--accent-cyan);">${p.goals} bàn</span>
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
          ${matches.filter(m => m.status === 'finished').map((m, idx) => `
            <div style="background:rgba(9,13,22,0.6); padding:10px 14px; border-radius:8px; border:1px solid var(--border-color);">
              <div style="display:flex; justify-content:space-between; font-size:0.88rem; font-weight:800;">
                <span>Trận ${idx + 1}: Đội ${m.homeTeam} vs Đội ${m.awayTeam}</span>
                <span style="color:var(--accent-cyan);">${m.homeScore} - ${m.awayScore}</span>
              </div>
              ${m.scorers && m.scorers.length > 0 ? `
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">
                  ⚽ ${m.scorers.map(s => `${s.name} (${s.goals})`).join(', ')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  calculateStandings(matches) {
    const teams = {
      1: { id: 1, name: 'Đội 1 (Đỏ)', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
      2: { id: 2, name: 'Đội 2 (Xanh)', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
      3: { id: 3, name: 'Đội 3 (Vàng)', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
    };

    matches.forEach(m => {
      if (m.status === 'finished') {
        const home = teams[m.homeTeam];
        const away = teams[m.awayTeam];

        if (home && away) {
          home.played++;
          away.played++;

          home.gf += m.homeScore;
          home.ga += m.awayScore;
          away.gf += m.awayScore;
          away.ga += m.homeScore;

          if (m.homeScore > m.awayScore) {
            home.won++;
            home.pts += 3;
            away.lost++;
          } else if (m.homeScore < m.awayScore) {
            away.won++;
            away.pts += 3;
            home.lost++;
          } else {
            home.drawn++;
            away.drawn++;
            home.pts += 1;
            away.pts += 1;
          }
        }
      }
    });

    Object.values(teams).forEach(t => {
      t.gd = t.gf - t.ga;
    });

    return Object.values(teams).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  }
}

window.RankingPage = new RankingPageController();
