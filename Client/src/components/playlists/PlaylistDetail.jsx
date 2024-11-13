import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPlaylist, deleteSongFromPlaylist } from '../../services/api_service'; // импортируем deleteSongFromPlaylist
import Track from '../track/Track';
import AudioPlayer from '../audioPlayer/AudioPlayer';
import { useAuth } from '../../contexts/AuthContext';
import { FaTrashAlt } from 'react-icons/fa'; // Используем иконку для удаления
import { fetchUserPlaylists } from '../../services/api_service'; // Импортируем функцию для получения всех плейлистов пользователя

export default function PlaylistDetail() {
    const { playlistId } = useParams();
    const { user } = useAuth();
    const [playlist, setPlaylist] = useState(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
    const [isOwner, setIsOwner] = useState(false); // Флаг, чтобы отслеживать, является ли пользователь владельцем плейлиста

    useEffect(() => {
        // Функция для загрузки данных плейлиста и плейлистов пользователя
        const loadPlaylistData = async () => {
            try {
                // Получаем информацию о текущем плейлисте
                const fetchedPlaylist = await getPlaylist(playlistId);
                setPlaylist(fetchedPlaylist);

                // Получаем все плейлисты пользователя
                const playlistsData = await fetchUserPlaylists(user.userId);

                // Проверяем, является ли пользователь владельцем плейлиста
                const isUserOwner = playlistsData.some(pl => pl.id == playlistId);
                setIsOwner(isUserOwner);
            } catch (error) {
                console.error("Failed to fetch playlist data:", error);
            }
        };

        loadPlaylistData();
    }, [playlistId, user.userId]);

    const handlePlay = (track) => {
        const index = playlist.songs.findIndex(t => t.id === track.id);
        setCurrentTrackIndex(index);
    };

    const handleNext = () => {
        setCurrentTrackIndex((currentTrackIndex + 1) % playlist.songs.length);
    };

    const handlePrev = () => {
        setCurrentTrackIndex((currentTrackIndex - 1 + playlist.songs.length) % playlist.songs.length);
    };

    const handleDelete = async (songId) => {
        try {
            await deleteSongFromPlaylist(playlistId, songId, user.token);
            setPlaylist(prevPlaylist => ({
                ...prevPlaylist,
                songs: prevPlaylist.songs.filter(song => song.id !== songId),
            }));
        } catch (error) {
            console.error("Error removing song from playlist:", error);
        }
    };

    const currentTrack = currentTrackIndex !== null ? playlist.songs[currentTrackIndex] : null;

    return (
        <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
            {playlist ? (
                <>
                    <h1 className="text-4xl font-semibold text-gray-900 mb-2">{playlist.name}</h1>
                    <h3 className="text-lg text-gray-600 mb-6">Создан: {new Date(playlist.createdAt).toLocaleDateString()}</h3>

                    <ul className="flex flex-wrap justify-center gap-4">
                        {playlist.songs.map((track) => (
                            <li key={track.id} className="flex flex-col items-center justify-between p-4 
                            bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow 
                            duration-300 ">
                                <Track track={track} onPlay={() => handlePlay(track)} />

                                {/* Кнопка удаления только для создателя плейлиста */}
                                {isOwner && (
                                    <button
                                        onClick={() => handleDelete(track.id)}
                                        className="mt-2 text-red-600 hover:text-red-800 transition-colors duration-200"
                                    >
                                        <FaTrashAlt size={20} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Компонент аудиоплеера */}
                    <AudioPlayer
                        currentTrack={currentTrack}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                </>
            ) : (
                <p className="text-gray-600">Loading playlist...</p>
            )}
        </div>
    );
}
