import { useState, useEffect } from 'react';

interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  marks?: number[];
}

const RangeSlider = ({ 
    min = 0, 
    max = 100, 
    step = 1, 
    value, 
    onChange, 
    marks = [],
}: RangeSliderProps) => {
  const [isNarrow, setIsNarrow] = useState(false);

  // Watch viewport width
  useEffect(() => {
    const checkWidth = () => {
      setIsNarrow(window.innerWidth < 340); // "narrow" mode below 640px
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Filter list if space is narrow (e.g. only keep first, last, and middle elements)
  const displayedMarks = isNarrow && marks.length > 3 
    ? marks.filter((_, index) => index % 2 === 0) // Show every second element
    : marks;

  return (
    <div className="relative w-full group">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="custom-range w-full h-2 bg-black/40 rounded-full appearance-none cursor-pointer m-0 p-0 block outline-none transition-all focus:ring-2 focus:ring-primary/20"
      />

      <div className="flex justify-between w-full mt-5 sm:mt-6 ">
        {displayedMarks.map((num) => {
          const isActive = value === num;
          return (
            <div
              key={num}
              className="flex flex-col items-center transition-all duration-500"
              style={{ width: "20px" }}
            >
              <div
                className={`w-1 h-1.5 sm:h-2 rounded-full mb-1.5 sm:mb-2 transition-all duration-300 ${
                  isActive ? "bg-primary shadow-[0_0_8px] shadow-primary" : "bg-slate-700"
                }`}
              />
              <span
                className={`text-xs sm:text-sm font-archivo transition-all duration-300 ${
                  isActive 
                    ? "text-primary scale-125 sm:scale-150" 
                    : "text-slate-600 hover:text-slate-400"
                }`}
              >
                {num}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RangeSlider;