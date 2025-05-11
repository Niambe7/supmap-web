import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CssBaseline,
  Paper,
  TextField,
  Typography,
  Link,
  Fade,
  IconButton,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import { createTheme, ThemeProvider} from "@mui/material/styles";

const sanitizeInput = (input) => {
  const temp = document.createElement("div");
  temp.textContent = input;
  return temp.innerHTML;
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: sanitizeInput(value) });
  };

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Une erreur est survenue.");

      setMessage("Inscription réussie ! 🎉 Redirection...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#a259ff" },
          background: {
            default: darkMode ? "#121212" : "#f5f5fa",
            paper: darkMode ? "#1e1e1e" : "#ffffff",
          },
        },
        typography: {
          fontFamily: "'Inter', sans-serif",
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          position: "relative",
        }}
      >
       
        <IconButton
          onClick={() => setDarkMode(!darkMode)}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "text.primary",
          }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>

        <Fade in timeout={600}>
          <Paper
            elevation={4}
            sx={{
              p: 5,
              borderRadius: 4,
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
              backgroundColor: "background.paper",
              color: "text.primary",
            }}
          >
            <PersonAddIcon
              sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
            />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Créer un compte
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Rejoignez SupMap et explorez intelligemment.
            </Typography>

            {message && (
              <Typography color="success.main" sx={{ mb: 2 }}>
                {message}
              </Typography>
            )}
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Nom complet"
                name="username"
                fullWidth
                margin="normal"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <TextField
                label="Adresse email"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextField
                label="Mot de passe"
                name="password"
                type="password"
                fullWidth
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: 2,
                }}
              >
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Link href="/" underline="hover" fontSize={14}>
                Déjà un compte ? Se connecter
              </Link>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </ThemeProvider>
  );
};

export default Register;
