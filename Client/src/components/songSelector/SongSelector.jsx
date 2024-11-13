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

                // Фильтруем песни, чтобы не добавлять уже добавленные
                const filteredSongs = songsData.filter(song => !addedSongs.has(song.id));

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
                setError("Failed to load songs");
            } finally {
                setLoading(false);
            }
        };

        if (!isSearching) {
            fetchSongs();
        }
    }, [skip, isSearching, addedSongs]);

    const handleAddSong = async (songId) => {
        try {
            await addSongToPlaylist(playlistId, songId, user.token);
            setAddedSongs(prevSet => new Set(prevSet.add(songId)));
        } catch (error) {
            console.error("Error adding song to playlist:", error);
            setError("Failed to add song to playlist.");
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
            setError("Failed to search songs.");
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

    if (loading) return <p>Loading songs...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex flex-col items-center p-6 bg-white border rounded-lg shadow-lg w-full mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Select Songs to Add</h3>

            <div className="flex flex-wrap w-full mb-4 gap-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a song..."
                    className="flex-grow border border-gray-300 rounded px-4 py-2 text-lg"
                />
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleSearch}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-lg"
                    >
                        Search
                    </button>
                    {isSearching && (
                        <button
                            onClick={resetSearch}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-lg"
                        >
                            Clear
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
                            <p className="text-base text-gray-600">by {song.author}</p>
                            <p className="text-sm text-gray-500">Duration: {song.duration}</p>
                        </div>

                        <button
                            onClick={() => handleAddSong(song.id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-lg w-full mt-4 sm:mt-0"
                            disabled={addedSongs.has(song.id)}
                        >
                            {addedSongs.has(song.id) ? "Added" : "Add to Playlist"}
                        </button>
                    </li>
                ))}
            </ul>

            {!isSearching && (
                <button
                    onClick={loadMoreSongs}
                    className="mt-6 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition text-lg"
                >
                    Load More
                </button>
            )}
        </div>
    );
}
