import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPlaylist } from '../../services/api_service';
import Track from '../track/Track';
import AudioPlayer from '../audioPlayer/AudioPlayer';

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
        setCurrentTrackIndex((currentTrackIndex + 1) % playlist.songs.length);
    };

    const handlePrev = () => {
        setCurrentTrackIndex((currentTrackIndex - 1 + playlist.songs.length) % playlist.songs.length);
    };

    const currentTrack = currentTrackIndex !== null ? playlist.songs[currentTrackIndex] : null;

    return (
        <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen">
            {playlist ? (
                <>
                    <h1 className="text-3xl font-semibold text-gray-800">{playlist.name}</h1>
                    <h3 className="text-lg text-gray-500 mb-4">Создан: {new Date(playlist.createdAt).toLocaleDateString()}</h3>
                    <ul className="w-full max-w-2xl space-y-3">
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
                <p className="text-gray-600">Loading playlist...</p>
            )}
        </div>
    );
}
