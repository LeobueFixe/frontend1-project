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

  const categorias = ["entradas", "sopas", hoje, "sobremesas", "bebidas", "cafes"];

  categorias.forEach(cat => {
    const items = menuData[cat];
    if (!items || items.length === 0) return;

    const box = document.createElement("div");
    box.className = "menu-category";

    const catTitle = document.createElement("h3");
    catTitle.textContent =
      cat === hoje
        ? "Prato Principal"
        : cat.charAt(0).toUpperCase() + cat.slice(1);
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
  // Keep a cached copy so the catch block can fall back to it
  let cached = null;

  try {
    const data = await fetchMenuFromAPI();
    const menuList = data[0].menuList;
    cached = menuList;

    const dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    let currentIndex = new Date().getDay();

    const dayCarousel = document.getElementById("day-carousel");
    const prevBtn = document.getElementById("prev-day");
    const nextBtn = document.getElementById("next-day");

    if (!dayCarousel) {
      renderMenu(menuList, currentIndex);
      return;
    }

    function renderDays() {
      dayCarousel.innerHTML = "";

      const prev = (currentIndex - 1 + dias.length) % dias.length;
      const next = (currentIndex + 1) % dias.length;

      [prev, currentIndex, next].forEach((index, pos) => {
        const div = document.createElement("div");
        div.className = "day-item " + (pos === 1 ? "center" : "side");
        div.textContent = dias[index].charAt(0).toUpperCase() + dias[index].slice(1);
        div.onclick = () => { currentIndex = index; updateMenu(); };
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
    if (cached) {
      renderMenu(cached, new Date().getDay());
    }
  }
}

loadMenu();