const API_BASE_URL = "https://69f24f77b15130b97352ca03.mockapi.io/api/v1";
const RESERVATIONS_ENDPOINT = `${API_BASE_URL}/reservation`;


function toastSuccess(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "#4CAF50"
  }).showToast();
}

function toastError(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "#E53935"
  }).showToast();
}

function toastWarning(message) {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "#FFA000"
  }).showToast();
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


if (service && timeSelect) {
  service.addEventListener("change", () => {
    if (service.value === "lunch") {
      generateTimeOptions(12, 15);
    } else if (service.value === "dinner") {
      generateTimeOptions(19, 21);
    } else {
      timeSelect.innerHTML = `<option value="">Escolha a hora...</option>`;
    }
  });
}



const countrySelect = document.getElementById("country-code");
const phoneInput = document.getElementById("phone");

const countryList = [
  { name: "Portugal", code: "+351", flag: "🇵🇹" },
  { name: "França", code: "+33", flag: "🇫🇷" }
];

function loadCountryCodes() {
  if (!countrySelect || !phoneInput) return;

  countryList.forEach(country => {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = `${country.flag} ${country.name} (${country.code})`;
    countrySelect.appendChild(option);
  });

  countrySelect.value = "+351";
  phoneInput.placeholder = "+351 ...";
}

if (countrySelect && phoneInput) {
  countrySelect.addEventListener("change", () => {
    phoneInput.placeholder = countrySelect.value + " ...";
  });

  loadCountryCodes();
}


const form = document.getElementById("form-reservation");

function saveReservationLocal(reservation) {
  const stored = JSON.parse(localStorage.getItem("reservations")) || [];
  stored.push(reservation);
  localStorage.setItem("reservations", JSON.stringify(stored));
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

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const reservation = {
      fullname: form.fullname.value,
      phone: `${countrySelect?.value || ""} ${phoneInput?.value || ""}`,
      day: form.day.value,
      service: form.service.value,
      time: form.time.value,
      people: form.people.value,
      allergy: form.allergy.value
    };

    saveReservationLocal(reservation);

    try {
      await sendReservationToAPI(reservation);
      toastSuccess("Reserva enviada com sucesso!");

      form.reset();
      if (countrySelect && phoneInput) {
        countrySelect.value = "+351";
        phoneInput.placeholder = "+351 ...";
      }

    } catch (error) {
      console.error("Erro ao enviar reserva para API:", error);
      toastError("Sem ligação — reserva guardada localmente.");
    }
  });
}

async function loadReservations() {
  const container = document.getElementById("admin-reservations");
  container.innerHTML = `<p class="placeholder">A carregar...</p>`;

  try {
    const res = await fetch(RESERVATIONS_ENDPOINT);
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = `<p class="placeholder">Nenhuma reserva encontrada.</p>`;
      return;
    }

    container.innerHTML = "";

    data.forEach(reservation => {
      const div = document.createElement("div");
      div.className = "reservation-item";
      div.innerHTML = `
        <div>
          <strong>${reservation.fullname}</strong><br>
          ${reservation.day} • ${reservation.time} • ${reservation.people} pessoas
        </div>

        <div class="admin-actions">
          <button class="btn-edit" onclick="editReservation('${reservation.id}')">Editar</button>
          <button class="btn-delete" onclick="deleteReservation('${reservation.id}')">Eliminar</button>
        </div>
      `;

      container.appendChild(div);
    });

  } catch (error) {
    container.innerHTML = `<p class="placeholder">Erro ao carregar reservas.</p>`;
  }
}

async function editReservation(id) {
  const newName = prompt("Novo nome para a reserva:");
  if (!newName) {
    toastWarning("Edição cancelada.");
    return;
  }

  try {
    await fetch(`${RESERVATIONS_ENDPOINT}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname: newName })
    });

    toastSuccess("Reserva editada com sucesso!");
    loadReservations();

  } catch (error) {
    toastError("Erro ao editar reserva.");
  }
}

async function deleteReservation(id) {
  const first = confirm("Tem a certeza que quer eliminar esta reserva?");
  if (!first) {
    toastWarning("Eliminação cancelada.");
    return;
  }

  const second = confirm("Tem MESMO a certeza? Esta ação é irreversível.");
  if (!second) {
    toastWarning("Eliminação cancelada.");
    return;
  }

  try {
    await fetch(`${RESERVATIONS_ENDPOINT}/${id}`, {
      method: "DELETE"
    });

    toastError("Reserva eliminada!");
    loadReservations();

  } catch (error) {
    toastError("Erro ao eliminar reserva.");
  }
}

document.addEventListener("DOMContentLoaded", loadReservations);
