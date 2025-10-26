import React from "react";
import "./cometCard.css";

export function CometCard({ comet }) {
  return (
    <div className="comet-card">
      {comet.ImageUrl && (
        <img src={comet.ImageUrl} alt={`${comet.Name} image`} className="comet-card-img" />
      )}
      <div className="comet-card-body">
        <h3 className="comet-card-title">{comet.Name} <span className="comet-card-designation">{comet.Designation}</span></h3>
        <p className="comet-card-discoverer">
          Открыл: <b>{comet.Discoverer || "—"}</b>
        </p>
        <p className="comet-card-date">
          Дата открытия: <b>{comet.DiscoveryDate ? comet.DiscoveryDate.slice(0, 10) : "—"}</b>
        </p>
        {comet.Description && (
          <p className="comet-card-description">{comet.Description}</p>
        )}
        {/* Add more comet fields here if you want */}
      </div>
    </div>
  );
}
