const API_BASE_URL = "https://69f24f77b15130b97352ca03.mockapi.io/api/v1";
const MENU_ENDPOINT = `${API_BASE_URL}/menu`;
const RESERVATIONS_ENDPOINT = `${API_BASE_URL}/reservation`;


function toastSuccess(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "#4CAF50",
    stopOnFocus: true
  }).showToast();
}

function toastError(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "#E53935",
    stopOnFocus: true
  }).showToast();
}

async function loadMenu() {
    const response = await fetch(MENU_ENDPOINT);
    const data = await response.json();

    const menuData = data[0].menuList;

    const dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    let currentIndex = new Date().getDay();

    const dayCarousel = document.getElementById("day-carousel");
    const container = document.getElementById("menu-items");

    function renderDays() {
        dayCarousel.innerHTML = "";

        dias.forEach((dia, index) => {
            const div = document.createElement("div");
            div.className = "day-item";

            if (index === currentIndex) {
                div.classList.add("active");
            } else {
                div.classList.add("small");
            }

            div.textContent = dia.charAt(0).toUpperCase() + dia.slice(1);
            div.onclick = () => {
                currentIndex = index;
                updateMenu();
            };

            dayCarousel.appendChild(div);
        });
    }

    function updateMenu() {
        renderDays();

        const hoje = dias[currentIndex];
        container.innerHTML = "";

        const categorias = [
            "entradas",
            "sopas",
            hoje,
            "sobremesas",
            "bebidas",
            "cafes"
        ];

        categorias.forEach(cat => {
            const items = menuData[cat];
            if (!items) return;

            const box = document.createElement("div");
            box.className = "menu-category";

            const catTitle = document.createElement("h3");
            catTitle.textContent = (cat === hoje) ? "Prato Principal" : cat.charAt(0).toUpperCase() + cat.slice(1);
            box.appendChild(catTitle);

            items.forEach(item => {
                const div = document.createElement("div");
                div.className = "menu-item";
                div.innerHTML = `
                    <span class="dish-name">${item.name}</span>
                    <span class="dish-price">${item.price}</span>
                `;
                box.appendChild(div);
            });

            container.appendChild(box);
        });
    }

    document.getElementById("prev-day").onclick = () => {
        currentIndex = (currentIndex - 1 + dias.length) % dias.length;
        updateMenu();
    };

    document.getElementById("next-day").onclick = () => {
        currentIndex = (currentIndex + 1) % dias.length;
        updateMenu();
    };

    updateMenu();
}

loadMenu();



class AlNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="navbar">
        <nav class="nav">
          <div class="nav-left">  
            <h1 class="nav-title">AlCafe</h1>
          </div>
          <div class="nav-right">
            <a class="nav-link" href="#home">Home</a>
            <a class="nav-link" href="#reservations-section">Reservas</a>
            <a class="nav-link" href="#contact">Contact</a>
          </div>
        </nav>
      </header>
    `;
  }
}

customElements.define("al-navbar", AlNavbar);


const service = document.getElementById("service");
const timeSelect = document.getElementById("time");

function generateTimeOptions(startHour, endHour) {
  if (!timeSelect) return;
  timeSelect.innerHTML = `<option value="">Escolha a hora...</option>`;

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute of ["00", "30"]) {
      const timeValue = `${String(hour).padStart(2, "0")}:${minute}`;
      const option = document.createElement("option");
      option.value = timeValue;
      option.textContent = timeValue;
      timeSelect.appendChild(option);
    }
  }
}

async function fetchMenuFromAPI() {
  const response = await fetch(MENU_ENDPOINT);
  if (!response.ok) throw new Error("Erro ao buscar menu da API");
  return response.json();
}

function getMenuFromLocalStorage() {
  const stored = localStorage.getItem("menu");
  return stored ? JSON.parse(stored) : null;
}

function saveMenuToLocalStorage(menu) {
  localStorage.setItem("menu", JSON.stringify(menu));
}


function renderMenu(menuData, currentIndex) {
  const dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const hoje = dias[currentIndex];

  const title = document.getElementById("menu-title");
  const container = document.getElementById("menu-items");
  if (!title || !container) return;

  title.textContent = hoje.charAt(0).toUpperCase() + hoje.slice(1);
  container.innerHTML = "";

  const categorias = [
    "entradas",
    "sopas",
    hoje,
    "sobremesas",
    "bebidas",
    "cafes"
  ];

  categorias.forEach(cat => {
    const items = menuData[cat];
    if (!items) return;

    const box = document.createElement("div");
    box.className = "menu-category";

    const catTitle = document.createElement("h3");
    catTitle.textContent = (cat === hoje) ? "Prato Principal" : cat.charAt(0).toUpperCase() + cat.slice(1);
    box.appendChild(catTitle);

    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "menu-item";
      div.innerHTML = `
        <span class="dish-name">${item.name}</span>
        <span class="dish-price">${item.price}</span>
      `;
      box.appendChild(div);
    });

    container.appendChild(box);
  });
}


async function loadMenu() {
  try {
    const data = await fetchMenuFromAPI();
    const menuList = data[0].menuList;

    saveMenuToLocalStorage(menuList);

    const dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    let currentIndex = new Date().getDay();

    const dayCarousel = document.getElementById("day-carousel");
    const prevBtn = document.getElementById("prev-day");
    const nextBtn = document.getElementById("next-day");

    if (!dayCarousel) {
      console.warn("Elemento #day-carousel não encontrado.");
      renderMenu(menuList, currentIndex);
      return;
    }

    function renderDays() {
      dayCarousel.innerHTML = "";

      const prev = (currentIndex - 1 + dias.length) % dias.length;
      const next = (currentIndex + 1) % dias.length;

      const order = [prev, currentIndex, next];

      order.forEach((index, pos) => {
        const div = document.createElement("div");
        div.className = "day-item";

        if (pos === 1) {
          div.classList.add("center");
        } else {
          div.classList.add("side");
        }

        div.textContent = dias[index].charAt(0).toUpperCase() + dias[index].slice(1);

        div.onclick = () => {
          currentIndex = index;
          updateMenu();
        };

        dayCarousel.appendChild(div);
      });
    }

    function updateMenu() {
      renderDays();
      renderMenu(menuList, currentIndex);
    }

    if (prevBtn) {
      prevBtn.onclick = () => {
        currentIndex = (currentIndex - 1 + dias.length) % dias.length;
        updateMenu();
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % dias.length;
        updateMenu();
      };
    }

    updateMenu();

  } catch (error) {
    console.warn("Erro ao carregar menu da API:", error);
    const cached = getMenuFromLocalStorage();
    if (cached) {
      const todayIndex = new Date().getDay();
      renderMenu(cached, todayIndex);
    }
  }
}

loadMenu();


async function loadDishes() {
  try {
    const data = await fetchMenuFromAPI();
    const menuList = data[0].menuList;

    saveMenuToLocalStorage(menuList);
    renderDishes(menuList);

  } catch (error) {
    console.warn("Erro ao carregar pratos da API, a usar LocalStorage:", error);
    const cached = getMenuFromLocalStorage();
    if (cached) {
      renderDishes(cached);
    }
  }
}

function renderDishes(menuData) {
  const daysPortuguese = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const todayIndex = new Date().getDay();
  const today = daysPortuguese[todayIndex];

  const menuItems = menuData[today] || [];

  const dishSelect = document.getElementById("dish");
  if (!dishSelect) return;

  dishSelect.innerHTML = `<option value="">Nenhum prato selecionado</option>`;

  menuItems.forEach(item => {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = `${item.name} - ${item.price}`;
    dishSelect.appendChild(option);
  });
}

loadDishes();
