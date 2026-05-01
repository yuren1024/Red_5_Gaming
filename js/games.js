const currentUsernameEl = document.querySelector("#current-username");
const enterHongwuBtn = document.querySelector("#enter-hongwu-btn");
const enterSnakeBtn = document.querySelector("#enter-snake-btn");
const enterRacingBtn = document.querySelector("#enter-racing-btn");
const logoutBtn = document.querySelector("#logout-btn");

init().catch(() => {});

async function init() {
  const user = await window.HWWJAuth.requireUser("login.html");
  currentUsernameEl.textContent = user.username;

  enterHongwuBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  enterSnakeBtn.addEventListener("click", () => {
    window.location.href = "snake.html";
  });

  enterRacingBtn.addEventListener("click", () => {
    window.location.href = "racing.html";
  });

  logoutBtn.addEventListener("click", async () => {
    await window.HWWJAuth.logout();
    window.location.href = "login.html";
  });
}
