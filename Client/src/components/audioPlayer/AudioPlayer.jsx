import { useEffect, useRef, useState } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'react-h5-audio-player/lib/styles.css';

export default function AudioPlayer({ currentTrack, onNext, onPrev }) {
    const audioPlayerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    // Отслеживание изменения размера экрана для мобильной адаптации
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); // Мобильным считаем экран уже 768px
        };

        handleResize(); // Первоначальная проверка при загрузке
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Обновление источника аудио при смене трека
    useEffect(() => {
        if (audioPlayerRef.current && currentTrack) {
            audioPlayerRef.current.audio.current.src = currentTrack.audioUrl;
            audioPlayerRef.current.audio.current.play();
        }
    }, [currentTrack]);

    // Кастомные кнопки управления плеером
    const customControls = [
        <button
            key="prev"
            className="bg-indigo-500 text-white rounded-full p-3 hover:bg-indigo-400 transition"
            onClick={onPrev}
            aria-label="Предыдущий трек"
        >
            <FaChevronLeft className="w-5 h-5" />
        </button>,
        <button
            key="next"
            className="bg-indigo-500 text-white rounded-full p-3 hover:bg-indigo-400 transition"
            onClick={onNext}
            aria-label="Следующий трек"
        >
            <FaChevronRight className="w-5 h-5" />
        </button>
    ];

    return (
        <>
            {currentTrack ? (
                <div className="fixed bottom-0 left-0 w-full bg-white text-gray-800 p-4 flex flex-col items-center justify-center shadow-md border-t-2 border-indigo-300">
                    <div className="w-full max-w-3xl mx-auto">
                        {/* Заголовок с названием трека и автором */}
                        <h4 className="text-lg font-medium text-indigo-600 truncate text-center">
                            {currentTrack.name} — {currentTrack.author}
                        </h4>

                        {/* Основной компонент аудиоплеера */}
                        <H5AudioPlayer
                            ref={audioPlayerRef}
                            src={currentTrack.audioUrl}
                            autoPlay
                            layout="horizontal-reverse"
                            showJumpControls={false}
                            customAdditionalControls={customControls}  // Кастомные кнопки управления
                            customVolumeControls={!isMobile ? ["VOLUME"] : []}  // Скрыть громкость на мобильных
                            customProgressBarSection={[
                                "PROGRESS_BAR", // Полоса прогресса
                                !isMobile && "CURRENT_TIME", // Текущее время (только на десктопе)
                                !isMobile && <span key="separator" className="text-gray-500 mx-2">|</span>,
                                !isMobile && "DURATION" // Общая длительность (только на десктопе)
                            ].filter(Boolean)}
                            style={{
                                backgroundColor: "#f9fafb", // Фон плеера
                            }}
                            onEnded={onNext} // Автопереход при завершении трека
                        />
                    </div>
                </div>
            ) : (
                // Пустой фрагмент если трек не выбран
                <></>
            )}
        </>
    );
}