import React, { useEffect, useState } from 'react';

export function MeteorOverlay({ onClose }) {
    const [cometList, setCometList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchCometData() {
            try {
                const response = await fetch("http://172.20.10.2:5075/api/comet");
                
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                
                const data = await response.json();
                setCometList(data);
                console.log(data);
            } catch (err) {
                console.error("Failed to fetch comet data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchCometData();
    }, []); 

    if (loading) {
        return <div>Loading meteors list...</div>;
    }

    return (
        <div className="meteor-overlay">
            <button onClick={onClose} className="close-button">
                Close
            </button>
            
            <h2>Список комет</h2>
            
            {cometList ? (
                <div className="comet-list">
                    <pre>{JSON.stringify(cometList, null, 2)}</pre>
                </div>
            ) : (
                <div>No meteor data available</div>
            )}
        </div>
    );
}