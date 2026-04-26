const RACING_STORAGE_KEY = "hwwj.racing.timeTrial.v1";

const STATE = {
  IDLE: "idle",
  COUNTDOWN: "countdown",
  RUNNING: "running",
  PAUSED: "paused",
  FINISHED: "finished",
};

const TRACK = {
  id: "training-loop",
  name: "练习环道",
  lapTarget: 3,
  centerX: 480,
  centerY: 270,
  straightHalf: 230,
  radius: 130,
  width: 72,
  startLineX: 480,
};

const PHYSICS = {
  maxSpeed: 290,
  turnSpeed: 190,
  brakeSpeed: 95,
  offTrackSpeed: 105,
  accelPerSecond: 420,
  brakePerSecond: 620,
  naturalDecelPerSecond: 280,
  steerRate: 2.55,
  minValidLapMs: 5000,
  countdownMs: 3000,
  offTrackRespawnMs: 1200,
  respawnPenaltyMs: 1500,
};

const canvas = document.querySelector("#racing-canvas");
const ctx = canvas.getContext("2d");

const currentUsernameEl = document.querySelector("#current-username");
const statusEl = document.querySelector("#race-status-value");
const lapEl = document.querySelector("#lap-value");
const currentLapTimeEl = document.querySelector("#current-lap-time-value");
const lastLapTimeEl = document.querySelector("#last-lap-time-value");
const sessionBestLapEl = document.querySelector("#session-best-lap-time-value");
const bestLapEl = document.querySelector("#best-lap-time-value");
const speedStateEl = document.querySelector("#speed-state-value");
const messageEl = document.querySelector("#message-value");
const lapTimesListEl = document.querySelector("#lap-times-list");

const startBtn = document.querySelector("#start-btn");
const pauseBtn = document.querySelector("#pause-btn");
const restartBtn = document.querySelector("#restart-btn");
const backBtn = document.querySelector("#back-games-btn");
const logoutBtn = document.querySelector("#logout-btn");

const input = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const runtime = {
  state: STATE.IDLE,
  countdownMsRemaining: PHYSICS.countdownMs,
  currentLap: 1,
  lapTimes: [],
  currentLapTimeMs: 0,
  totalTimeMs: 0,
  lastLapTimeMs: null,
  sessionBestLapMs: null,
  checkpointIndex: 0,
  speedState: "待命",
  message: "点击开始比赛",
  flashMessageMs: 0,
  hasNewRecord: false,
  offTrackMs: 0,
  bestLapMs: readBestLap(),
};

const car = {
  x: TRACK.startLineX + 56,
  y: TRACK.centerY - TRACK.radius,
  heading: 0,
  speed: 0,
  inTrack: true,
  inCurveZone: false,
  lastSafeX: TRACK.startLineX + 56,
  lastSafeY: TRACK.centerY - TRACK.radius,
  lastSafeHeading: 0,
};

const geometry = createTrackGeometry();

let animationFrameId = null;
let lastFrameAt = performance.now();

init();

function init() {
  currentUsernameEl.textContent = window.HWWJAuth.getCurrentUsername();
  bindEvents();
  syncHud();
  renderLapTimes();
  render();
  animationFrameId = window.requestAnimationFrame(frame);
}

function bindEvents() {
  startBtn.addEventListener("click", startRace);
  pauseBtn.addEventListener("click", togglePause);
  restartBtn.addEventListener("click", restartRace);

  backBtn.addEventListener("click", () => {
    window.location.href = "games.html";
  });

  logoutBtn.addEventListener("click", () => {
    window.HWWJAuth.logout();
    window.location.href = "login.html";
  });

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      togglePause();
      return;
    }

    const handled = setInput(event.key, true);
    if (handled) {
      event.preventDefault();
    }
  });

  document.addEventListener("keyup", (event) => {
    const handled = setInput(event.key, false);
    if (handled) {
      event.preventDefault();
    }
  });
}

function frame(now) {
  const dt = Math.min((now - lastFrameAt) / 1000, 0.05);
  lastFrameAt = now;

  update(dt);
  render();

  animationFrameId = window.requestAnimationFrame(frame);
}

function update(dt) {
  if (runtime.flashMessageMs > 0) {
    runtime.flashMessageMs = Math.max(0, runtime.flashMessageMs - dt * 1000);
    if (runtime.flashMessageMs === 0 && runtime.state !== STATE.FINISHED) {
      runtime.message = runtime.state === STATE.IDLE ? "点击开始比赛" : "保持节奏，跑出更快单圈";
    }
  }

  if (runtime.state === STATE.COUNTDOWN) {
    runtime.countdownMsRemaining = Math.max(0, runtime.countdownMsRemaining - dt * 1000);
    if (runtime.countdownMsRemaining === 0) {
      runtime.state = STATE.RUNNING;
      runtime.message = "比赛开始";
      runtime.flashMessageMs = 900;
    }
    syncHud();
    return;
  }

  if (runtime.state !== STATE.RUNNING) {
    syncHud();
    return;
  }

  runtime.currentLapTimeMs += dt * 1000;
  runtime.totalTimeMs += dt * 1000;

  const previous = {
    x: car.x,
    y: car.y,
  };

  updateCarPhysics(dt);
  checkTrackState(dt);
  checkCheckpoints(previous, car);
  syncHud();
}

function updateCarPhysics(dt) {
  const steeringInput = Number(input.right) - Number(input.left);
  const isTurning = steeringInput !== 0;

  car.inCurveZone = isInCurveZone(car.x);

  let targetSpeed = 0;
  if (input.down) {
    targetSpeed = PHYSICS.brakeSpeed;
  } else if (input.up) {
    targetSpeed = PHYSICS.maxSpeed;
    if (car.inCurveZone || isTurning) {
      targetSpeed = Math.min(targetSpeed, PHYSICS.turnSpeed);
    }
    if (!car.inTrack) {
      targetSpeed = Math.min(targetSpeed, PHYSICS.offTrackSpeed);
    }
  }

  if (car.speed < targetSpeed) {
    car.speed = Math.min(targetSpeed, car.speed + PHYSICS.accelPerSecond * dt);
  } else if (car.speed > targetSpeed) {
    const decel = input.down || !car.inTrack ? PHYSICS.brakePerSecond : PHYSICS.naturalDecelPerSecond;
    car.speed = Math.max(targetSpeed, car.speed - decel * dt);
  }

  const speedFactor = clamp(car.speed / PHYSICS.maxSpeed, 0.25, 1);
  if (isTurning && car.speed > 18) {
    car.heading += steeringInput * PHYSICS.steerRate * dt * (0.6 + speedFactor * 0.55);
  }

  car.x += Math.cos(car.heading) * car.speed * dt;
  car.y += Math.sin(car.heading) * car.speed * dt;

  runtime.speedState = "滑行";
  if (car.speed <= 1) {
    runtime.speedState = "待命";
  } else if (!car.inTrack) {
    runtime.speedState = "越界减速";
  } else if (input.down) {
    runtime.speedState = "刹车修线";
  } else if (car.inCurveZone || isTurning) {
    runtime.speedState = "转弯减速";
  } else {
    runtime.speedState = "直线高速";
  }
}

function checkTrackState(dt) {
  const inTrackNow = isPointInTrack(car.x, car.y);
  car.inTrack = inTrackNow;

  if (inTrackNow) {
    car.lastSafeX = car.x;
    car.lastSafeY = car.y;
    car.lastSafeHeading = car.heading;
    runtime.offTrackMs = 0;
    return;
  }

  runtime.offTrackMs += dt * 1000;
  if (runtime.offTrackMs >= PHYSICS.offTrackRespawnMs) {
    respawnCar();
  }
}

function checkCheckpoints(previous, current) {
  const topY = TRACK.centerY - TRACK.radius;
  const bottomY = TRACK.centerY + TRACK.radius;
  const halfWidth = TRACK.width / 2;
  const leftCenterX = TRACK.centerX - TRACK.straightHalf;
  const rightCenterX = TRACK.centerX + TRACK.straightHalf;

  if (
    runtime.checkpointIndex === 0 &&
    previous.y < TRACK.centerY &&
    current.y >= TRACK.centerY &&
    current.x > rightCenterX
  ) {
    runtime.checkpointIndex = 1;
    flashMessage("通过 CP1");
    return;
  }

  if (
    runtime.checkpointIndex === 1 &&
    previous.x > TRACK.centerX &&
    current.x <= TRACK.centerX &&
    Math.abs(current.y - bottomY) <= halfWidth + 8
  ) {
    runtime.checkpointIndex = 2;
    flashMessage("通过 CP2");
    return;
  }

  if (
    runtime.checkpointIndex === 2 &&
    previous.y > TRACK.centerY &&
    current.y <= TRACK.centerY &&
    current.x < leftCenterX
  ) {
    runtime.checkpointIndex = 3;
    flashMessage("通过 CP3");
    return;
  }

  if (
    previous.x < TRACK.startLineX &&
    current.x >= TRACK.startLineX &&
    Math.abs(current.y - topY) <= halfWidth + 8
  ) {
    finishLapIfEligible();
  }
}

function finishLapIfEligible() {
  if (runtime.checkpointIndex !== 3) return;
  if (runtime.currentLapTimeMs < PHYSICS.minValidLapMs) return;

  const lapTimeMs = Math.round(runtime.currentLapTimeMs);
  runtime.lapTimes.push(lapTimeMs);
  runtime.lastLapTimeMs = lapTimeMs;
  runtime.sessionBestLapMs = runtime.sessionBestLapMs === null
    ? lapTimeMs
    : Math.min(runtime.sessionBestLapMs, lapTimeMs);

  if (runtime.bestLapMs === null || lapTimeMs < runtime.bestLapMs) {
    runtime.bestLapMs = lapTimeMs;
    runtime.hasNewRecord = true;
    saveBestLap(lapTimeMs);
    flashMessage(`Lap ${runtime.currentLap} 完成，新纪录！`, 1800);
  } else {
    flashMessage(`Lap ${runtime.currentLap} 完成`, 1400);
  }

  runtime.currentLapTimeMs = 0;
  runtime.checkpointIndex = 0;
  renderLapTimes();

  if (runtime.lapTimes.length >= TRACK.lapTarget) {
    finishRace();
    return;
  }

  runtime.currentLap += 1;
}

function finishRace() {
  runtime.state = STATE.FINISHED;
  runtime.speedState = "已完成";
  runtime.message = runtime.hasNewRecord ? "比赛结束，已刷新最佳单圈" : "比赛结束";
  car.speed = 0;
  persistRaceResult();
  syncHud();
}

function startRace() {
  resetRace();
  runtime.state = STATE.COUNTDOWN;
  runtime.message = "准备开始";
  syncHud();
}

function restartRace() {
  startRace();
}

function resetRace() {
  runtime.state = STATE.COUNTDOWN;
  runtime.countdownMsRemaining = PHYSICS.countdownMs;
  runtime.currentLap = 1;
  runtime.lapTimes = [];
  runtime.currentLapTimeMs = 0;
  runtime.totalTimeMs = 0;
  runtime.lastLapTimeMs = null;
  runtime.sessionBestLapMs = null;
  runtime.checkpointIndex = 0;
  runtime.speedState = "等待起跑";
  runtime.message = "准备开始";
  runtime.flashMessageMs = 0;
  runtime.hasNewRecord = false;
  runtime.offTrackMs = 0;

  car.x = TRACK.startLineX + 56;
  car.y = TRACK.centerY - TRACK.radius;
  car.heading = 0;
  car.speed = 0;
  car.inTrack = true;
  car.inCurveZone = false;
  car.lastSafeX = car.x;
  car.lastSafeY = car.y;
  car.lastSafeHeading = car.heading;

  input.up = false;
  input.down = false;
  input.left = false;
  input.right = false;

  renderLapTimes();
}

function togglePause() {
  if (runtime.state === STATE.RUNNING) {
    runtime.state = STATE.PAUSED;
    runtime.message = "比赛已暂停";
  } else if (runtime.state === STATE.PAUSED) {
    runtime.state = STATE.RUNNING;
    runtime.message = "继续比赛";
    runtime.flashMessageMs = 700;
  }
  syncHud();
}

function respawnCar() {
  car.x = car.lastSafeX;
  car.y = car.lastSafeY;
  car.heading = car.lastSafeHeading;
  car.speed = 0;
  car.inTrack = true;
  runtime.offTrackMs = 0;
  runtime.currentLapTimeMs += PHYSICS.respawnPenaltyMs;
  runtime.totalTimeMs += PHYSICS.respawnPenaltyMs;
  flashMessage("偏离赛道，已重置并罚时 1.5 秒", 1800);
}

function flashMessage(text, durationMs = 1100) {
  runtime.message = text;
  runtime.flashMessageMs = durationMs;
}

function syncHud() {
  statusEl.textContent = toStatusLabel(runtime.state);
  lapEl.textContent = `${Math.min(runtime.currentLap, TRACK.lapTarget)} / ${TRACK.lapTarget}`;
  currentLapTimeEl.textContent = formatDuration(runtime.currentLapTimeMs);
  lastLapTimeEl.textContent = formatNullableDuration(runtime.lastLapTimeMs);
  sessionBestLapEl.textContent = formatNullableDuration(runtime.sessionBestLapMs);
  bestLapEl.textContent = formatNullableDuration(runtime.bestLapMs);
  speedStateEl.textContent = runtime.speedState;
  messageEl.textContent = runtime.message;

  const canPause = runtime.state === STATE.RUNNING || runtime.state === STATE.PAUSED;
  pauseBtn.disabled = !canPause;
  pauseBtn.textContent = runtime.state === STATE.PAUSED ? "继续" : "暂停";
  startBtn.disabled = runtime.state === STATE.COUNTDOWN || runtime.state === STATE.RUNNING || runtime.state === STATE.PAUSED;
}

function renderLapTimes() {
  const items = [];
  for (let index = 0; index < TRACK.lapTarget; index += 1) {
    const time = runtime.lapTimes[index];
    items.push(`
      <div class="racing-lap-item">
        <span>Lap ${index + 1}</span>
        <strong>${time ? formatDuration(time) : "--:--.---"}</strong>
      </div>
    `);
  }
  lapTimesListEl.innerHTML = items.join("");
}

function render() {
  drawBackground();
  drawTrack();
  drawCheckpoints();
  drawCar();
  drawOverlay();
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#b7efc5");
  gradient.addColorStop(1, "#89d69a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  for (let x = 0; x < canvas.width; x += 90) {
    ctx.fillRect(x, 0, 8, canvas.height);
  }
}

function drawTrack() {
  ctx.fillStyle = "#404858";
  ctx.fill(geometry.outerPath);

  ctx.fillStyle = "#7dc47f";
  ctx.fill(geometry.innerPath);

  ctx.strokeStyle = "#f5f7ff";
  ctx.lineWidth = 4;
  ctx.stroke(geometry.outerPath);
  ctx.stroke(geometry.innerPath);

  ctx.save();
  ctx.setLineDash([16, 14]);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke(geometry.centerPath);
  ctx.restore();

  drawStartFinishLine();
}

function drawStartFinishLine() {
  const topY = TRACK.centerY - TRACK.radius;
  const halfWidth = TRACK.width / 2;
  const x = TRACK.startLineX;
  const cell = 8;
  const rows = Math.ceil((TRACK.width + 4) / cell);

  for (let index = 0; index < rows; index += 1) {
    ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#202636";
    ctx.fillRect(x - 10, topY - halfWidth + index * cell, 20, cell);
  }
}

function drawCheckpoints() {
  const topY = TRACK.centerY - TRACK.radius;
  const bottomY = TRACK.centerY + TRACK.radius;
  const outerRadius = TRACK.radius + TRACK.width / 2;
  const innerRadius = TRACK.radius - TRACK.width / 2;
  const leftCenterX = TRACK.centerX - TRACK.straightHalf;
  const rightCenterX = TRACK.centerX + TRACK.straightHalf;

  ctx.save();
  ctx.lineWidth = 5;
  ctx.setLineDash([10, 10]);

  drawCheckpointLine(
    rightCenterX + innerRadius,
    TRACK.centerY,
    rightCenterX + outerRadius,
    TRACK.centerY,
    runtime.checkpointIndex >= 1
  );
  drawCheckpointLine(
    TRACK.centerX,
    bottomY - TRACK.width / 2,
    TRACK.centerX,
    bottomY + TRACK.width / 2,
    runtime.checkpointIndex >= 2
  );
  drawCheckpointLine(
    leftCenterX - innerRadius,
    TRACK.centerY,
    leftCenterX - outerRadius,
    TRACK.centerY,
    runtime.checkpointIndex >= 3
  );
  drawCheckpointLine(
    TRACK.startLineX,
    topY - TRACK.width / 2,
    TRACK.startLineX,
    topY + TRACK.width / 2,
    false,
    "#5fb1ff"
  );
  ctx.restore();
}

function drawCheckpointLine(x1, y1, x2, y2, completed, activeColor = "#ffd25d") {
  ctx.strokeStyle = completed ? "#43c37c" : activeColor;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawCar() {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.heading);

  const isDanger = !car.inTrack;
  ctx.fillStyle = isDanger ? "#f56c6c" : "#ff5630";
  ctx.strokeStyle = isDanger ? "#ffd2d2" : "#ffe1d7";
  ctx.lineWidth = 2;

  roundRect(ctx, -14, -9, 28, 18, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#15324c";
  roundRect(ctx, -4, -7, 12, 14, 4);
  ctx.fill();

  ctx.fillStyle = "#fdfdfd";
  ctx.fillRect(9, -4, 4, 8);

  ctx.restore();
}

function drawOverlay() {
  if (runtime.state === STATE.COUNTDOWN) {
    drawCenteredOverlay(runtime.countdownMsRemaining > 400 ? String(Math.ceil(runtime.countdownMsRemaining / 1000)) : "GO!");
    return;
  }

  if (runtime.state === STATE.PAUSED) {
    drawCenteredOverlay("暂停中");
    return;
  }

  if (runtime.state === STATE.FINISHED) {
    const bestLap = runtime.sessionBestLapMs === null ? "--:--.---" : formatDuration(runtime.sessionBestLapMs);
    drawCenteredOverlay(`完赛 ${formatDuration(runtime.totalTimeMs)}`, `最佳圈 ${bestLap}`);
  }
}

function drawCenteredOverlay(title, subtitle = "") {
  ctx.save();
  ctx.fillStyle = "rgba(17, 25, 40, 0.34)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 54px 'Segoe UI', 'PingFang SC', sans-serif";
  ctx.fillText(title, canvas.width / 2, canvas.height / 2);

  if (subtitle) {
    ctx.font = "600 22px 'Segoe UI', 'PingFang SC', sans-serif";
    ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 42);
  }
  ctx.restore();
}

function createTrackGeometry() {
  const outerRadius = TRACK.radius + TRACK.width / 2;
  const innerRadius = TRACK.radius - TRACK.width / 2;
  const leftCenterX = TRACK.centerX - TRACK.straightHalf;
  const rightCenterX = TRACK.centerX + TRACK.straightHalf;

  return {
    outerPath: createStadiumPath(leftCenterX, rightCenterX, TRACK.centerY, outerRadius),
    innerPath: createStadiumPath(leftCenterX, rightCenterX, TRACK.centerY, innerRadius),
    centerPath: createStadiumPath(leftCenterX, rightCenterX, TRACK.centerY, TRACK.radius),
  };
}

function createStadiumPath(leftCenterX, rightCenterX, centerY, radius) {
  const path = new Path2D();
  path.moveTo(leftCenterX, centerY - radius);
  path.lineTo(rightCenterX, centerY - radius);
  path.arc(rightCenterX, centerY, radius, -Math.PI / 2, Math.PI / 2, false);
  path.lineTo(leftCenterX, centerY + radius);
  path.arc(leftCenterX, centerY, radius, Math.PI / 2, (Math.PI * 3) / 2, false);
  path.closePath();
  return path;
}

function isPointInTrack(x, y) {
  return ctx.isPointInPath(geometry.outerPath, x, y) && !ctx.isPointInPath(geometry.innerPath, x, y);
}

function isInCurveZone(x) {
  const leftCenterX = TRACK.centerX - TRACK.straightHalf;
  const rightCenterX = TRACK.centerX + TRACK.straightHalf;
  return x <= leftCenterX || x >= rightCenterX;
}

function setInput(key, pressed) {
  if (key === "ArrowUp") {
    input.up = pressed;
    return true;
  }
  if (key === "ArrowDown") {
    input.down = pressed;
    return true;
  }
  if (key === "ArrowLeft") {
    input.left = pressed;
    return true;
  }
  if (key === "ArrowRight") {
    input.right = pressed;
    return true;
  }
  return false;
}

function toStatusLabel(state) {
  if (state === STATE.COUNTDOWN) return "倒计时中";
  if (state === STATE.RUNNING) return "比赛中";
  if (state === STATE.PAUSED) return "暂停中";
  if (state === STATE.FINISHED) return "已完成";
  return "未开始";
}

function formatNullableDuration(value) {
  if (value === null || value === undefined) return "--:--.---";
  return formatDuration(value);
}

function formatDuration(value) {
  const totalMs = Math.max(0, Math.round(value));
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function readBestLap() {
  const storage = readStorage();
  const value = storage.bestLapByTrack?.[TRACK.id];
  return Number.isFinite(value) ? value : null;
}

function saveBestLap(bestLapMs) {
  const storage = readStorage();
  storage.bestLapByTrack[TRACK.id] = bestLapMs;
  writeStorage(storage);
}

function persistRaceResult() {
  const storage = readStorage();
  storage.recentResults.unshift({
    trackId: TRACK.id,
    lapTimes: [...runtime.lapTimes],
    totalTimeMs: Math.round(runtime.totalTimeMs),
    playedAt: new Date().toISOString(),
  });
  storage.recentResults = storage.recentResults.slice(0, 10);
  writeStorage(storage);
}

function readStorage() {
  try {
    const raw = window.localStorage.getItem(RACING_STORAGE_KEY);
    if (!raw) {
      return createDefaultStorage();
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return createDefaultStorage();
    }

    return {
      version: "v1",
      bestLapByTrack: typeof parsed.bestLapByTrack === "object" && parsed.bestLapByTrack !== null ? parsed.bestLapByTrack : {},
      recentResults: Array.isArray(parsed.recentResults) ? parsed.recentResults : [],
    };
  } catch {
    return createDefaultStorage();
  }
}

function writeStorage(storage) {
  window.localStorage.setItem(RACING_STORAGE_KEY, JSON.stringify(storage));
}

function createDefaultStorage() {
  return {
    version: "v1",
    bestLapByTrack: {},
    recentResults: [],
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}
