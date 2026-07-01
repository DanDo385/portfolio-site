export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="section-label">{children}</div>;
}

export function Bridge() {
  return (
    <div className="container">
      <div className="bridge" aria-hidden="true">
        <div className="n" />
        <div className="seg" />
        <div className="n on" />
        <div className="seg" />
        <div className="n" />
      </div>
    </div>
  );
}
