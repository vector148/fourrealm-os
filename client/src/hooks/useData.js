import { useState, useEffect, useCallback } from "react";
import { api } from "../api/index.js";

export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getGames();
      setGames(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (id, patch) => {
    const updated = await api.updateGame(id, patch);
    setGames((prev) => prev.map((g) => String(g.id) === String(id) ? { ...g, ...updated } : g));
    return updated;
  }, []);

  const create = useCallback(async (item) => {
    const created = await api.createGame(item);
    setGames((prev) => [...prev, created]);
    return created;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteGame(id);
    setGames((prev) => prev.filter((g) => String(g.id) !== String(id)));
  }, []);

  return { games, loading, error, reload: load, update, create, remove };
}

export function useFilms() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getFilms();
      setFilms(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (id, patch) => {
    const updated = await api.updateFilm(id, patch);
    setFilms((prev) => prev.map((f) => String(f.id) === String(id) ? { ...f, ...updated } : f));
    return updated;
  }, []);

  const create = useCallback(async (item) => {
    const created = await api.createFilm(item);
    setFilms((prev) => [...prev, created]);
    return created;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteFilm(id);
    setFilms((prev) => prev.filter((f) => String(f.id) !== String(id)));
  }, []);

  return { films, loading, error, reload: load, update, create, remove };
}

export function useUpcoming(type) {
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await api.getUpcoming(type);
      setItems(data);
    } catch { setItems([]); }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (item) => {
    await api.addUpcoming(type, item);
    setItems((prev) => [...prev, item]);
  }, [type]);

  const remove = useCallback(async (title) => {
    await api.removeUpcoming(type, title);
    setItems((prev) => prev.filter((i) => i.title !== title));
  }, [type]);

  const isUpcoming = useCallback((title) =>
    items.some((i) => i.title?.toLowerCase() === title?.toLowerCase()), [items]);

  const updateItem = useCallback((updatedItem) => {
    setItems((prev) => prev.map((i) => i.title === updatedItem.title ? { ...i, ...updatedItem } : i));
  }, []);

  return { items, add, remove, isUpcoming, updateItem, reload: load };
}

export function useSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSeries();
      setSeries(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (id, patch) => {
    const updated = await api.updateSeries(id, patch);
    setSeries((prev) => prev.map((s) => String(s.id) === String(id) ? { ...s, ...updated } : s));
    return updated;
  }, []);

  const create = useCallback(async (item) => {
    const created = await api.createSeries(item);
    setSeries((prev) => [...prev, created]);
    return created;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteSeries(id);
    setSeries((prev) => prev.filter((s) => String(s.id) !== String(id)));
  }, []);

  return { series, loading, error, reload: load, update, create, remove };
}

export function useMusic() {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getMusic();
      setMusic(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (id, patch) => {
    const updated = await api.updateMusic(id, patch);
    setMusic((prev) => prev.map((m) => String(m.id) === String(id) ? { ...m, ...updated } : m));
    return updated;
  }, []);

  const create = useCallback(async (item) => {
    const created = await api.createMusic(item);
    setMusic((prev) => [...prev, created]);
    return created;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteMusic(id);
    setMusic((prev) => prev.filter((m) => String(m.id) !== String(id)));
  }, []);

  return { music, loading, error, reload: load, update, create, remove };
}

export function usePlanning() {
  const [planning, setPlanning] = useState({ games: {}, films: {}, series: {}, music: {} });

  useEffect(() => {
    api.getPlanning().then(setPlanning).catch(() => {});
  }, []);

  const save = useCallback(async (data) => {
    await api.savePlanning(data);
    setPlanning(data);
  }, []);

  return { planning, save, setPlanning };
}
