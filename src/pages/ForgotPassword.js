import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  CssBaseline,
  TextField,
  Typography,
  Paper,
  IconButton,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DarkMode, LightMode } from "@mui/icons-material";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSent(false);

    if (!email) {
      setError("Veuillez saisir votre adresse e-mail.");
      return;
    }

    setTimeout(() => {
      setSent(true);
    }, 1000);
  };

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
          aria-label="Changer le thème"
        >
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>

        <Paper
          elevation={4}
          sx={{
            p: 5,
            borderRadius: 4,
            width: "100%",
            maxWidth: 420,
            textAlign: "center",
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Mot de passe oublié ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Entrez votre adresse email pour recevoir un lien de
            réinitialisation.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Adresse e-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}
            {sent && (
              <Typography color="success.main" variant="body2" sx={{ mb: 1 }}>
                Lien envoyé ! Vérifiez votre boîte mail 📬
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                fontWeight: "bold",
                borderRadius: 2,
              }}
            >
              Envoyer le lien
            </Button>
          </form>

          <Button
            onClick={() => navigate("/")}
            fullWidth
            sx={{
              mt: 2,
              textTransform: "none",
              color: "primary.main",
            }}
          >
            ⬅ Revenir à la connexion
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default ForgotPassword;
