import axios from "axios";
// Базовый URL API
const API_URL = "https://localhost:7156/api";

// Получение списка музыки с пагинацией
export async function getAllMusic(skip = 0, count = 10) {
  try {
      const response = await axios.get(`${API_URL}/Music/songs?skip=${skip}&count=${count}`);
      return response.data;
  } catch (error) {
      console.error("Ошибка при загрузке музыки:", error);
      throw error;
  }
}

// Поиск песен по ключевым словам
export async function searchSongs(searchTerm) {
  try {
    const response = await axios.get(`${API_URL}/Music/songs/search`, {
      params: { searchTerm },
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка поиска песен:", error);
    throw error;
  }
}

// Сервисы для работы с плейлистами
export async function createPlaylist(name, token) {
    try {
      const response = await axios.post(
        `${API_URL}/Playlists`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Установка заголовка авторизации
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Ошибка создания плейлиста:", error);
      throw error;
    }
}

// Добавление песни в плейлист
export async function addSongToPlaylist(playlistId, songId, token) {
  try {
      const response = await axios.post(
          `${API_URL}/Playlists/${playlistId}/songs/${songId}`,
          {}, // Тело запроса не требуется
          {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          }
      );
      return response.data;
  } catch (error) {
      console.error("Ошибка добавления песни в плейлист:", error);
      throw error;
  }
}

// Получение данных плейлиста
export async function getPlaylist(id) {
  try {
    const response = await axios.get(`${API_URL}/Playlists/${id}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки плейлиста:", error);
    throw error;
  }
}

// Обновление названия плейлиста
export async function updatePlaylist(playlistId, name, token) {
  try {
      const response = await axios.put(
          `${API_URL}/Playlists/${playlistId}`,
          { name }, // Тело запроса с новым названием
          {
              headers: {
                  Authorization: `Bearer ${token}`, // JWT токен в заголовке
              },
          }
      );
      return response.data; // Возвращает обновленные данные плейлиста
  } catch (error) {
      console.error("Ошибка обновления плейлиста:", error);
      throw error;
  }
}

// Удаление плейлиста
export async function deletePlaylist(playlistId, token) {
  try {
      const response = await axios.delete(`${API_URL}/Playlists/${playlistId}`, {
          headers: {
              Authorization: `Bearer ${token}`, // JWT токен в заголовке
          },
      });
      return response.data;
  } catch (error) {
      console.error("Ошибка удаления плейлиста:", error);
      throw error;
  }
}

// Удаление песни из плейлиста
export async function deleteSongFromPlaylist(playlistId, songId, token) {
  try {
    const response = await axios.delete(
      `${API_URL}/Playlists/${playlistId}/songs/${songId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Добавляем токен авторизации
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка удаления песни из плейлиста:", error);
    throw error;
  }
}

// Сервисы для работы с пользователями
export async function registerUser(name, email, password) {
  try {
    const response = await axios.post(`${API_URL}/Users/Register`, { name, email, password });
    return response.data; // Возвращает JWT токен
  } catch (error) {
    console.error("Ошибка регистрации пользователя:", error);
    throw error;
  }
}

// Авторизация пользователя
export async function signInUser(name, password) {
  try {
    const response = await axios.post(`${API_URL}/Users/SignIn`, { name, password });
    return response.data; // Возвращает JWT токен
  } catch (error) {
    console.error("Ошибка входа пользователя:", error);
    throw error;
  }
}

// Получение списка плейлистов
export const fetchPlaylists = async (limit) => {
    try {
        const response = await axios.get(`${API_URL}/Playlists?limit=${limit}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка загрузки плейлистов:", error);
        throw error;
    }
};

// Получение плейлистов конкретного пользователя
export const fetchUserPlaylists = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/Playlists/users/${userId}/playlists`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка загрузки пользовательских плейлистов:", error);
        throw error;
    }
};