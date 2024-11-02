// Music.js
import { useEffect, useState } from 'react';
import { getAllMusic } from '../../services/music_service';
import Track from '../track/Track';
import AudioPlayer from '../audioPlayer/AudioPlayer';
import styles from './music.module.css';

export default function Music() {
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);

  useEffect(() => {
    const fetchAllMusic = async () => {
      const musicData = await getAllMusic();
      setTracks(musicData);
    };
    fetchAllMusic();
  }, []);

  const handlePlay = (track) => {
    const index = tracks.findIndex(t => t.id === track.id);
    setCurrentTrackIndex(index);
  };

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0); // Зациклить на первом треке
    }
  };

  const handlePrev = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      setCurrentTrackIndex(tracks.length - 1); // Зациклить на последнем треке
    }
  };

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  return (
    <div className={styles.musicContainer}>
      <h1 className={styles.title}>Библиотека песен</h1>
      <ul className={styles.trackContainer}>
        {tracks.map((track) => (
          <Track
            track={track}
            key={track.id}
            onPlay={() => handlePlay(track)}
          />
        ))}
      </ul>
      <AudioPlayer currentTrack={currentTrack} tracks={tracks} onNext={handleNext} onPrev={handlePrev} />
    </div>
  );
}
