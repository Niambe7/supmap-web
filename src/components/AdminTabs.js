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

  console.log("Clé API:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    const initMap = async () => {
      try {
        const google = await loadGoogleMaps(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

        if (!window.google || !google.maps || !google.maps.visualization) {
          console.error("L'API Google Maps n'a pas pu être chargée correctement.");
          alert("L'API Google Maps n'a pas pu être chargée correctement.");
          return;
        }

        console.log("Google Maps chargé avec succès:", google);

        // Une fois que l'API Google Maps est chargée, on met à jour l'état pour signaler que la carte peut être affichée
        setIsGoogleMapsReady(true);

        // Initialiser la carte avec un délai pour s'assurer que l'API est complètement prête
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

          // Ajouter la Heatmap si les données existent
          if (google.maps.visualization && congestionData.length > 0) {
            const heatmapData = congestionData
              .filter((item) => item.lat && item.lng)
              .map(
                (item) =>
                  new google.maps.LatLng(parseFloat(item.lat), parseFloat(item.lng))
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
    return <div>Chargement de la carte...</div>;
  }

  return (
    <section className="section">
      <h2>Périodes de Congestion</h2>

      <div className="congestion-form">
        <input
          type="text"
          placeholder="Zone (ex: Gare du Nord, Paris)"
          value={searchZone}
          onChange={(e) => setSearchZone(e.target.value)}
        />
        <input
          type="number"
          placeholder="Rayon en mètres"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
        <button onClick={handleSearch}>Rechercher</button>
      </div>

      {location && (
        <div style={{ height: "300px", marginTop: "2rem" }}>
          <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        </div>
      )}

      <div style={{ marginTop: "2rem", width: "100%", height: 400 }}>
        <ResponsiveContainer>
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
      </div>
    </section>
  );
}


export function IncidentsPerDay({ incidentsPerDay }) {
  return (
    <section className="section">
      <h2>Incidents Signalés Par Jour</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Nombre d'incidents</th>
          </tr>
        </thead>
        <tbody>
          {incidentsPerDay.length > 0 ? (
            incidentsPerDay.map((day, index) => {
              const date = new Date(day.report_date).toLocaleDateString(
                "fr-FR"
              );
              return (
                <tr key={index}>
                  <td>{date}</td>
                  <td>{day.incident_count}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="2">Aucun incident trouvé.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export function PendingIncidents({ pendingIncidents, updateIncidentStatus }) {
  return (
    <section className="section">
      <h2>Incidents à Approuver</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Contributions</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingIncidents.length > 0 ? (
            pendingIncidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.id}</td>
                <td>{incident.type}</td>
                <td>{incident.status}</td>
                <td>{incident.yesVotes}</td>
                <td>
                  <button
                    className="btn-approve"
                    onClick={() => updateIncidentStatus(incident.id, "approve")}
                  >
                    Approuver
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Aucun incident en attente.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export function ActiveIncidents({ activeIncidents, updateIncidentStatus }) {
  return (
    <section className="section">
      <h2>Incidents à Résoudre</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {activeIncidents.length > 0 ? (
            activeIncidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.id}</td>
                <td>{incident.type}</td>
                <td>{incident.status}</td>
                <td>
                  <button
                    className="btn-resolve"
                    onClick={() => updateIncidentStatus(incident.id, "resolve")}
                  >
                    Résolu
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Aucun incident actif.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export function ResolvedIncidents({ resolvedIncidents }) {
  return (
    <section className="section">
      <h2>Historique des Incidents Résolus</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {resolvedIncidents.length > 0 ? (
            resolvedIncidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.id}</td>
                <td>{incident.type}</td>
                <td>{incident.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Aucun incident résolu.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
