import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Pour rediriger après l'inscription
import "../styles/Register.css"; // Importation du fichier CSS

const Register = () => {
  const navigate = useNavigate(); // Pour rediriger l'utilisateur après l'inscription
  const [formData, setFormData] = useState({
    name: "", // Correspond à "name" dans l'API
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false); // État pour le bouton de chargement
  const [message, setMessage] = useState(""); // Message de succès ou erreur
  const [error, setError] = useState(""); // Message d'erreur

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setMessage("Inscription réussie ! 🎉 Redirection...");
      setTimeout(() => navigate("/"), 2000); // Redirige après 2 secondes
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h1 className="register-title">SupMap</h1>
      <div className="register-container">
        <h2>Inscription</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Nom complet</label>
          <input
            type="text"
            name="name"
            placeholder="Votre nom complet"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Adresse email</label>
          <input
            type="email"
            name="email"
            placeholder="Adresse email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </button>

          <div className="register-links">
            <a href="/">Se connecter</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
