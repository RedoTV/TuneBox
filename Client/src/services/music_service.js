import axios from "axios";
import tracksData from './tracks.json'

export async function getAllMusic()
{
    let tracks;
    await axios.get("https://localhost:7156/api/music")
        .then(response => tracks = response.data)
        .catch(() => tracks = tracksData)
    return tracks;
}