import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css"; // Importation du fichier CSS

const OSRM_API = "https://router.project-osrm.org/route/v1";

const Map = () => {
  const mapRef = useRef(null); // Référence pour la carte
  const [startAddress, setStartAddress] = useState(""); // Adresse de départ
  const [endAddress, setEndAddress] = useState(""); // Adresse de fin
  const [routeLayer, setRouteLayer] = useState(null); // Etat pour stocker l'itinéraire

  // Initialisation de la carte une seule fois lors du premier rendu
  useEffect(() => {
    if (!mapRef.current) {
      // Initialiser la carte si elle n'est pas encore initialisée
      mapRef.current = L.map("map").setView([48.8566, 2.3522], 20); // Vue centrée sur Paris, France
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }
  }, []); // Cet effet s'exécute une seule fois lors du premier rendu du composant

  // Fonction pour géocoder une adresse en coordonnées GPS
  const geocodeAddress = async (address) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`
    );
    const data = await response.json();
    if (data.length > 0) {
      return [data[0].lat, data[0].lon]; // Retourne [latitude, longitude]
    } else {
      alert(`Adresse introuvable : ${address}`);
      return null;
    }
  };

  // Fonction pour récupérer et tracer l'itinéraire sur la carte
  const getRoute = async () => {
    if (!startAddress || !endAddress) {
      alert("Veuillez entrer une adresse de départ et d'arrivée !");
      return;
    }

    // Vérifier si la carte est initialisée
    if (!mapRef.current) {
      alert("La carte n'est pas encore initialisée !");
      return;
    }

    // Géocoder les adresses
    const startCoords = await geocodeAddress(startAddress);
    const endCoords = await geocodeAddress(endAddress);
    if (!startCoords || !endCoords) return;

    // Construire l'URL pour récupérer l'itinéraire
    const url = `${OSRM_API}/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0].geometry.coordinates.map((coord) => [
        coord[1],
        coord[0],
      ]);

      // Si un itinéraire est déjà présent, on le retire avant d'en ajouter un nouveau
      if (routeLayer) {
        routeLayer.remove(); // Retirer le tracé précédent
      }

      // Ajouter le nouvel itinéraire sur la carte
      const newRouteLayer = L.polyline(route, { color: "blue" }).addTo(
        mapRef.current
      );
      setRouteLayer(newRouteLayer); // Mettre à jour l'état avec le nouvel itinéraire

      // Centrer la carte sur le premier point du trajet
      mapRef.current.setView(startCoords, 20);
    } else {
      alert("Aucun itinéraire trouvé !");
    }
  };

  return (
    <div>
      {/* Formulaire de recherche */}
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
        <button onClick={getRoute}>Rechercher</button>
      </div>

      {/* Conteneur pour la carte */}
      <div id="map"></div>
    </div>
  );
};

export default Map;
