import React, { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";

const getCongestionLevel = (count) => {
  if (count >= 10) return "very_high";
  if (count >= 5) return "high";
  if (count >= 2) return "moderate";
  return "low";
};

const levelColors = {
  low: "#4ade80",
  moderate: "#facc15",
  high: "#f97316",
  very_high: "#ef4444",
};

const generateEmptyHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, "0") + ":00";
    hours.push({ hour, count: 0 });
  }
  return hours;
};

export function CongestionPeriods({
  searchZone,
  radius,
  setSearchZone,
  setRadius,
  handleSearch,
  congestionData,
  location,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false); // Ajout de l'état pour l'API

  useEffect(() => {
    const initMap = async () => {
      try {
        const google = await loadGoogleMaps(
          process.env.REACT_APP_GOOGLE_MAPS_API_KEY
        );

        if (!window.google || !google.maps || !google.maps.visualization) {
          console.error(
            "L'API Google Maps n'a pas pu être chargée correctement."
          );
          alert("L'API Google Maps n'a pas pu être chargée correctement.");
          return;
        }

        setIsGoogleMapsReady(true);

        if (location && google && mapRef.current) {
          if (!mapInstance.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
              center: location,
              zoom: 15,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            });
          }
          mapInstance.current.setCenter(location);

          // Ajouter un cercle à la carte
          new google.maps.Circle({
            center: location,
            radius: parseInt(radius),
            map: mapInstance.current,
            fillColor: "#FF0000",
            fillOpacity: 0.2,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 1,
          });

          // Ajout de la Heatmap si les données existent
          if (google.maps.visualization && congestionData.length > 0) {
            const heatmapData = congestionData
              .filter((item) => item.lat && item.lng)
              .map(
                (item) =>
                  new google.maps.LatLng(
                    parseFloat(item.lat),
                    parseFloat(item.lng)
                  )
              );

            new google.maps.visualization.HeatmapLayer({
              data: heatmapData,
              map: mapInstance.current,
            });
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement de Google Maps:", err);
      }
    };

    initMap();
  }, [location, radius, congestionData]);

  const hourMap = {};
  congestionData.forEach((item) => {
    const hour = new Date(item.period_start).getHours();
    const hourLabel = hour.toString().padStart(2, "0") + ":00";
    hourMap[hourLabel] = item.traffic_incident_count;
  });

  const chartData = generateEmptyHours().map((h) => {
    const count = hourMap[h.hour] || 0;
    return {
      hour: h.hour,
      count,
      level: getCongestionLevel(count),
    };
  });

  if (!isGoogleMapsReady) {
    return <Typography variant="h6">Chargement de la carte...</Typography>;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Périodes de Congestion
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginBottom: 2,
        }}
      >
        <TextField
          label="Zone (ex: Gare du Nord, Paris)"
          variant="outlined"
          value={searchZone}
          onChange={(e) => setSearchZone(e.target.value)}
        />
        <TextField
          label="Rayon en mètres"
          variant="outlined"
          type="number"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
        <Button
          variant="contained"
          sx={{ backgroundColor: "#a259ff" }}
          onClick={handleSearch}
        >
          Rechercher
        </Button>
      </Box>

      {location && (
        <Box sx={{ height: 300, marginTop: 2 }}>
          <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        </Box>
      )}

      <Box sx={{ marginTop: 2 }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" angle={-45} textAnchor="end" />
            <YAxis
              label={{
                value: "Niveau de Congestion",
                angle: -90,
                position: "insideLeft",
              }}
              type="number"
              domain={[0, 12]}
              ticks={[1, 3, 7, 11]}
              tickFormatter={(value) => {
                if (value <= 1) return "Low";
                if (value <= 4) return "Moderate";
                if (value <= 9) return "High";
                return "Very High";
              }}
            />
            <Tooltip />
            <Bar dataKey="count">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={levelColors[entry.level]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export function IncidentsPerDay({ incidentsPerDay }) {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Incidents Signalés Par Jour
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Nombre d'incidents</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidentsPerDay.length > 0 ? (
              incidentsPerDay.map((day, index) => {
                const date = new Date(day.report_date).toLocaleDateString(
                  "fr-FR"
                );
                return (
                  <TableRow key={index}>
                    <TableCell>{date}</TableCell>
                    <TableCell>{day.incident_count}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan="2">Aucun incident trouvé.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function PendingIncidents({ pendingIncidents, updateIncidentStatus }) {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Incidents à Approuver
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Contributions</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingIncidents.length > 0 ? (
              pendingIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>{incident.id}</TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>{incident.status}</TableCell>
                  <TableCell>{incident.yesVotes}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: "#a259ff" }}
                      color="primary"
                      onClick={() =>
                        updateIncidentStatus(incident.id, "approve")
                      }
                    >
                      Approuver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5">Aucun incident en attente.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function ActiveIncidents({ activeIncidents, updateIncidentStatus }) {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Incidents à Résoudre
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeIncidents.length > 0 ? (
              activeIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>{incident.id}</TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>{incident.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: "#a259ff" }}
                      color="secondary"
                      onClick={() =>
                        updateIncidentStatus(incident.id, "resolve")
                      }
                    >
                      Résolu
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4">Aucun incident actif.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function ResolvedIncidents({ resolvedIncidents }) {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Historique des Incidents Résolus
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resolvedIncidents.length > 0 ? (
              resolvedIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>{incident.id}</TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>{incident.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="3">Aucun incident résolu.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function Dashboard() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <CongestionPeriods />;
      case 1:
        return <IncidentsPerDay />;
      case 2:
        return <ActiveIncidents />;
      case 3:
        return <ResolvedIncidents />;
      default:
        return (
          <Typography variant="h6">Veuillez sélectionner un onglet</Typography>
        );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%" }}>
        <Box
          sx={{
            width: 240,
            backgroundColor: "#a259ff",
            padding: 2,
            borderRight: "1px solid #ddd", 
          }}
        >
          <Tabs
            orientation="vertical"
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="Menu de navigation"
            sx={{
              "& .MuiTab-root": {
                color: "#fff",
                backgroundColor: "#a259ff",
                marginBottom: 1,
                borderRadius: 1,
                textTransform: "none",
              },
              "& .Mui-selected": {
                fontWeight: "bold",
                backgroundColor: "#8338ec", 
              },
              "& .MuiTab-textColorPrimary": {
                color: "#333", 
              },
            }}
          >
            <Tab label="Périodes de Congestion" />
            <Tab label="Incidents Par Jour" />
            <Tab label="Incidents Actifs" />
            <Tab label="Incidents Résolus" />
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, padding: 2, backgroundColor: "#fff" }}>
          {renderTabContent()}
        </Box>
      </Box>
    </Box>
  );
}
