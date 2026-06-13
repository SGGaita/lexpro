import { AppProvider } from "../context/AppContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "../styles/globals.css";

const theme = createTheme({
  palette: { mode: "dark", primary: { main: "#D4A843" }, secondary: { main: "#4A90D9" }, background: { default: "#0A0F1A", paper: "#1E2D42" }, text: { primary: "#E8DCC8", secondary: "#8B9BB4" } },
  typography: { fontFamily: "'DM Sans', sans-serif" },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 500, borderRadius: 8 }, contained: { background: "#D4A843", color: "#0A0F1A", "&:hover": { background: "#C09530" } } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 6 } } },
  },
});

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </ThemeProvider>
  );
}
