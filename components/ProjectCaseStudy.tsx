import type { Project, ProjectCaseStudy as ProjectCaseStudyData } from '@/lib/types';

interface ProjectCaseStudyProps {
  project: Project;
}

const LIST_SECTIONS: Array<{
  key: keyof Pick<
    ProjectCaseStudyData,
    'ownership' | 'architecture' | 'decisions' | 'verification' | 'limitations' | 'productionDifferences' | 'lessons'
  >;
  label: string;
}> = [
  { key: 'ownership', label: 'What I designed and implemented' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'decisions', label: 'Engineering decisions' },
  { key: 'verification', label: 'Verification and testing' },
  { key: 'limitations', label: 'Limitations and what is simulated' },
  { key: 'productionDifferences', label: 'Production differences' },
  { key: 'lessons', label: 'Lessons' },
];

export function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
  const caseStudy = project.caseStudy;
  if (!caseStudy) return null;

  return (
    <section className="amd-detail case-study" aria-labelledby={`${project.slug}-case-study-title`}>
      <p className="section-label" id={`${project.slug}-case-study-title`}>
        Case Study
      </p>
      <div className="case-study-problem">
        <p className="amd-kicker">Problem</p>
        <p>{caseStudy.problem}</p>
      </div>
      <div className="case-study-grid">
        {LIST_SECTIONS.map(({ key, label }) => {
          const items = caseStudy[key];
          if (!items || items.length === 0) return null;
          return (
            <div className="case-study-section" key={key}>
              <h3 className="case-study-heading">{label}</h3>
              <ul className="case-study-list">
                {items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
