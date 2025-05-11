import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import CustomThemeProvider from "./components/ThemeProvider"; 

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <CustomThemeProvider>
      <Router>
        <App />
      </Router>
    </CustomThemeProvider>
  </React.StrictMode>
);
