import axios from "axios";

export async function getAllMusic()
{
    let tracks;
    await axios.get("https://localhost:7156/api/music")
        .then(response => tracks = response.data)
    return tracks;
}