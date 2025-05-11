import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import {
  Box,
  Button,
  CssBaseline,
  Divider,
  Link,
  TextField,
  Typography,
  Avatar,
  useTheme,
  Paper,
} from "@mui/material";
import logo from "../assets/logo.png";
import ThemeToggleButton from "../components/ThemeToggleButton";

const Login = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/map");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.post(
        "https://api.supmap-server.pp.ua/auth/auth/login",
        { email: email.trim(), password }
      );
      const { token, user } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("role", user.role);
      navigate(user.role === "admin" ? "/trafficAnalysis" : "/map");
    } catch {
      setError("Échec de connexion. Vérifie tes identifiants.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const { data } = await axios.post(
        "https://api.supmap-server.pp.ua/oauth/auth/google/token",
        { idToken }
      );
      const { token, user } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("username", user.username); 
      localStorage.setItem("email", user.email); 
      localStorage.setItem("role", user.role);
      navigate(user.role === "admin" ? "/trafficAnalysis" : "/map");
    } catch {
      setError("Échec de connexion avec Google.");
    }
  };

  return (
    <>
      <CssBaseline />
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 5,
              borderRadius: 4,
              width: "100%",
              maxWidth: 400,
              textAlign: "center",
              position: "relative",
            }}
          >
            <Box position="absolute" top={16} right={16}>
              <ThemeToggleButton />
            </Box>

            <Avatar
              src={logo}
              alt="SupMap Logo"
              sx={{
                width: 72,
                height: 72,
                mx: "auto",
                mb: 1.5,
                backgroundColor: "#fff",
                border: "1px solid #ccc",
              }}
            />
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Bienvenue sur SupMap
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connecte-toi pour accéder à ta carte.
            </Typography>

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleLogin} noValidate>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                margin="normal"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Mot de passe"
                type="password"
                fullWidth
                required
                margin="normal"
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.4,
                  fontWeight: "bold",
                  borderRadius: 2,
                  backgroundColor: "#a259ff",
                  "&:hover": { backgroundColor: "#923dff" },
                }}
              >
                Se connecter
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1.5,
                fontSize: 13,
              }}
            >
              <Link href="/reset-password" underline="hover">
                Mot de passe oublié ?
              </Link>
              <Link href="/register" underline="hover">
                Créer un compte
              </Link>
            </Box>

            <Divider sx={{ my: 3 }} />

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Échec de l'authentification Google.")}
              width="100%"
            />
          </Paper>
        </Box>
      </GoogleOAuthProvider>
    </>
  );
};

export default Login;
