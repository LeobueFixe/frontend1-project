const API_BASE_URL = "https://69f24f77b15130b97352ca03.mockapi.io/api/v1";
const MENU_ENDPOINT = `${API_BASE_URL}/menu`;


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


async function fetchMenuFromAPI() {
  const response = await fetch(MENU_ENDPOINT);
  if (!response.ok) throw new Error("Erro ao buscar menu da API");
  return response.json();
}


function renderMenu(menuData, currentIndex) {
  const dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const hoje = dias[currentIndex];

  const container = document.getElementById("menu-items");
  if (!container) return;

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

function renderDays(dayCarousel, dias, currentIndex, updateMenu) {
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
      updateMenu(index);
    };

    dayCarousel.appendChild(div);
  });
}

async function loadMenu() {
  try {
    const data = await fetchMenuFromAPI();
    const menuList = data[0].menuList;

    const dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    let currentIndex = new Date().getDay();

    const dayCarousel = document.getElementById("day-carousel");
    const prevBtn = document.getElementById("prev-day");
    const nextBtn = document.getElementById("next-day");

    function updateMenu(newIndex = currentIndex) {
      currentIndex = newIndex;
      renderDays(dayCarousel, dias, currentIndex, updateMenu);
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
    console.error("Erro ao carregar menu da API:", error);
    toastError("Erro ao carregar menu.");
  }
}

loadMenu();
