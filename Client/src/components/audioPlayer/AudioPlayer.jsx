import { useEffect, useRef, useState } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing Font Awesome icons
import 'react-h5-audio-player/lib/styles.css';

export default function AudioPlayer({ currentTrack, onNext, onPrev }) {
    const audioPlayerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    // Update the isMobile state based on the screen width
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); // Assuming 768px is the mobile breakpoint
        };

        handleResize(); // Set initial state based on screen size
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (audioPlayerRef.current && currentTrack) {
            audioPlayerRef.current.audio.current.src = currentTrack.audioUrl;
            audioPlayerRef.current.audio.current.play();
        }
    }, [currentTrack]);

    // Custom controls for Next and Prev buttons inside the player
    const customControls = [
        <button
            key="prev"
            className="bg-indigo-500 text-white rounded-full p-3 hover:bg-indigo-400 transition"
            onClick={onPrev}
            aria-label="Previous Track"
        >
            <FaChevronLeft className="w-5 h-5" />
        </button>,
        <button
            key="next"
            className="bg-indigo-500 text-white rounded-full p-3 hover:bg-indigo-400 transition"
            onClick={onNext}
            aria-label="Next Track"
        >
            <FaChevronRight className="w-5 h-5" />
        </button>
    ];

    return (
        <>
            {currentTrack ? (
                <div className="fixed bottom-0 left-0 w-full bg-white text-gray-800 p-4 flex flex-col items-center justify-center shadow-md border-t-2 border-indigo-300">
                    <div className="w-full max-w-3xl mx-auto">
                        {/* Container to control the width */}
                        <h4 className="text-lg font-medium text-indigo-600 truncate text-center">
                            {currentTrack.name} — {currentTrack.author}
                        </h4>
                        <H5AudioPlayer
                            ref={audioPlayerRef}
                            src={currentTrack.audioUrl}
                            autoPlay
                            layout="horizontal-reverse"
                            showJumpControls={false}
                            customAdditionalControls={customControls}  // Adding custom controls here
                            customVolumeControls={!isMobile ? ["VOLUME"] : []}  // Hide volume control on mobile
                            customProgressBarSection={[
                                "PROGRESS_BAR", // Always show progress bar
                                !isMobile && "CURRENT_TIME", // Show time only if not mobile
                                !isMobile && <span key="separator" className="text-gray-500 mx-2">|</span>, // Separator
                                !isMobile && "DURATION" // Show duration only if not mobile
                            ].filter(Boolean)} // Remove undefined values
                            style={{
                                backgroundColor: "#f9fafb", // Light gray background for player
                            }}
                            onEnded={onNext}
                        />
                    </div>
                </div>
            ) : (
                <></>
            )}
        </>
    );
}
