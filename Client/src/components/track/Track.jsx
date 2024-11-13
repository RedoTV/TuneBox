export default function Track({ track, onPlay }) {
  return (
    <li
      className="
      bg-white border border-gray-200 rounded-lg
        p-4 w-60 min-h-44 text-gray-800 cursor-pointer transition-transform
        transform hover:scale-105 hover:shadow-md shadow-sm"
      onClick={() => onPlay(track)}
    >
      <div className="relative">
        <span className="text-xl text-indigo-500 absolute top-2 right-2">&#9658;</span>
      </div>
      <h3 className="text-lg font-semibold text-indigo-600">{track.name}</h3>
      <p className="text-sm text-gray-500 mt-1">Author: {track.author}</p>
      <p className="text-sm text-gray-500">Genres: {track.genres.join(', ')}</p>
      <p className="text-sm text-gray-400 mt-1">Added: {new Date(track.createdAt).toLocaleDateString()}</p>
    </li>
  );
}
