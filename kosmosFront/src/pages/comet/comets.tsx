import React, { useState } from "react";

import { CometCard } from "../../components/cometCard/cometCard";

import { CometAddOverlay } from "../../components/cometAdd/cometAddOverlay";
import { useComets } from "../../hooks/useComets"; 
import type { Comet } from "../../types/comet"; 

export function AllComets() {
  const { comets, loading, error, refetch} = useComets();  
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [localComets, setLocalComets] = useState<Comet[]>([]);

  const allComets = [...localComets, ...comets];

  function handleAddComet(newComet: Omit<Comet, 'Id' | 'ImageUrl'>) {
    refetch()
  }

  if (loading) return <div>Загрузка комет...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>Список комет</h2>
      {allComets.length === 0 && <div>Нет комет</div>}

      {showAddOverlay && (
        <CometAddOverlay
          onAdd={handleAddComet}
          onClose={() => setShowAddOverlay(false)}
        />
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
        {/* "+" card to add new comet */}
        <div
          className="comet-card add-comet-card"
          style={{
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            minWidth: 125,
            fontSize: '4rem',
            color: '#63b3ed',
            border: '2px dashed #63b3ed'
          }}
          onClick={() => setShowAddOverlay(true)}
          title="Добавить комету"
        >
          +
        </div>

        {allComets.map((comet) => (
          <CometCard key={comet.id} comet={comet} />
        ))}
      </div>
    </div>
  );
}
