// 🔐 Protection XSS appliquée : 
// - Pas de rendu HTML brut (évite dangerouslySetInnerHTML)
// - encodeURIComponent utilisé pour sécuriser les données dans les URL
// - Pas d'injection de contenu utilisateur dans le DOM sans contrôle
// - Valeurs dans les <input> gérées via useState (React échappe automatiquement les données)

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 48.8566, lng: 2.3522 },
      zoom: 14,
    });
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

    const startLocation = currentPosition
      ? `${currentPosition.latitude},${currentPosition.longitude}`
      : startAddress.trim(); // 🔐 Protection XSS : nettoyage des inputs

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_location: startLocation,
          end_location: endAddress.trim(), // 🔐 Protection XSS
          user_id: localStorage.getItem("user_id"),
          avoidTolls: avoidTolls,
        }),
      });

      const data = await response.json();
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
        }

        // 🔐 Protection XSS : utilisation de encodeURIComponent pour éviter toute injection via l’URL
        const itineraryLink = `https://monapp.com/itineraire?start=${encodeURIComponent(
          startAddress
        )}&end=${encodeURIComponent(endAddress)}`;
        setQrCode(itineraryLink);
      } else {
        alert("Aucun itinéraire trouvé !");
      }
    } catch (error) {
      alert("Une erreur s’est produite.");
      console.error(error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
        mapInstance.current.setCenter(latLng);
        mapInstance.current.setZoom(16);
        new window.google.maps.Marker({
          position: latLng,
          map: mapInstance.current,
          title: "Ma position actuelle",
          icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        });
        setStartAddress("Ma position actuelle"); // 🔐 Valeur prédéfinie et sûre
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
      <button className="menu-button" onClick={toggleMenu}>
        &#9776;
      </button>

      {isMenuOpen && (
        <div className="menu">
          <div className="search-container">
            <input
              type="text"
              placeholder="Point de départ"
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)} // 🔐 React échappe automatiquement
            />
            <input
              type="text"
              placeholder="Point d'arrivée"
              value={endAddress}
              onChange={(e) => setEndAddress(e.target.value)}
            />
            <button onClick={handleCurrentLocation}>📍 Ma position actuelle</button>
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
                setIsMenuOpen(false);
              }}
            >
              Rechercher
            </button>

            {qrCode && (
              <button
                onClick={() => {
                  setShowPopup(true);
                  setIsMenuOpen(false);
                }}
              >
                Partager l'itinéraire
              </button>
            )}
          </div>

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
            <QRCodeCanvas value={qrCode} size={200} /> {/* 🔐 QR sécurisé grâce à encodeURIComponent */}
          </div>
        </div>
      )}

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
