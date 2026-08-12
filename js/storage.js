/* ==========================================================================
   SUNDAY FOOTBALL - CENTRAL LOCAL & CLOUD STATE STORE (V3 SÂN 5 UPGRADE)
   ========================================================================== */

const STORAGE_KEY = 'SUNDAY_FOOTBALL_DATA_V3';

// 21 Official Real Members Roster with Sân 5 (Futsal) Positions
const DEFAULT_PLAYERS = [
  { id: 1, name: 'Trần Thắng', fullName: 'Trần Thắng', pos: 'PIV', ovr: 74, teamId: 1, pin: 'TT123', altPin: '1001', stats: { pac: 78, sho: 85, pas: 60, dri: 72, def: 38, phy: 70 }, attendance: 'going', goals: 5, assists: 2, streak: 3 },
  { id: 2, name: 'Phan Bảo Tuân', fullName: 'Phan Bảo Tuân', pos: 'ALA', ovr: 73, teamId: 1, pin: 'PBT456', altPin: '1002', stats: { pac: 72, sho: 70, pas: 84, dri: 78, def: 45, phy: 55 }, attendance: 'going', goals: 2, assists: 4, streak: 3 },
  { id: 3, name: 'Cao Thái Hiệp', fullName: 'Cao Thái Hiệp', pos: 'FIX', ovr: 71, teamId: 1, pin: 'CTH789', altPin: '1003', stats: { pac: 62, sho: 48, pas: 60, dri: 52, def: 82, phy: 84 }, attendance: 'going', goals: 0, assists: 1, streak: 3 },
  { id: 4, name: 'Cao Thái Hoài', fullName: 'Cao Thái Hoài', pos: 'ALA', ovr: 71, teamId: 1, pin: 'CTH012', altPin: '1004', stats: { pac: 86, sho: 65, pas: 70, dri: 80, def: 35, phy: 60 }, attendance: 'going', goals: 3, assists: 3, streak: 2 },
  { id: 5, name: 'Duy', fullName: 'Duy', pos: 'FIX', ovr: 70, teamId: 1, pin: 'DUY345', altPin: '1005', stats: { pac: 65, sho: 55, pas: 75, dri: 68, def: 72, phy: 78 }, attendance: 'going', goals: 1, assists: 1, streak: 3 },
  { id: 6, name: 'Hiển', fullName: 'Hiển', pos: 'ALA', ovr: 68, teamId: 1, pin: 'HIE678', altPin: '1006', stats: { pac: 80, sho: 45, pas: 65, dri: 70, def: 70, phy: 72 }, attendance: 'absent', goals: 0, assists: 2, streak: 1 },
  { id: 7, name: 'Huy Hoàng', fullName: 'Huy Hoàng', pos: 'GK', ovr: 68, teamId: 1, pin: 'HH901', altPin: '1007', stats: { pac: 40, sho: 30, pas: 50, dri: 35, def: 20, phy: 75 }, attendance: 'going', goals: 0, assists: 0, streak: 3 },

  { id: 8, name: 'Hòa Nova', fullName: 'Hòa Nova', pos: 'PIV', ovr: 73, teamId: 2, pin: 'HN234', altPin: '1008', stats: { pac: 82, sho: 88, pas: 58, dri: 70, def: 40, phy: 72 }, attendance: 'going', goals: 6, assists: 1, streak: 3 },
  { id: 9, name: 'Ngô Quang Tùng', fullName: 'Ngô Quang Tùng', pos: 'ALA', ovr: 72, teamId: 2, pin: 'NQT567', altPin: '1009', stats: { pac: 70, sho: 68, pas: 86, dri: 80, def: 42, phy: 52 }, attendance: 'going', goals: 2, assists: 5, streak: 3 },
  { id: 10, name: 'Phong Phú', fullName: 'Phong Phú', pos: 'FIX', ovr: 70, teamId: 2, pin: 'PP890', altPin: '1010', stats: { pac: 60, sho: 45, pas: 58, dri: 50, def: 84, phy: 86 }, attendance: 'going', goals: 1, assists: 0, streak: 3 },
  { id: 11, name: 'Ngọc Phúc', fullName: 'Ngọc Phúc', pos: 'ALA', ovr: 69, teamId: 2, pin: 'NP123', altPin: '1011', stats: { pac: 84, sho: 62, pas: 72, dri: 76, def: 40, phy: 64 }, attendance: 'absent', goals: 2, assists: 1, streak: 1 },
  { id: 12, name: 'Phú Thanh', fullName: 'Phú Thanh', pos: 'FIX', ovr: 68, teamId: 2, pin: 'PT456', altPin: '1012', stats: { pac: 66, sho: 58, pas: 78, dri: 68, def: 58, phy: 72 }, attendance: 'going', goals: 1, assists: 2, streak: 2 },
  { id: 13, name: 'Anh Vân', fullName: 'Anh Vân', pos: 'ALA', ovr: 67, teamId: 2, pin: 'AV789', altPin: '1013', stats: { pac: 78, sho: 42, pas: 62, dri: 68, def: 72, phy: 70 }, attendance: 'going', goals: 0, assists: 1, streak: 3 },
  { id: 14, name: 'Võ Phi', fullName: 'Võ Phi', pos: 'GK', ovr: 67, teamId: 2, pin: 'VP012', altPin: '1014', stats: { pac: 38, sho: 28, pas: 48, dri: 32, def: 18, phy: 73 }, attendance: 'going', goals: 0, assists: 0, streak: 3 },

  { id: 15, name: 'Xuân Hậu', fullName: 'Xuân Hậu', pos: 'PIV', ovr: 72, teamId: 3, pin: 'XH345', altPin: '1015', stats: { pac: 76, sho: 82, pas: 62, dri: 74, def: 36, phy: 68 }, attendance: 'going', goals: 4, assists: 2, streak: 3 },
  { id: 16, name: 'Xuân Phát', fullName: 'Xuân Phát', pos: 'ALA', ovr: 70, teamId: 3, pin: 'XP678', altPin: '1016', stats: { pac: 68, sho: 60, pas: 82, dri: 72, def: 50, phy: 68 }, attendance: 'going', goals: 2, assists: 3, streak: 3 },
  { id: 17, name: 'Viết Khánh', fullName: 'Viết Khánh', pos: 'FIX', ovr: 69, teamId: 3, pin: 'VK901', altPin: '1017', stats: { pac: 58, sho: 42, pas: 56, dri: 48, def: 80, phy: 82 }, attendance: 'absent', goals: 0, assists: 0, streak: 1 },
  { id: 18, name: 'Viết Đạt', fullName: 'Viết Đạt', pos: 'ALA', ovr: 69, teamId: 3, pin: 'VD234', altPin: '1018', stats: { pac: 82, sho: 66, pas: 74, dri: 78, def: 38, phy: 62 }, attendance: 'going', goals: 3, assists: 2, streak: 3 },
  { id: 19, name: 'Huy', fullName: 'Huy', pos: 'FIX', ovr: 67, teamId: 3, pin: 'HUY567', altPin: '1019', stats: { pac: 62, sho: 50, pas: 70, dri: 60, def: 70, phy: 76 }, attendance: 'going', goals: 1, assists: 1, streak: 2 },
  { id: 20, name: 'Tú', fullName: 'Tú', pos: 'ALA', ovr: 66, teamId: 3, pin: 'TU890', altPin: '1020', stats: { pac: 76, sho: 40, pas: 60, dri: 66, def: 68, phy: 68 }, attendance: 'going', goals: 0, assists: 1, streak: 3 },
  { id: 21, name: 'Đại', fullName: 'Đại', pos: 'GK', ovr: 66, teamId: 3, pin: 'DAI123', altPin: '1021', stats: { pac: 36, sho: 26, pas: 46, dri: 30, def: 16, phy: 70 }, attendance: 'going', goals: 0, assists: 0, streak: 3 },

  // New members - chưa có ai xác nhận điểm danh
  { id: 22, name: 'Ben', fullName: 'Ben', pos: 'ALA', ovr: 65, teamId: 1, pin: 'BEN123', altPin: '1022', stats: { pac: 68, sho: 60, pas: 65, dri: 68, def: 45, phy: 62 }, attendance: 'pending', goals: 0, assists: 0, streak: 0 },
  { id: 23, name: 'Thái Bảo', fullName: 'Thái Bảo', pos: 'ALA', ovr: 65, teamId: 2, pin: 'TB456', altPin: '1023', stats: { pac: 68, sho: 60, pas: 65, dri: 68, def: 45, phy: 62 }, attendance: 'pending', goals: 0, assists: 0, streak: 0 },
  { id: 24, name: 'Khanh', fullName: 'Khanh', pos: 'FIX', ovr: 65, teamId: 3, pin: 'KH789', altPin: '1024', stats: { pac: 58, sho: 42, pas: 58, dri: 50, def: 75, phy: 75 }, attendance: 'pending', goals: 0, assists: 0, streak: 0 },
  { id: 25, name: 'Huy Dê', fullName: 'Huy Dê', pos: 'PIV', ovr: 65, teamId: 1, pin: 'HD012', altPin: '1025', stats: { pac: 68, sho: 74, pas: 55, dri: 62, def: 38, phy: 64 }, attendance: 'pending', goals: 0, assists: 0, streak: 0 },
  { id: 26, name: 'Khoa Ù', fullName: 'Khoa Ù', pos: 'FIX', ovr: 65, teamId: 2, pin: 'KU345', altPin: '1026', stats: { pac: 55, sho: 40, pas: 56, dri: 48, def: 76, phy: 78 }, attendance: 'pending', goals: 0, assists: 0, streak: 0 },
  { id: 27, name: 'Trí', fullName: 'Trí', pos: 'ALA', ovr: 65, teamId: 3, pin: 'TRI678', altPin: '1027', stats: { pac: 68, sho: 60, pas: 65, dri: 68, def: 45, phy: 62 }, attendance: 'pending', goals: 0, assists: 0, streak: 0 },
  { id: 28, name: 'Vũ Mai', fullName: 'Vũ Mai', pos: 'ALA', ovr: 65, teamId: 1, pin: 'VM901', altPin: '1028', stats: { pac: 68, sho: 60, pas: 65, dri: 68, def: 45, phy: 62 }, attendance: 'pending', goals: 0, assists: 0, streak: 0 }
];

const DEFAULT_TACTICS = {
  formation: '1-2-1', // '1-2-1', '2-2', '3-1'
  pitchStarters: {
    1: [7, 3, 2, 4, 1], // Đội 1: 5 chính thức (GK, FIX, 2 ALA, PIV)
    2: [14, 10, 9, 12, 8],
    3: [21, 19, 16, 18, 15]
  }
};

const DEFAULT_MATCHDAY = { date: "2026-08-09" };

// Starts empty - real match results are entered by the admin via "➕ Thêm trận".
// (Previously seeded with 3 fake demo matches, which polluted the standings and
// top-scorer boards with results that never actually happened.)
const DEFAULT_MATCHES = [];

const DEFAULT_FUND = {
  balance: 40000,
  income: 540000,
  expense: 500000,
  matchSession: {
    date: "2026-08-12",
    fee: 35000,
    paidIds: [],
    customFees: {}
  },
  transactions: [
    { id: 1, type: 'income', desc: 'Thu tiền trận tuần trước (09/08) - 18 người × 30k', amount: 540000, date: '2026-08-09' },
    { id: 2, type: 'expense', desc: 'Tiền sân Sân Thanh Đa (09/08)', amount: 500000, date: '2026-08-09' }
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
      return this.normalize(parsed);
    } catch (e) {
      console.error('Error parsing stored data', e);
      return this.resetToDefault();
    }
  }

  // Firebase Realtime Database silently rewrites any object whose keys look like
  // a dense array index (e.g. {1:.., 2:.., 3:..}) into a real JS array with holes
  // (e.g. [null, .., ..]). Converts that shape back into a plain {key: value} object.
  static coerceKeyedObject(value) {
    if (Array.isArray(value)) {
      const obj = {};
      value.forEach((v, idx) => { if (v !== null && v !== undefined) obj[idx] = v; });
      return obj;
    }
    return value || {};
  }

  // Back-fills any fields missing from older/incomplete data (local OR from the
  // cloud) so every render can safely assume the full shape exists.
  normalize(parsed) {
    parsed.nextMatch = parsed.nextMatch || DEFAULT_NEXT_MATCH;
    parsed.notice = parsed.notice || DEFAULT_NOTICE;
    parsed.matches = parsed.matches || DEFAULT_MATCHES;
    parsed.matchDay = parsed.matchDay || DEFAULT_MATCHDAY;
    parsed.matches.forEach(m => {
      if (!m.matchDate) m.matchDate = parsed.matchDay.date;
    });

    parsed.tactics = parsed.tactics || DEFAULT_TACTICS;
    parsed.tactics.pitchStarters = DataStore.coerceKeyedObject(parsed.tactics.pitchStarters);
    [1, 2, 3].forEach(t => {
      if (!Array.isArray(parsed.tactics.pitchStarters[t])) {
        parsed.tactics.pitchStarters[t] = (DEFAULT_TACTICS.pitchStarters[t] || []).slice();
      }
    });

    parsed.fund = parsed.fund || DEFAULT_FUND;
    if (!parsed.fund.matchSession) {
      const d = new Date();
      const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      parsed.fund.matchSession = {
        date: localToday,
        fee: 500000,
        paidIds: [],
        customFees: {}
      };
    }
    parsed.fund.matchSession.paidIds = parsed.fund.matchSession.paidIds || [];
    parsed.fund.matchSession.customFees = DataStore.coerceKeyedObject(parsed.fund.matchSession.customFees);

    parsed.players = parsed.players || DEFAULT_PLAYERS;
    parsed.players.forEach(p => {
      // Legacy boolean attendance -> 3-state string ('going' | 'absent' | 'pending')
      if (typeof p.attendance === 'boolean') {
        p.attendance = p.attendance ? 'going' : 'absent';
      }
      p.attendance = p.attendance || 'pending';
    });

    return parsed;
  }

  resetToDefault() {
    const initial = {
      players: DEFAULT_PLAYERS,
      tactics: DEFAULT_TACTICS,
      matches: DEFAULT_MATCHES,
      matchDay: DEFAULT_MATCHDAY,
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

  // status: 'going' | 'absent' | 'pending'
  updatePlayerAttendance(playerId, status) {
    const p = this.getPlayerById(playerId);
    if (p) {
      p.attendance = status;
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
      playerObj.attendance = 'pending';
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

  getMatchDay() {
    return this.data.matchDay || DEFAULT_MATCHDAY;
  }

  startNewMatchDay(dateStr) {
    this.data.matchDay = { date: dateStr };
    this.save();
  }

  addMatch(homeTeam, awayTeam) {
    const match = {
      id: Date.now(),
      homeTeam: Number(homeTeam),
      awayTeam: Number(awayTeam),
      homeScore: 0,
      awayScore: 0,
      status: 'pending',
      duration: '10 phút',
      note: '',
      scorers: [],
      matchDate: this.getMatchDay().date
    };
    this.data.matches.push(match);
    this.save();
    return match;
  }

  deleteMatch(matchId) {
    const idx = this.data.matches.findIndex(m => m.id === Number(matchId));
    if (idx !== -1) {
      this.data.matches.splice(idx, 1);
      this.save();
    }
  }

  // Goal totals are derived live from match.scorers across all matches (see
  // RankingPage.calculateTopScorers) rather than tracked as a running counter
  // on each player - that avoided a bug where the counter drifted out of sync
  // with the actual match history whenever a result was corrected.
  updateMatchResult(matchId, homeScore, awayScore, duration = '10 phút', note = '', scorers = []) {
    const match = this.data.matches.find(m => m.id === Number(matchId));
    if (match) {
      match.homeScore = Number(homeScore);
      match.awayScore = Number(awayScore);
      match.duration = duration;
      match.note = note;
      match.status = 'finished';
      match.scorers = scorers;
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

  toggleMatchPayment(playerId) {
    const paidIds = this.data.fund.matchSession.paidIds;
    const idx = paidIds.indexOf(Number(playerId));
    if (idx !== -1) {
      paidIds.splice(idx, 1);
    } else {
      paidIds.push(Number(playerId));
    }
    this.save();
  }

  updateMatchSessionInfo(fee, date) {
    this.data.fund.matchSession.fee = Number(fee);
    this.data.fund.matchSession.date = date;
    this.save();
  }

  startNewMatchSession(fee, date) {
    this.data.fund.matchSession = {
      fee: Number(fee),
      date: date,
      paidIds: [],
      customFees: {}
    };
    this.save();
  }

  getPlayerMatchFee(playerId) {
    const session = this.data.fund.matchSession;
    const custom = session.customFees ? session.customFees[playerId] : undefined;
    return custom !== undefined ? custom : session.fee;
  }

  setPlayerMatchFee(playerId, amount) {
    if (!this.data.fund.matchSession.customFees) this.data.fund.matchSession.customFees = {};
    this.data.fund.matchSession.customFees[playerId] = Number(amount);
    this.save();
  }

  markAllMatchPaid() {
    this.data.fund.matchSession.paidIds = this.data.players.map(p => p.id);
    this.save();
  }

  markAllMatchUnpaid() {
    this.data.fund.matchSession.paidIds = [];
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
    const attendees = [...this.data.players].filter(p => p.attendance === 'going');
    const nonAttendees = [...this.data.players].filter(p => p.attendance !== 'going');

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
