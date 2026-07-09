import type { Song } from "../types";

interface VerticalTimelineProps {
  timeline: Song[];
  title?: string;
  subtitle?: string;
}

export const VerticalTimeline = ({
  timeline,
  title = "Timeline",
  subtitle,
}: VerticalTimelineProps) => {
  if (!timeline) return null;

  const startYear = timeline[0]?.year;
  const endYear = timeline[timeline.length - 1]?.year;

  return (
    <div className="flex flex-col h-full bg-[#12051d] border-l border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-black/20 backdrop-blur-md shrink-0">
        <h2 className="text-xl sm:text-2xl font-archivo uppercase italic tracking-tighter text-white">
          {title}
        </h2>
        <p className="text-zinc-500 text-xs sm:text-sm font-medium mt-1">
          {subtitle ||
            (timeline.length > 0
              ? `Időrendi sorrend: ${startYear} — ${endYear}`
              : "Üres timeline")}
        </p>
      </div>

      {/* List container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="relative pl-2 xs:pl-8 space-y-6">
          {/* Vertical indicator line */}
          <div className="absolute -left-[13.7px] xs:left-2.5 h-full w-0.5 bg-linear-to-b from-transparent via-secondary-light/85 to-transparent rounded-full" />

            {timeline.map((song, idx) => (
            <div
              key={`${song.id}-${idx}`}
              className="relative group animate-in fade-in slide-in-from-right-4 duration-500"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Dot on the timeline */}
              <div className="absolute -left-[27.7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_12px] shadow-primary/60 z-10 transition-transform duration-300 group-hover:scale-125" />

              {/* Item Card */}
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/4 border border-white/5 hover:bg-white/10 hover:border-secondary/30 transition-all duration-300 group/item shadow-xl">
                <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border border-white/10">
                  <img
                    src={song.cover || "/cover_placeholder.jpg"}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="inline-flex px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-archivo uppercase mb-1.5">
                    {song.year}
                  </div>
                  <h4 className="text-white font-bold text-base sm:text-lg truncate leading-tight">
                    {song.title}
                  </h4>
                  <p className="text-zinc-500 text-xs sm:text-sm truncate mt-1 italic font-medium opacity-80">
                    {song.artist}
                  </p>
                </div>
              </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};
