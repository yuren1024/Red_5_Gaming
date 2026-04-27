const RACING_STORAGE_KEY = "hwwj.racing.timeTrial.v1";

const STATE = {
  IDLE: "idle",
  COUNTDOWN: "countdown",
  RUNNING: "running",
  PAUSED: "paused",
  FINISHED: "finished",
};

const TRACKS = window.HWWJRacingTracks;

if (!Array.isArray(TRACKS) || TRACKS.length === 0) {
  throw new Error("Racing tracks config missing. Please load js/racing-tracks.js before js/racing.js.");
}

const TRACKS_BY_ID = Object.fromEntries(TRACKS.map((track) => [track.id, track]));

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
const trackTitleEl = document.querySelector("#track-title");
const trackDescriptionEl = document.querySelector("#track-description");
const trackSelectListEl = document.querySelector("#track-select-list");
const statusEl = document.querySelector("#race-status-value");
const lapEl = document.querySelector("#lap-value");
const currentLapTimeEl = document.querySelector("#current-lap-time-value");
const lastLapTimeEl = document.querySelector("#last-lap-time-value");
const sessionBestLapEl = document.querySelector("#session-best-lap-time-value");
const bestLapEl = document.querySelector("#best-lap-time-value");
const speedStateEl = document.querySelector("#speed-state-value");
const messageEl = document.querySelector("#message-value");
const lapTimesListEl = document.querySelector("#lap-times-list");
const resultLapTimesListEl = document.querySelector("#result-lap-times-list");
const resultPanelEl = document.querySelector("#result-panel");
const resultBadgeEl = document.querySelector("#result-badge");
const resultTotalTimeEl = document.querySelector("#result-total-time");
const resultBestLapEl = document.querySelector("#result-best-lap");
const resultLastLapEl = document.querySelector("#result-last-lap");
const resultSummaryEl = document.querySelector("#result-summary");

const startBtn = document.querySelector("#start-btn");
const pauseBtn = document.querySelector("#pause-btn");
const restartBtn = document.querySelector("#restart-btn");
const backBtn = document.querySelector("#back-games-btn");
const logoutBtn = document.querySelector("#logout-btn");
const touchButtons = document.querySelectorAll(".racing-touch-btn");

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
  activeTrackId: TRACKS[0].id,
  bestLapMs: null,
};

let activeTrack = TRACKS_BY_ID[runtime.activeTrackId];

const car = {
  x: 0,
  y: 0,
  heading: 0,
  speed: 0,
  inTrack: true,
  inCurveZone: false,
  progress: 0,
  distanceToCenter: 0,
  lastSafeX: 0,
  lastSafeY: 0,
  lastSafeHeading: 0,
};

let geometry = createTrackGeometry(activeTrack);

let animationFrameId = null;
let lastFrameAt = performance.now();

init();

function init() {
  currentUsernameEl.textContent = window.HWWJAuth.getCurrentUsername();
  applyTrackMetadata();
  renderTrackButtons();
  resetRaceState(STATE.IDLE, `已选择 ${activeTrack.name}`);
  bindEvents();
  syncHud();
  renderLapTimes();
  syncResultPanel();
  render();
  animationFrameId = window.requestAnimationFrame(frame);
}

function bindEvents() {
  startBtn.addEventListener("click", startRace);
  pauseBtn.addEventListener("click", togglePause);
  restartBtn.addEventListener("click", restartRace);

  trackSelectListEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-track-id]");
    if (!button) return;
    if (button.disabled) return;
    setActiveTrack(button.dataset.trackId);
  });

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

  touchButtons.forEach((button) => {
    const control = button.dataset.control;
    if (!control) return;

    const release = () => {
      setTouchInput(control, false);
    };

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      setTouchInput(control, true);
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
    button.addEventListener("pointerout", release);
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
    progress: car.progress,
  };

  updateCarPhysics(dt);
  checkTrackState(dt);
  checkCheckpoints(previous, car);
  syncHud();
}

function updateCarPhysics(dt) {
  const steeringInput = Number(input.right) - Number(input.left);
  const isTurning = steeringInput !== 0;

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

  syncCarTrackSample();

  const isOffTrack = car.distanceToCenter > activeTrack.width / 2;

  runtime.speedState = "滑行";
  if (car.speed <= 1) {
    runtime.speedState = "待命";
  } else if (isOffTrack) {
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
  const inTrackNow = car.distanceToCenter <= activeTrack.width / 2;
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
  if (!current.inTrack) return;

  const checkpointProgresses = activeTrack.checkpoints;
  const nextCheckpointProgress = checkpointProgresses[runtime.checkpointIndex];
  if (
    Number.isFinite(nextCheckpointProgress) &&
    crossedProgress(previous.progress, current.progress, nextCheckpointProgress)
  ) {
    runtime.checkpointIndex += 1;
    flashMessage(`通过 CP${runtime.checkpointIndex}`);
    return;
  }

  if (
    runtime.checkpointIndex === checkpointProgresses.length &&
    crossedStartLine(previous.progress, current.progress)
  ) {
    finishLapIfEligible();
  }
}

function finishLapIfEligible() {
  if (runtime.checkpointIndex !== activeTrack.checkpoints.length) return;
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

  if (runtime.lapTimes.length >= activeTrack.lapTarget) {
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
  resetRaceState(STATE.COUNTDOWN, "准备开始");
  runtime.state = STATE.COUNTDOWN;
  runtime.message = "准备开始";
  syncHud();
}

function restartRace() {
  startRace();
}

function resetRaceState(nextState = STATE.IDLE, message = "点击开始比赛") {
  runtime.state = nextState;
  runtime.countdownMsRemaining = PHYSICS.countdownMs;
  runtime.currentLap = 1;
  runtime.lapTimes = [];
  runtime.currentLapTimeMs = 0;
  runtime.totalTimeMs = 0;
  runtime.lastLapTimeMs = null;
  runtime.sessionBestLapMs = null;
  runtime.checkpointIndex = 0;
  runtime.speedState = nextState === STATE.COUNTDOWN ? "等待起跑" : "待命";
  runtime.message = message;
  runtime.flashMessageMs = 0;
  runtime.hasNewRecord = false;
  runtime.offTrackMs = 0;
  runtime.bestLapMs = readBestLap();

  const startPose = getTrackStartPose();
  car.x = startPose.x;
  car.y = startPose.y;
  car.heading = startPose.heading;
  car.speed = 0;
  car.inTrack = true;
  car.inCurveZone = isInCurveZone(startPose.progress);
  car.progress = startPose.progress;
  car.distanceToCenter = 0;
  car.lastSafeX = car.x;
  car.lastSafeY = car.y;
  car.lastSafeHeading = car.heading;

  input.up = false;
  input.down = false;
  input.left = false;
  input.right = false;

  renderLapTimes();
  syncResultPanel();
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
  syncCarTrackSample();
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
  lapEl.textContent = `${Math.min(runtime.currentLap, activeTrack.lapTarget)} / ${activeTrack.lapTarget}`;
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
  renderTrackButtons();
  syncResultPanel();
}

function renderLapTimes() {
  const markup = buildLapTimesMarkup(runtime.lapTimes);
  lapTimesListEl.innerHTML = markup;
  resultLapTimesListEl.innerHTML = markup;
}

function buildLapTimesMarkup(lapTimes) {
  const items = [];
  for (let index = 0; index < activeTrack.lapTarget; index += 1) {
    const time = lapTimes[index];
    items.push(`
      <div class="racing-lap-item">
        <span>Lap ${index + 1}</span>
        <strong>${time ? formatDuration(time) : "--:--.---"}</strong>
      </div>
    `);
  }
  return items.join("");
}

function syncResultPanel() {
  const isFinished = runtime.state === STATE.FINISHED;
  resultPanelEl.classList.toggle("hidden", !isFinished);
  resultBadgeEl.textContent = runtime.hasNewRecord ? "New Record" : "完赛";
  resultTotalTimeEl.textContent = formatDuration(runtime.totalTimeMs);
  resultBestLapEl.textContent = formatNullableDuration(runtime.sessionBestLapMs);
  resultLastLapEl.textContent = formatNullableDuration(runtime.lastLapTimeMs);
  resultSummaryEl.textContent = runtime.hasNewRecord ? "刷新本地最佳圈" : "顺利完成 3 圈";
}

function applyTrackMetadata() {
  trackTitleEl.textContent = activeTrack.name;
  trackDescriptionEl.textContent = activeTrack.description;
}

function renderTrackButtons() {
  const disableSwitch = runtime.state === STATE.COUNTDOWN || runtime.state === STATE.RUNNING || runtime.state === STATE.PAUSED;
  if (trackSelectListEl.children.length !== TRACKS.length) {
    trackSelectListEl.innerHTML = TRACKS.map((track) => `
      <button
        type="button"
        class="racing-track-btn"
        data-track-id="${track.id}"
      >
        <strong>${track.name}</strong>
        <span>${track.description}</span>
      </button>
    `).join("");
  }

  trackSelectListEl.querySelectorAll("[data-track-id]").forEach((button) => {
    const isActive = button.dataset.trackId === activeTrack.id;
    button.classList.toggle("active", isActive);
    button.disabled = disableSwitch;
  });
}

function setActiveTrack(trackId) {
  const nextTrack = TRACKS_BY_ID[trackId];
  if (!nextTrack || nextTrack.id === activeTrack.id) return;

  activeTrack = nextTrack;
  runtime.activeTrackId = nextTrack.id;
  geometry = createTrackGeometry(activeTrack);
  applyTrackMetadata();
  resetRaceState(STATE.IDLE, `已切换至 ${activeTrack.name}`);
  syncHud();
  render();
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
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = "#18212f";
  ctx.lineWidth = activeTrack.width + 14;
  ctx.stroke(geometry.centerPath);

  ctx.strokeStyle = activeTrack.surfaceColor;
  ctx.lineWidth = activeTrack.width;
  ctx.stroke(geometry.centerPath);

  ctx.setLineDash([16, 14]);
  ctx.strokeStyle = activeTrack.centerLineColor;
  ctx.lineWidth = 2;
  ctx.stroke(geometry.centerPath);
  ctx.restore();

  drawStartFinishLine();
}

function drawStartFinishLine() {
  const { center, normal } = geometry.startGate;
  const cell = 8;
  const rows = Math.ceil((activeTrack.width + 4) / cell);
  const normalAngle = Math.atan2(normal.y, normal.x);

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(normalAngle);

  for (let index = 0; index < rows; index += 1) {
    ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#202636";
    ctx.fillRect(-10, -activeTrack.width / 2 + index * cell, 20, cell);
  }
  ctx.restore();
}

function drawCheckpoints() {
  ctx.save();
  ctx.lineWidth = 5;
  ctx.setLineDash([10, 10]);

  geometry.checkpointGates.forEach((gate, index) => {
    drawCheckpointLine(gate.x1, gate.y1, gate.x2, gate.y2, runtime.checkpointIndex >= index + 1);
  });
  drawCheckpointLine(
    geometry.startGate.x1,
    geometry.startGate.y1,
    geometry.startGate.x2,
    geometry.startGate.y2,
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

function createTrackGeometry(track) {
  const path = createTrackPath(track.points);
  const segments = [];
  let totalLength = 0;

  for (let index = 0; index < track.points.length; index += 1) {
    const start = track.points[index];
    const end = track.points[(index + 1) % track.points.length];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    const tangent = length === 0 ? { x: 1, y: 0 } : { x: dx / length, y: dy / length };

    segments.push({
      start,
      end,
      dx,
      dy,
      length,
      tangent,
      startLength: totalLength,
      endLength: totalLength + length,
    });
    totalLength += length;
  }

  return {
    centerPath: path,
    segments,
    totalLength,
    checkpointGates: track.checkpoints.map((progress) => createGateAtProgress(progress, segments, totalLength, track.width)),
    startGate: createGateAtProgress(0, segments, totalLength, track.width),
  };
}

function createTrackPath(points) {
  const path = new Path2D();
  path.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    path.lineTo(points[index].x, points[index].y);
  }
  path.closePath();
  return path;
}

function isPointInTrack(x, y) {
  return getNearestTrackSample(x, y).distance <= activeTrack.width / 2;
}

function isInCurveZone(progress) {
  return activeTrack.curveRanges.some(([start, end]) => {
    if (start <= end) {
      return progress >= start && progress <= end;
    }
    return progress >= start || progress <= end;
  });
}

function syncCarTrackSample() {
  const sample = getNearestTrackSample(car.x, car.y);
  car.progress = sample.progress;
  car.distanceToCenter = sample.distance;
  car.inCurveZone = isInCurveZone(sample.progress);
}

function getTrackStartPose() {
  const startSample = sampleTrackAtProgress(0);
  return {
    x: startSample.x,
    y: startSample.y,
    heading: Math.atan2(startSample.tangent.y, startSample.tangent.x),
    progress: 0,
  };
}

function createGateAtProgress(progress, segments, totalLength, width) {
  const sample = sampleTrackAtProgress(progress, segments, totalLength);
  const halfWidth = width / 2 + 8;
  return {
    progress,
    center: { x: sample.x, y: sample.y },
    normal: sample.normal,
    x1: sample.x + sample.normal.x * halfWidth,
    y1: sample.y + sample.normal.y * halfWidth,
    x2: sample.x - sample.normal.x * halfWidth,
    y2: sample.y - sample.normal.y * halfWidth,
  };
}

function sampleTrackAtProgress(progress, segments = geometry.segments, totalLength = geometry.totalLength) {
  const normalized = normalizeProgress(progress);
  const targetLength = normalized * totalLength;

  for (const segment of segments) {
    if (targetLength <= segment.endLength) {
      const localLength = targetLength - segment.startLength;
      const ratio = segment.length === 0 ? 0 : localLength / segment.length;
      const x = segment.start.x + segment.dx * ratio;
      const y = segment.start.y + segment.dy * ratio;
      return {
        x,
        y,
        tangent: segment.tangent,
        normal: { x: -segment.tangent.y, y: segment.tangent.x },
      };
    }
  }

  const lastSegment = segments[segments.length - 1];
  return {
    x: lastSegment.end.x,
    y: lastSegment.end.y,
    tangent: lastSegment.tangent,
    normal: { x: -lastSegment.tangent.y, y: lastSegment.tangent.x },
  };
}

function getNearestTrackSample(x, y) {
  let bestSample = null;

  for (const segment of geometry.segments) {
    const projection = projectPointToSegment(x, y, segment);
    if (!bestSample || projection.distance < bestSample.distance) {
      bestSample = projection;
    }
  }

  return bestSample;
}

function projectPointToSegment(x, y, segment) {
  const lengthSquared = segment.length * segment.length || 1;
  const rawT = ((x - segment.start.x) * segment.dx + (y - segment.start.y) * segment.dy) / lengthSquared;
  const t = clamp(rawT, 0, 1);
  const projectedX = segment.start.x + segment.dx * t;
  const projectedY = segment.start.y + segment.dy * t;
  const distance = Math.hypot(x - projectedX, y - projectedY);

  return {
    x: projectedX,
    y: projectedY,
    distance,
    progress: normalizeProgress((segment.startLength + segment.length * t) / geometry.totalLength),
    tangent: segment.tangent,
  };
}

function crossedProgress(previousProgress, currentProgress, targetProgress) {
  const delta = currentProgress - previousProgress;
  if (delta >= 0 && delta < 0.4) {
    return targetProgress > previousProgress && targetProgress <= currentProgress;
  }
  if (delta < -0.6) {
    return targetProgress > previousProgress || targetProgress <= currentProgress;
  }
  return false;
}

function crossedStartLine(previousProgress, currentProgress) {
  return previousProgress - currentProgress > 0.6;
}

function normalizeProgress(progress) {
  if (progress >= 1 || progress < 0) {
    return ((progress % 1) + 1) % 1;
  }
  return progress;
}

function setInput(key, pressed) {
  if (key === "ArrowUp") {
    return setTouchInput("up", pressed);
  }
  if (key === "ArrowDown") {
    return setTouchInput("down", pressed);
  }
  if (key === "ArrowLeft") {
    return setTouchInput("left", pressed);
  }
  if (key === "ArrowRight") {
    return setTouchInput("right", pressed);
  }
  return false;
}

function setTouchInput(control, pressed) {
  if (!(control in input)) return false;
  input[control] = pressed;
  return true;
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
  const value = storage.bestLapByTrack?.[activeTrack.id];
  return Number.isFinite(value) ? value : null;
}

function saveBestLap(bestLapMs) {
  const storage = readStorage();
  storage.bestLapByTrack[activeTrack.id] = bestLapMs;
  writeStorage(storage);
}

function persistRaceResult() {
  const storage = readStorage();
  storage.recentResults.unshift({
    trackId: activeTrack.id,
    trackName: activeTrack.name,
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
