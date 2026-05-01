const API_BASE_URL = "https://69f24f77b15130b97352ca03.mockapi.io/api/v1";

const MENU_ENDPOINT = `${API_BASE_URL}/menu`;
const RESERVATIONS_ENDPOINT = `${API_BASE_URL}/reservation`;

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}