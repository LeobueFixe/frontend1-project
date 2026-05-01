const LUNCH_SLOTS  = ["12:00","12:30","13:00","13:30","14:00","14:30","15:00"];
const DINNER_SLOTS = ["19:00","19:30","20:00","20:30","21:00","21:30","22:00"];

let selectedTime    = null;
let selectedService = null;

function buildTimeSlots() {
  const wrapper = document.getElementById("time-slots");
  if (!wrapper) return;

  wrapper.innerHTML = "";

  function makeGroup(label, slots, service) {
    const group = document.createElement("div");
    group.className = "slot-group";

    const title = document.createElement("span");
    title.className = "slot-group-label";
    title.textContent = label;
    group.appendChild(title);

    const pills = document.createElement("div");
    pills.className = "slot-pills";

    slots.forEach(time => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot-pill";
      btn.textContent = time;
      btn.dataset.time = time;
      btn.dataset.service = service;

      btn.addEventListener("click", () => {
        wrapper.querySelectorAll(".slot-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        selectedTime    = time;
        selectedService = service;
      });

      pills.appendChild(btn);
    });

    group.appendChild(pills);
    return group;
  }

  wrapper.appendChild(makeGroup("Almoço (12:00 – 15:00)", LUNCH_SLOTS,  "lunch"));
  wrapper.appendChild(makeGroup("Jantar (19:00 – 22:00)", DINNER_SLOTS, "dinner"));
}

function saveReservationLocal(reservationId) {
  let ids = JSON.parse(localStorage.getItem("myReservationIds")) || [];
  ids.push(reservationId);
  localStorage.setItem("myReservationIds", JSON.stringify(ids));
}

async function sendReservationToAPI(reservation) {
  const response = await fetch(RESERVATIONS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reservation)
  });
  if (!response.ok) throw new Error("Erro ao enviar reserva para API");
  return response.json();
}

function initReservationForm() {
  const form        = document.getElementById("form-reservation");
  const phoneInput  = document.getElementById("phone");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedTime) {
      toastWarning("Por favor escolha uma hora.");
      return;
    }

    if (phoneInput.value.length < 9) {
      toastWarning("Por favor insira um número válido.");
      return;
    }

    const reservation = {
      fullname: form.fullname.value.trim(),
      phone:    phoneInput.value.trim(),
      day:      form.day.value,
      service:  selectedService,
      time:     selectedTime,
      people:   form.people.value,
      allergy:  form.allergy.value.trim()
    };

    try {
      const saved = await sendReservationToAPI(reservation);

      if (saved && saved.id) {
        saveReservationLocal(saved.id);
      }

      toastSuccess("Reserva enviada com sucesso!");
      form.reset();

      document.querySelectorAll(".slot-pill").forEach(p => p.classList.remove("active"));
      selectedTime    = null;
      selectedService = null;

      loadMyReservation();

    } catch (error) {
      toastError("Sem ligação — reserva guardada localmente.");
    }
  });
}

async function loadMyReservation() {
  const box = document.getElementById("my-reservation-box");
  if (!box) return;

  const myIds = JSON.parse(localStorage.getItem("myReservationIds")) || [];

  if (myIds.length === 0) {
    box.innerHTML = `<p class="placeholder">Ainda não tens nenhuma reserva registada.</p>`;
    return;
  }

  box.innerHTML = `<p class="placeholder">A carregar...</p>`;

  try {
    const cards = [];

    for (const id of myIds) {
      const res = await fetch(`${RESERVATIONS_ENDPOINT}/${id}`);
      if (!res.ok) continue;

      const r = await res.json();

      cards.push(`
        <div class="my-reservation-card" data-id="${r.id}">
          <div class="my-reservation-row"><span class="label">Nome</span><span>${r.fullname}</span></div>
          <div class="my-reservation-row"><span class="label">Telefone</span><span>${r.phone}</span></div>
          <div class="my-reservation-row"><span class="label">Dia</span><span>${r.day}</span></div>
          <div class="my-reservation-row"><span class="label">Serviço</span><span>${r.service === "lunch" ? "Almoço" : "Jantar"}</span></div>
          <div class="my-reservation-row"><span class="label">Hora</span><span>${r.time}</span></div>
          <div class="my-reservation-row"><span class="label">Pessoas</span><span>${r.people}</span></div>
          <div class="my-reservation-row"><span class="label">Alergias</span><span>${r.allergy || "Nenhuma"}</span></div>
          <div class="my-reservation-actions">
            <button class="btn-edit"   onclick="myEditReservation('${r.id}')">Editar nome</button>
            <button class="btn-delete" onclick="myDeleteReservation('${r.id}')">Cancelar reserva</button>
          </div>
        </div>
      `);
    }

    if (cards.length === 0) {
      box.innerHTML = `<p class="placeholder">Nenhuma reserva encontrada.</p>`;
      return;
    }

    box.innerHTML = cards.join("");

  } catch {
    box.innerHTML = `<p class="placeholder">Erro ao carregar reservas.</p>`;
  }
}

async function myEditReservation(id) {
  const box = document.getElementById("my-reservation-box");
  const card = box.querySelector(`.my-reservation-card[data-id="${id}"]`);
  const row = card.querySelector(".my-reservation-row:nth-child(1) span:last-child");

  const oldName = row.textContent;

  const input = document.createElement("input");
  input.type = "text";
  input.value = oldName;
  input.className = "inline-edit-input";

  row.replaceWith(input);
  input.focus();

  input.addEventListener("blur", async () => {
    const newName = input.value.trim();

    if (!newName || newName === oldName) {
      input.replaceWith(row);
      return;
    }

    try {
      await fetch(`${RESERVATIONS_ENDPOINT}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname: newName })
      });

      toastSuccess("Nome atualizado!");
      loadMyReservation();

    } catch {
      toastError("Erro ao editar.");
      input.replaceWith(row);
    }
  });
}

async function myDeleteReservation(id) {
  const box = document.getElementById("my-reservation-box");
  const card = box.querySelector(`.my-reservation-card[data-id="${id}"]`);

  if (card.querySelector(".delete-confirm")) return;

  const confirmBar = document.createElement("div");
  confirmBar.className = "delete-confirm";
  confirmBar.innerHTML = `
    <span>Cancelar esta reserva?</span>
    <button class="yes">Sim</button>
    <button class="no">Não</button>
  `;

  card.appendChild(confirmBar);

  confirmBar.querySelector(".no").onclick = () => confirmBar.remove();

  confirmBar.querySelector(".yes").onclick = async () => {
    try {
      await fetch(`${RESERVATIONS_ENDPOINT}/${id}`, { method: "DELETE" });

      let myIds = JSON.parse(localStorage.getItem("myReservationIds")) || [];
      myIds = myIds.filter(x => x !== id);
      localStorage.setItem("myReservationIds", JSON.stringify(myIds));

      toastWarning("Reserva cancelada.");
      loadMyReservation();

    } catch {
      toastError("Erro ao cancelar.");
    }
  };
}



document.addEventListener("DOMContentLoaded", () => {
  buildTimeSlots();
  initReservationForm();
  loadMyReservation();
});
