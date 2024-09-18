import { createRoot } from "react-dom/client";
import App from "./App";

// render the app
const rootElement = document.getElementById("root");

if (rootElement) {
    createRoot(rootElement).render(<App />);
}