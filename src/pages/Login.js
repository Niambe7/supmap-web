import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

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

    try {
      const response = await axios.post("http://localhost:3000/api/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/map");
    } catch (error) {
      console.error("Erreur de connexion", error);
      setError("Échec de connexion. Vérifie tes identifiants.");
    }
  };

  // ✅ Connexion avec Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post("http://localhost:3000/api/users/auth/google", {
        token: credentialResponse.credential, // Envoyer le token Google à ton backend
      });

      localStorage.setItem("token", response.data.token);
      navigate("/map"); // Rediriger vers la page MAP après connexion
    } catch (error) {
      console.error("Erreur lors de la connexion Google", error);
      setError("Échec de connexion avec Google.");
    }
  };

  const handleGoogleFailure = () => {
    setError("Échec de l'authentification Google.");
  };

  return (
    <GoogleOAuthProvider clientId="564207686931-73l31fra9nh4tla2tnnhj8aj4hlc4ul4.apps.googleusercontent.com">
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Connexion</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Se connecter</button>
        </form>

        <h3>Ou</h3>

        {/* ✅ Bouton Google qui ouvre la pop-up */}
        <GoogleLogin 
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
