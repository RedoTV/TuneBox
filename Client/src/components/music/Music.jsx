import { useEffect, useState } from 'react';
import { getAllMusic, searchSongs } from '../../services/api_service';
import Track from '../track/Track';
import AudioPlayer from '../audioPlayer/AudioPlayer';

export default function Music() {
  const [tracks, setTracks] = useState([]); // Все песни
  const [filteredTracks, setFilteredTracks] = useState([]); // Отфильтрованные песни по поиску
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Состояние для поискового запроса
  const [resetSearch, setResetSearch] = useState(); // Флаг для сброса поиска (1 - активен, 0 - сброшен)

  // Загрузка всех песен при первом рендере
  useEffect(() => {
    const fetchAllMusic = async () => {
      const musicData = await getAllMusic();
      setTracks(musicData);
      setFilteredTracks(musicData); // Изначально показываем все песни
    };
    fetchAllMusic();
  }, []);

  // Обработчик изменения поисковой строки
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Выполнение поиска по песням
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setResetSearch(1);
        const searchResults = await searchSongs(searchTerm);
        setFilteredTracks(searchResults);
      } catch (error) {
        console.error('Ошибка поиска песен:', error);
      }
    } else {
      setFilteredTracks(tracks); // Показываем все песни при пустом запросе
    }
  };

  // Сброс поискового запроса
  const resetSearchTerm = () => {
    setFilteredTracks(tracks);
    setSearchTerm("");
    setResetSearch(0);
  }

  // Воспроизведение выбранного трека
  const handlePlay = (track) => {
    const index = tracks.findIndex(t => t.id === track.id);
    setCurrentTrackIndex(index);
  };

  // Переключение на следующий трек
  const handleNext = () => {
    if (currentTrackIndex < filteredTracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0); // Циклическое воспроизведение: переходим к первому треку
    }
  };

  // Переключение на предыдущий трек
  const handlePrev = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      setCurrentTrackIndex(filteredTracks.length - 1); // Циклическое воспроизведение: переходим к последнему треку
    }
  };

  const currentTrack = currentTrackIndex !== null ? filteredTracks[currentTrackIndex] : null;

  return (
    <div className="flex flex-col items-center p-5 bg-white text-gray-800 min-h-screen">
      <h1 className="text-3xl font-semibold mb-5 text-center">Библиотека песен</h1>

      {/* Панель поиска с кнопками */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6 w-full max-w-lg flex flex-col items-center justify-between">
        <div className="flex flex-wrap md:flex-nowrap w-full mb-4 md:mb-0">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Поиск по песням"
            className="border p-2 rounded-lg w-full"
          />
          <div className="flex gap-2 mt-2 md:mt-0 md:ml-2">
            <button
              onClick={handleSearch}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
              Поиск
            </button>
            {resetSearch == 1 && <button
              onClick={resetSearchTerm}
              className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500"
            >
              Очистить
            </button>}
          </div>
        </div>
      </div>

      {/* Список треков с возможностью воспроизведения */}
      <ul className="flex flex-wrap max-w-[1100px] gap-4 justify-center">
        {filteredTracks.map((track) => (
          <Track
            track={track}
            key={track.id}
            onPlay={() => handlePlay(track)}
          />
        ))}
      </ul>

      {/* Аудиоплеер в нижней части экрана */}
      <AudioPlayer currentTrack={currentTrack} tracks={filteredTracks} onNext={handleNext} onPrev={handlePrev} />
    </div>
  );
}