import type { Comet } from "../../types/comet";
import "./cometCard.css"
import { useNavigate } from "react-router-dom"; 

export function CometCard({ comet }: { comet: Comet }) {
  const navigate = useNavigate();
  

  const handleMoreInfo = () => {
    navigate(`/comet/${comet.id}`);
  };

  return (
    <div className="comet-card">
      {comet.imageUrl && (
        <img src={comet.imageUrl} alt={`${comet.name} image`} className="comet-card-img" />
      )}
      <div className="comet-card-body">
        <h3 className="comet-card-title">
          {comet.name}
          <span className="comet-card-designation">{comet.designation}</span>
        </h3>
        <p className="comet-card-discoverer">
          Открыл: <b>{comet.discoverer || "—"}</b>
        </p>
        <p className="comet-card-date">
          Дата открытия: <b>{comet.discoveryDate ? comet.discoveryDate.slice(0, 10) : "—"}</b>
        </p>
        <button
          className="comet-card-button"
          onClick={handleMoreInfo}
        >
          Подробнее
        </button>
      </div>
    </div>
  );
}
