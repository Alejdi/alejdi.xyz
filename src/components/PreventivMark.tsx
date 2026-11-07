/**
 * The Preventiv mark — a section box with a "P" and a dimension tick —
 * drawn from the brand's own 22-unit geometry (Preventiv: lib/brand/mark.ts).
 */
export default function PreventivMark({
  size = 22,
  tick = "#e8561c",
  className,
}: {
  size?: number;
  tick?: string;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true" className={className}>
      <rect x={1.75} y={1.75} width={18.5} height={18.5} rx={2} stroke="currentColor" strokeWidth={1.5} />
      <path d="M6 15.5V6.5h5.25a3 3 0 0 1 0 6H6" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M14.5 17.25h3.75M14.5 16v2.5M18.25 16v2.5" stroke={tick} strokeWidth={1.25} />
    </svg>
  );
}
