const HWWJ_AUTH_STORAGE_KEY = "hwwj.simpleAuth";
const HWWJ_DEFAULT_ACCOUNT = {
  username: "于人",
  password: "123456",
};

function getStoredAuth() {
  try {
    const raw = window.localStorage.getItem(HWWJ_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function isLoggedIn() {
  const auth = getStoredAuth();
  return Boolean(auth?.username);
}

function login(username, password) {
  const normalizedUsername = String(username ?? "").trim();
  const normalizedPassword = String(password ?? "");
  const isValid =
    normalizedUsername === HWWJ_DEFAULT_ACCOUNT.username &&
    normalizedPassword === HWWJ_DEFAULT_ACCOUNT.password;

  if (!isValid) {
    return {
      ok: false,
      message: "账号或密码错误，请使用默认账号登录。",
    };
  }

  window.localStorage.setItem(
    HWWJ_AUTH_STORAGE_KEY,
    JSON.stringify({
      username: normalizedUsername,
      loggedInAt: new Date().toISOString(),
    })
  );

  return { ok: true };
}

function logout() {
  window.localStorage.removeItem(HWWJ_AUTH_STORAGE_KEY);
}

function protectPage(loginPage = "login.html") {
  if (!isLoggedIn()) {
    window.location.replace(loginPage);
    return false;
  }
  return true;
}

function redirectIfLoggedIn(targetPage = "games.html") {
  if (isLoggedIn()) {
    window.location.replace(targetPage);
    return true;
  }
  return false;
}

function getCurrentUsername() {
  return getStoredAuth()?.username || "";
}

window.HWWJAuth = {
  defaultUsername: HWWJ_DEFAULT_ACCOUNT.username,
  defaultPassword: HWWJ_DEFAULT_ACCOUNT.password,
  isLoggedIn,
  login,
  logout,
  protectPage,
  redirectIfLoggedIn,
  getCurrentUsername,
};
