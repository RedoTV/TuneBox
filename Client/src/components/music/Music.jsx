// Music.js
import { useEffect, useState } from 'react';
import { getAllMusic } from '../../services/api_service';
import Track from '../track/Track';
import AudioPlayer from '../audioPlayer/AudioPlayer';

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
      setCurrentTrackIndex(0); // Loop back to the first track
    }
  };

  const handlePrev = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      setCurrentTrackIndex(tracks.length - 1); // Loop to the last track
    }
  };

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  return (
    <div className="flex flex-col items-center p-5 bg-white text-gray-800 min-h-screen">
      <h1 className="text-3xl font-semibold mb-5 text-center">Библиотека песен</h1>
      <ul className="flex flex-wrap gap-4 justify-center p-0 list-none">
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
