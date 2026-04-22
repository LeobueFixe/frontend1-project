async function loadMenu() {
    const response = await fetch("/assets/data/menu.json");
    const data = await response.json();

    const language = "english";

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    const today = days[new Date().getDay()];
    const menuItems = data[language][today] || [];

    document.getElementById("menu-title").textContent =
        today.charAt(0).toUpperCase() + today.slice(1);

    const container = document.getElementById("menu-items");
    container.innerHTML = "";

    menuItems.forEach(item => {
        const div = document.createElement("div");
        div.className = "menu-item";
        div.innerHTML = `
            <span class="dish-name">${item.name}</span>
            <span class="separator">|</span>
            <span class="dish-price">${item.price}</span>
        `;
        container.appendChild(div);
    });
}

loadMenu();