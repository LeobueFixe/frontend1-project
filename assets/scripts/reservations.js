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


const service = document.getElementById("service");
const timeInput = document.getElementById("time"); 
const phoneInput = document.getElementById("phone");
const form = document.getElementById("form-reservation");


service.addEventListener("change", () => {
  if (service.value === "lunch") {
    timeInput.min = "12:00";
    timeInput.max = "15:00";
    timeInput.step = 1800; 
    timeInput.value = "";
  } 
  else if (service.value === "dinner") {
    timeInput.min = "17:00";
    timeInput.max = "21:00";
    timeInput.step = 1800; 
    timeInput.value = "";
  } 
  else {
    timeInput.min = "";
    timeInput.max = "";
    timeInput.step = "";
    timeInput.value = "";
  }
});

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
      phone: phoneInput.value,
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
    } catch (error) {
      toastError("Sem ligação — reserva guardada localmente.");
    }
  });
}

async function loadReservations() {
  const container = document.getElementById("admin-reservations");
  if (!container) return;

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


async function loadUserReservation() {
    const box = document.getElementById("user-reservation-box");
    if (!box) return;

    const myId = localStorage.getItem("myReservationId");

    if (!myId) {
        box.innerHTML = `<p class="placeholder">Nenhuma reserva encontrada.</p>`;
        return;
    }

    try {
        const res = await fetch(`${RESERVATIONS_ENDPOINT}/${myId}`);
        if (!res.ok) throw new Error();

        const r = await res.json();

        box.innerHTML = `
            <div class="user-reservation">
                <p><strong>Nome:</strong> ${r.fullname}</p>
                <p><strong>Telefone:</strong> ${r.phone}</p>
                <p><strong>Dia:</strong> ${r.day}</p>
                <p><strong>Serviço:</strong> ${r.service}</p>
                <p><strong>Hora:</strong> ${r.time}</p>
                <p><strong>Pessoas:</strong> ${r.people}</p>
                <p><strong>Alergias:</strong> ${r.allergy || "Nenhuma"}</p>

                <div class="user-actions">
                    <button class="btn-edit" onclick="userEditReservation('${r.id}')">Editar</button>
                    <button class="btn-delete" onclick="userDeleteReservation('${r.id}')">Eliminar</button>
                </div>
            </div>
        `;

    } catch (error) {
        box.innerHTML = `<p class="placeholder">Erro ao carregar reserva.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", loadUserReservation);


async function userEditReservation(id) {
    const newName = prompt("Novo nome:");
    if (!newName) return toastWarning("Edição cancelada.");

    try {
        await fetch(`${RESERVATIONS_ENDPOINT}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullname: newName })
        });

        toastSuccess("Reserva atualizada!");
        loadUserReservation();

    } catch (error) {
        toastError("Erro ao editar reserva.");
    }
}


async function userDeleteReservation(id) {
    if (!confirm("Tem a certeza que quer eliminar a sua reserva?")) return;

    try {
        await fetch(`${RESERVATIONS_ENDPOINT}/${id}`, {
            method: "DELETE"
        });

        localStorage.removeItem("myReservationId");
        toastError("Reserva eliminada!");

        loadUserReservation();

    } catch (error) {
        toastError("Erro ao eliminar reserva.");
    }
}
