/** Ported from yesNo() — a small ✓/✕ check used on the user profile tab. */
export default function YesNo({ value }) {
  return value ? <span className="check yes">✓ Yes</span> : <span className="check no">✕ No</span>;
}
