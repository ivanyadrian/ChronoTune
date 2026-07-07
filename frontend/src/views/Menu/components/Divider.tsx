export const Divider = ({ className = "" }: { className?: string }) => (
  <div className={`hidden sm:block w-px h-12 bg-linear-to-b from-transparent via-secondary/20 to-transparent mx-auto ${className}`} />
);