const STORAGE_KEY = "hwwj.appState.v1";

const DEFAULT_PLAYERS = ["A", "B", "C", "D", "E"].map((id) => ({ id, name: id }));
const PLAYER_IDS = DEFAULT_PLAYERS.map((player) => player.id);

const NORMAL_RULES = [
  { min: 0, max: 0, winnerSide: "dealer", dealerScore: 18, partnerScore: 9, idleScorePerPlayer: -9 },
  { min: 5, max: 5, winnerSide: "dealer", dealerScore: 16, partnerScore: 8, idleScorePerPlayer: -8 },
  { min: 10, max: 10, winnerSide: "dealer", dealerScore: 14, partnerScore: 7, idleScorePerPlayer: -7 },
  { min: 15, max: 15, winnerSide: "dealer", dealerScore: 12, partnerScore: 6, idleScorePerPlayer: -6 },
  { min: 20, max: 20, winnerSide: "dealer", dealerScore: 10, partnerScore: 5, idleScorePerPlayer: -5 },
  { min: 25, max: 25, winnerSide: "dealer", dealerScore: 8, partnerScore: 4, idleScorePerPlayer: -4 },
  { min: 30, max: 55, winnerSide: "dealer", dealerScore: 6, partnerScore: 3, idleScorePerPlayer: -3 },
  { min: 60, max: 85, winnerSide: "dealer", dealerScore: 4, partnerScore: 2, idleScorePerPlayer: -2 },
  { min: 90, max: 115, winnerSide: "dealer", dealerScore: 2, partnerScore: 1, idleScorePerPlayer: -1 },
  { min: 120, max: 155, winnerSide: "idle", dealerScore: -2, partnerScore: -1, idleScorePerPlayer: 1 },
  { min: 160, max: 175, winnerSide: "idle", dealerScore: -4, partnerScore: -2, idleScorePerPlayer: 2 },
  { min: 180, max: 195, winnerSide: "idle", dealerScore: -6, partnerScore: -3, idleScorePerPlayer: 3 },
  { min: 200, max: 200, winnerSide: "idle", dealerScore: -8, partnerScore: -4, idleScorePerPlayer: 4 },
  { min: 205, max: 205, winnerSide: "idle", dealerScore: -10, partnerScore: -5, idleScorePerPlayer: 5 },
  { min: 210, max: 210, winnerSide: "idle", dealerScore: -12, partnerScore: -6, idleScorePerPlayer: 6 },
  { min: 215, max: 215, winnerSide: "idle", dealerScore: -14, partnerScore: -7, idleScorePerPlayer: 7 },
  { min: 220, max: 220, winnerSide: "idle", dealerScore: -16, partnerScore: -8, idleScorePerPlayer: 8 },
  { min: 225, max: 225, winnerSide: "idle", dealerScore: -18, partnerScore: -9, idleScorePerPlayer: 9 },
  { min: 230, max: 230, winnerSide: "idle", dealerScore: -21, partnerScore: -9, idleScorePerPlayer: 10 },
  { min: 235, max: 235, winnerSide: "idle", dealerScore: -24, partnerScore: -9, idleScorePerPlayer: 11 },
  { min: 240, max: 240, winnerSide: "idle", dealerScore: -27, partnerScore: -9, idleScorePerPlayer: 12 },
  { min: 245, max: 245, winnerSide: "idle", dealerScore: -30, partnerScore: -9, idleScorePerPlayer: 13 },
  { min: 250, max: 250, winnerSide: "idle", dealerScore: -33, partnerScore: -9, idleScorePerPlayer: 14 },
  { min: 255, max: 255, winnerSide: "idle", dealerScore: -36, partnerScore: -9, idleScorePerPlayer: 15 },
  { min: 260, max: 260, winnerSide: "idle", dealerScore: -39, partnerScore: -9, idleScorePerPlayer: 16 },
  { min: 265, max: 265, winnerSide: "idle", dealerScore: -42, partnerScore: -9, idleScorePerPlayer: 17 },
  { min: 270, max: 270, winnerSide: "idle", dealerScore: -45, partnerScore: -9, idleScorePerPlayer: 18 },
  { min: 275, max: 275, winnerSide: "idle", dealerScore: -48, partnerScore: -9, idleScorePerPlayer: 19 },
  { min: 280, max: 280, winnerSide: "idle", dealerScore: -51, partnerScore: -9, idleScorePerPlayer: 20 },
  { min: 285, max: 285, winnerSide: "idle", dealerScore: -54, partnerScore: -9, idleScorePerPlayer: 21 },
  { min: 290, max: 290, winnerSide: "idle", dealerScore: -57, partnerScore: -9, idleScorePerPlayer: 22 },
  { min: 295, max: 295, winnerSide: "idle", dealerScore: -60, partnerScore: -9, idleScorePerPlayer: 23 },
  { min: 300, max: 300, winnerSide: "idle", dealerScore: -63, partnerScore: -9, idleScorePerPlayer: 24 },
];

const SOLO_RULES = [
  { min: 0, max: 0, winnerSide: "dealer", dealerScore: 72, idleScorePerPlayer: -18 },
  { min: 5, max: 5, winnerSide: "dealer", dealerScore: 64, idleScorePerPlayer: -16 },
  { min: 10, max: 10, winnerSide: "dealer", dealerScore: 56, idleScorePerPlayer: -14 },
  { min: 15, max: 15, winnerSide: "dealer", dealerScore: 48, idleScorePerPlayer: -12 },
  { min: 20, max: 20, winnerSide: "dealer", dealerScore: 40, idleScorePerPlayer: -10 },
  { min: 25, max: 25, winnerSide: "dealer", dealerScore: 32, idleScorePerPlayer: -8 },
  { min: 30, max: 55, winnerSide: "dealer", dealerScore: 24, idleScorePerPlayer: -6 },
  { min: 60, max: 85, winnerSide: "dealer", dealerScore: 16, idleScorePerPlayer: -4 },
  { min: 90, max: 115, winnerSide: "dealer", dealerScore: 8, idleScorePerPlayer: -2 },
  { min: 120, max: 155, winnerSide: "idle", dealerScore: -8, idleScorePerPlayer: 2 },
  { min: 160, max: 175, winnerSide: "idle", dealerScore: -16, idleScorePerPlayer: 4 },
  { min: 180, max: 195, winnerSide: "idle", dealerScore: -24, idleScorePerPlayer: 6 },
  { min: 200, max: 200, winnerSide: "idle", dealerScore: -32, idleScorePerPlayer: 8 },
  { min: 205, max: 205, winnerSide: "idle", dealerScore: -40, idleScorePerPlayer: 10 },
  { min: 210, max: 210, winnerSide: "idle", dealerScore: -48, idleScorePerPlayer: 12 },
  { min: 215, max: 215, winnerSide: "idle", dealerScore: -56, idleScorePerPlayer: 14 },
  { min: 220, max: 220, winnerSide: "idle", dealerScore: -64, idleScorePerPlayer: 16 },
  { min: 225, max: 225, winnerSide: "idle", dealerScore: -72, idleScorePerPlayer: 18 },
  { min: 230, max: 230, winnerSide: "idle", dealerScore: -80, idleScorePerPlayer: 20 },
  { min: 235, max: 235, winnerSide: "idle", dealerScore: -88, idleScorePerPlayer: 22 },
  { min: 240, max: 240, winnerSide: "idle", dealerScore: -96, idleScorePerPlayer: 24 },
  { min: 245, max: 245, winnerSide: "idle", dealerScore: -104, idleScorePerPlayer: 26 },
  { min: 250, max: 250, winnerSide: "idle", dealerScore: -112, idleScorePerPlayer: 28 },
  { min: 255, max: 255, winnerSide: "idle", dealerScore: -120, idleScorePerPlayer: 30 },
  { min: 260, max: 260, winnerSide: "idle", dealerScore: -128, idleScorePerPlayer: 32 },
  { min: 265, max: 265, winnerSide: "idle", dealerScore: -136, idleScorePerPlayer: 34 },
  { min: 270, max: 270, winnerSide: "idle", dealerScore: -144, idleScorePerPlayer: 36 },
  { min: 275, max: 275, winnerSide: "idle", dealerScore: -152, idleScorePerPlayer: 38 },
  { min: 280, max: 280, winnerSide: "idle", dealerScore: -160, idleScorePerPlayer: 40 },
  { min: 285, max: 285, winnerSide: "idle", dealerScore: -168, idleScorePerPlayer: 42 },
  { min: 290, max: 290, winnerSide: "idle", dealerScore: -176, idleScorePerPlayer: 44 },
  { min: 295, max: 295, winnerSide: "idle", dealerScore: -184, idleScorePerPlayer: 46 },
  { min: 300, max: 300, winnerSide: "idle", dealerScore: -192, idleScorePerPlayer: 48 },
];

const state = loadState();

const elements = {
  playersGrid: document.querySelector("#players-grid"),
  resetNamesBtn: document.querySelector("#reset-names-btn"),
  roundForm: document.querySelector("#round-form"),
  roundNo: document.querySelector("#round-no"),
  modeSelect: document.querySelector("#mode-select"),
  finishTypeSelect: document.querySelector("#finish-type-select"),
  dealerSelect: document.querySelector("#dealer-select"),
  partnerField: document.querySelector("#partner-field"),
  partnerSelect: document.querySelector("#partner-select"),
  idleScoreField: document.querySelector("#idle-score-field"),
  idleScoreInput: document.querySelector("#idle-score"),
  escapePlayerField: document.querySelector("#escape-player-field"),
  escapePlayerSelect: document.querySelector("#escape-player-select"),
  idlePlayersPreview: document.querySelector("#idle-players-preview"),
  settlementPreview: document.querySelector("#settlement-preview"),
  previewBtn: document.querySelector("#preview-btn"),
  clearBtn: document.querySelector("#clear-btn"),
  saveBtn: document.querySelector("#save-btn"),
  editingBadge: document.querySelector("#editing-badge"),
  overviewCards: document.querySelector("#overview-cards"),
  leaderboard: document.querySelector("#leaderboard"),
  historyHead: document.querySelector("#history-head"),
  historyBody: document.querySelector("#history-body"),
  historyEmpty: document.querySelector("#history-empty"),
  exportCsvBtn: document.querySelector("#export-csv-btn"),
  exportJsonBtn: document.querySelector("#export-json-btn"),
  playerCardTemplate: document.querySelector("#player-card-template"),
};

let editingRoundId = null;

bootstrap();

function bootstrap() {
  renderPlayerInputs();
  populateRoleSelects();
  bindEvents();
  syncFormDefaults();
  render();
}

function bindEvents() {
  elements.resetNamesBtn.addEventListener("click", resetPlayerNames);
  elements.previewBtn.addEventListener("click", handlePreview);
  elements.clearBtn.addEventListener("click", resetForm);
  elements.roundForm.addEventListener("submit", handleSaveRound);
  elements.modeSelect.addEventListener("change", handleRoundStructureChange);
  elements.finishTypeSelect.addEventListener("change", handleRoundStructureChange);
  elements.dealerSelect.addEventListener("change", handleRoundStructureChange);
  elements.partnerSelect.addEventListener("change", handleRoundStructureChange);
  elements.escapePlayerSelect.addEventListener("change", markPreviewDirty);
  elements.idleScoreInput.addEventListener("input", markPreviewDirty);
  elements.exportCsvBtn.addEventListener("click", exportRoundsCsv);
  elements.exportJsonBtn.addEventListener("click", exportJson);
}

function loadState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultState();
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      appVersion: "v2",
      ruleVersion: "baike-normal-solo-escape",
      players: sanitizePlayers(parsed.players),
      rounds: sanitizeRounds(parsed.rounds),
    };
  } catch (error) {
    console.warn("读取本地数据失败，已恢复默认状态。", error);
    return createDefaultState();
  }
}

function createDefaultState() {
  return {
    appVersion: "v2",
    ruleVersion: "baike-normal-solo-escape",
    players: structuredClone(DEFAULT_PLAYERS),
    rounds: [],
  };
}

function sanitizePlayers(players) {
  if (!Array.isArray(players) || players.length !== 5) {
    return structuredClone(DEFAULT_PLAYERS);
  }

  return DEFAULT_PLAYERS.map((player) => {
    const match = players.find((entry) => entry.id === player.id);
    const name = match?.name?.toString().trim();
    return { id: player.id, name: name || player.id };
  });
}

function sanitizeRounds(rounds) {
  if (!Array.isArray(rounds)) {
    return [];
  }

  return rounds.map(sanitizeRound).filter(Boolean);
}

function sanitizeRound(round) {
  if (!round || typeof round !== "object") {
    return null;
  }

  const roundNo = Number.parseInt(round.roundNo, 10);
  if (!Number.isInteger(roundNo) || roundNo < 1 || !isValidPlayerId(round.dealerId)) {
    return null;
  }

  const mode = round.mode === "solo" ? "solo" : "normal";
  const finishType = round.finishType === "escape" ? "escape" : "score";
  const dealerId = round.dealerId;
  const partnerId =
    mode === "normal" && isValidPlayerId(round.partnerId) && round.partnerId !== dealerId
      ? round.partnerId
      : null;
  if (mode === "normal" && !partnerId) {
    return null;
  }

  const idlePlayerIds = getIdlePlayerIdsForRoles({ mode, dealerId, partnerId });
  const idleScore =
    finishType === "score" && Number.isInteger(Number(round.idleScore)) ? Number(round.idleScore) : null;
  const escapePlayerId =
    finishType === "escape" && isValidPlayerId(round.escapePlayerId) ? round.escapePlayerId : null;
  const winnerSide =
    finishType === "score" && (round.winnerSide === "dealer" || round.winnerSide === "idle")
      ? round.winnerSide
      : null;
  const winnerPlayerIds = sanitizeWinnerPlayerIds(round.winnerPlayerIds);
  const normalizedWinnerPlayerIds =
    winnerPlayerIds.length > 0
      ? winnerPlayerIds
      : deriveWinnerPlayerIds({
          mode,
          finishType,
          dealerId,
          partnerId,
          idlePlayerIds,
          winnerSide,
          escapePlayerId,
        });

  return {
    id: String(round.id || createRoundId()),
    roundNo,
    mode,
    finishType,
    dealerId,
    partnerId,
    idlePlayerIds,
    idleScore,
    escapePlayerId,
    winnerSide,
    winnerPlayerIds: normalizedWinnerPlayerIds,
    settlement: sanitizeSettlement(round.settlement),
    ruleSnapshot: round.ruleSnapshot && typeof round.ruleSnapshot === "object" ? round.ruleSnapshot : {},
    note: typeof round.note === "string" ? round.note : "",
    createdAt: round.createdAt || "",
    updatedAt: round.updatedAt || round.createdAt || "",
  };
}

function sanitizeSettlement(settlement) {
  const normalized = {};
  for (const playerId of PLAYER_IDS) {
    normalized[playerId] = Number(settlement?.[playerId] ?? 0);
  }
  return normalized;
}

function sanitizeWinnerPlayerIds(playerIds) {
  if (!Array.isArray(playerIds)) {
    return [];
  }

  return [...new Set(playerIds.filter(isValidPlayerId))];
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderPlayerInputs() {
  elements.playersGrid.innerHTML = "";
  for (const player of state.players) {
    const fragment = elements.playerCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".player-card");
    const idNode = fragment.querySelector(".player-id");
    const inputNode = fragment.querySelector(".player-name-input");

    idNode.textContent = `${player.id} 号玩家`;
    inputNode.value = player.name;
    inputNode.setAttribute("data-player-id", player.id);
    inputNode.setAttribute("aria-label", `${player.id} 玩家姓名`);
    inputNode.addEventListener("input", handlePlayerRename);

    card.dataset.playerId = player.id;
    elements.playersGrid.appendChild(fragment);
  }
}

function populateRoleSelects() {
  const options = state.players
    .map((player) => `<option value="${player.id}">${escapeHtml(getPlayerLabel(player.id))}</option>`)
    .join("");

  elements.dealerSelect.innerHTML = `<option value="">请选择</option>${options}`;
  syncPartnerOptions();
  syncEscapePlayerOptions();
}

function syncPartnerOptions(selectedPartnerId = elements.partnerSelect.value) {
  const dealerId = elements.dealerSelect.value;
  const partnerOptions = ['<option value="">请选择</option>']
    .concat(
      state.players
        .filter((player) => player.id !== dealerId)
        .map(
          (player) =>
            `<option value="${player.id}" ${selectedPartnerId === player.id ? "selected" : ""}>${escapeHtml(
              getPlayerLabel(player.id)
            )}</option>`
        )
    )
    .join("");

  elements.partnerSelect.innerHTML = partnerOptions;
  if (selectedPartnerId && selectedPartnerId !== dealerId) {
    elements.partnerSelect.value = selectedPartnerId;
  }
}

function syncEscapePlayerOptions(selectedEscapePlayerId = elements.escapePlayerSelect.value) {
  const options = ['<option value="">请选择</option>']
    .concat(
      state.players.map(
        (player) =>
          `<option value="${player.id}" ${selectedEscapePlayerId === player.id ? "selected" : ""}>${escapeHtml(
            getPlayerLabel(player.id)
          )}</option>`
      )
    )
    .join("");

  elements.escapePlayerSelect.innerHTML = options;
  if (selectedEscapePlayerId) {
    elements.escapePlayerSelect.value = selectedEscapePlayerId;
  }
}

function syncFormDefaults() {
  elements.modeSelect.value = "normal";
  elements.finishTypeSelect.value = "score";
  elements.roundNo.value = getNextRoundNo();
  updateRoundFormVisibility();
  renderIdlePlayersPreview();
  renderSettlementPlaceholder();
  updateEditingState(false);
}

function render() {
  renderOverview();
  renderLeaderboard();
  renderHistoryTable();
  saveState();
}

function handlePlayerRename(event) {
  const playerId = event.target.dataset.playerId;
  const player = state.players.find((entry) => entry.id === playerId);
  if (!player) return;

  const nextName = event.target.value.trim();
  player.name = nextName || player.id;
  populateRoleSelects();
  preserveFormSelection();
  render();
}

function resetPlayerNames() {
  if (!window.confirm("要将 5 位玩家姓名恢复为 A-E 吗？")) {
    return;
  }

  state.players = structuredClone(DEFAULT_PLAYERS);
  renderPlayerInputs();
  populateRoleSelects();
  preserveFormSelection();
  render();
}

function preserveFormSelection() {
  const currentFormState = {
    mode: elements.modeSelect.value,
    finishType: elements.finishTypeSelect.value,
    dealerId: elements.dealerSelect.value,
    partnerId: elements.partnerSelect.value,
    idleScore: elements.idleScoreInput.value,
    escapePlayerId: elements.escapePlayerSelect.value,
  };

  elements.modeSelect.value = currentFormState.mode;
  elements.finishTypeSelect.value = currentFormState.finishType;
  elements.dealerSelect.value = currentFormState.dealerId;
  syncPartnerOptions(currentFormState.partnerId);
  syncEscapePlayerOptions(currentFormState.escapePlayerId);
  elements.idleScoreInput.value = currentFormState.idleScore;
  updateRoundFormVisibility();
  renderIdlePlayersPreview();
}

function handleRoundStructureChange() {
  updateRoundFormVisibility();
  renderIdlePlayersPreview();
  markPreviewDirty();
}

function updateRoundFormVisibility() {
  const mode = getSelectedMode();
  const finishType = getSelectedFinishType();
  const isSolo = mode === "solo";
  const isEscape = finishType === "escape";

  if (isSolo) {
    elements.partnerSelect.value = "";
  }

  elements.partnerField.classList.toggle("hidden", isSolo);
  elements.idleScoreField.classList.toggle("hidden", isEscape);
  elements.escapePlayerField.classList.toggle("hidden", !isEscape);

  elements.partnerSelect.disabled = isSolo;
  elements.partnerSelect.required = !isSolo;
  elements.idleScoreInput.disabled = isEscape;
  elements.idleScoreInput.required = !isEscape;
  elements.escapePlayerSelect.disabled = !isEscape;
  elements.escapePlayerSelect.required = isEscape;

  syncPartnerOptions();
  syncEscapePlayerOptions();
}

function renderIdlePlayersPreview() {
  const dealerId = elements.dealerSelect.value;
  const mode = getSelectedMode();
  const partnerId = mode === "normal" ? elements.partnerSelect.value : null;

  if (!dealerId) {
    elements.idlePlayersPreview.textContent = "请选择庄家";
    return;
  }
  if (mode === "normal" && !partnerId) {
    elements.idlePlayersPreview.textContent = "请选择庄家和伴家";
    return;
  }

  const idlePlayers = getIdlePlayerIdsForRoles({ mode, dealerId, partnerId }).map(getPlayerLabel);
  elements.idlePlayersPreview.textContent = idlePlayers.join(" / ");
}

function markPreviewDirty() {
  renderSettlementPlaceholder();
}

function handlePreview() {
  try {
    const preview = buildRoundPayloadFromForm();
    renderSettlementPreview(preview);
  } catch (error) {
    window.alert(error.message);
  }
}

function handleSaveRound(event) {
  event.preventDefault();

  try {
    const round = buildRoundPayloadFromForm();
    if (editingRoundId) {
      const index = state.rounds.findIndex((entry) => entry.id === editingRoundId);
      if (index >= 0) {
        state.rounds[index] = {
          ...round,
          id: editingRoundId,
          createdAt: state.rounds[index].createdAt,
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      state.rounds.push({
        ...round,
        id: createRoundId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    sortRoundsByRoundNo();
    render();
    resetForm();
  } catch (error) {
    window.alert(error.message);
  }
}

function buildRoundPayloadFromForm() {
  const roundInput = normalizeRoundInput();
  validateRoundInput(roundInput);
  const settlementResult = settleRound(roundInput);
  return buildRoundRecord(roundInput, settlementResult);
}

function normalizeRoundInput() {
  const mode = getSelectedMode();
  const finishType = getSelectedFinishType();
  const dealerId = elements.dealerSelect.value;
  const partnerId = mode === "normal" ? elements.partnerSelect.value : null;
  const idleScore = finishType === "score" ? Number.parseInt(elements.idleScoreInput.value, 10) : null;
  const escapePlayerId = finishType === "escape" ? elements.escapePlayerSelect.value : null;

  return {
    roundNo: Number.parseInt(elements.roundNo.value, 10),
    mode,
    finishType,
    dealerId,
    partnerId,
    idleScore,
    escapePlayerId,
  };
}

function validateRoundInput({ roundNo, mode, finishType, dealerId, partnerId, idleScore, escapePlayerId }) {
  if (!Number.isInteger(roundNo) || roundNo < 1) {
    throw new Error("局号必须是大于等于 1 的整数。");
  }
  if (!dealerId) {
    throw new Error("请选择庄家。");
  }
  if (mode === "normal" && !partnerId) {
    throw new Error("请选择伴家。");
  }
  if (partnerId && dealerId === partnerId) {
    throw new Error("庄家和伴家不能是同一位玩家。");
  }
  if (finishType === "score") {
    if (!Number.isInteger(idleScore) || idleScore < 0 || idleScore > 300) {
      throw new Error("闲家抓分必须在 0 到 300 之间。");
    }
    if (idleScore % 5 !== 0) {
      throw new Error("闲家抓分必须是 5 的倍数。");
    }
  }
  if (finishType === "escape" && !escapePlayerId) {
    throw new Error("请选择逃跑玩家。");
  }

  const duplicateRound = state.rounds.find(
    (round) => round.roundNo === roundNo && round.id !== editingRoundId
  );
  if (duplicateRound) {
    throw new Error(`局号 ${roundNo} 已存在，请使用其他局号或编辑该记录。`);
  }
}

function settleRound(roundInput) {
  if (roundInput.finishType === "escape") {
    return settleEscapeRound(roundInput);
  }
  if (roundInput.mode === "solo") {
    return settleSoloScoreRound(roundInput);
  }
  return settleNormalScoreRound(roundInput);
}

function settleNormalScoreRound({ dealerId, partnerId, idleScore }) {
  const idlePlayerIds = getIdlePlayerIdsForRoles({ mode: "normal", dealerId, partnerId });
  const rule = lookupRule(NORMAL_RULES, idleScore);
  const settlement = {};

  for (const playerId of PLAYER_IDS) {
    if (playerId === dealerId) settlement[playerId] = rule.dealerScore;
    else if (playerId === partnerId) settlement[playerId] = rule.partnerScore;
    else settlement[playerId] = rule.idleScorePerPlayer;
  }

  return {
    idlePlayerIds,
    settlement,
    winnerSide: rule.winnerSide,
    winnerPlayerIds:
      rule.winnerSide === "dealer" ? [dealerId, partnerId] : structuredClone(idlePlayerIds),
    ruleSnapshot: {
      dealerScore: rule.dealerScore,
      partnerScore: rule.partnerScore,
      idleScorePerPlayer: rule.idleScorePerPlayer,
    },
  };
}

function settleSoloScoreRound({ dealerId, idleScore }) {
  const idlePlayerIds = getIdlePlayerIdsForRoles({ mode: "solo", dealerId, partnerId: null });
  const rule = lookupRule(SOLO_RULES, idleScore);
  const settlement = {};

  for (const playerId of PLAYER_IDS) {
    settlement[playerId] = playerId === dealerId ? rule.dealerScore : rule.idleScorePerPlayer;
  }

  return {
    idlePlayerIds,
    settlement,
    winnerSide: rule.winnerSide,
    winnerPlayerIds: rule.winnerSide === "dealer" ? [dealerId] : structuredClone(idlePlayerIds),
    ruleSnapshot: {
      dealerScore: rule.dealerScore,
      partnerScore: null,
      idleScorePerPlayer: rule.idleScorePerPlayer,
    },
  };
}

function settleEscapeRound({ mode, dealerId, partnerId, escapePlayerId }) {
  const idlePlayerIds = getIdlePlayerIdsForRoles({ mode, dealerId, partnerId });
  const settlement = {};
  const escapePenalty = mode === "solo" ? -200 : -80;
  const othersReward = mode === "solo" ? 25 : 10;

  for (const playerId of PLAYER_IDS) {
    settlement[playerId] = playerId === escapePlayerId ? escapePenalty : othersReward;
  }

  return {
    idlePlayerIds,
    settlement,
    winnerSide: null,
    winnerPlayerIds: PLAYER_IDS.filter((playerId) => playerId !== escapePlayerId),
    ruleSnapshot: {
      escapePenalty,
      othersReward,
    },
  };
}

function buildRoundRecord(roundInput, settlementResult) {
  return {
    roundNo: roundInput.roundNo,
    mode: roundInput.mode,
    finishType: roundInput.finishType,
    dealerId: roundInput.dealerId,
    partnerId: roundInput.mode === "normal" ? roundInput.partnerId : null,
    idlePlayerIds: settlementResult.idlePlayerIds,
    idleScore: roundInput.finishType === "score" ? roundInput.idleScore : null,
    escapePlayerId: roundInput.finishType === "escape" ? roundInput.escapePlayerId : null,
    winnerSide: settlementResult.winnerSide,
    winnerPlayerIds: settlementResult.winnerPlayerIds,
    settlement: settlementResult.settlement,
    ruleSnapshot: settlementResult.ruleSnapshot,
    note: "",
  };
}

function lookupRule(ruleTable, idleScore) {
  const rule = ruleTable.find((entry) => idleScore >= entry.min && idleScore <= entry.max);
  if (!rule) {
    throw new Error("未找到对应的结算规则，请检查闲家抓分。");
  }
  return rule;
}

function renderSettlementPreview(round) {
  const header = `
    <p><strong>${escapeHtml(getRoundResultSummary(round))}</strong></p>
    <p>模式：${escapeHtml(getModeLabel(round.mode))}，结束方式：${escapeHtml(
    getFinishTypeLabel(round.finishType)
  )}。</p>
    <p>${escapeHtml(getRoundRoleLine(round))}</p>
  `;

  const cards = state.players
    .map((player) => {
      const score = round.settlement[player.id];
      return `
        <div class="preview-item">
          <strong>${escapeHtml(getPlayerLabel(player.id))}</strong>
          <span class="${getScoreClass(score)}">${formatSignedNumber(score)}</span>
        </div>
      `;
    })
    .join("");

  elements.settlementPreview.innerHTML = `${header}<div class="preview-grid">${cards}</div>`;
}

function renderSettlementPlaceholder() {
  elements.settlementPreview.textContent =
    "输入信息后点击“预览结算”，系统将展示本局 5 人得分。";
}

function renderOverview() {
  const stats = computeStats();
  const cards = [
    { label: "总局数", value: stats.totalRounds },
    { label: "当前领先", value: stats.leader?.name || "暂无" },
    { label: "最高总分", value: stats.leader ? `${stats.leader.totalScore}` : "0" },
    { label: "规则模式", value: "一般 / 独打 / 逃跑" },
  ];

  elements.overviewCards.innerHTML = cards
    .map(
      (card) => `
        <div class="overview-card">
          <span>${escapeHtml(card.label)}</span>
          <strong>${escapeHtml(String(card.value))}</strong>
        </div>
      `
    )
    .join("");
}

function renderLeaderboard() {
  const stats = computeStats();
  if (stats.totalRounds === 0) {
    elements.leaderboard.innerHTML =
      '<div class="empty-state">保存首局后，这里会显示总分排行榜、胜率和叫庄率。</div>';
    return;
  }

  elements.leaderboard.innerHTML = stats.entries
    .map(
      (entry, index) => `
        <div class="leaderboard-row ${index === 0 ? "top" : ""}">
          <div class="leaderboard-rank">${index + 1}</div>
          <div class="leaderboard-name">
            <strong>${escapeHtml(entry.name)}</strong>
            <span>${entry.playerId} 号玩家</span>
          </div>
          <div class="leaderboard-metric">
            <span>总分</span>
            <strong class="${getScoreClass(entry.totalScore)}">${formatSignedNumber(entry.totalScore)}</strong>
          </div>
          <div class="leaderboard-metric">
            <span>胜率</span>
            <strong>${formatPercent(entry.winRate)}</strong>
          </div>
          <div class="leaderboard-metric">
            <span>叫庄率</span>
            <strong>${formatPercent(entry.dealerRate)}</strong>
          </div>
        </div>
      `
    )
    .join("");
}

function renderHistoryTable() {
  const playerHeaders = state.players
    .map((player) => `<th>${escapeHtml(player.name)}</th>`)
    .join("");

  elements.historyHead.innerHTML = `
    <tr>
      <th>局号</th>
      <th>模式</th>
      <th>结束方式</th>
      <th>庄家</th>
      <th>伴家</th>
      <th>闲家</th>
      <th>闲家抓分</th>
      <th>逃跑玩家</th>
      <th>胜方</th>
      ${playerHeaders}
      <th>操作</th>
    </tr>
  `;

  if (state.rounds.length === 0) {
    elements.historyBody.innerHTML = "";
    elements.historyEmpty.classList.remove("hidden");
    return;
  }

  elements.historyEmpty.classList.add("hidden");
  elements.historyBody.innerHTML = state.rounds
    .map(
      (round) => `
        <tr>
          <td>${round.roundNo}</td>
          <td>${escapeHtml(getModeLabel(round.mode))}</td>
          <td>${escapeHtml(getFinishTypeLabel(round.finishType))}</td>
          <td>${escapeHtml(getPlayerLabel(round.dealerId))}</td>
          <td>${escapeHtml(round.partnerId ? getPlayerLabel(round.partnerId) : "-")}</td>
          <td>${escapeHtml(round.idlePlayerIds.map(getPlayerLabel).join(" / "))}</td>
          <td>${round.idleScore ?? "-"}</td>
          <td>${escapeHtml(round.escapePlayerId ? getPlayerLabel(round.escapePlayerId) : "-")}</td>
          <td>${escapeHtml(getRoundWinnerLabel(round))}</td>
          ${state.players
            .map(
              (player) =>
                `<td class="${getScoreClass(round.settlement[player.id])}">${formatSignedNumber(
                  round.settlement[player.id]
                )}</td>`
            )
            .join("")}
          <td>
            <div class="actions-cell">
              <button class="small-btn" data-action="edit" data-round-id="${round.id}">编辑</button>
              <button class="danger-btn" data-action="delete" data-round-id="${round.id}">删除</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  elements.historyBody.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", handleHistoryAction);
  });
}

function handleHistoryAction(event) {
  const roundId = event.currentTarget.dataset.roundId;
  const action = event.currentTarget.dataset.action;
  const round = state.rounds.find((entry) => entry.id === roundId);
  if (!round) return;

  if (action === "edit") {
    startEditRound(round);
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(`确定删除第 ${round.roundNo} 局记录吗？`);
    if (!confirmed) return;

    state.rounds = state.rounds.filter((entry) => entry.id !== roundId);
    render();
    if (editingRoundId === roundId) {
      resetForm();
    } else {
      elements.roundNo.value = getNextRoundNo();
    }
  }
}

function startEditRound(round) {
  editingRoundId = round.id;
  elements.roundNo.value = round.roundNo;
  elements.modeSelect.value = round.mode;
  elements.finishTypeSelect.value = round.finishType;
  elements.dealerSelect.value = round.dealerId;
  syncPartnerOptions(round.partnerId || "");
  elements.partnerSelect.value = round.partnerId || "";
  elements.idleScoreInput.value = round.idleScore ?? "";
  syncEscapePlayerOptions(round.escapePlayerId || "");
  elements.escapePlayerSelect.value = round.escapePlayerId || "";
  updateRoundFormVisibility();
  renderIdlePlayersPreview();
  renderSettlementPreview(round);
  updateEditingState(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateEditingState(isEditing) {
  elements.editingBadge.classList.toggle("hidden", !isEditing);
  elements.saveBtn.textContent = isEditing ? "保存修改" : "保存本局";
}

function resetForm() {
  editingRoundId = null;
  elements.roundForm.reset();
  elements.modeSelect.value = "normal";
  elements.finishTypeSelect.value = "score";
  elements.roundNo.value = getNextRoundNo();
  elements.escapePlayerSelect.value = "";
  updateRoundFormVisibility();
  renderIdlePlayersPreview();
  renderSettlementPlaceholder();
  updateEditingState(false);
}

function computeStats() {
  const totalRounds = state.rounds.length;
  const statsMap = new Map(
    state.players.map((player) => [
      player.id,
      {
        playerId: player.id,
        name: player.name,
        totalScore: 0,
        roundCount: totalRounds,
        winCount: 0,
        winRate: 0,
        dealerCount: 0,
        dealerRate: 0,
        partnerCount: 0,
        idleCount: 0,
      },
    ])
  );

  for (const round of state.rounds) {
    const winnerIds = new Set(getWinnerPlayerIds(round));
    for (const player of state.players) {
      const entry = statsMap.get(player.id);
      entry.totalScore += Number(round.settlement[player.id] || 0);

      if (player.id === round.dealerId) {
        entry.dealerCount += 1;
      } else if (round.partnerId && player.id === round.partnerId) {
        entry.partnerCount += 1;
      } else {
        entry.idleCount += 1;
      }

      if (winnerIds.has(player.id)) {
        entry.winCount += 1;
      }
    }
  }

  const entries = [...statsMap.values()].map((entry) => ({
    ...entry,
    winRate: totalRounds ? entry.winCount / totalRounds : 0,
    dealerRate: totalRounds ? entry.dealerCount / totalRounds : 0,
  }));

  entries.sort((left, right) => {
    if (right.totalScore !== left.totalScore) return right.totalScore - left.totalScore;
    if (right.winRate !== left.winRate) return right.winRate - left.winRate;
    if (right.dealerCount !== left.dealerCount) return right.dealerCount - left.dealerCount;
    return left.playerId.localeCompare(right.playerId, "zh-CN");
  });

  return {
    totalRounds,
    entries,
    leader: totalRounds > 0 ? entries[0] || null : null,
  };
}

function exportRoundsCsv() {
  if (state.rounds.length === 0) {
    window.alert("还没有历史记录可导出。");
    return;
  }

  const header = [
    "局号",
    "模式",
    "结束方式",
    "庄家",
    "伴家",
    "闲家",
    "闲家抓分",
    "逃跑玩家",
    "胜方",
    ...state.players.map((player) => player.name),
    "创建时间",
  ];

  const rows = state.rounds.map((round) => [
    round.roundNo,
    getModeLabel(round.mode),
    getFinishTypeLabel(round.finishType),
    getPlayerLabel(round.dealerId),
    round.partnerId ? getPlayerLabel(round.partnerId) : "",
    round.idlePlayerIds.map(getPlayerLabel).join(" / "),
    round.idleScore ?? "",
    round.escapePlayerId ? getPlayerLabel(round.escapePlayerId) : "",
    getRoundWinnerLabel(round),
    ...state.players.map((player) => round.settlement[player.id]),
    formatDateTime(round.createdAt),
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map(csvEscapeCell).join(","))
    .join("\n");

  downloadFile(csvContent, "hongwu-wujia-rounds.csv", "text/csv;charset=utf-8;");
}

function exportJson() {
  const exportPayload = {
    appVersion: state.appVersion,
    ruleVersion: state.ruleVersion,
    exportedAt: new Date().toISOString(),
    players: state.players,
    rounds: state.rounds,
    stats: computeStats(),
  };

  downloadFile(
    JSON.stringify(exportPayload, null, 2),
    "hongwu-wujia-data.json",
    "application/json;charset=utf-8;"
  );
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob(["\uFEFF", content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getIdlePlayerIdsForRoles({ mode, dealerId, partnerId }) {
  return PLAYER_IDS.filter((playerId) => {
    if (playerId === dealerId) return false;
    if (mode === "normal" && playerId === partnerId) return false;
    return true;
  });
}

function deriveWinnerPlayerIds({ mode, finishType, dealerId, partnerId, idlePlayerIds, winnerSide, escapePlayerId }) {
  if (finishType === "escape" && escapePlayerId) {
    return PLAYER_IDS.filter((playerId) => playerId !== escapePlayerId);
  }
  if (winnerSide === "dealer") {
    return mode === "solo" ? [dealerId] : [dealerId, partnerId];
  }
  if (winnerSide === "idle") {
    return structuredClone(idlePlayerIds);
  }
  return [];
}

function getWinnerPlayerIds(round) {
  const winnerIds = sanitizeWinnerPlayerIds(round.winnerPlayerIds);
  if (winnerIds.length > 0) {
    return winnerIds;
  }

  return deriveWinnerPlayerIds({
    mode: round.mode === "solo" ? "solo" : "normal",
    finishType: round.finishType === "escape" ? "escape" : "score",
    dealerId: round.dealerId,
    partnerId: round.partnerId || null,
    idlePlayerIds: Array.isArray(round.idlePlayerIds)
      ? round.idlePlayerIds.filter(isValidPlayerId)
      : getIdlePlayerIdsForRoles({
          mode: round.mode === "solo" ? "solo" : "normal",
          dealerId: round.dealerId,
          partnerId: round.partnerId || null,
        }),
    winnerSide: round.winnerSide,
    escapePlayerId: round.escapePlayerId || null,
  });
}

function getNextRoundNo() {
  if (!state.rounds.length) {
    return 1;
  }

  return Math.max(...state.rounds.map((round) => round.roundNo)) + 1;
}

function sortRoundsByRoundNo() {
  state.rounds.sort((left, right) => left.roundNo - right.roundNo);
}

function createRoundId() {
  return `round-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSelectedMode() {
  return elements.modeSelect.value === "solo" ? "solo" : "normal";
}

function getSelectedFinishType() {
  return elements.finishTypeSelect.value === "escape" ? "escape" : "score";
}

function getModeLabel(mode) {
  return mode === "solo" ? "独打" : "一般情况";
}

function getFinishTypeLabel(finishType) {
  return finishType === "escape" ? "逃跑" : "抓分结算";
}

function getRoundResultSummary(round) {
  if (round.finishType === "escape") {
    return `${getPlayerLabel(round.escapePlayerId)} 逃跑，其余四家获胜。`;
  }
  if (round.mode === "solo") {
    return round.winnerSide === "dealer" ? "独打庄家获胜。" : "四名闲家获胜。";
  }
  return round.winnerSide === "dealer" ? "庄家方获胜。" : "闲家方获胜。";
}

function getRoundRoleLine(round) {
  const dealerText = `庄家：${getPlayerLabel(round.dealerId)}`;
  const idleText = `闲家：${round.idlePlayerIds.map(getPlayerLabel).join(" / ")}`;

  if (round.finishType === "escape") {
    const escapeText = `逃跑玩家：${getPlayerLabel(round.escapePlayerId)}`;
    if (round.mode === "solo") {
      return `${dealerText}，${idleText}，${escapeText}`;
    }
    return `${dealerText}，伴家：${getPlayerLabel(round.partnerId)}，${idleText}，${escapeText}`;
  }

  if (round.mode === "solo") {
    return `${dealerText}，${idleText}，闲家抓分 ${round.idleScore} 分。`;
  }
  return `${dealerText}，伴家：${getPlayerLabel(round.partnerId)}，${idleText}，闲家抓分 ${round.idleScore} 分。`;
}

function getRoundWinnerLabel(round) {
  if (round.finishType === "escape") {
    return "其余四家";
  }
  if (round.mode === "solo") {
    return round.winnerSide === "dealer" ? "独打庄家" : "四闲家";
  }
  return round.winnerSide === "dealer" ? "庄家方" : "闲家方";
}

function getPlayerLabel(playerId) {
  const player = state.players.find((entry) => entry.id === playerId);
  return player ? player.name : playerId;
}

function isValidPlayerId(playerId) {
  return PLAYER_IDS.includes(playerId);
}

function formatSignedNumber(value) {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function getScoreClass(score) {
  if (score > 0) return "score-positive";
  if (score < 0) return "score-negative";
  return "score-neutral";
}

function formatDateTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function csvEscapeCell(value) {
  const normalized = String(value ?? "");
  if (normalized.includes(",") || normalized.includes('"') || normalized.includes("\n")) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }
  return normalized;
}
