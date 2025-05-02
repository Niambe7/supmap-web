import React from "react";
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

// Définir la couleur en fonction du niveau de congestion
const getCongestionLevel = (count) => {
  if (count >= 10) return "very high";
  if (count >= 5) return "high";
  if (count >= 2) return "moderate";
  return "low";
};

const levelColors = {
  low: "#4ade80", // vert
  moderate: "#facc15", // jaune
  high: "#f97316", // orange
  very_high: "#ef4444", // rouge
};

// Génère 24 heures avec count = 0 par défaut
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
}) {
  // Fusionner les données retournées avec la base vide
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

      {/* Diagramme à barres verticales */}
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
              domain={[0, 12]} // Pour couvrir tous les niveaux
              ticks={[1, 3, 7, 11]} // Points de référence
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

// Composant IncidentsPerDay
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

// Composant PendingIncidents
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

// Composant ActiveIncidents
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

// Composant ResolvedIncidents
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
