export const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="flex items-end justify-center gap-1 h-12 w-full">
      {[...Array(14)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 bg-yellow-500 rounded-full transition-all duration-300 ${
            isPlaying ? 'animate-visualizer' : 'h-2'
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: isPlaying ? '100%' : '8px'
          }}
        />
      ))}
    </div>
  );
};