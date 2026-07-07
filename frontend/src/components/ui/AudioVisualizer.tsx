import { useEffect, useState, useMemo } from "react";

export const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const [barCount, setBarCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setBarCount(window.innerWidth < 640 ? 20 : 40);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //  Fix height of bars to a random value between 30% and 80% of the container height
  const barScales = useMemo(() => {
    return [...Array(barCount)].map(
      () => (Math.floor(Math.random() * 50) + 30) / 100,
    );
  }, [barCount]);

  return (
    <div className="flex items-end justify-around gap-0.5 h-full w-full px-2 opacity-20">
      {[...Array(barCount)].map((_, i) => {
        return (
          <div
            key={i}
            className="w-2 bg-linear-to-t from-primary to-secondary-light rounded-b-none rounded-t-full"
            style={{
              height: "18%",
              transform: `scaleY(${isPlaying ? barScales[i] : 0.05})`,
              transformOrigin: "bottom",
              transition: "transform 0.1s ease",
              // The animation using the visualizer keyframes defined in the global CSS, with a random duration for each bar to create a more dynamic effect
              animation: isPlaying
                ? `visualizer ${0.6 + (i % 5) * 0.2}s ease-in-out infinite alternate`
                : "none",
            }}
          />
        );
      })}
    </div>
  );
};
