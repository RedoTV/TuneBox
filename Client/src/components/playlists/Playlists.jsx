import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPlaylists } from '../../services/api_service';

export default function Playlists() {
    const [playlists, setPlaylists] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadPlaylists = async () => {
            try {
                const playlistsData = await fetchPlaylists(20); // Получаем 20 первых плейлистов
                setPlaylists(playlistsData);
            } catch (error) {
                console.error("Failed to fetch playlists:", error);
            }
        };
        loadPlaylists();
    }, []);

    const handlePlaylistClick = (id) => {
        navigate(`/playlists/${id}`); // Переход на страницу подробного описания плейлиста
    };

    return (
        <div className="flex flex-col max-w-[1100px] mx-auto items-center p-5 min-h-screen">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Пользовательские плейлисты</h2>
            <ul className="flex flex-wrap gap-6 justify-center">
                {playlists.map((playlist, index) => (
                    <li
                        key={playlist.id || index}  // Используем id, если он есть, иначе индекс
                        className="bg-white border border-gray-300 rounded-lg p-8 shadow-lg transition-transform transform hover:scale-105 cursor-pointer relative w-64 min-h-52 flex flex-col justify-between"
                        onClick={() => handlePlaylistClick(playlist.id)}
                    >
                        <div className="flex flex-col items-center">
                            <h3 className="text-2xl font-semibold text-indigo-600 mb-2">{playlist.name}</h3>
                            <p className="text-gray-500 text-lg">Создан: {new Date(playlist.createdAt).toLocaleDateString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
