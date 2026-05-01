const HWWJAuth = (() => {
  let cachedSession = null;

  async function login(username, password) {
    const normalizedUsername = String(username ?? "").trim();
    const normalizedPassword = String(password ?? "");

    let response;
    let data;
    try {
      ({ response, data } = await requestJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: normalizedUsername,
          password: normalizedPassword,
        }),
      }));
    } catch (error) {
      cachedSession = unauthenticatedSession();
      return {
        ok: false,
        message: "登录服务暂时不可用，请稍后重试。",
      };
    }

    if (!response.ok) {
      cachedSession = unauthenticatedSession();
      return {
        ok: false,
        message: data?.message || "登录失败，请检查账号或密码。",
      };
    }

    cachedSession = normalizeSessionPayload(data);
    return {
      ok: true,
      user: cachedSession.user,
    };
  }

  async function logout() {
    try {
      await requestJson("/api/auth/logout", { method: "POST" });
    } catch (error) {
      // Ignore logout transport errors and clear the local view of the session.
    } finally {
      cachedSession = unauthenticatedSession();
    }
  }

  async function getSession(forceRefresh = false) {
    if (!forceRefresh && cachedSession) {
      return cachedSession;
    }

    try {
      const { response, data } = await requestJson("/api/auth/session");
      if (!response.ok) {
        cachedSession = unauthenticatedSession();
        return cachedSession;
      }

      cachedSession = normalizeSessionPayload(data);
      return cachedSession;
    } catch (error) {
      cachedSession = unauthenticatedSession();
      return cachedSession;
    }
  }

  async function getCurrentUser(forceRefresh = false) {
    const session = await getSession(forceRefresh);
    return session.user;
  }

  async function isLoggedIn(forceRefresh = false) {
    const session = await getSession(forceRefresh);
    return session.authenticated;
  }

  async function protectPage(loginPage = "login.html") {
    const session = await getSession(true);
    if (!session.authenticated) {
      window.location.replace(loginPage);
      return false;
    }
    return true;
  }

  async function requireUser(loginPage = "login.html") {
    const session = await getSession(true);

    if (!session.authenticated || !session.user) {
      window.location.replace(loginPage);
      throw new Error("Authentication required");
    }

    return session.user;
  }

  async function redirectIfLoggedIn(targetPage = "games.html") {
    const session = await getSession(true);
    if (session.authenticated) {
      window.location.replace(targetPage);
      return true;
    }
    return false;
  }

  function getCurrentUsername() {
    return cachedSession?.user?.username || "";
  }

  return {
    getSession,
    getCurrentUser,
    getCurrentUsername,
    isLoggedIn,
    login,
    logout,
    protectPage,
    redirectIfLoggedIn,
    requireUser,
  };
})();

window.HWWJAuth = HWWJAuth;

async function requestJson(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await window.fetch(url, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  return { response, data };
}

function normalizeSessionPayload(payload) {
  const authenticated = Boolean(payload?.authenticated);
  const user = authenticated && isValidUser(payload?.user) ? payload.user : null;

  return {
    authenticated: Boolean(user),
    user,
  };
}

function unauthenticatedSession() {
  return {
    authenticated: false,
    user: null,
  };
}

function isValidUser(user) {
  return Boolean(user && typeof user === "object" && typeof user.username === "string" && user.username.trim());
}
