const SNAKE_BEST_SCORE_KEY = "hwwj.snake.bestScore";
const GRID_SIZE = 24;
const CELL_SIZE = 20;
const BASE_TICK_MS = 150;
const MIN_TICK_MS = 70;
const SPEED_STEP_MS = 10;
const SPEED_UP_EVERY = 3;

const STATE = {
  IDLE: "idle",
  RUNNING: "running",
  PAUSED: "paused",
  GAME_OVER: "gameover",
};

const DIRECTION_MAP = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  W: { x: 0, y: -1 },
  S: { x: 0, y: 1 },
  A: { x: -1, y: 0 },
  D: { x: 1, y: 0 },
};

const TOUCH_DIRECTION_MAP = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const canvas = document.querySelector("#snake-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score-value");
const bestScoreEl = document.querySelector("#best-score-value");
const statusEl = document.querySelector("#status-value");
const speedEl = document.querySelector("#speed-value");
const startBtn = document.querySelector("#start-btn");
const pauseBtn = document.querySelector("#pause-btn");
const restartBtn = document.querySelector("#restart-btn");
const backBtn = document.querySelector("#back-games-btn");
const logoutBtn = document.querySelector("#logout-btn");
const currentUsernameEl = document.querySelector("#current-username");
const touchButtons = document.querySelectorAll(".snake-touch-btn");

let gameState = STATE.IDLE;
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = null;
let score = 0;
let bestScore = readBestScore();
let timerId = null;

init();

function init() {
  currentUsernameEl.textContent = window.HWWJAuth.getCurrentUsername();
  bestScoreEl.textContent = String(bestScore);
  bindEvents();
  resetBoard();
  render();
}

function bindEvents() {
  startBtn.addEventListener("click", () => {
    if (gameState === STATE.IDLE || gameState === STATE.GAME_OVER) {
      startGame();
    }
  });

  pauseBtn.addEventListener("click", () => {
    if (gameState === STATE.RUNNING) {
      pauseGame();
    } else if (gameState === STATE.PAUSED) {
      resumeGame();
    }
  });

  restartBtn.addEventListener("click", () => {
    startGame();
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
      if (gameState === STATE.RUNNING) {
        pauseGame();
      } else if (gameState === STATE.PAUSED) {
        resumeGame();
      }
      return;
    }

    const candidate = DIRECTION_MAP[event.key];
    if (!candidate) return;

    event.preventDefault();
    requestDirection(candidate);
  });

  touchButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const candidate = TOUCH_DIRECTION_MAP[button.dataset.direction];
      if (candidate) {
        requestDirection(candidate);
      }
    });
  });
}

function resetBoard() {
  snake = [
    { x: 10, y: 12 },
    { x: 9, y: 12 },
    { x: 8, y: 12 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  food = createFood();
  updateScore();
  setState(STATE.IDLE);
}

function startGame() {
  stopLoop();
  resetBoard();
  setState(STATE.RUNNING);
  startLoop();
}

function pauseGame() {
  if (gameState !== STATE.RUNNING) return;
  setState(STATE.PAUSED);
  stopLoop();
}

function resumeGame() {
  if (gameState !== STATE.PAUSED) return;
  setState(STATE.RUNNING);
  startLoop();
}

function endGame() {
  setState(STATE.GAME_OVER);
  stopLoop();
  if (score > bestScore) {
    bestScore = score;
    window.localStorage.setItem(SNAKE_BEST_SCORE_KEY, String(bestScore));
    bestScoreEl.textContent = String(bestScore);
  }
}

function stopLoop() {
  if (timerId !== null) {
    window.clearTimeout(timerId);
    timerId = null;
  }
}

function startLoop() {
  stopLoop();
  timerId = window.setTimeout(runFrame, getTickMs());
}

function runFrame() {
  if (gameState !== STATE.RUNNING) return;
  tick();
  if (gameState === STATE.RUNNING) {
    timerId = window.setTimeout(runFrame, getTickMs());
  }
}

function tick() {
  direction = nextDirection;
  const head = snake[0];
  const nextHead = { x: head.x + direction.x, y: head.y + direction.y };

  if (hitsWall(nextHead) || hitsSelf(nextHead)) {
    endGame();
    render();
    return;
  }

  snake.unshift(nextHead);
  if (nextHead.x === food.x && nextHead.y === food.y) {
    score += 1;
    updateScore();
    food = createFood();
  } else {
    snake.pop();
  }

  render();
}

function render() {
  drawBoard();
  drawFood();
  drawSnake();
}

function drawBoard() {
  ctx.fillStyle = "#f8fbff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#e2eaf8";
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const pos = i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const x = segment.x * CELL_SIZE;
    const y = segment.y * CELL_SIZE;
    ctx.fillStyle = index === 0 ? "#2458e8" : "#4f79ef";
    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  });
}

function drawFood() {
  if (!food) return;
  const x = food.x * CELL_SIZE + CELL_SIZE / 2;
  const y = food.y * CELL_SIZE + CELL_SIZE / 2;
  ctx.fillStyle = "#d23939";
  ctx.beginPath();
  ctx.arc(x, y, CELL_SIZE * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

function createFood() {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    const onSnake = snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y);
    if (!onSnake) return candidate;
  }
}

function hitsWall(node) {
  return node.x < 0 || node.y < 0 || node.x >= GRID_SIZE || node.y >= GRID_SIZE;
}

function hitsSelf(node) {
  return snake.some((segment) => segment.x === node.x && segment.y === node.y);
}

function isOppositeDirection(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

function updateScore() {
  scoreEl.textContent = String(score);
  speedEl.textContent = formatSpeedMultiplier(getTickMs());
}

function setState(nextState) {
  gameState = nextState;
  statusEl.textContent = toStatusLabel(nextState);
  const canPause = nextState === STATE.RUNNING || nextState === STATE.PAUSED;
  pauseBtn.disabled = !canPause;
  pauseBtn.textContent = nextState === STATE.PAUSED ? "继续" : "暂停";
  startBtn.disabled = nextState === STATE.RUNNING || nextState === STATE.PAUSED;
}

function toStatusLabel(value) {
  if (value === STATE.RUNNING) return "进行中";
  if (value === STATE.PAUSED) return "已暂停";
  if (value === STATE.GAME_OVER) return "已结束";
  return "未开始";
}

function readBestScore() {
  const raw = window.localStorage.getItem(SNAKE_BEST_SCORE_KEY);
  const parsed = Number.parseInt(raw ?? "0", 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

function requestDirection(candidate) {
  if (gameState === STATE.IDLE) {
    startGame();
  }
  if (gameState !== STATE.RUNNING) return;
  if (isOppositeDirection(candidate, direction)) return;
  nextDirection = candidate;
}

function getTickMs() {
  const reduced = Math.floor(score / SPEED_UP_EVERY) * SPEED_STEP_MS;
  return Math.max(MIN_TICK_MS, BASE_TICK_MS - reduced);
}

function formatSpeedMultiplier(tickMs) {
  const multiplier = BASE_TICK_MS / tickMs;
  return `${multiplier.toFixed(1)}x`;
}
