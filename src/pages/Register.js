import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

// 🛡️ Étape 1 : Fonction pour neutraliser les balises potentiellement dangereuses (Protection XSS)
const sanitizeInput = (input) => {
  const temp = document.createElement("div");
  temp.textContent = input; // Échappe tout contenu HTML/JS
  return temp.innerHTML;
};

const Register = () => {
  const navigate = useNavigate();

  // 📝 Étape 2 : Déclaration de l'état pour stocker les champs du formulaire
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",

  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 🛡️ Étape 3 : Nettoyer chaque saisie utilisateur avant de la stocker (Protection XSS)
  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value); // <-- protection ici
    setFormData({ ...formData, [name]: sanitizedValue });
  };

  // 🚀 Étape 4 : Envoi des données vers l'API après soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "https://api.supmap-server.pp.ua/users/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // Les données ont déjà été nettoyées
        }
      );

      const data = await response.json();

      // ✅ Étape 5 : Vérification de la réponse de l'API
      if (!response.ok)
        throw new Error(data.error || "Une erreur est survenue.");

      setMessage("Inscription réussie ! 🎉 Redirection...");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Étape 6 : Affichage du formulaire sécurisé côté utilisateur
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
            className="input-register"
            type="text"
            name="username"
            placeholder="Votre nom complet"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Adresse email</label>
          <input
            className="input-register"
            type="email"
            name="email"
            placeholder="Adresse email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Mot de passe</label>
          <input
            className="input-register"
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
