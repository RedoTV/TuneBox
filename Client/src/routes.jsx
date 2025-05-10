import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Music from "./components/music/Music";
import Auth from "./components/auth/Auth";
import Playlists from "./components/playlists/Playlists";
import PlaylistDetail from "./components/playlists/PlaylistDetail"; // Import the new component
import UserPlaylists from "./components/playlists/UserPlaylists"; // Import the new component
import Home from "./components/home/Home";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "auth",
        element: <Auth />,
      },
      {
        path: "playlists",
        element: <Playlists />,
      },
      {
        path: "playlists/:playlistId",
        element: <PlaylistDetail />,
      },
      {
        path: "user/playlists",
        element: <UserPlaylists />,
      },
      {
        path: "/music",
        element: <Music />,
      },
    ],
  },
]);
