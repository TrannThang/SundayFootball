/* ==========================================================================
   SUNDAY FOOTBALL - PAGE 4: TRANG QUỸ (FUND & TRANSACTIONS)
   ========================================================================== */

class FundPageController {
  constructor() {
    this.filterType = 'ALL'; // ALL, income, expense
  }

  render() {
    const container = document.getElementById('page-fund');
    if (!container) return;

    const fundData = Store.getFund();
    const isAdmin = Auth.isAdmin();

    const formatVnd = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    container.innerHTML = `
      <!-- Financial Summary Cards -->
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:14px;">
        <div class="card" style="margin:0; padding:12px; text-align:center;">
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">SỐ DƯ DƯ DỰ</div>
          <div style="font-size:1rem; font-weight:900; color:var(--accent-cyan); margin-top:2px;">${formatVnd(fundData.balance)}</div>
        </div>
        <div class="card" style="margin:0; padding:12px; text-align:center;">
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">TỔNG THU</div>
          <div style="font-size:1rem; font-weight:900; color:var(--accent-emerald); margin-top:2px;">+${formatVnd(fundData.income)}</div>
        </div>
        <div class="card" style="margin:0; padding:12px; text-align:center;">
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">TỔNG CHI</div>
          <div style="font-size:1rem; font-weight:900; color:var(--accent-rose); margin-top:2px;">-${formatVnd(fundData.expense)}</div>
        </div>
      </div>

      <!-- 6-Month Income vs Expense Visual Bar Chart -->
      <div class="card">
        <div class="card-header-flex" style="margin-bottom:4px;">
          <div class="card-title">
            <span class="card-title-icon">📊</span>
            <span>Thu Chi 6 Tháng Gần Nhất</span>
          </div>
          <div style="display:flex; gap:10px; font-size:0.75rem;">
            <span style="color:var(--accent-emerald); font-weight:700;">🟢 Thu</span>
            <span style="color:var(--accent-rose); font-weight:700;">🔴 Chi</span>
          </div>
        </div>

        <div class="chart-bar-container">
          ${this.renderBarChart()}
        </div>
      </div>

      <!-- Current Active Campaign Card -->
      <div class="card" style="background:linear-gradient(135deg, rgba(6,182,212,0.1), rgba(19,27,46,0.9)); border:1px solid rgba(6,182,212,0.3);">
        <div class="card-header-flex">
          <div>
            <span class="section-badge">ĐỢT THU QUỸ HIỆN TẠI</span>
            <h3 style="font-size:1.05rem; font-weight:800; margin-top:4px;">${fundData.activeDrive.title}</h3>
          </div>
          <button class="btn btn-outline btn-sm" onclick="FundPage.openChecklistModal()">
            📋 Chi Tiết Từng Người
          </button>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:0.85rem; background:rgba(9,13,22,0.5); padding:10px 14px; border-radius:8px;">
          <div>Mức thu: <strong style="color:var(--accent-gold);">${formatVnd(fundData.activeDrive.amountPerPerson)}/người</strong></div>
          <div>Hạn nộp: <strong style="color:var(--accent-rose);">${fundData.activeDrive.deadline}</strong></div>
        </div>

        <div style="margin-top:10px; font-size:0.82rem; color:var(--accent-emerald); font-weight:700;">
          ✅ Đã hoàn thành: ${fundData.activeDrive.paidIds.length}/${Store.getPlayers().length} thành viên
        </div>
      </div>

      <!-- Transaction History Log -->
      <div class="card">
        <div class="card-header-flex">
          <div class="card-title">
            <span class="card-title-icon">📜</span>
            <span>Lịch Sử Giao Dịch</span>
          </div>

          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" onclick="FundPage.openAddFundModal()">
              ➕ Thêm Giao Dịch
            </button>
          ` : ''}
        </div>

        <!-- Filter Tabs for Transactions -->
        <div class="filter-tabs" style="margin-bottom:10px;">
          <button class="filter-tab-btn ${this.filterType === 'ALL' ? 'active' : ''}" onclick="FundPage.setFilter('ALL')">Tất Cả</button>
          <button class="filter-tab-btn ${this.filterType === 'income' ? 'active' : ''}" onclick="FundPage.setFilter('income')">Thu (+)</button>
          <button class="filter-tab-btn ${this.filterType === 'expense' ? 'active' : ''}" onclick="FundPage.setFilter('expense')">Chi (-)</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${this.renderTransactions(fundData.transactions, formatVnd)}
        </div>
      </div>
    `;
  }

  setFilter(type) {
    this.filterType = type;
    this.render();
  }

  renderBarChart() {
    const months = ['T3', 'T4', 'T5', 'T6', 'T7', 'T8'];
    const mockData = [
      { inc: 1800000, exp: 1200000 },
      { inc: 1950000, exp: 1400000 },
      { inc: 1650000, exp: 1100000 },
      { inc: 2100000, exp: 1800000 },
      { inc: 1950000, exp: 1850000 },
      { inc: 1950000, exp: 1250000 }
    ];

    const maxVal = 2500000;

    return mockData.map((d, idx) => {
      const incH = Math.round((d.inc / maxVal) * 100);
      const expH = Math.round((d.exp / maxVal) * 100);
      return `
        <div class="chart-column">
          <div class="chart-bars-wrapper">
            <div class="chart-bar-inc" style="height:${incH}px;" title="Thu: ${d.inc}đ"></div>
            <div class="chart-bar-exp" style="height:${expH}px;" title="Chi: ${d.exp}đ"></div>
          </div>
          <span class="chart-label">${months[idx]}</span>
        </div>
      `;
    }).join('');
  }

  renderTransactions(transactions, formatVnd) {
    let filtered = transactions;
    if (this.filterType !== 'ALL') {
      filtered = transactions.filter(t => t.type === this.filterType);
    }

    if (filtered.length === 0) {
      return `<div style="text-align:center; color:var(--text-muted); padding:16px;">Không có giao dịch nào</div>`;
    }

    return filtered.map(t => {
      const isInc = t.type === 'income';
      return `
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(9,13,22,0.6); padding:10px 14px; border-radius:8px; border-left:3px solid ${isInc ? 'var(--accent-emerald)' : 'var(--accent-rose)'}">
          <div>
            <div style="font-weight:700; font-size:0.88rem;">${t.desc}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${t.date}</div>
          </div>
          <div style="font-weight:900; font-size:0.95rem; color:${isInc ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
            ${isInc ? '+' : '-'}${formatVnd(t.amount)}
          </div>
        </div>
      `;
    }).join('');
  }

  openChecklistModal() {
    const players = Store.getPlayers();
    const fund = Store.getFund();
    const paidIds = fund.activeDrive.paidIds;
    const isAdmin = Auth.isAdmin();

    const container = document.getElementById('fund-checklist-content');
    container.innerHTML = `
      <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:12px;">
        Đợt thu: <strong>${fund.activeDrive.title}</strong> (${new Intl.NumberFormat('vi-VN').format(fund.activeDrive.amountPerPerson)}đ/người)
      </p>
      <div style="display:flex; flex-direction:column; gap:6px; max-height:350px; overflow-y:auto;">
        ${players.map(p => {
          const isPaid = paidIds.includes(p.id);
          return `
            <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(9,13,22,0.6); padding:8px 12px; border-radius:8px;">
              <span style="font-weight:700; font-size:0.88rem;">${p.name} (${p.pos})</span>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:0.8rem; font-weight:800; color:${isPaid ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                  ${isPaid ? '✅ ĐÃ NỘP' : '❌ CHƯA NỘP'}
                </span>
                ${isAdmin ? `
                  <button class="btn btn-secondary btn-sm" onclick="FundPage.togglePaid(${p.id})">
                    ${isPaid ? 'Báo chưa' : 'Báo đã nộp'}
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    App.openModal('fund-checklist-modal');
  }

  togglePaid(playerId) {
    Store.toggleFundPayment(playerId);
    this.openChecklistModal();
    this.render();
    App.showToast('Đã cập nhật trạng thái đóng quỹ!', 'info');
  }

  openAddFundModal() {
    document.getElementById('fund-desc').value = '';
    document.getElementById('fund-amount').value = '';
    document.getElementById('fund-date').value = new Date().toISOString().split('T')[0];
    App.openModal('fund-modal');
  }

  saveTransaction(e) {
    e.preventDefault();
    const type = document.getElementById('fund-type').value;
    const desc = document.getElementById('fund-desc').value.trim();
    const amount = Number(document.getElementById('fund-amount').value);
    const date = document.getElementById('fund-date').value;

    Store.addFundTransaction({ type, desc, amount, date });
    App.showToast('Đã thêm giao dịch quỹ mới! 💸', 'success');
    App.closeModal('fund-modal');
    this.render();
  }
}

window.FundPage = new FundPageController();
