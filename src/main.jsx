import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTheme, ThemeProvider } from "@mui/material/styles";

/**
 * Global MUI theme — aligns all MUI components with the site theme
 * (navy + orange accent, DM Sans, rounded corners). Replaces MUI's
 * default blue primary so buttons, inputs, tabs, switches, pagination,
 * spinners, etc. render orange across the admin panel automatically.
 */
const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#F57C00",
      dark: "#e06c00",
      light: "#ff9d3f",
      contrastText: "#ffffff",
    },
    secondary: { main: "#0D1B4A" },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#f9fafb",
          color: "#6b7280",
          fontSize: "0.8125rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        },
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={muiTheme}>
      <App />
    </ThemeProvider>
  </QueryClientProvider>,
);
// This code is for all users
window.__TANSTACK_QUERY_CLIENT__ = queryClient;