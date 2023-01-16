import { ThemeProvider } from "@mui/system";
import { createRoot } from "react-dom/client";
import { themeOptionsDefault } from "./theme/default";
import { StrictMode } from "react";
import "./styles/app.scss";
import { Box } from "@mui/material";

function App() {
    return (
        <ThemeProvider theme={themeOptionsDefault}>
            <Box
                className="app-root"
                sx={{
                    backgroundColor: "background.default",
                }}
            ></Box>
        </ThemeProvider>
    );
}

function render() {
    const rootElement = document.getElementById("root");
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}

render();
