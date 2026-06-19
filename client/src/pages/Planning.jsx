import { useState } from "react";
import AiImporter from "../components/AiImporter.jsx";
import PlanBoard from "../components/PlanBoard.jsx";
import DetailModal from "../components/DetailModal.jsx";

export default function Planning({ type, games, films, planning, onSave, onUpdateItem, onDeleteItem, onAiImported }) {
  const [detail, setDetail] = useState(null);

  return (
    <div>
      <div className="pillar-header" style={{ marginBottom: 18 }}>
        <span className="section-title">Planning</span>
      </div>
      <PlanBoard
        type={type}
        games={games}
        films={films}
        planning={planning}
        onSave={onSave}
        onOpenItem={setDetail}
      />
      <AiImporter type={type} onImported={onAiImported} />
      {detail && (
        <DetailModal
          item={detail}
          type={type}
          onClose={() => setDetail(null)}
          onDelete={(item) => { onDeleteItem(item); setDetail(null); }}
          onUpdate={(updated) => { onUpdateItem(updated); setDetail(updated); }}
        />
      )}
    </div>
  );
}
