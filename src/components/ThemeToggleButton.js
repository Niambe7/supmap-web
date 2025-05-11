import React, { useContext } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { ColorModeContext } from "./ThemeProvider";

const ThemeToggleButton = () => {
  const colorMode = useContext(ColorModeContext);

  return (
    <Tooltip title="Changer le thème">
      <IconButton onClick={colorMode.toggleColorMode} color="inherit">
        {colorMode.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;
