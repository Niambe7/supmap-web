import React, { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "../styles/Map.css";

const API_BASE_URL =
  "https://api.supmap-server.pp.ua/itineraries/itineraries/search";

const Map = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [routePolyline, setRoutePolyline] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [duration, setDuration] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Etat pour gérer l'ouverture du menu

  // Initialisation de l'état pour les coordonnées de la position actuelle
  const [currentPosition, setCurrentPosition] = useState(null); // <-- Correcte déclaration ici

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 48.8566, lng: 2.3522 },
      zoom: 14,
    });
    console.log("✅ Carte initialisée !");
  }, []);

  const addMarkers = (startLatLng, endLatLng) => {
    new window.google.maps.Marker({
      position: startLatLng,
      map: mapInstance.current,
      title: "Point de départ",
      icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    });

    new window.google.maps.Marker({
      position: endLatLng,
      map: mapInstance.current,
      title: "Point d'arrivée",
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });
  };

  const getRoute = async () => {
    if (!startAddress || !endAddress) {
      alert("Veuillez entrer une adresse de départ et d'arrivée !");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Utilisateur non authentifié !");
      return;
    }

    // Vérifier si nous avons les coordonnées de la position actuelle pour le point de départ
    const startLocation = currentPosition
      ? `${currentPosition.latitude},${currentPosition.longitude}`
      : startAddress;

    console.log("🔍 Données envoyées à l'API :", {
      start_location: startLocation,
      end_location: endAddress,
      user_id: localStorage.getItem("user_id"),
      avoidTolls: avoidTolls,
    });

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_location: startLocation,
          end_location: endAddress,
          user_id: localStorage.getItem("user_id"),
          avoidTolls: avoidTolls, // ✅ on envoie la valeur
        }),
      });

      const data = await response.json();
      console.log("📩 Réponse brute :", data);
      if (!response.ok) throw new Error(data.error);

      if (
        data.itineraries &&
        data.itineraries.length > 0 &&
        data.itineraries[0].route_points
      ) {
        const routePoints = data.itineraries[0].route_points.map(
          (point) => new window.google.maps.LatLng(point.lat, point.lng)
        );

        if (routePolyline) routePolyline.setMap(null);

        const polyline = new window.google.maps.Polyline({
          path: routePoints,
          geodesic: true,
          strokeColor: "#007bff",
          strokeOpacity: 0.8,
          strokeWeight: 5,
        });

        polyline.setMap(mapInstance.current);
        setRoutePolyline(polyline);

        if (routePoints.length > 0) {
          mapInstance.current.setCenter(routePoints[0]);
          mapInstance.current.setZoom(16);
        }

        addMarkers(routePoints[0], routePoints[routePoints.length - 1]);

        if (data.itineraries[0].duration && data.itineraries[0].distance) {
          setDuration(data.itineraries[0].duration);
          setDistance(data.itineraries[0].distance);
        } else {
          console.error("Aucune durée ou distance trouvée dans l'itinéraire.");
        }

        const itineraryLink = `https://monapp.com/itineraire?start=${encodeURIComponent(
          startAddress
        )}&end=${encodeURIComponent(endAddress)}`;
        setQrCode(itineraryLink);
      } else {
        alert("Aucun itinéraire trouvé !");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert(error.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle le menu
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latLng = new window.google.maps.LatLng(latitude, longitude);

        // Centrer la carte
        mapInstance.current.setCenter(latLng);
        mapInstance.current.setZoom(16);

        // Ajouter un marqueur
        new window.google.maps.Marker({
          position: latLng,
          map: mapInstance.current,
          title: "Ma position actuelle",
          icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        });

        // Remplir le champ de départ avec "Ma position actuelle"
        setStartAddress("Ma position actuelle");
        // Stocker les coordonnées
        setCurrentPosition({ latitude, longitude });
      },
      (error) => {
        alert("Impossible de récupérer votre position.");
        console.error(error);
      }
    );
  };

  return (
    <div>
      {/* Bouton Menu */}
      <button className="menu-button" onClick={toggleMenu}>
        &#9776; {/* Symbole pour le menu */}
      </button>

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
            className="logout-button"
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
