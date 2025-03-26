import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "../styles/Login.css"; // Importation du fichier CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/map");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Log pour vérifier les valeurs
    console.log("Email:", email, "Mot de passe:", password);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      navigate("/map");
    } catch (error) {
      console.error("Erreur de connexion", error);
      setError("Échec de connexion. Vérifie tes identifiants.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/auth/google",
        {
          token: credentialResponse.credential,
        }
      );

      localStorage.setItem("token", response.data.token);
      navigate("/map");
    } catch (error) {
      console.error("Erreur lors de la connexion Google", error);
      setError("Échec de connexion avec Google.");
    }
  };

  const handleGoogleFailure = () => {
    setError("Échec de l'authentification Google.");
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
      <div className="login-page">
        <div className="left-section">
          <h1>SupMap</h1>
          <p className="slogan">
            Avec SupMap, trouvez votre chemin facilement grâce aux itinéraires
            proposés{" "}
          </p>
        </div>
        <div className="login-container">
          <h2>Connexion</h2>
          {error && <p className="error">{error}</p>}

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Se connecter</button>
          </form>

          {/* Liens entre le bouton de connexion et le bouton Google */}
          <div className="login-links">
            <a href="/reset-password">Mot de passe oublié ?</a>
            <a href="/register">Créer un compte</a>
          </div>

          {/* Bouton Google tout en bas */}
          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
