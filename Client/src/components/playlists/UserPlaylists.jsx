import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserPlaylists, createPlaylist } from '../../services/api_service';
import { useNavigate } from 'react-router-dom';
import SongSelector from '../songSelector/SongSelector';

export default function UserPlaylists() {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null); // For showing SongSelector
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserPlaylists = async () => {
            if (user) {
                try {
                    const playlistsData = await fetchUserPlaylists(user.userId);
                    setPlaylists(playlistsData);
                } catch (error) {
                    console.error("Failed to fetch user playlists:", error);
                }
            }
        };
        loadUserPlaylists();
    }, [user]);

    const handlePlaylistClick = (id) => {
        setSelectedPlaylistId(id); // Set selected playlist to show SongSelector
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) {
            setError("Please enter a valid playlist name.");
            return;
        }

        try {
            const newPlaylist = await createPlaylist(newPlaylistName, user.token);
            setPlaylists([...playlists, newPlaylist]); // Add new playlist to the list
            setNewPlaylistName(''); // Reset the input field
            setError(null); // Clear any previous error
        } catch (error) {
            console.error("Failed to create playlist:", error);
            setError("Failed to create playlist. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Ваши Плейлисты</h2>

            {/* New Playlist Input and Button */}
            <div className="flex flex-col items-center mb-6">
                {/* Create Playlist Code */}
            </div>

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

            {/* Song Selector Modal */}
            {selectedPlaylistId && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg relative ">
                        <button
                            onClick={() => setSelectedPlaylistId(null)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            &times;
                        </button>
                        <SongSelector playlistId={selectedPlaylistId} />
                    </div>
                </div>
            )}
        </div>
    );
}
