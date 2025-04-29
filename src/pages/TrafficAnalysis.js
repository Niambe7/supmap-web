import React from "react";
import "../styles/TrafficAnalysis.css";

function TrafficAnalysis() {
  const congestionData = [
    { hour: "7h", congestion: 30 },
    { hour: "8h", congestion: 50 },
    { hour: "9h", congestion: 40 },
    { hour: "10h", congestion: 60 },
    { hour: "11h", congestion: 80 },
    { hour: "12h", congestion: 70 },
    { hour: "13h", congestion: 90 },
    { hour: "14h", congestion: 100 },
    { hour: "15h", congestion: 90 },
    { hour: "16h", congestion: 80 },
    { hour: "17h", congestion: 70 },
  ];

  return (
    <div className="container">
      <header>
        <h1>Analyse des Données de Trafic</h1>
      </header>

      <section className="stats">
        <div className="stats-item">
          <h2>Incidents Signalés</h2>
          <p>100 incidents signalés</p>
        </div>

        <div className="stats-item">
          <h2>Périodes de Congestion</h2>
          <div className="congestion-bars">
            {congestionData.map((data, index) => (
              <div key={index} className="bar-container">
                <label>{data.hour}</label>
                <progress
                  value={data.congestion}
                  max="100"
                  style={{ width: "100%" }}
                >
                  {data.congestion}%
                </progress>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-item">
          <h2>Prédictions de Trafic</h2>
          <ul>
            <li>Heure de pointe à 18h</li>
            <li>Embouteillage à Paris</li>
            <li>Accident à Lyon</li>
          </ul>
        </div>
      </section>

      <footer>
        <p>&copy; 2025 SUPMAP - Tous droits réservés</p>
      </footer>
    </div>
  );
}

export default TrafficAnalysis;
