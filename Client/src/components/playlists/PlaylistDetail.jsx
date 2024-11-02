import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPlaylist } from '../../services/api_service';
import Track from '../track/Track';
import AudioPlayer from '../audioPlayer/AudioPlayer';
import styles from './playlistDetail.module.css';

export default function PlaylistDetail() {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(null);

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const data = await getPlaylist(playlistId);
                setPlaylist(data);
            } catch (error) {
                console.error("Failed to fetch playlist:", error);
            }
        };
        fetchPlaylist();
    }, [playlistId]);

    const handlePlay = (track) => {
        const index = playlist.songs.findIndex(t => t.id === track.id);
        setCurrentTrackIndex(index);
    };

    const handleNext = () => {
        if (currentTrackIndex < playlist.songs.length - 1) {
            setCurrentTrackIndex(currentTrackIndex + 1);
        } else {
            setCurrentTrackIndex(0);
        }
    };

    const handlePrev = () => {
        if (currentTrackIndex > 0) {
            setCurrentTrackIndex(currentTrackIndex - 1);
        } else {
            setCurrentTrackIndex(playlist.songs.length - 1);
        }
    };

    const currentTrack = currentTrackIndex !== null ? playlist.songs[currentTrackIndex] : null;

    return (
        <div className={styles.playlistDetailContainer}>
            {playlist ? (
                <>
                    <h1>{playlist.name}</h1>
                    <h3>(Создан: {new Date(playlist.createdAt).toLocaleDateString()})</h3>
                    <ul className={styles.trackList}>
                        {playlist.songs.map((track) => (
                            <Track
                                track={track}
                                key={track.id}
                                onPlay={() => handlePlay(track)}
                            />
                        ))}
                    </ul>
                    <AudioPlayer
                        currentTrack={currentTrack}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                </>
            ) : (
                <p>Loading playlist...</p>
            )}
        </div>
    );
}
