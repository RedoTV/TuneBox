import { useEffect, useState } from 'react';
import { getAllMusic, searchSongs, addSongToPlaylist } from '../../services/api_service';
import { useAuth } from '../../contexts/AuthContext';

export default function SongSelector({ playlistId }) {
    const { user } = useAuth();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [skip, setSkip] = useState(0);
    const count = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [addedSongs, setAddedSongs] = useState(new Set());

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                setLoading(true);
                const songsData = await getAllMusic(skip, count);

                // Применяем форматирование длительности для каждой песни
                const formattedSongs = songsData.map(song => ({
                    ...song,
                    duration: formatDuration(song.duration), // Отформатированная длительность
                }));


                // Фильтруем песни, чтобы не добавлять уже добавленные
                const filteredSongs = formattedSongs.filter(song => !addedSongs.has(song.id));

                // Убираем дублирующиеся песни по id
                const uniqueSongs = Array.from(new Map(filteredSongs.map(song => [song.id, song])).values());

                // Обновляем стейт песен
                if (!isSearching) {
                    setSongs((prevSongs) => {
                        const allSongs = [...prevSongs, ...uniqueSongs];

                        // Убираем возможные дубли из текущего состояния
                        return Array.from(new Map(allSongs.map(song => [song.id, song])).values());
                    });
                }
            } catch (error) {
                console.error("Error fetching songs:", error);
                setError("Ошибка при загрузке песен");
            } finally {
                setLoading(false);
            }
        };

        if (!isSearching) {
            fetchSongs();
        }
    }, [skip, isSearching, addedSongs]);

    // Функция для форматирования длительности
    const formatDuration = (duration) => {
        const [hours, minutes, seconds] = duration.split(':');

        // Добавляем ведущие нули, если нужно
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds.split('.')[0]).padStart(2, '0'); // Обрезаем миллисекунды, если они есть

        // Возвращаем отформатированную длительность в формате hh:mm:ss
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    const handleAddSong = async (songId) => {
        try {
            await addSongToPlaylist(playlistId, songId, user.token);
            setAddedSongs(prevSet => new Set(prevSet.add(songId)));
        } catch (error) {
            console.error("Error adding song to playlist:", error);
            setError("Ошибка во время добавления песни в плейлист.");
        }
    };

    const loadMoreSongs = () => {
        setSkip(skip + count);
    };

    const handleSearch = async () => {
        setIsSearching(true);
        setLoading(true);
        setSkip(0);

        try {
            const searchResults = await searchSongs(searchTerm);

            // Фильтруем, чтобы не добавлять уже добавленные песни
            const filteredSearchResults = searchResults.filter(song => !addedSongs.has(song.id));

            // Убираем дублирующиеся песни по id
            const uniqueSearchResults = Array.from(new Map(filteredSearchResults.map(song => [song.id, song])).values());

            setSongs(uniqueSearchResults);
        } catch (error) {
            console.error("Error searching songs:", error);
            setError("Ошибка при поиске песни.");
        } finally {
            setLoading(false);
        }
    };

    const resetSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
        setSongs([]);
        setSkip(0);
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex flex-col items-center p-6 bg-white border rounded-lg shadow-lg w-full mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Выберите песни</h3>

            <div className="flex flex-wrap w-full mb-4 gap-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Название песни"
                    className="flex-grow border border-gray-300 rounded px-4 py-2 text-lg"
                />
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleSearch}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-lg"
                    >
                        Поиск
                    </button>
                    {isSearching && (
                        <button
                            onClick={resetSearch}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-lg"
                        >
                            Очистить
                        </button>
                    )}
                </div>
            </div>

            <ul className="overflow-y-auto max-h-96 w-full">
                {songs.map((song) => (
                    <li
                        key={song.id}  // Здесь ключ будет уникальным, так как song.id уникален
                        className="flex-col justify-between items-center p-4 border-b last:border-none hover:bg-gray-100"
                    >
                        <div>
                            <p className="font-semibold text-lg">{song.name}</p>
                            <p className="text-base text-gray-600">Исполнитель: {song.author}</p>
                            <p className="text-sm text-gray-500">Длительность: {song.duration}</p>
                        </div>

                        <button
                            onClick={() => handleAddSong(song.id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-lg w-full mt-4 sm:mt-2"
                            disabled={addedSongs.has(song.id)}
                        >
                            {addedSongs.has(song.id) ? "Добавлено" : "Добавить в плейлист"}
                        </button>
                    </li>
                ))}
            </ul>

            {!isSearching && (
                <button
                    onClick={loadMoreSongs}
                    className="mt-6 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition text-lg"
                >
                    Показать больше
                </button>
            )}
        </div>
    );
}
