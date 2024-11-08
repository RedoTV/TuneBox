import { useEffect, useRef } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import styles from './audioPlayer.module.css';
import './customAudioPlayerStyles.css'; // Import custom styles

export default function AudioPlayer({ currentTrack, onNext, onPrev }) {
    const audioPlayerRef = useRef(null);

    useEffect(() => {
        if (audioPlayerRef.current && currentTrack) {
            audioPlayerRef.current.audio.current.src = currentTrack.audioUrl;
            audioPlayerRef.current.audio.current.play();
        }
    }, [currentTrack]);

    return (
        <div className={styles.audioPlayerContainer}>
            {currentTrack ? (
                <>
                    <h4 className={styles.trackTitle}>
                        {currentTrack.name} — {currentTrack.author}
                    </h4>
                    <H5AudioPlayer
                        ref={audioPlayerRef}
                        src={currentTrack.audioUrl}
                        autoPlay
                        layout="horizontal-reverse"
                        showJumpControls={false}
                        customAdditionalControls={[]}
                        customVolumeControls={["VOLUME"]}
                        customProgressBarSection={[
                            "PROGRESS_BAR",
                            "CURRENT_TIME",
                            <span key="separator" className={styles.separator}>|</span>,
                            "DURATION"
                        ]}
                        style={{
                            backgroundColor: "#1e1e1e",
                        }}
                        onEnded={onNext}
                    />
                    <div className={styles.controls}>
                        <button className={styles.controlButton} onClick={onPrev}>&lt;&lt; Prev</button>
                        <button className={styles.controlButton} onClick={onNext}>Next &gt;&gt;</button>
                    </div>
                </>
            ) : (
                <p className={styles.placeholder}>Select a track to play</p>
            )}
        </div>
    );
}