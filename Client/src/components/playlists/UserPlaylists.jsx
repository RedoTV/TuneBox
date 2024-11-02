import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import the useAuth hook
import { fetchUserPlaylists } from '../../services/api_service'; // Create a new service function for fetching user playlists
import { useNavigate } from 'react-router-dom';
import './Playlists.css';

export default function UserPlaylists() {
    const { user } = useAuth(); // Get user context to access user ID
    const [playlists, setPlaylists] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserPlaylists = async () => {
            if (user) {
                try {
                    const playlistsData = await fetchUserPlaylists(user.userId); // Fetch playlists for the user
                    setPlaylists(playlistsData);
                } catch (error) {
                    console.error("Failed to fetch user playlists:", error);
                }
            }
        };
        loadUserPlaylists();
    }, [user]);

    const handlePlaylistClick = (id) => {
        navigate(`/playlists/${id}`); // Navigate to the playlist detail page
    };

    return (
        <div className="playlists-container">
            <h2 className="title">Ваши Плейлисты</h2>
            <ul className="playlists-list">
                {playlists.map((playlist) => (
                    <li key={playlist.id} className="playlist-item" onClick={() => handlePlaylistClick(playlist.id)}>
                        <div className="playlist-info">
                            <h3>{playlist.name}</h3>
                            <p>Создан: {new Date(playlist.createdAt).toLocaleDateString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
