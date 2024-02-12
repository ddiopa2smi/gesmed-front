import React, { createContext, useState } from "react";

export const ThemeContext = createContext();
function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(
    localStorage.getItem("currentTheme") &&
      localStorage.getItem("currentTheme") !== undefined &&
      localStorage.getItem("currentTheme") !== null
      ? localStorage.getItem("currentTheme") === "light"
        ? false
        : true
      : false
  );
  const setLightMode = () => {
    setIsDark(false);
    localStorage.setItem("currentTheme", "light");
  };

  const setDarkMode = () => {
    setIsDark(true);
    localStorage.setItem("currentTheme", "dark");
  };

  return (
    <ThemeContext.Provider value={{ isDark, setLightMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
