import { useEffect, useState } from 'react';
import { getAllMusic, searchSongs } from '../../services/api_service';
import Track from '../track/Track';
import AudioPlayer from '../audioPlayer/AudioPlayer';

export default function Music() {
  const [tracks, setTracks] = useState([]); // Все песни
  const [filteredTracks, setFilteredTracks] = useState([]); // Отфильтрованные песни по поиску
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Состояние для поискового запроса

  // Загружаем все песни при монтировании компонента
  useEffect(() => {
    const fetchAllMusic = async () => {
      const musicData = await getAllMusic();
      setTracks(musicData);
      setFilteredTracks(musicData); // Изначально показываем все песни
    };
    fetchAllMusic();
  }, []);

  // Обработчик для изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Обработчик для кнопки поиска
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const searchResults = await searchSongs(searchTerm);
        setFilteredTracks(searchResults); // Обновляем отфильтрованные песни
      } catch (error) {
        console.error('Error searching songs:', error);
      }
    } else {
      setFilteredTracks(tracks); // Если поисковый запрос пустой, показываем все песни
    }
  };

  const handlePlay = (track) => {
    const index = tracks.findIndex(t => t.id === track.id);
    setCurrentTrackIndex(index);
  };

  const handleNext = () => {
    if (currentTrackIndex < filteredTracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0); // Loop back to the first track
    }
  };

  const handlePrev = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      setCurrentTrackIndex(filteredTracks.length - 1); // Loop to the last track
    }
  };

  const currentTrack = currentTrackIndex !== null ? filteredTracks[currentTrackIndex] : null;

  return (
    <div className="flex flex-col items-center p-5 bg-white text-gray-800 min-h-screen">
      <h1 className="text-3xl font-semibold mb-5 text-center">Библиотека песен</h1>

      {/* Панель для поиска */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6 w-full max-w-lg flex flex-col items-center justify-between">
        <div className="flex w-full mb-4 md:mb-0">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Поиск по песням"
            className="border p-2 rounded-lg w-full"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 ml-2"
          >
            Поиск
          </button>
        </div>
      </div>

      {/* Список песен, отфильтрованных по запросу */}
      <ul className="flex flex-wrap gap-4 justify-center p-0 list-none">
        {filteredTracks.map((track) => (
          <Track
            track={track}
            key={track.id}
            onPlay={() => handlePlay(track)}
          />
        ))}
      </ul>

      {/* Плеер */}
      <AudioPlayer currentTrack={currentTrack} tracks={filteredTracks} onNext={handleNext} onPrev={handlePrev} />
    </div>
  );
}
