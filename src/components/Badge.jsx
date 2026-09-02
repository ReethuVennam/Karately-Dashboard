/** Small pill label — variant maps to .badge.success/.warning/.critical/.info/.muted */
export default function Badge({ variant = 'muted', title, children }) {
  return (
    <span className={`badge ${variant}`} title={title}>
      {children}
    </span>
  );
}
