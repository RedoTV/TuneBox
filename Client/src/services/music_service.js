import axios from "axios";
import tracksData from './tracks.json';

export async function getAllMusic(skip = 0, count = 10) {
  let tracks;
  await axios
    .get(`https://localhost:7156/api/music/songs?skip=${skip}&count=${count}`)
    .then((response) => tracks = response.data)
    .catch(() => tracks = tracksData);
  return tracks;
}