export function EngineeringApproach() {
  return <section id="approach" className="approach-section"><div className="container">
    <div className="section-heading"><div><p className="eyebrow">02 / How I approach the work</p><h2>Start with the problem.<br />Stay through the details.</h2></div><p>My markets background shapes how I approach engineering: understand the workflow, make assumptions explicit, and account for what can fail.</p></div>
    <div className="approach-grid">
      <div><span className="index-number">01</span><h3>Understand the workflow</h3><p>Map the users, decisions, data, and constraints. Translate domain knowledge into a specific problem the software can solve.</p></div>
      <div><span className="index-number">02</span><h3>Connect the system</h3><p>Build the interface and integrations together. Make data sources, tool permissions, and failure boundaries explicit.</p></div>
      <div><span className="index-number">03</span><h3>Make behavior verifiable</h3><p>Use tests, evaluations, and observability to inspect behavior. Document tradeoffs and what it takes to operate the system.</p></div>
    </div>
  </div></section>;
}
