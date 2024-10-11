import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Music from "./components/music/Music";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/music",
    element: <Music />
  },
]);