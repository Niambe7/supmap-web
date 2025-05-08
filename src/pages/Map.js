import React from "react";

const Map = () => {
  return (

    <div>
      {/* Bouton Menu */}
      <div className="sidebar">
       <button className="menu-button" onClick={toggleMenu}>
         ☰
        </button>
     </div>

      {/* Menu */}
      {isMenuOpen && (
        <div className="menu">
          <div className="search-container">
            <input
              type="text"
              placeholder="Point de départ"
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="Point d'arrivée"
              value={endAddress}
              onChange={(e) => setEndAddress(e.target.value)}
            />
            <button onClick={handleCurrentLocation}>
              📍 Ma position actuelle
            </button>
            <div className="checkbox-container">
              <label>
                Éviter les péages
                <input
                  type="checkbox"
                  checked={avoidTolls}
                  onChange={() => setAvoidTolls(!avoidTolls)}
                />
              </label>
            </div>
            <button
              onClick={() => {
                getRoute();
                setIsMenuOpen(false); // ✅ Fermer le menu après recherche
              }}
            >
              Rechercher
            </button>

            {qrCode && (
              <button
                onClick={() => {
                  setShowPopup(true);
                  setIsMenuOpen(false); // ✅ Fermer menu après clic sur partager
                }}
              >
                Partager l'itinéraire
              </button>
            )}
          </div>

          {/* ✅ Bouton de déconnexion, en bas du menu */}
          <button
            className="logout-button1"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user_id");
              window.location.href = "/";
            }}
          >
            Déconnexion
          </button>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button
              className="close-button"
              onClick={() => setShowPopup(false)}
            >
              X
            </button>
            <p>Scannez pour ouvrir l'itinéraire :</p>
            <QRCodeCanvas value={qrCode} size={200} />
          </div>
        </div>
      )}

      {/* ✅ Affichage de la distance et durée */}
      {duration && distance && (
        <div className="info-container">
          <p>🕒 Durée : {(duration / 60).toFixed(0)} minutes</p>
          <p>📏 Distance : {(distance / 1000).toFixed(2)} km</p>
        </div>
      )}

      <div ref={mapRef} className="map-container"></div>
    </div>

  );
};

export default Map;
