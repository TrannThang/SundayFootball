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
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">SỐ DƯ QUỸ</div>
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

      <!-- Current Match Payment Session Card -->
      <div class="card" style="background:linear-gradient(135deg, rgba(6,182,212,0.1), rgba(19,27,46,0.9)); border:1px solid rgba(6,182,212,0.3);">
        <div class="card-header-flex">
          <div>
            <span class="section-badge">THU TIỀN TRẬN TUẦN NÀY</span>
            <h3 style="font-size:1.05rem; font-weight:800; margin-top:4px;">${this.formatDate(fundData.matchSession.date)}</h3>
          </div>
          <button class="btn btn-outline btn-sm" onclick="FundPage.openChecklistModal()">
            📋 Chi Tiết Từng Người
          </button>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:0.85rem; background:rgba(9,13,22,0.5); padding:10px 14px; border-radius:8px;">
          <div>Phí mặc định: <strong style="color:var(--accent-gold);">${formatVnd(fundData.matchSession.fee)}/người</strong></div>
          <div>Đã đóng: <strong style="color:var(--accent-emerald);">${fundData.matchSession.paidIds.length}/${Store.getPlayers().length}</strong></div>
        </div>

        <div style="margin-top:6px; font-size:0.82rem; color:var(--text-secondary);">
          Đã thu: <strong style="color:var(--accent-emerald);">${formatVnd(this.getSessionCollected())}</strong> / dự kiến <strong>${formatVnd(this.getSessionExpected())}</strong>
        </div>

        ${isAdmin ? `
          <div style="display:flex; gap:8px; margin-top:12px; border-top:1px solid var(--border-color); padding-top:12px;">
            <input type="number" id="session-fee-input" class="form-input" value="${fundData.matchSession.fee}" step="10000" style="flex:1;" placeholder="Phí/người">
            <input type="date" id="session-date-input" class="form-input" value="${fundData.matchSession.date}" style="flex:1;">
          </div>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="FundPage.saveSessionInfo()">💾 Cập nhật phí/ngày</button>
            <button class="btn btn-outline btn-sm" style="flex:1;" onclick="FundPage.startNewSession()">🔄 Buổi đá mới</button>
          </div>
        ` : ''}
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

  formatDate(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  }

  getSessionCollected() {
    const fund = Store.getFund();
    return fund.matchSession.paidIds.reduce((sum, id) => sum + Store.getPlayerMatchFee(id), 0);
  }

  getSessionExpected() {
    return Store.getPlayers().reduce((sum, p) => sum + Store.getPlayerMatchFee(p.id), 0);
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
    const paidIds = fund.matchSession.paidIds;
    const isAdmin = Auth.isAdmin();

    const container = document.getElementById('fund-checklist-content');
    container.innerHTML = `
      <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:10px;">
        Trận ngày <strong>${this.formatDate(fund.matchSession.date)}</strong> — phí mặc định ${new Intl.NumberFormat('vi-VN').format(fund.matchSession.fee)}đ/người, có thể sửa riêng từng người bên dưới.
      </p>

      ${isAdmin ? `
        <div style="display:flex; gap:8px; margin-bottom:10px;">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="FundPage.markAllPaid()">✅ Chọn tất cả đã đóng</button>
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="FundPage.markAllUnpaid()">❌ Bỏ chọn tất cả</button>
        </div>
      ` : ''}

      <div style="display:flex; flex-direction:column; gap:6px; max-height:350px; overflow-y:auto;">
        ${players.map(p => {
          const isPaid = paidIds.includes(p.id);
          const fee = Store.getPlayerMatchFee(p.id);
          return `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:rgba(9,13,22,0.6); padding:8px 12px; border-radius:8px;">
              <span style="font-weight:700; font-size:0.85rem; flex:1;">${p.name} (${p.pos})</span>
              ${isAdmin ? `
                <input type="number" class="form-input" value="${fee}" step="10000" style="width:90px; padding:4px 8px; font-size:0.78rem;" onchange="FundPage.setPlayerFee(${p.id}, this.value)">
              ` : `<span style="font-size:0.78rem; color:var(--text-muted);">${new Intl.NumberFormat('vi-VN').format(fee)}đ</span>`}
              <span style="font-size:0.78rem; font-weight:800; color:${isPaid ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; white-space:nowrap;">
                ${isPaid ? '✅ ĐÃ ĐÓNG' : '❌ CHƯA'}
              </span>
              ${isAdmin ? `
                <button class="btn btn-secondary btn-sm" onclick="FundPage.togglePaid(${p.id})">
                  ${isPaid ? 'Báo chưa' : 'Báo đã đóng'}
                </button>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    App.openModal('fund-checklist-modal');
  }

  togglePaid(playerId) {
    Store.toggleMatchPayment(playerId);
    this.openChecklistModal();
    this.render();
    App.showToast('Đã cập nhật trạng thái đóng tiền!', 'info');
  }

  setPlayerFee(playerId, amount) {
    Store.setPlayerMatchFee(playerId, amount);
    this.openChecklistModal();
    this.render();
  }

  markAllPaid() {
    Store.markAllMatchPaid();
    this.openChecklistModal();
    this.render();
    App.showToast('Đã đánh dấu tất cả đã đóng tiền!', 'success');
  }

  markAllUnpaid() {
    if (!confirm('Bỏ chọn tất cả sẽ đánh dấu mọi người là chưa đóng tiền. Tiếp tục?')) return;
    Store.markAllMatchUnpaid();
    this.openChecklistModal();
    this.render();
    App.showToast('Đã bỏ chọn tất cả!', 'info');
  }

  saveSessionInfo() {
    const fee = document.getElementById('session-fee-input').value;
    const date = document.getElementById('session-date-input').value;
    Store.updateMatchSessionInfo(fee, date);
    App.showToast('Đã cập nhật phí & ngày trận đấu!', 'success');
    this.render();
  }

  startNewSession() {
    if (!confirm('Bắt đầu buổi thu tiền mới sẽ xoá danh sách đã đóng tiền của buổi trước. Tiếp tục?')) return;
    const fee = document.getElementById('session-fee-input').value || 500000;
    const today = new Date().toISOString().split('T')[0];
    Store.startNewMatchSession(fee, today);
    App.showToast('Đã tạo buổi thu tiền mới cho trận tuần này!', 'success');
    this.render();
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
