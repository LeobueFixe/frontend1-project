function toastSuccess(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      backgroundColor: "#4CAF50",
    },
    stopOnFocus: true
  }).showToast();
}

function toastError(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      backgroundColor: "#E53935",
    },
    stopOnFocus: true
  }).showToast();
}

function toastWarning(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "#FFA000",
    stopOnFocus: true
  }).showToast();
}


class AlNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="navbar">
        <nav class="nav">
          <div class="nav-left">
            <h1 class="nav-title">AlCafe</h1>
          </div>
          <div class="nav-right">
            <a class="nav-link" href="#reservations-section">Reservas</a>
            <a class="nav-link" href="#my-reservation">A minha reserva</a>
            <input type="checkbox" id="checkboxInput">
            <label for="checkboxInput" class="toggleSwitch"></label>
          </div>
        </nav>
      </header>
    `;

    this.initThemeToggle();
  }

  initThemeToggle() {
    const checkbox = this.querySelector("#checkboxInput");
    const body = document.body;

    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      body.classList.add("dark");
      checkbox.checked = true;
    }

    checkbox.addEventListener("change", () => {
      body.classList.toggle("dark");
      localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
    });
  }
}

customElements.define("al-navbar", AlNavbar);