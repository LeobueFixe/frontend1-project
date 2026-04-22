class AlNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="navbar">
        <nav class="nav">
          <div class="nav-left">
            <h1 class="nav-title">AlCafe</h1>
          </div>

          <div class="nav-right">
            <input type="checkbox" id="checkboxInput">
            <label for="checkboxInput" class="toggleSwitch"></label>

            <button class="icon-btn">
              <img src="/assets/img/icons/user-dark.png" alt="icon" id="user-icon"/>
            </button>
          </div>
        </nav>
      </header>
    `;

    const checkbox = document.getElementById("checkboxInput");
    const icon = document.getElementById("user-icon");
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      checkbox.checked = true;
      icon.src = "/assets/img/icons/user-light.png";
    }

    checkbox.addEventListener("change", () => {
      const isDark = checkbox.checked;

      document.body.classList.toggle("dark", isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");

      icon.src = isDark
        ? "/assets/img/icons/user-light.png"
        : "/assets/img/icons/user-dark.png";
    });
  }
}

customElements.define("al-navbar", AlNavbar);
