import { createContext, useContext, useState, useCallback, useRef } from "react";

const AppContext = createContext(null);
const DEFAULT_FILTER = { query: "", status: "active", pillar: "all" };

export function AppProvider({ children }) {
  const [tab, setTab] = useState("games");         // "games" | "films" | "series" | "music"
  const [view, setView] = useState("library");     // "library" | "planning" | "history" | "ranking"
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [ranking, setRanking] = useState({ pillar: "all", releaseDate: "all" });
  const [toast, setToast] = useState({ msg: "", show: false });
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, show: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
  }, []);

  const switchTab = useCallback((newTab) => {
    setTab(newTab);
    setView("library");
    setFilter(DEFAULT_FILTER);
    setRanking({ pillar: "all", releaseDate: "all" });
  }, []);

  const switchView = useCallback((newView) => {
    setView(newView);
    setFilter((f) => ({ ...DEFAULT_FILTER, query: f.query }));
  }, []);

  return (
    <AppContext.Provider value={{
      tab, setTab, switchTab,
      view, setView, switchView,
      filter, setFilter,
      ranking, setRanking,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
