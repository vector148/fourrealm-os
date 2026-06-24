import { useCallback, useState } from "react";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import { useFilms, useGames, useSeries, useMusic, usePlanning, useUpcoming } from "./hooks/useData.js";
import { getTaxonomy } from "./utils/taxonomy.js";
import { slug } from "./utils/helpers.js";
import Overview from "./pages/Overview.jsx";
import PlanningPage from "./pages/Planning.jsx";
import History from "./pages/History.jsx";
import Ranking from "./pages/Ranking.jsx";

import Toast from "./components/Toast.jsx";
import "./styles/glass.css";

const BASE_VIEWS = [
  { id: "library",  label: "Overview",    icon: "◆" },
  { id: "planning", label: "Planning",    icon: "⬡" },
  { id: "history",  label: "Completed",   icon: "✦" },
  { id: "ranking",  label: "Hall of Fame", icon: "★" },
];

const TABS = [
  { id: "games",  label: "Games",  icon: "◈" },
  { id: "series", label: "Series", icon: "⬛" },
  { id: "films",  label: "Films",  icon: "▶" },
  { id: "music",  label: "Music",  icon: "♪" },
];

const MAX_SLOTS = 4;

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#ffffff" d="M12 2C6.48 2 2 6.58 2 12.25c0 4.52 2.86 8.35 6.84 9.71.5.09.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.51.47-3.16-.63-3.36-1.21-.11-.3-.6-1.21-1.03-1.46-.35-.19-.85-.66-.01-.67.79-.01 1.35.75 1.54 1.06.9 1.55 2.34 1.11 2.91.85.09-.67.35-1.11.64-1.37-2.22-.26-4.55-1.14-4.55-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.25 9.25 0 0 1 12 6.97c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.05.36.32.68.94.68 1.91 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.13 10.13 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}


function AppInner() {
  const { tab, switchTab, view, switchView, showToast, setFilter } = useApp();
  const gamesHook  = useGames();
  const filmsHook  = useFilms();
  const seriesHook = useSeries();
  const musicHook  = useMusic();
  const upcomingGames  = useUpcoming("games");
  const upcomingFilms  = useUpcoming("films");
  const upcomingSeries = useUpcoming("series");
  const planHook = usePlanning();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isGames = tab === "games";
  const isFilms = tab === "films";
  const isSeries = tab === "series";
  const hookMap = { games: gamesHook, films: filmsHook, series: seriesHook, music: musicHook };
  const upcomingMap   = { games: upcomingGames, films: upcomingFilms, series: upcomingSeries, music: null };
  const lib = hookMap[tab];
  const upcoming  = upcomingMap[tab];

  const itemsKey = { games: "games", films: "films", series: "series", music: "music" };
  const items = lib[itemsKey[tab]] ?? [];

  let views = BASE_VIEWS;

  if (tab === "music") {
    views = views.filter(v => v.id === "library" || v.id === "ranking");
  }

  function addItemToPlanning(item) {
    const tax = getTaxonomy(item, tab);
    const current = planHook.planning?.[tab]?.[tax.key] || [];
    if (current.length >= MAX_SLOTS) { showToast(`${tax.label} is full (${MAX_SLOTS} slots).`); return; }
    if (current.some((entry) => slug(entry.title) === slug(item.title))) { showToast("Already in Planning."); return; }
    const next = {
      ...planHook.planning,
      [tab]: { ...planHook.planning?.[tab], [tax.key]: [...current, { title: item.title, cover: item.cover || "" }] },
    };
    planHook.save(next);
    showToast(`Added "${item.title}" to Planning.`);
  }

  async function addToLibrary(item) {
    if (!window.confirm(`Add "${item.title}" to your library?`)) return;
    try {
      if (item.id && !item._wishlistOnly) {
        await lib.update(item.id, { status: "active", score: null, completionDate: "" });
      } else {
        await lib.create({
          title: item.title,
          releaseDate: item.releaseDate || "",
          gameplay: item.gameplay || item.affect || "Discovery",
          subcategory: item.subcategory || "",
          affect: item.affect || "",
          mood: item.mood || "",
          genre: item.genre || "",
          seasons: item.seasons || "",
          episodes: item.episodes || "",
          artist: item.artist || "",
          trailerUrl: item.trailerUrl || "",
          score: null,
          status: tab === "music" ? "" : "active",
          cover: item.cover || "",
          source: "Upcoming",
        });
        if (upcoming) await upcoming.remove(item.title);
      }
      showToast(`Added "${item.title}" to your library.`);
      switchView("library");
      setFilter({ query: "", status: "active", pillar: "all" });
    } catch { showToast("Failed to add to library."); }
  }

  async function handleAiImported(importType, row) {
    try {
      const created = await hookMap[importType].create(row);
      if (tab !== importType) switchTab(importType);
      showToast(`Added "${row.title}" to your library.`);
      setFilter({ query: "", status: "active", pillar: "all" });

      const tax = getTaxonomy(created, importType);
      const current = planHook.planning?.[importType]?.[tax.key] || [];
      if (current.some((entry) => slug(entry.title) === slug(created.title))) {
        showToast(`Added "${created.title}" to your library. Already in Planning.`);
        return;
      }
      if (current.length >= MAX_SLOTS) {
        showToast(`${tax.label} is full. Added to library, not Planning.`);
        return;
      }

      const next = {
        ...planHook.planning,
        [importType]: {
          ...planHook.planning?.[importType],
          [tax.key]: [...current, { title: created.title, cover: created.cover || "" }],
        },
      };
      await planHook.save(next);
      showToast(`Added "${created.title}" to library and Planning.`);
    } catch { showToast("Failed to add to library."); }
  }

  const updateItem = useCallback(async (updated) => {
    if (updated._upcomingOnly) {
      if (tab === "games") upcomingGames.updateItem(updated);
      if (tab === "films") upcomingFilms.updateItem(updated);
      if (tab === "series") upcomingSeries.updateItem(updated);
      return;
    }
    if (updated._isMissing) return;
    await lib.update(updated.id, updated);
  }, [lib, tab, upcomingGames, upcomingFilms, upcomingSeries]);

  const deleteItem = useCallback(async (item) => {
    await lib.remove(item.id);
    const next = { ...planHook.planning };
    if (next[tab]) {
      Object.keys(next[tab]).forEach((key) => {
        next[tab][key] = (next[tab][key] || []).filter((entry) => slug(entry.title) !== slug(item.title));
      });
      planHook.save(next);
    }
  }, [lib, planHook, tab]);

  function renderPage() {
    const shared = { type: tab, items, onUpdateItem: updateItem, onDeleteItem: deleteItem };
    switch (view) {
      case "library":
        return <Overview {...shared} loading={lib.loading} error={lib.error} upcoming={upcoming} planning={planHook.planning} onPlanAdd={addItemToPlanning} onAddLibrary={addToLibrary} />;
      case "planning":
        return <PlanningPage {...shared} games={gamesHook.games} films={filmsHook.films} planning={planHook.planning} onSave={planHook.save} onAiImported={handleAiImported} />;
      case "history":
        return <History {...shared} />;
      case "ranking":
        return <Ranking {...shared} />;
      default:
        return null;
    }
  }

  return (
    <div id="app">
      <button className={`mobile-menu-btn ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header"><div className="logo">FourRealm <span>OS</span></div></div>
        <nav className="sidebar-nav">
          {views.map((item) => (
            <button key={item.id} className={`nav-item ${view === item.id ? "active" : ""}`} onClick={() => { switchView(item.id); setSidebarOpen(false); }}>
              <span className="icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="realm-tab-grid">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`realm-tab-btn realm-tab-${t.id} ${tab === t.id ? "active" : ""}`}
                onClick={() => {
                  switchTab(t.id);
                }}
              >
                <span className="realm-tab-icon">{t.icon}</span>
                <span className="realm-tab-label">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-links">
            <div className="sidebar-icon-row">
              <a className="sidebar-icon-btn github" href="https://github.com/Vector148/fourrealm-os" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GitHubIcon />
              </a>
              <a className="sidebar-icon-btn coffee" href="https://buymeacoffee.com/Vector148" target="_blank" rel="noopener noreferrer" aria-label="Buy me a coffee">
                <img src="/images/buymeacoffee.png" alt="Buy me a coffee" style={{ width: '18px', height: '18px', display: 'block', borderRadius: '4px' }} />
              </a>
            </div>
            <span className="sidebar-license">MIT · Vector148</span>
          </div>
        </div>
      </aside>

      <main className="main-content">{renderPage()}</main>
      <Toast />
    </div>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}
