import { ThemeProvider } from "@mui/system";
import { createRoot } from "react-dom/client";
import { themeOptionsDefault } from "./theme/default";
import { StrictMode, useEffect } from "react";
import "./styles/app.scss";
import {
    AppBar,
    Box,
    Button,
    IconButton,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import { MdClose, MdDescription } from "react-icons/md";
import * as React from "react";
import {
    MemoryRouter,
    Outlet,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { CoverLetterPage } from "./views/cover-letters/CoverLetters";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { TemplatePage } from "./views/templates/Templates";

const fss = window.require("fs");
const fs = window.require("fs/promises");

function setup() {
    console.info("Performing startup...");
    if (!fss.readdirSync(".").includes("templates")) {
        console.debug("./templates does not exist; creating");
        fs.mkdir("./templates");
    }
}

function Layout() {
    const nav = useNavigate();
    const loc = useLocation();
    return (
        <Box
            className="app-root"
            sx={{
                backgroundColor: "background.default",
            }}
        >
            <AppBar elevation={2} className="toolbar">
                <Toolbar>
                    <MdDescription className="icon" size={24} />
                    <Typography variant="h5" className="title">
                        Cover Letter Generator
                    </Typography>
                    <Stack className="pages" spacing={2} direction={"row"}>
                        <Button
                            className="btn-main"
                            onClick={() => nav("/")}
                            variant={loc.pathname === "/" ? "outlined" : "text"}
                        >
                            Generator
                        </Button>
                        <Button
                            className="btn-templates"
                            onClick={() => nav("/templates")}
                            variant={
                                loc.pathname === "/templates"
                                    ? "outlined"
                                    : "text"
                            }
                        >
                            Templates
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>
            <Box className="content">
                <Outlet />
            </Box>
        </Box>
    );
}

function App() {
    useEffect(() => {
        setup();
    }, []);

    return (
        <ThemeProvider theme={themeOptionsDefault}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
                <MemoryRouter>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<CoverLetterPage />} />
                            <Route
                                path="templates"
                                element={<TemplatePage />}
                            />
                        </Route>
                    </Routes>
                </MemoryRouter>
            </LocalizationProvider>
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
