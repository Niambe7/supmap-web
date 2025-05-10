import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close"; // Import de la croix
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
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const google = await loadGoogleMaps(
          process.env.REACT_APP_GOOGLE_MAPS_API_KEY
        );
        if (!mapRef.current || mapInstance.current) return;
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: 48.8566, lng: 2.3522 },
          zoom: 14,
        });
      } catch (err) {
        alert("Erreur de chargement de Google Maps");
      }
    };
    initMap();
  }, []);

  const addMarkers = (startLatLng, endLatLng) => {
    const isCurrent =
      currentPosition &&
      startLatLng.lat() === currentPosition.latitude &&
      startLatLng.lng() === currentPosition.longitude;

    if (!isCurrent) {
      new window.google.maps.Marker({
        position: startLatLng,
        map: mapInstance.current,
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });
    }

    new window.google.maps.Marker({
      position: endLatLng,
      map: mapInstance.current,
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    });
  };

  const fetchQrCodeFromApi = async (id) => {
    try {
      const qrRes = await fetch(
        `https://api.supmap-server.pp.ua/qrcode/qrcode/${id}`
      );
      if (!qrRes.ok) throw new Error("Échec QR code");
      const blob = await qrRes.blob();
      const url = URL.createObjectURL(blob);
      setQrImageBlobUrl(url);
      setShowPopup(true);
    } catch (e) {
      alert(e.message);
    }
  };

  const searchItineraries = async () => {
    if (!startAddress || !endAddress) return alert("Remplir les champs !");
    const token = localStorage.getItem("token");
    if (!token) return alert("Non connecté");

    const startLocation = currentPosition
      ? `${currentPosition.latitude},${currentPosition.longitude}`
      : startAddress.trim();

    try {
      setLoading(true);
      const res = await fetch("/itineraries/itineraries/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_location: startLocation,
          end_location: endAddress.trim(),
          user_id: localStorage.getItem("user_id"),
          avoidTolls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setItineraries(data.itineraries || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const drawItinerary = (route_points, duration, distance) => {
    if (routePolyline) routePolyline.setMap(null);
    const points = route_points.map(
      (p) => new window.google.maps.LatLng(p.lat, p.lng)
    );
    const poly = new window.google.maps.Polyline({
      path: points,
      strokeColor: "#a259ff",
      strokeOpacity: 0.8,
      strokeWeight: 5,
    });
    poly.setMap(mapInstance.current);
    mapInstance.current.setCenter(points[0]);
    mapInstance.current.setZoom(16);
    setRoutePolyline(poly);
    addMarkers(points[0], points[points.length - 1]);
    setDuration(duration);
    setDistance(distance);
  };

  const loadItinerary = async (itinerary) => {
    try {
      setLoading(true);
      const res = await fetch("/itineraries/itineraries/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: localStorage.getItem("user_id"),
          start_location: startAddress,
          end_location: endAddress,
          selected_itinerary: {
            duration: itinerary.duration,
            distance: itinerary.distance,
            toll_free: itinerary.toll_free,
            steps: itinerary.steps,
            route_points: itinerary.route_points
              .filter((_, idx) => idx % 10 === 0)
              .map(({ lat, lng }) => ({ lat, lng })),
          },
        }),
      });
      const data = await res.json();
      if (!data.itinerary) throw new Error("Aucun itinéraire");
      drawItinerary(
        data.itinerary.route_points,
        data.itinerary.duration,
        data.itinerary.distance
      );
      setItineraryId(data.itinerary.id);
      setItineraries([]);
    } catch (err) {
      alert("Erreur lors du chargement de l'itinéraire.");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Géolocalisation non disponible");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        mapInstance.current.setCenter({ lat: latitude, lng: longitude });
        mapInstance.current.setZoom(16);
        setCurrentPosition({ latitude, longitude });
        setStartAddress("Ma position actuelle");
      },
      () => alert("Erreur localisation")
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <Box display="flex">
      <Drawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <Box
          p={3}
          width={320}
          sx={{
            height: "100vh",
            backgroundColor: "#f4f4f9", // Fond clair pour mieux distinguer le menu
            borderLeft: "3px solid #a259ff", // Bordure à gauche pour mieux délimiter
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", // Ombre pour un effet de profondeur
          }}
        >
          {/* Ajouter une croix pour fermer le menu */}
          <IconButton
            onClick={() => setIsMenuOpen(false)}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "#a259ff",
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" mb={2} color="#a259ff">
            🔍 Recherche d'itinéraire
          </Typography>

          <TextField
            label="Point de départ"
            fullWidth
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Point d'arrivé"
            fullWidth
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
            margin="normal"
          />
          <Button fullWidth onClick={handleCurrentLocation}>
            📍 Utiliser ma position
          </Button>

          <FormControlLabel
            control={
              <Checkbox
                checked={avoidTolls}
                onChange={() => setAvoidTolls(!avoidTolls)}
              />
            }
            label="Éviter les péages"
          />

          <Button
            variant="contained"
            fullWidth
            onClick={searchItineraries}
            sx={{ my: 2, backgroundColor: "#a259ff" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Rechercher"}
          </Button>

          {itineraries.map((itinerary, i) => (
            <Box
              key={i}
              p={2}
              my={1}
              sx={{
                border: "1px solid #ccc",
                borderRadius: 2,
                cursor: "pointer",
                backgroundColor: "#f9f9f9",
              }}
              onClick={() => loadItinerary(itinerary)}
            >
              <Typography fontWeight="bold">Itinéraire {i + 1}</Typography>
              <Typography>
                🕒 {Math.round(itinerary.duration / 60)} min
              </Typography>
              <Typography>
                📏 {(itinerary.distance / 1000).toFixed(2)} km
              </Typography>
            </Box>
          ))}
          {duration && distance && (
            <Box mt={2}>
              <Typography>
                🕒 Durée : {(duration / 60).toFixed(0)} min
              </Typography>
              <Typography>
                📏 Distance : {(distance / 1000).toFixed(2)} km
              </Typography>
            </Box>
          )}

          {itineraryId && (
            <Button
              fullWidth
              sx={{ mt: 2, color: "#a259ff" }}
              onClick={() => fetchQrCodeFromApi(itineraryId)}
            >
              📎 Partager l'itinéraire
            </Button>
          )}

          {/* Ajouter le bouton de déconnexion */}
          <Button
            fullWidth
            sx={{ mt: 3, backgroundColor: "#a259ff", color: "#fff" }}
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </Box>
      </Drawer>

      {!isMenuOpen && (
        <Box position="absolute" top={50} left={10} zIndex={1000}>
          <IconButton
            onClick={() => setIsMenuOpen(true)}
            sx={{ backgroundColor: "#a259ff", borderRadius: "50%" }}
          >
            <MenuIcon fontSize="large" sx={{ color: "#fff" }} />
          </IconButton>
        </Box>
      )}

      <Box ref={mapRef} sx={{ height: "100vh", width: "100%" }} />

      <Dialog open={showPopup} onClose={() => setShowPopup(false)}>
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center">
            <img src={qrImageBlobUrl} alt="QR Code" width="200" height="200" />
          </Box>

          {/* Bouton "Fermer" en bas */}
          <Button
            fullWidth
            sx={{ mt: 2, backgroundColor: "#a259ff", color: "#fff" }}
            onClick={() => setShowPopup(false)} // Ferme le pop-up lorsqu'on clique sur "Fermer"
          >
            Fermer
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RouteMap;

