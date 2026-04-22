const icon = document.getElementById("user-icon");
const body = document.body;
const checkbox = document.getElementById("checkboxInput");

checkbox.addEventListener("change", toggleTheme);

function toggleTheme() {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    icon.src = "assets/img/icons/user-light.png";
  } else {
    icon.src = "assets/img/icons/user-dark.png";
  }
}
