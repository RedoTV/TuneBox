import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPlaylists } from '../../services/api_service';
import './Playlists.css';

export default function Playlists() {
    const [playlists, setPlaylists] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadPlaylists = async () => {
            try {
                const playlistsData = await fetchPlaylists(20); // Fetch up to 20 playlists
                setPlaylists(playlistsData);
            } catch (error) {
                console.error("Failed to fetch playlists:", error);
            }
        };
        loadPlaylists();
    }, []);

    const handlePlaylistClick = (id) => {
        navigate(`/playlists/${id}`); // Navigate to the detail page
    };

    return (
        <div className="playlists-container">
            <h2 className="title">Плейлисты</h2>
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
