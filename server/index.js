const path = require("path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

function loadConfig(env = process.env) {
  const config = {
    projectRoot: path.resolve(__dirname, ".."),
    isProduction: env.NODE_ENV === "production",
    port: readPositiveInt(env.PORT, 3000),
    sessionTtlMs: readPositiveInt(env.SESSION_TTL_MS, 1000 * 60 * 60 * 8),
    adminUsername: normalizeUsername(env.AUTH_ADMIN_USERNAME),
    adminPasswordHash: String(env.AUTH_ADMIN_PASSWORD_HASH ?? "").trim(),
    sessionSecret: String(env.SESSION_SECRET ?? "").trim(),
    trustProxy: env.TRUST_PROXY === "1",
  };

  if (!config.adminUsername || !config.adminPasswordHash || !config.sessionSecret) {
    throw new Error(
      [
        "Missing auth server configuration.",
        "Create server/.env from server/.env.example and provide:",
        "- AUTH_ADMIN_USERNAME",
        "- AUTH_ADMIN_PASSWORD_HASH",
        "- SESSION_SECRET",
      ].join("\n")
    );
  }

  return config;
}

function createApp(config = loadConfig()) {
  const app = express();

  app.disable("x-powered-by");

  if (config.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.use((req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-store");
    }
    next();
  });

  app.use(express.json({ limit: "10kb" }));

  app.use(
    session({
      name: "hwwj.sid",
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: config.isProduction,
        maxAge: config.sessionTtlMs,
      },
    })
  );

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res) {
      res.status(429).json({
        ok: false,
        message: "登录尝试过于频繁，请 15 分钟后再试。",
      });
    },
  });

  app.get("/", (req, res) => {
    res.redirect(getSessionUser(req) ? "/games.html" : "/login.html");
  });

  app.get("/login.html", (req, res) => {
    if (getSessionUser(req)) {
      res.redirect("/games.html");
      return;
    }

    res.sendFile(path.join(config.projectRoot, "login.html"));
  });

  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    const username = normalizeUsername(req.body?.username);
    const password = normalizePassword(req.body?.password);

    if (!username || !password || username.length > 60 || password.length > 200) {
      res.status(400).json({
        ok: false,
        message: "请输入正确的账号和密码。",
      });
      return;
    }

    const isValid =
      username === config.adminUsername &&
      (await bcrypt.compare(password, config.adminPasswordHash).catch(() => false));

    if (!isValid) {
      res.status(401).json({
        ok: false,
        message: "账号或密码错误。",
      });
      return;
    }

    req.session.regenerate((error) => {
      if (error) {
        console.error("Failed to regenerate session:", error);
        res.status(500).json({
          ok: false,
          message: "登录服务暂时不可用，请稍后再试。",
        });
        return;
      }

      req.session.user = {
        username: config.adminUsername,
        loggedInAt: new Date().toISOString(),
      };

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Failed to save session:", saveError);
          res.status(500).json({
            ok: false,
            message: "登录服务暂时不可用，请稍后再试。",
          });
          return;
        }

        res.json({
          ok: true,
          authenticated: true,
          user: req.session.user,
        });
      });
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        console.error("Failed to destroy session:", error);
        res.status(500).json({
          ok: false,
          message: "退出登录失败，请稍后再试。",
        });
        return;
      }

      res.clearCookie("hwwj.sid");
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    const user = getSessionUser(req);
    res.json({
      authenticated: Boolean(user),
      user,
    });
  });

  app.get("/api/auth/me", requireApiAuth, (req, res) => {
    res.json({
      user: getSessionUser(req),
    });
  });

  for (const page of ["games.html", "index.html", "snake.html", "racing.html"]) {
    app.get(`/${page}`, requirePageAuth, (req, res) => {
      res.sendFile(path.join(config.projectRoot, page));
    });
  }

  app.use("/css", express.static(path.join(config.projectRoot, "css"), { index: false }));
  app.use("/js", express.static(path.join(config.projectRoot, "js"), { index: false }));
  app.use("/docs", express.static(path.join(config.projectRoot, "docs"), { index: false }));

  app.use(express.static(config.projectRoot, { index: false }));

  app.use((req, res) => {
    if (req.accepts("html")) {
      res.redirect(getSessionUser(req) ? "/games.html" : "/login.html");
      return;
    }

    res.status(404).json({
      ok: false,
      message: "Not found.",
    });
  });

  return app;
}

function startServer(config = loadConfig()) {
  const app = createApp(config);
  return app.listen(config.port, () => {
    console.log(`Red_5_Gaming auth server is running on http://localhost:${config.port}`);
  });
}

function requirePageAuth(req, res, next) {
  if (!getSessionUser(req)) {
    res.redirect("/login.html");
    return;
  }

  next();
}

function requireApiAuth(req, res, next) {
  const user = getSessionUser(req);

  if (!user) {
    res.status(401).json({
      authenticated: false,
      user: null,
      message: "请先登录。",
    });
    return;
  }

  next();
}

function getSessionUser(req) {
  const username = req.session?.user?.username;
  const loggedInAt = req.session?.user?.loggedInAt;

  if (typeof username !== "string" || !username.trim()) {
    return null;
  }

  return {
    username,
    loggedInAt: typeof loggedInAt === "string" ? loggedInAt : null,
  };
}

function normalizeUsername(value) {
  return String(value ?? "").trim();
}

function normalizePassword(value) {
  return String(value ?? "");
}

function readPositiveInt(rawValue, fallbackValue) {
  const parsed = Number.parseInt(String(rawValue ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallbackValue;
  }
  return parsed;
}

if (require.main === module) {
  try {
    startServer();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  createApp,
  loadConfig,
  startServer,
};
