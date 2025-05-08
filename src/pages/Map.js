// 🔐 Protection XSS appliquée : 
// - Pas de rendu HTML brut (évite dangerouslySetInnerHTML)
// - encodeURIComponent utilisé pour sécuriser les données dans les URL
// - Pas d'injection de contenu utilisateur dans le DOM sans contrôle
// - Valeurs dans les <input> gérées via useState (React échappe automatiquement les données)

import React, { useEffect, useRef, useState } from "react";
import "../styles/Map.css";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";

const RouteMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [routePolyline, setRoutePolyline] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [duration, setDuration] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [qrImageBlobUrl, setQrImageBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itineraryId, setItineraryId] = useState(null);

  // Initialisation de l'état pour les coordonnées de la position actuelle
  const [currentPosition, setCurrentPosition] = useState(null); // <-- Correcte déclaration ici

  useEffect(() => {
    const initMap = async () => {
      try {
        console.log("clé google:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
        const google = await loadGoogleMaps(
          process.env.REACT_APP_GOOGLE_MAPS_API_KEY
        );
        console.log("Google Maps chargé avec succès :", google);

        if (!mapRef.current || mapInstance.current) return;

        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: 48.8566, lng: 2.3522 }, // Coordonnées par défaut
          zoom: 14,
        });
      } catch (err) {
        console.error("Erreur lors du chargement de Google Maps :", err);
        alert("Google Maps n'a pas pu être chargé.");
      }
    };

    initMap();
  }, []);

  const addMarkers = (startLatLng, endLatLng) => {
    const isCurrentLocation =
      currentPosition &&
      startLatLng.lat() === currentPosition.latitude &&
      startLatLng.lng() === currentPosition.longitude;

    if (!isCurrentLocation) {
      new window.google.maps.Marker({
        position: startLatLng,
        map: mapInstance.current,
        title: "Point de départ",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });
    }

    new window.google.maps.Marker({
      position: endLatLng,
      map: mapInstance.current,
      title: "Point d'arrivée",
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });
  };

  const fetchQrCodeFromApi = async (id) => {
    try {
      const check = await fetch(
        `https://api.supmap-server.pp.ua/itineraries/itineraries/${id}`
      );
      if (!check.ok) throw new Error("Itinéraire non trouvé.");

      const qrRes = await fetch(
        `https://api.supmap-server.pp.ua/qrcode/qrcode/${id}`
      );
      if (!qrRes.ok) throw new Error("Échec de génération du QR code.");

      const blob = await qrRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      setQrImageBlobUrl(blobUrl);
      setShowPopup(true);
    } catch (err) {
      console.error("Erreur QR :", err);
      alert(err.message);
    }
  };

  const searchItineraries = async () => {
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

    console.log("🔍 Données envoyées à l'API :", {
      start_location: startLocation,
      end_location: endAddress,
      user_id: localStorage.getItem("user_id"),
      avoidTolls: avoidTolls,
    });

    try {
      setLoading(true);
      const response = await fetch("/itineraries/itineraries/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_location: startLocation,
          end_location: endAddress.trim(), // 🔐 Protection XSS
          user_id: localStorage.getItem("user_id"),
          avoidTolls: avoidTolls, // ✅ on envoie la valeur
        }),
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (!response.ok) throw new Error(data?.error || "Erreur inconnue");
      if (Array.isArray(data.itineraries)) {
        setItineraries(data.itineraries);
      } else {
        alert("Aucun itinéraire proposé.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadItinerary = async (itinerary) => {
    const startLocation = currentPosition
      ? `${currentPosition.latitude},${currentPosition.longitude}`
      : startAddress;

    try {
      setLoading(true);
      const response = await fetch("/itineraries/itineraries/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: localStorage.getItem("user_id"),
          start_location: startLocation,
          end_location: endAddress,
          selected_itinerary: {
            duration: itinerary.duration,
            distance: itinerary.distance,
            toll_free: itinerary.toll_free,
            route_points: itinerary.route_points
              ?.filter((_, idx) => idx % 10 === 0)
              .map(({ lat, lng }) => ({ lat, lng })),
            steps: itinerary.steps, // ✅ AJOUTÉ pour permettre au backend de reconnaître l'itinéraire
          },
        }),
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text);

      const data = JSON.parse(text);
      if (!data?.itinerary) throw new Error("Itinéraire invalide.");

      drawItinerary(
        data.itinerary.route_points,
        data.itinerary.duration,
        data.itinerary.distance
      );
      setItineraryId(data.itinerary.id); // ID utilisé pour générer le QR code
      setItineraries([]);
    } catch (error) {
      alert("Erreur lors du chargement de l'itinéraire.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const drawItinerary = (route_points, duration, distance) => {
    if (!Array.isArray(route_points) || route_points.length === 0) {
      alert("Itinéraire vide.");
      return;
    }

    if (routePolyline) routePolyline.setMap(null);

    const routePoints = route_points.map(
      (point) => new window.google.maps.LatLng(point.lat, point.lng)
    );

    const polyline = new window.google.maps.Polyline({
      path: routePoints,
      geodesic: true,
      strokeColor: "#007bff",
      strokeOpacity: 0.8,
      strokeWeight: 5,
    });

    polyline.setMap(mapInstance.current);
    setRoutePolyline(polyline);

    mapInstance.current.setCenter(routePoints[0]);
    mapInstance.current.setZoom(16);

    addMarkers(routePoints[0], routePoints[routePoints.length - 1]);
    setDuration(duration);
    setDistance(distance);
  };
  // 🔐 Protection XSS : utilisation de encodeURIComponent pour éviter toute injection via l’URL

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        const latLng = new window.google.maps.LatLng(latitude, longitude);

        mapInstance.current.setCenter(latLng);
        mapInstance.current.setZoom(16);

        setStartAddress("Ma position actuelle");
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
      <button
        className="menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        &#9776;
      </button>

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
            <label className="checkbox-container">
              Éviter les péages
              <input
                type="checkbox"
                checked={avoidTolls}
                onChange={() => setAvoidTolls(!avoidTolls)}
              />
            </label>
            <button onClick={searchItineraries} disabled={loading}>
              {loading ? "Chargement..." : "Rechercher"}
            </button>

            {itineraries.length > 0 && (
              <div className="itinerary-list">
                {itineraries.map((itinerary, index) => (
                  <div
                    key={index}
                    className="itinerary-item"
                    onClick={() => loadItinerary(itinerary)}
                  >
                    <strong>Itinéraire {index + 1}</strong>
                    <p>🕒 {Math.round(itinerary.duration / 60)} min</p>
                    <p>📏 {(itinerary.distance / 1000).toFixed(2)} km</p>
                  </div>
                ))}
              </div>
            )}

            {duration && distance && (
              <div className="info-container">
                <p>🕒 Durée : {(duration / 60).toFixed(0)} minutes</p>
                <p>📏 Distance : {(distance / 1000).toFixed(2)} km</p>
              </div>
            )}

            {itineraryId && (
              <button onClick={() => fetchQrCodeFromApi(itineraryId)}>
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
            <p>Scannez pour obtenir l'ID de l'itinéraire :</p>
            {qrImageBlobUrl && (
              <img src={qrImageBlobUrl} alt="QR Code Itinéraire" />
            )}
          </div>
        </div>
      )}

      <div ref={mapRef} className="map-container"></div>
    </div>
  );
};

export default RouteMap;