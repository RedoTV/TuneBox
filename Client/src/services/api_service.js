import axios from "axios";

// Base URL for the API
const API_URL = "https://localhost:7156/api";

// Playlist Services
export async function createPlaylist(name, token) {
    try {
      const response = await axios.post(
        `${API_URL}/Playlists`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the authorization header
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating playlist:", error);
      throw error;
    }
}

export async function getPlaylist(id) {
  try {
    const response = await axios.get(`${API_URL}/Playlists/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching playlist:", error);
    throw error;
  }
}

// User Services

export async function registerUser(name, email, password) {
  try {
    const response = await axios.post(`${API_URL}/Users/Register`, { name, email, password });
    return response.data; // This will return the JWT token
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

export async function signInUser(name, password) {
  try {
    const response = await axios.post(`${API_URL}/Users/SignIn`, { name, password });
    return response.data; // This will return the JWT token
  } catch (error) {
    console.error("Error signing in user:", error);
    throw error;
  }
}

export const fetchPlaylists = async (limit) => {
    try {
        const response = await axios.get(`${API_URL}/Playlists?limit=${limit}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data; // Return the data from the response
    } catch (error) {
        console.error("Error fetching playlists:", error);
        throw error; // Rethrow the error for handling in the component
    }
};

export const fetchUserPlaylists = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/Playlists/users/${userId}/playlists`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data; // Return the data from the response
    } catch (error) {
        console.error("Error fetching user playlists:", error);
        throw error; // Rethrow the error for handling in the component
    }
};