export const API = {
  BASE_URL: "https://69f24f77b15130b97352ca03.mockapi.io/api/v1",
  ENDPOINTS: {
    MENU: "/menu",
    RESERVATIONS: "/reservation"
  }
};

export const apiUrl = (endpoint) => `${API.BASE_URL}${endpoint}`;
