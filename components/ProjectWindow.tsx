'use client';

import Link from 'next/link';
import { useRef } from 'react';

export type ProjectWindowData = {
  title: string;
  slug: string;
  hook?: string | null;
  summary: string;
  tags: string[];
};

export function ProjectWindow({ project }: { project: ProjectWindowData }) {
  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openWindow() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    dialog.focus();
  }

  function closeWindow() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className="btn btn-primary project-window-launcher"
        aria-label={`Open project window: ${project.title}`}
        onClick={openWindow}
      >
        Project window
      </button>
      <dialog
        ref={dialogRef}
        className="project-window"
        aria-labelledby="project-window-title"
        tabIndex={-1}
        onClose={() => openerRef.current?.focus()}
      >
        <div className="project-window-bar">
          <button type="button" className="project-window-close" aria-label="Close" onClick={closeWindow}>
            Close
          </button>
          <span className="project-window-caption">Project</span>
        </div>
        <div className="project-window-body">
          <h2 id="project-window-title">{project.title}</h2>
          {project.hook ? <p className="project-window-hook">{project.hook}</p> : null}
          <p className="project-window-summary">{project.summary}</p>
          {project.tags.length > 0 ? (
            <ul className="project-window-tags">
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
          <Link className="project-window-link" href={`/projects/${project.slug}`}>
            Open project page
          </Link>
        </div>
      </dialog>
    </>
  );
}
