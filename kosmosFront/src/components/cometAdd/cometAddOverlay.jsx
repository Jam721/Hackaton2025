import React, { useState } from "react";
import "./cometAddOverlay.css";

const API_BASE_URL = 'http://172.20.10.2:5075/api';

async function handleCreateCometApi(params) {
  const formData = new FormData();
  if (params.Name) formData.append("Name", params.Name);
  if (params.Designation) formData.append("Designation", params.Designation);
  if (params.Description) formData.append("Description", params.Description);
  if (params.DiscoveryDate) formData.append("DiscoveryDate", params.DiscoveryDate);
  if (params.Discoverer) formData.append("Discoverer", params.Discoverer);
  if (params.File) formData.append("File", params.File);

  const response = await fetch(`${API_BASE_URL}/comet/create`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
  },
    body: formData,
  });
}


export function CometAddOverlay({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState("");
  const [discoveryDate, setDiscoveryDate] = useState("");
  const [discoverer, setDiscoverer] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await handleCreateCometApi({
        Name: name,
        Designation: designation,
        Description: description,
        DiscoveryDate: discoveryDate,
        Discoverer: discoverer,
        File: file,
      });
      if (onAdd) await onAdd();
      onClose();
    } catch (err) {
      setError(err.message || "Ошибка добавления");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay-bg">
      <div className="overlay-form">
        <button className="overlay-close-btn" onClick={onClose}>×</button>
        <h2>Добавить комету</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Название *"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
          />
          <input
            type="text"
            placeholder="Обозначение"
            value={designation}
            onChange={e => setDesignation(e.target.value)}
          />
          <input
            type="text"
            placeholder="Открыватель"
            value={discoverer}
            onChange={e => setDiscoverer(e.target.value)}
          />
          <input
            type="date"
            value={discoveryDate}
            onChange={e => setDiscoveryDate(e.target.value)}
          />
          <textarea
            placeholder="Описание"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files[0])}
            style={{ margin: "0.7rem 0 0.5rem" }}
          />
          {error && <div className="overlay-error">{error}</div>}
          <button type="submit" disabled={loading} className="overlay-submit-button">
            {loading ? "Сохраняем..." : "Добавить"}
          </button>
        </form>
      </div>
    </div>
  );
}
