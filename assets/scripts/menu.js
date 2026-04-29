async function loadMenu() {
    const API_BASE_URL = "https://69f24f77b15130b97352ca03.mockapi.io/api/v1";
    const MENU_ENDPOINT = `${API_BASE_URL}/menu`;

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
