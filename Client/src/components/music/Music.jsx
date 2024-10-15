import { useEffect, useState } from 'react'
import { getAllMusic } from '../../services/music_service'
import Track from '../track/Track'
import styles from './music.module.css'

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
      <ul className={styles.track_container}>
        {tracks.map((track, index) => (
          <Track track={track} key={index} />
        ))}
      </ul>
    </>
  )
}