/* ==========================================================================
   SUNDAY FOOTBALL - CENTRAL LOCAL & CLOUD STATE STORE (V3 SÂN 5 UPGRADE)
   ========================================================================== */

const STORAGE_KEY = 'SUNDAY_FOOTBALL_DATA_V3';

// 21 Official Real Members Roster with Sân 5 (Futsal) Positions
const DEFAULT_PLAYERS = [
  { id: 1, name: 'Trần Thắng', fullName: 'Trần Thắng', pos: 'PIV', ovr: 74, teamId: 1, pin: 'TT123', altPin: '1001', stats: { pac: 78, sho: 85, pas: 60, dri: 72, def: 38, phy: 70 }, attendance: true, goals: 5, assists: 2, streak: 3 },
  { id: 2, name: 'Phan Bảo Tuân', fullName: 'Phan Bảo Tuân', pos: 'ALA', ovr: 73, teamId: 1, pin: 'PBT456', altPin: '1002', stats: { pac: 72, sho: 70, pas: 84, dri: 78, def: 45, phy: 55 }, attendance: true, goals: 2, assists: 4, streak: 3 },
  { id: 3, name: 'Cao Thái Hiệp', fullName: 'Cao Thái Hiệp', pos: 'FIX', ovr: 71, teamId: 1, pin: 'CTH789', altPin: '1003', stats: { pac: 62, sho: 48, pas: 60, dri: 52, def: 82, phy: 84 }, attendance: true, goals: 0, assists: 1, streak: 3 },
  { id: 4, name: 'Cao Thái Hoài', fullName: 'Cao Thái Hoài', pos: 'ALA', ovr: 71, teamId: 1, pin: 'CTH012', altPin: '1004', stats: { pac: 86, sho: 65, pas: 70, dri: 80, def: 35, phy: 60 }, attendance: true, goals: 3, assists: 3, streak: 2 },
  { id: 5, name: 'Duy', fullName: 'Duy', pos: 'FIX', ovr: 70, teamId: 1, pin: 'DUY345', altPin: '1005', stats: { pac: 65, sho: 55, pas: 75, dri: 68, def: 72, phy: 78 }, attendance: true, goals: 1, assists: 1, streak: 3 },
  { id: 6, name: 'Hiển', fullName: 'Hiển', pos: 'ALA', ovr: 68, teamId: 1, pin: 'HIE678', altPin: '1006', stats: { pac: 80, sho: 45, pas: 65, dri: 70, def: 70, phy: 72 }, attendance: false, goals: 0, assists: 2, streak: 1 },
  { id: 7, name: 'Huy Hoàng', fullName: 'Huy Hoàng', pos: 'GK', ovr: 68, teamId: 1, pin: 'HH901', altPin: '1007', stats: { pac: 40, sho: 30, pas: 50, dri: 35, def: 20, phy: 75 }, attendance: true, goals: 0, assists: 0, streak: 3 },

  { id: 8, name: 'Hòa Nova', fullName: 'Hòa Nova', pos: 'PIV', ovr: 73, teamId: 2, pin: 'HN234', altPin: '1008', stats: { pac: 82, sho: 88, pas: 58, dri: 70, def: 40, phy: 72 }, attendance: true, goals: 6, assists: 1, streak: 3 },
  { id: 9, name: 'Ngô Quang Tùng', fullName: 'Ngô Quang Tùng', pos: 'ALA', ovr: 72, teamId: 2, pin: 'NQT567', altPin: '1009', stats: { pac: 70, sho: 68, pas: 86, dri: 80, def: 42, phy: 52 }, attendance: true, goals: 2, assists: 5, streak: 3 },
  { id: 10, name: 'Phong Phú', fullName: 'Phong Phú', pos: 'FIX', ovr: 70, teamId: 2, pin: 'PP890', altPin: '1010', stats: { pac: 60, sho: 45, pas: 58, dri: 50, def: 84, phy: 86 }, attendance: true, goals: 1, assists: 0, streak: 3 },
  { id: 11, name: 'Ngọc Phúc', fullName: 'Ngọc Phúc', pos: 'ALA', ovr: 69, teamId: 2, pin: 'NP123', altPin: '1011', stats: { pac: 84, sho: 62, pas: 72, dri: 76, def: 40, phy: 64 }, attendance: false, goals: 2, assists: 1, streak: 1 },
  { id: 12, name: 'Phú Thanh', fullName: 'Phú Thanh', pos: 'FIX', ovr: 68, teamId: 2, pin: 'PT456', altPin: '1012', stats: { pac: 66, sho: 58, pas: 78, dri: 68, def: 58, phy: 72 }, attendance: true, goals: 1, assists: 2, streak: 2 },
  { id: 13, name: 'Anh Vân', fullName: 'Anh Vân', pos: 'ALA', ovr: 67, teamId: 2, pin: 'AV789', altPin: '1013', stats: { pac: 78, sho: 42, pas: 62, dri: 68, def: 72, phy: 70 }, attendance: true, goals: 0, assists: 1, streak: 3 },
  { id: 14, name: 'Võ Phi', fullName: 'Võ Phi', pos: 'GK', ovr: 67, teamId: 2, pin: 'VP012', altPin: '1014', stats: { pac: 38, sho: 28, pas: 48, dri: 32, def: 18, phy: 73 }, attendance: true, goals: 0, assists: 0, streak: 3 },

  { id: 15, name: 'Xuân Hậu', fullName: 'Xuân Hậu', pos: 'PIV', ovr: 72, teamId: 3, pin: 'XH345', altPin: '1015', stats: { pac: 76, sho: 82, pas: 62, dri: 74, def: 36, phy: 68 }, attendance: true, goals: 4, assists: 2, streak: 3 },
  { id: 16, name: 'Xuân Phát', fullName: 'Xuân Phát', pos: 'ALA', ovr: 70, teamId: 3, pin: 'XP678', altPin: '1016', stats: { pac: 68, sho: 60, pas: 82, dri: 72, def: 50, phy: 68 }, attendance: true, goals: 2, assists: 3, streak: 3 },
  { id: 17, name: 'Viết Khánh', fullName: 'Viết Khánh', pos: 'FIX', ovr: 69, teamId: 3, pin: 'VK901', altPin: '1017', stats: { pac: 58, sho: 42, pas: 56, dri: 48, def: 80, phy: 82 }, attendance: false, goals: 0, assists: 0, streak: 1 },
  { id: 18, name: 'Viết Đạt', fullName: 'Viết Đạt', pos: 'ALA', ovr: 69, teamId: 3, pin: 'VD234', altPin: '1018', stats: { pac: 82, sho: 66, pas: 74, dri: 78, def: 38, phy: 62 }, attendance: true, goals: 3, assists: 2, streak: 3 },
  { id: 19, name: 'Huy', fullName: 'Huy', pos: 'FIX', ovr: 67, teamId: 3, pin: 'HUY567', altPin: '1019', stats: { pac: 62, sho: 50, pas: 70, dri: 60, def: 70, phy: 76 }, attendance: true, goals: 1, assists: 1, streak: 2 },
  { id: 20, name: 'Tú', fullName: 'Tú', pos: 'ALA', ovr: 66, teamId: 3, pin: 'TU890', altPin: '1020', stats: { pac: 76, sho: 40, pas: 60, dri: 66, def: 68, phy: 68 }, attendance: true, goals: 0, assists: 1, streak: 3 },
  { id: 21, name: 'Đại', fullName: 'Đại', pos: 'GK', ovr: 66, teamId: 3, pin: 'DAI123', altPin: '1021', stats: { pac: 36, sho: 26, pas: 46, dri: 30, def: 16, phy: 70 }, attendance: true, goals: 0, assists: 0, streak: 3 }
];

const DEFAULT_TACTICS = {
  formation: '1-2-1', // '1-2-1', '2-2', '3-1'
  pitchStarters: {
    1: [7, 3, 2, 4, 1], // Đội 1: 5 chính thức (GK, FIX, 2 ALA, PIV)
    2: [14, 10, 9, 12, 8],
    3: [21, 19, 16, 18, 15]
  }
};

const DEFAULT_MATCHES = [
  { id: 1, homeTeam: 1, awayTeam: 2, homeScore: 2, awayScore: 1, status: 'finished', duration: '10 phút', note: 'Đội 1 thắng 2-1 (Chạm 2 ở lại)', scorers: [{ name: 'Trần Thắng', goals: 2 }, { name: 'Hòa Nova', goals: 1 }] },
  { id: 2, homeTeam: 2, awayTeam: 3, homeScore: 1, awayScore: 1, status: 'finished', duration: '10 phút', note: 'Hòa 1-1 (Đội 2 ở lâu hơn ra sân)', scorers: [{ name: 'Ngô Quang Tùng', goals: 1 }, { name: 'Xuân Hậu', goals: 1 }] },
  { id: 3, homeTeam: 3, awayTeam: 1, homeScore: 0, awayScore: 2, status: 'finished', duration: '8 phút', note: 'Đội 1 thắng 2-0 (Chạm 2 ở lại)', scorers: [{ name: 'Cao Thái Hoài', goals: 1 }, { name: 'Phan Bảo Tuân', goals: 1 }] }
];

const DEFAULT_FUND = {
  balance: 3750000,
  income: 6350000,
  expense: 2600000,
  activeDrive: {
    title: "Quỹ Đội Tháng 8/2026",
    amountPerPerson: 150000,
    deadline: "15/08/2026",
    paidIds: [1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15]
  },
  transactions: [
    { id: 1, type: 'income', desc: 'Quỹ tháng 8 - 13 người × 150k', amount: 1950000, date: '2026-08-05' },
    { id: 2, type: 'expense', desc: 'Tiền sân Sân Thanh Đa', amount: 600000, date: '2026-07-29' },
    { id: 3, type: 'expense', desc: 'Tiền nước ngọt & trà đá', amount: 200000, date: '2026-07-29' },
    { id: 4, type: 'expense', desc: 'Tiền sân Sân Chảo Lửa', amount: 600000, date: '2026-07-22' },
    { id: 5, type: 'income', desc: 'Phạt đi trễ 20 phút', amount: 50000, date: '2026-07-22' },
    { id: 6, type: 'expense', desc: 'Mua bóng Futsal Động Lực số 4', amount: 450000, date: '2026-07-14' }
  ]
};

const DEFAULT_NOTICE = "📢 Thông báo Sân 5: Chủ Nhật tuần này đá 18h - 19h30 tại Sân Thanh Đa. Thể thức 3 đội luân phiên (Đá 10 phút, ai ghi 2 bàn trước thì ở lại, hòa đội ở lâu hơn ra sân)!";

const DEFAULT_NEXT_MATCH = {
  date: "Chủ Nhật, 17/08/2026",
  time: "18h - 19h30",
  venue: "Sân Thanh Đa, Bình Thạnh (Sân 5)",
  targetDate: "2026-08-17T18:00:00"
};

// Data Store Class
class DataStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return this.resetToDefault();
    }
    try {
      const parsed = JSON.parse(raw);
      parsed.nextMatch = parsed.nextMatch || DEFAULT_NEXT_MATCH;
      parsed.notice = parsed.notice || DEFAULT_NOTICE;
      parsed.tactics = parsed.tactics || DEFAULT_TACTICS;
      return parsed;
    } catch (e) {
      console.error('Error parsing stored data', e);
      return this.resetToDefault();
    }
  }

  resetToDefault() {
    const initial = {
      players: DEFAULT_PLAYERS,
      tactics: DEFAULT_TACTICS,
      matches: DEFAULT_MATCHES,
      fund: DEFAULT_FUND,
      notice: DEFAULT_NOTICE,
      nextMatch: DEFAULT_NEXT_MATCH
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    this.data = initial;
    if (window.CloudSync) CloudSync.pushToCloud(initial);
    return initial;
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    if (window.CloudSync) CloudSync.pushToCloud(this.data);
  }

  getPlayers() {
    return this.data.players;
  }

  getPlayerById(id) {
    return this.data.players.find(p => p.id === Number(id));
  }

  getPlayerByPin(pin) {
    const cleanPin = String(pin).trim().toUpperCase();
    return this.data.players.find(p => 
      (p.pin && p.pin.toUpperCase() === cleanPin) || 
      (p.altPin && p.altPin.toUpperCase() === cleanPin) ||
      (`A00${p.id}`.toUpperCase() === cleanPin) ||
      (`A0${p.id}`.toUpperCase() === cleanPin)
    );
  }

  updatePlayerAttendance(playerId, status) {
    const p = this.getPlayerById(playerId);
    if (p) {
      p.attendance = Boolean(status);
      this.save();
    }
  }

  savePlayer(playerObj) {
    if (playerObj.id) {
      const index = this.data.players.findIndex(p => p.id === playerObj.id);
      if (index !== -1) {
        this.data.players[index] = { ...this.data.players[index], ...playerObj };
      }
    } else {
      playerObj.id = Date.now();
      playerObj.teamId = 1;
      playerObj.attendance = true;
      playerObj.goals = 0;
      playerObj.assists = 0;
      playerObj.streak = 1;
      this.data.players.push(playerObj);
    }
    this.save();
  }

  getMatches() {
    return this.data.matches;
  }

  updateMatchResult(matchIndex, homeScore, awayScore, duration = '10 phút', note = '', scorers = []) {
    if (this.data.matches[matchIndex]) {
      this.data.matches[matchIndex].homeScore = Number(homeScore);
      this.data.matches[matchIndex].awayScore = Number(awayScore);
      this.data.matches[matchIndex].duration = duration;
      this.data.matches[matchIndex].note = note;
      this.data.matches[matchIndex].status = 'finished';
      this.data.matches[matchIndex].scorers = scorers;

      scorers.forEach(s => {
        const p = this.data.players.find(player => player.name.toLowerCase() === s.name.toLowerCase());
        if (p) {
          p.goals = (p.goals || 0) + (s.goals || 1);
        }
      });

      this.save();
    }
  }

  getTactics() {
    return this.data.tactics || DEFAULT_TACTICS;
  }

  setFormation(formation) {
    if (!this.data.tactics) this.data.tactics = DEFAULT_TACTICS;
    this.data.tactics.formation = formation;
    this.save();
  }

  swapStarterBench(teamId, outPlayerId, inPlayerId) {
    if (!this.data.tactics) this.data.tactics = DEFAULT_TACTICS;
    const starters = this.data.tactics.pitchStarters[teamId] || [];
    const idx = starters.indexOf(Number(outPlayerId));
    if (idx !== -1) {
      starters[idx] = Number(inPlayerId);
      this.save();
    }
  }

  getFund() {
    return this.data.fund;
  }

  addFundTransaction(tx) {
    tx.id = Date.now();
    this.data.fund.transactions.unshift(tx);

    if (tx.type === 'income') {
      this.data.fund.balance += Number(tx.amount);
      this.data.fund.income += Number(tx.amount);
    } else {
      this.data.fund.balance -= Number(tx.amount);
      this.data.fund.expense += Number(tx.amount);
    }

    this.save();
  }

  toggleFundPayment(playerId) {
    const paidIds = this.data.fund.activeDrive.paidIds;
    const idx = paidIds.indexOf(playerId);
    if (idx !== -1) {
      paidIds.splice(idx, 1);
    } else {
      paidIds.push(playerId);
    }
    this.save();
  }

  getNotice() {
    return this.data.notice;
  }

  updateNotice(text) {
    this.data.notice = text;
    this.save();
  }

  getNextMatch() {
    return this.data.nextMatch || DEFAULT_NEXT_MATCH;
  }

  updateNextMatch(matchObj) {
    this.data.nextMatch = { ...this.getNextMatch(), ...matchObj };
    this.save();
  }

  autoBalanceTeams() {
    const attendees = [...this.data.players].filter(p => p.attendance);
    const nonAttendees = [...this.data.players].filter(p => !p.attendance);

    attendees.sort((a, b) => b.ovr - a.ovr);

    const teams = [[], [], []];
    let forward = true;
    let currentTeamIndex = 0;

    attendees.forEach(player => {
      teams[currentTeamIndex].push(player);
      player.teamId = currentTeamIndex + 1;

      if (forward) {
        if (currentTeamIndex === 2) {
          forward = false;
        } else {
          currentTeamIndex++;
        }
      } else {
        if (currentTeamIndex === 0) {
          forward = true;
        } else {
          currentTeamIndex--;
        }
      }
    });

    nonAttendees.forEach((player, idx) => {
      player.teamId = (idx % 3) + 1;
    });

    // Update starters for pitch 5
    for (let t = 1; t <= 3; t++) {
      const teamP = attendees.filter(p => p.teamId === t);
      this.data.tactics.pitchStarters[t] = teamP.slice(0, 5).map(p => p.id);
    }

    this.save();
  }

  swapPlayerTeam(playerId, targetTeamId) {
    const p = this.getPlayerById(playerId);
    if (p) {
      p.teamId = Number(targetTeamId);
      this.save();
    }
  }
}

window.Store = new DataStore();
