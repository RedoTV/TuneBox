// Track.js
import styles from './track.module.css';

export default function Track({ track, onPlay }) {
  return (
    <li className={styles.track} onClick={() => onPlay(track)}>
      <div className={styles.trackOverlay}>
        <span className={styles.playIcon}>&#9658;</span>
      </div>
      <h3 className={styles.title}>{track.name}</h3>
      <p className={styles.author}>Author: {track.author}</p>
      <p className={styles.genres}>Genres: {track.genres.join(', ')}</p>
      <p className={styles.createdAt}>Added: {new Date(track.createdAt).toLocaleDateString()}</p>
    </li>
  );
}
