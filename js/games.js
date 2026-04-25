document.querySelector("#current-username").textContent = window.HWWJAuth.getCurrentUsername();

document.querySelector("#enter-hongwu-btn").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.querySelector("#enter-snake-btn").addEventListener("click", () => {
  window.location.href = "snake.html";
});

document.querySelector("#logout-btn").addEventListener("click", () => {
  window.HWWJAuth.logout();
  window.location.href = "login.html";
});
