import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserPlaylists, createPlaylist, deletePlaylist, updatePlaylist } from '../../services/api_service';
import { useNavigate } from 'react-router-dom';
import SongSelector from '../songSelector/SongSelector';

export default function UserPlaylists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]); // Состояние для отфильтрованных плейлистов
  const [newPlaylistName, setNewPlaylistName] = useState(''); // Имя нового плейлиста
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [editPlaylistId, setEditPlaylistId] = useState(null); // ID плейлиста для редактирования
  const [editPlaylistName, setEditPlaylistName] = useState(''); // Новое имя плейлиста
  const [selectedPlaylistIdForSong, setSelectedPlaylistIdForSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Состояние для поискового запроса
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserPlaylists = async () => {
      if (user) {
        try {
          const playlistsData = await fetchUserPlaylists(user.userId);
          setPlaylists(playlistsData);
          setFilteredPlaylists(playlistsData); // Изначально показываем все плейлисты
        } catch (error) {
          console.error("Ошибка при загрузке плейлистов пользователя:", error);
        }
      }
    };
    loadUserPlaylists();
  }, [user]);

  useEffect(() => {
    // Фильтруем плейлисты по запросу
    const filtered = playlists.filter((playlist) =>
      playlist.name && playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlaylists(filtered);
  }, [searchTerm, playlists]); // Перезапускаем фильтрацию, когда изменяется поисковый запрос или список плейлистов

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError("Please enter a valid playlist name.");
      return;
    }

    try {
      // Пытаемся создать новый плейлист
      await createPlaylist(newPlaylistName, user.token);

      // Запросим актуальные данные после добавления
      const playlistsData = await fetchUserPlaylists(user.userId);
      setPlaylists(playlistsData);
      setFilteredPlaylists(playlistsData);

      setNewPlaylistName('');
      setError(null); // Убираем ошибку
      navigate(`/user/playlists/`);
    } catch (error) {
      console.error("Ошибка при добавлении плейлиста.:", error);
      setError("Ошибка при добавлении плейлиста.");
    }
  };

  const handleDeletePlaylist = async (id) => {
    try {
      await deletePlaylist(id, user.token);
      setPlaylists(playlists.filter((playlist) => playlist.id !== id));
      setFilteredPlaylists(filteredPlaylists.filter((playlist) => playlist.id !== id)); // Убираем удаленный плейлист из отфильтрованного списка
    } catch (error) {
      console.error("Ошибка при удалении плейлиста.", error);
      setError("Ошибка при удалении плейлиста.");
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!editPlaylistName.trim()) {
      setError("Введено некорректное название плейлиста.");
      return;
    }

    try {
      const updatedPlaylist = await updatePlaylist(editPlaylistId, editPlaylistName, user.token);
      setPlaylists(playlists.map((playlist) =>
        playlist.id === editPlaylistId ? { ...playlist, name: updatedPlaylist.name } : playlist
      ));
      setFilteredPlaylists(filteredPlaylists.map((playlist) =>
        playlist.id === editPlaylistId ? { ...playlist, name: updatedPlaylist.name } : playlist
      ));
      setEditPlaylistId(null);
      setEditPlaylistName('');
      setError(null);
    } catch (error) {
      console.error("Ошибка при обнавлении плейлиста:", error);
      setError("Ошибка при обнавлении плейлиста.");
    }
  };

  const handlePlaylistClick = (id) => {
    navigate(`/playlists/${id}`);
  };

  const handleAddSongClick = (id) => {
    setSelectedPlaylistIdForSong(id);
  };

  return (
    <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Ваши Плейлисты</h2>

      {/* Панель для создания нового плейлиста и поиска */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6 w-full max-w-lg flex flex-col items-center justify-between">
        {/* Поле для ввода имени нового плейлиста */}
        <div className="flex w-full mb-4 md:mb-0">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Введите название нового плейлиста"
            className="border p-2 rounded-lg w-full"
          />
          <button
            onClick={handleCreatePlaylist}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 ml-2"
          >
            Создать
          </button>
        </div>

        {/* Поле для поиска плейлистов */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск по плейлистам"
          className="border p-2 rounded-lg w-full mt-2"
        />
      </div>

      {/* Ошибка при создании плейлиста */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Список плейлистов */}
      <ul className="flex flex-wrap gap-8 justify-center">
        {filteredPlaylists.map((playlist, index) => (
          <li
            key={playlist.id || index}  // Используем id, если он есть, иначе индекс
            className="
            bg-white border border-gray-300 rounded-lg p-8 shadow-lg 
              transition-transform transform hover:scale-105 cursor-pointer relative 
              w-64 h-80 flex flex-col justify-between"
            onClick={() => handlePlaylistClick(playlist.id)}
          >
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-2 text-center">{playlist.name}</h3>
              <p className="text-gray-500 text-lg">Создан: {new Date(playlist.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Кнопка добавления песни */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddSongClick(playlist.id);
              }}
              className="mt-4 bg-green-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600"
            >
              Добавить песни
            </button>

            {/* Переключатель опций меню */}
            <button
              className="absolute top-4 right-1 w-7 text-gray-600 hover:text-gray-800 text-2xl"
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(showOptions === playlist.id ? null : playlist.id);
              }}
            >
              ⋮
            </button>

            {/* Опции меню */}
            {showOptions === playlist.id && (
              <div className="absolute top-12 right-4 bg-white border rounded shadow-lg z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditPlaylistId(playlist.id);
                    setEditPlaylistName(playlist.name);
                    setShowOptions(null);
                  }}
                  className="px-6 py-3 text-md text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Изменить
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlaylist(playlist.id);
                  }}
                  className="px-6 py-3 text-md text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  Удалить
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Модальное окно выбора песни для добавления */}
      {selectedPlaylistIdForSong && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg relative">
            <button
              onClick={() => setSelectedPlaylistIdForSong(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
            <SongSelector playlistId={selectedPlaylistIdForSong} />
          </div>
        </div>
      )}

      {/* Модальное окно для изменения названия плейлиста */}
      {editPlaylistId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button
              onClick={() => {
                setEditPlaylistId(null);
                setEditPlaylistName('');
              }}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">Изменить Плейлист</h3>

            {/* Поля ввода данных с изменяющимся цветом границ */}
            <input
              type="text"
              value={editPlaylistName}
              onChange={(e) => setEditPlaylistName(e.target.value)}
              className={`border p-2 mb-4 w-full rounded ${editPlaylistName.trim() === '' ? 'border-red-500' : 'border-gray-300'}`}
            />

            <button
              onClick={handleUpdatePlaylist}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
