// src/pages/ForgotPassword.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h2>Mot de passe oublié</h2>

        <form>
          <label htmlFor="email">Adresse e-mail</label>
          <input type="email" id="email" placeholder="Votre email" required />
          <button type="submit">Envoyer le lien</button>
        </form>

        <button className="back-button" onClick={() => navigate("/")}>
          ⬅ Revenir à la connexion
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
