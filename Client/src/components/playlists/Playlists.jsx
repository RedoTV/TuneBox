import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPlaylists } from '../../services/api_service';

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
        <div className="flex flex-col items-center p-5 min-h-screen">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Плейлисты</h2>
            <ul className="flex flex-wrap gap-6 justify-center">
                {playlists.map((playlist) => (
                    <li
                        key={playlist.id}
                        className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm transition-transform transform hover:scale-105 cursor-pointer"
                        onClick={() => handlePlaylistClick(playlist.id)}
                    >
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-semibold text-indigo-600">{playlist.name}</h3>
                            <p className="text-gray-500 mt-1">Создан: {new Date(playlist.createdAt).toLocaleDateString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
