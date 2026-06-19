import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { applyFilters } from "../utils/filter.js";
import { getRealmDefs } from "../utils/taxonomy.js";
import { slug } from "../utils/helpers.js";
import LibraryCard from "../components/LibraryCard.jsx";
import DetailModal from "../components/DetailModal.jsx";

const STATUS_CHIPS = [
  { id: "upcoming",  label: "Upcoming" },
  { id: "active",    label: "Active" },
  { id: "completed", label: "Completed" },
];

const DOT_COLOR = {
  narrative: "red",
  thriller: "red",
  horror: "purple",
  pop_cn: "red",
  wistful: "blue",
  emotional: "blue",
  action: "yellow",
  exciting: "yellow",
  thrilling: "yellow",
  scifi: "yellow",
  adventure: "yellow",
  fantasy: "yellow",
  epic: "red",
  edm: "yellow",
  pop_vn: "yellow",
  discovery: "green",
  healing: "green",
  romance: "green",
  comedy: "green",
  cozy: "green",
  chill: "green",
  pop_en: "green",
  mystery: "blue",
};

export default function Overview({
  type, items, loading, error,
  upcoming, planning, onPlanAdd,
  onUpdateItem, onDeleteItem, onAddLibrary,
}) {
  const { filter, setFilter, showToast } = useApp();
  const [detail, setDetail] = useState(null);
  const defs = getRealmDefs(type);
  const chips = STATUS_CHIPS;
  const wishlistStatus = "upcoming";

  const allItems = useMemo(() => {
    if (filter.status !== wishlistStatus) return items;
    const inLib = new Set(items.map((i) => slug(i.title)));
    const upcomingOnly = (upcoming?.items || [])
      .filter((w) => !inLib.has(slug(w.title)))
      .map((w) => ({ ...w, status: wishlistStatus, _upcomingOnly: true }));
    const libItems = items.filter((i) => {
      const s = String(i.status || "").toLowerCase();
      return s === wishlistStatus || s === "wishlist";
    });
    return [...libItems, ...upcomingOnly];
  }, [items, upcoming?.items, filter.status, wishlistStatus]);

  const filtered = useMemo(() =>
    applyFilters(allItems, { ...filter, type }),
    [allItems, filter, type]
  );

  function isInPlan(item) {
    return Object.values(planning?.[type] || {}).some((q) =>
      q.some((e) => slug(e.title) === slug(item.title))
    );
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-dim)", fontSize: 15 }}>
      Loading...
    </div>
  );
  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--red)", fontSize: 15 }}>
      Error: {error}
    </div>
  );

  return (
    <div>
      <div className="controls glass-card">
        <div className="search-box glass-input">
          <span className="icon">Search</span>
          <input
            placeholder="Search titles..."
            value={filter.query}
            onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
          />
        </div>

        <div className="filter-chips">
          {type !== "music" && (
            <>
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  className={`chip ${filter.status === chip.id ? "active" : ""}`}
                  onClick={() => setFilter((f) => ({ ...f, status: chip.id }))}
                >
                  {chip.label}
                </button>
              ))}

              <div style={{ width: 1, background: "var(--glass-border)", margin: "0 6px", alignSelf: "stretch" }} />
            </>
          )}

          <button
            key="all"
            className={`chip ${filter.pillar === "all" ? "active" : ""}`}
            onClick={() => setFilter((f) => ({ ...f, pillar: "all" }))}
          >
            All
          </button>

          {defs.map((d) => {
            if (d.key === "separator") {
              return <div key="sep" style={{ width: 1, background: "var(--glass-border)", margin: "0 6px", alignSelf: "stretch" }} />;
            }
            return (
              <button
                key={d.key}
                className={`chip realm-chip ${filter.pillar === d.key ? "active" : ""}`}
                onClick={() => setFilter((f) => ({ ...f, pillar: d.key }))}
              >
                <span className={`dot ${DOT_COLOR[d.key] || "blue"}`} />
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {!filtered.length ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-dim)", fontSize: 15 }}>
          {items.length === 0
            ? "No data yet. Add games/films to the database folder using the README instructions."
            : "No matching items."}
        </div>
      ) : (
        <div className="grid">
          {filtered.map((item) => (
            <LibraryCard
              key={item.id || slug(item.title)}
              item={item}
              type={type}
              onOpen={(item) => setDetail(item._upcomingOnly ? { ...item, _isMissing: true } : item)}
              onPlan={(item) => {
                if (isInPlan(item)) { showToast("Already in Planning."); return; }
                onPlanAdd?.(item);
              }}
              onAddLib={onAddLibrary}
              inPlan={isInPlan(item)}
            />
          ))}
        </div>
      )}

      {detail && (
        <DetailModal
          item={detail}
          type={type}
          onClose={() => setDetail(null)}
          onDelete={async (item) => { await onDeleteItem?.(item); setDetail(null); }}
          onUpdate={(updated) => { onUpdateItem?.(updated); setDetail(updated); }}
          onRemoveUpcoming={async (item) => { if (upcoming) await upcoming.remove(item.title); }}
        />
      )}
    </div>
  );
}
