/* ==========================================================================
   SUNDAY FOOTBALL - PAGE 6: MẪU ÁO (JERSEY DESIGN VOTING)
   Everyone can browse the 12 designs and see live results without logging
   in (same open-browsing pattern as the rest of the app) - only casting a
   vote requires being logged in as a player. One vote per player, locked
   after submit; only Admin can unlock someone to let them redo it.
   ========================================================================== */

class JerseyPageController {
  constructor() {
    this.selected = []; // design numbers picked in the current unsent session
    this.noOrder = false;
  }

  render() {
    const container = document.getElementById('page-jersey');
    if (!container) return;

    const currentPlayer = Auth.getCurrentPlayer();
    const results = Store.getJerseyResults();

    container.innerHTML = `
      <div class="card">
        <div class="card-title" style="margin-bottom:6px;">
          <span class="card-title-icon">👕</span>
          <span>Chọn Mẫu Áo Đội</span>
        </div>
        <p style="font-size:0.82rem; color:var(--text-secondary);">
          Mỗi người được chọn tối đa <strong>2 mẫu</strong> trong 12 mẫu bên dưới, hoặc chọn "Không đặt áo" nếu không có nhu cầu. Chỉ chốt được <strong>1 lần</strong> - chọn kỹ trước khi bấm Chốt nhé!
        </p>
      </div>

      ${Auth.isAdmin() ? this.renderAdminPanel() : ''}
      ${!Auth.isLoggedIn() ? this.renderLoginPrompt() : ''}
      ${currentPlayer ? this.renderVotingSection(currentPlayer) : ''}

      <div class="card" style="margin-top:14px;">
        <div class="card-header-flex">
          <div class="card-title">
            <span class="card-title-icon">📊</span>
            <span>Kết Quả Bình Chọn</span>
          </div>
          <span style="font-size:0.72rem; color:var(--text-muted);">${results.totalVoters} người đã chốt${results.noOrderCount > 0 ? ` • ${results.noOrderCount} không đặt áo` : ''}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${results.totalVoters === 0 ? `
            <div style="text-align:center; color:var(--text-muted); padding:16px;">Chưa có ai chốt mẫu.</div>
          ` : results.ranked.map((j, idx) => this.renderResultRow(j, idx, results.totalVoters)).join('')}
        </div>
      </div>

      <div class="jersey-grid">
        ${Store.getJerseyCatalog().map(j => this.renderGalleryCard(j)).join('')}
      </div>
    `;
  }

  renderLoginPrompt() {
    return `
      <div class="card" style="margin-top:14px; text-align:center;">
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:10px;">Đăng nhập bằng mã PIN để chọn mẫu áo cho riêng bạn.</p>
        <button class="btn btn-primary btn-block" onclick="Auth.openPinModal()">⚡ Đăng Nhập</button>
      </div>
    `;
  }

  renderAdminPanel() {
    const votes = Store.getJerseyVotes();
    const votedPlayers = Store.getPlayers().filter(p => votes[String(p.id)]);
    return `
      <div class="card" style="margin-top:14px; border:1px solid rgba(245,158,11,0.3);">
        <div class="card-title" style="color:var(--accent-gold); margin-bottom:8px;">⚡ Quản Lý (Admin)</div>
        ${votedPlayers.length === 0 ? `
          <p style="font-size:0.8rem; color:var(--text-muted);">Chưa có ai chốt mẫu.</p>
        ` : `
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <select id="jersey-admin-select" class="form-select" style="flex:1; min-width:160px;">
              ${votedPlayers.map(p => {
                const v = votes[String(p.id)];
                const label = v.noOrder ? 'Không đặt áo' : `Mẫu ${v.picks.join(', ')}`;
                return `<option value="${p.id}">${p.name} - ${label}</option>`;
              }).join('')}
            </select>
            <button class="btn btn-danger btn-sm" onclick="JerseyPage.adminUnlock()">🔓 Mở lại cho chọn lại</button>
          </div>
        `}
      </div>
    `;
  }

  renderVotingSection(player) {
    const existing = Store.getJerseyVoteFor(player.id);
    if (existing) {
      const label = existing.noOrder ? 'Không đặt áo' : `Mẫu ${existing.picks.join(' và ')}`;
      return `
        <div class="card" style="margin-top:14px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3);">
          <div style="font-size:0.9rem; font-weight:700;">✅ Bạn đã chốt: <span style="color:var(--accent-emerald);">${label}</span></div>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${App.formatRelativeTime(existing.votedAt)} - nhờ Admin nếu cần đổi lại.</p>
        </div>
      `;
    }

    return `
      <div class="card" style="margin-top:14px;">
        <div style="font-size:0.9rem; font-weight:700; margin-bottom:8px;">Chào ${player.name}, chọn mẫu áo của bạn:</div>
        <div id="jersey-selected-summary" style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:10px;">${this.summaryText()}</div>
        <div style="display:flex; gap:8px;">
          <button class="btn ${this.noOrder ? 'btn-danger' : 'btn-outline'} btn-sm" onclick="JerseyPage.toggleNoOrder()">🚫 Không đặt áo</button>
          <button class="btn btn-primary btn-block" onclick="JerseyPage.submit()">✅ Chốt Lựa Chọn</button>
        </div>
      </div>
    `;
  }

  summaryText() {
    if (this.noOrder) return 'Đã chọn: Không đặt áo';
    if (this.selected.length === 0) return 'Chưa chọn mẫu nào (chạm vào ảnh bên dưới để chọn, tối đa 2 mẫu).';
    return `Đã chọn: Mẫu ${this.selected.join(', ')} (${this.selected.length}/2)`;
  }

  renderResultRow(j, idx, totalVoters) {
    const pct = totalVoters > 0 ? Math.round((j.count / totalVoters) * 100) : 0;
    return `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-weight:900; font-size:0.8rem; color:var(--accent-gold); width:22px;">#${idx + 1}</span>
        <img src="${j.img}" style="width:36px; height:36px; object-fit:cover; border-radius:6px; flex-shrink:0;" loading="lazy">
        <div style="flex:1; min-width:0;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700;">
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Mẫu ${j.num} - ${j.label}</span>
            <span style="color:var(--accent-cyan); flex-shrink:0; margin-left:6px;">${j.count} lượt</span>
          </div>
          <div style="background:var(--bg-surface); border-radius:4px; height:6px; margin-top:4px; overflow:hidden;">
            <div style="background:var(--accent-cyan); height:100%; width:${pct}%; transition:width 0.3s;"></div>
          </div>
        </div>
      </div>
    `;
  }

  renderGalleryCard(j) {
    const isSelected = this.selected.includes(j.num);
    return `
      <div class="jersey-card ${isSelected ? 'selected' : ''}" onclick="JerseyPage.toggleSelect(${j.num})">
        <div class="jersey-card-num">#${j.num}</div>
        ${isSelected ? '<div class="jersey-card-check">✅</div>' : ''}
        <img src="${j.img}" alt="Mẫu ${j.num}" loading="lazy">
        <div class="jersey-card-label">${j.label}</div>
      </div>
    `;
  }

  toggleSelect(num) {
    if (!Auth.getCurrentPlayer()) {
      App.showToast('Đăng nhập trước để chọn mẫu áo.', 'error');
      return;
    }
    if (Store.hasVotedJersey(Auth.currentUser.id)) return;

    this.noOrder = false;
    const idx = this.selected.indexOf(num);
    if (idx !== -1) {
      this.selected.splice(idx, 1);
    } else {
      if (this.selected.length >= 2) {
        App.showToast('Chỉ được chọn tối đa 2 mẫu - bỏ bớt 1 mẫu trước đã.', 'error');
        return;
      }
      this.selected.push(num);
    }
    this.render();
  }

  toggleNoOrder() {
    this.noOrder = !this.noOrder;
    if (this.noOrder) this.selected = [];
    this.render();
  }

  submit() {
    const player = Auth.getCurrentPlayer();
    if (!player) return;
    if (!this.noOrder && this.selected.length === 0) {
      App.showToast('Chọn ít nhất 1 mẫu, hoặc bấm "Không đặt áo".', 'error');
      return;
    }
    if (!confirm(this.noOrder
      ? 'Xác nhận: Bạn KHÔNG đặt áo?'
      : `Xác nhận chốt mẫu: ${this.selected.join(', ')}? Không đổi lại được sau khi chốt.`)) return;

    const result = Store.submitJerseyVote(player.id, this.selected, this.noOrder);
    if (!result.ok) {
      App.showToast(result.error, 'error');
      return;
    }
    if (window.TelegramNotify) TelegramNotify.notifyJerseyVote(player.name, this.selected, this.noOrder);
    this.selected = [];
    this.noOrder = false;
    App.showToast('Đã chốt mẫu áo thành công! 👕', 'success');
    this.render();
  }

  adminUnlock() {
    const select = document.getElementById('jersey-admin-select');
    if (!select) return;
    const playerId = select.value;
    const player = Store.getPlayerById(playerId);
    if (!confirm(`Mở lại cho ${player ? player.name : ''} chọn mẫu áo lần nữa?`)) return;
    Store.adminUnlockJerseyVote(playerId);
    App.showToast(`Đã mở lại cho ${player ? player.name : ''}.`, 'success');
    this.render();
  }
}

window.JerseyPage = new JerseyPageController();
