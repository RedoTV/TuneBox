import { useEffect, useState } from 'react'
import { getAllMusic } from '../../services/music_service'

export default function Music() {
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    const fetchAllMusic = async () => {
      const musicData = await getAllMusic();
      setTracks(musicData);
    }

    fetchAllMusic();
  }, [])

  return (
    <>
      <ul>
        {tracks.map((track, index) => (
          <li key={index}>
            <h1>{track.id}</h1>
            <p>{track.name}</p>
          </li>
        ))}
      </ul>
    </>
  )
}