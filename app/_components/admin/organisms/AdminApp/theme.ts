import { defaultTheme } from "react-admin";
import { createTheme } from "@mui/material/styles";

const primaryColor = "#CD1C18";
const secondaryColor = "#fca5a5";

export const adminTheme = createTheme({
    ...defaultTheme,
    palette: {
        ...defaultTheme.palette,
        primary: {
            main: primaryColor,
        },
        secondary: {
            main: secondaryColor,
        },
    },
    typography: {
        ...defaultTheme.typography,
        fontFamily: '"Acumin Variable Concept", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
        ...defaultTheme.components,
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});
