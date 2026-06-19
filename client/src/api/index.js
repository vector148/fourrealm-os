const BASE = "/api";

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  // Games
  getGames: () => req("/games"),
  updateGame: (id, data) => req(`/games/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createGame: (data) => req("/games", { method: "POST", body: JSON.stringify(data) }),
  deleteGame: (id) => req(`/games/${id}`, { method: "DELETE" }),

  // Films
  getFilms: () => req("/films"),
  updateFilm: (id, data) => req(`/films/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createFilm: (data) => req("/films", { method: "POST", body: JSON.stringify(data) }),
  deleteFilm: (id) => req(`/films/${id}`, { method: "DELETE" }),

  // Series
  getSeries: () => req("/series"),
  updateSeries: (id, data) => req(`/series/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createSeries: (data) => req("/series", { method: "POST", body: JSON.stringify(data) }),
  deleteSeries: (id) => req(`/series/${id}`, { method: "DELETE" }),

  // Music
  getMusic: () => req("/music"),
  updateMusic: (id, data) => req(`/music/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createMusic: (data) => req("/music", { method: "POST", body: JSON.stringify(data) }),
  deleteMusic: (id) => req(`/music/${id}`, { method: "DELETE" }),

  // Upcoming
  getUpcoming: (type) => req(`/upcoming/${type}`),
  addUpcoming: (type, item) => req(`/upcoming/${type}`, { method: "POST", body: JSON.stringify(item) }),
  updateUpcoming: (type, title, data) => req(`/upcoming/${type}/${encodeURIComponent(title)}`, { method: "PUT", body: JSON.stringify(data) }),
  removeUpcoming: (type, title) => req(`/upcoming/${type}/${encodeURIComponent(title)}`, { method: "DELETE" }),

  // Planning
  getPlanning: () => req("/planning"),
  savePlanning: (data) => req("/planning", { method: "PUT", body: JSON.stringify(data) }),
};
