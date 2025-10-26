import React, { useEffect, useState } from "react";
import { CometCard } from "../../components/cometCard/cometCard";
import { CometAddOverlay } from "../../components/cometAdd/cometAddOverlay"; 

const exampleCometsJson = `
[
  {
    "Id": 1,
    "ImageUrl": "https://starwalk.space/gallery/images/what-are-comets/1920x1080.jpg",
    "Name": "Halley",
    "Designation": "1P/Halley",
    "DiscoveryDate": "1758-12-25",
    "Discoverer": "Edmond Halley"
  },
  {
    "Id": 2,
    "ImageUrl": "https://starwalk.space/gallery/images/what-are-comets/1920x1080.jpg",
    "Name": "Encke",
    "Designation": "2P/Encke",
    "DiscoveryDate": "1786-01-17",
    "Discoverer": "Pierre Méchain"
  },
  {
    "Id": 3,
    "ImageUrl": "https://starwalk.space/gallery/images/what-are-comets/1920x1080.jpg",
    "Name": "Swift-Tuttle",
    "Designation": "109P/Swift-Tuttle",
    "DiscoveryDate": "1862-07-16",
    "Discoverer": "Lewis Swift & Horace Tuttle"
  }
]
`;

export function AllComets() {
  const [comets, setComets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddOverlay, setShowAddOverlay] = useState(false);

  //todo
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const data = JSON.parse(exampleCometsJson);
        setComets(data);
      } catch (err) {
        setError(err.message || "Ошибка fetch");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function handleAddComet(newComet) {
    setComets(prev => [
      { Id: Date.now(), ...newComet, ImageUrl: "https://starwalk.space/gallery/images/what-are-comets/1920x1080.jpg" },
      ...prev
    ]);
  }

  if (loading) return <div>Загрузка комет...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>Список комет</h2>
      {comets.length === 0 && <div>Нет комет</div>}

      {showAddOverlay && (
        <CometAddOverlay
          onAdd={handleAddComet}
          onClose={() => setShowAddOverlay(false)}
        />
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
        {/* "+" card to open AddOverlay */}
        <div
          className="comet-card add-comet-card"
          style={{
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            minWidth: 125,
            minHeight: 125,
            fontSize: '4rem',
            color: '#63b3ed',
            background: '#262a39',
            border: '2px dashed #63b3ed'
          }}
          onClick={() => setShowAddOverlay(true)}
          title="Добавить комету"
        >
          +
        </div>
        {comets.map((comet) => (
          <CometCard key={comet.Id} comet={comet} />
        ))}
      </div>
    </div>
  );
}
