import type { Metadata } from 'next';
import { DemoShell } from '@/components/DemoShell';
import { MacOsDesktop } from '@/components/MacOsDesktop';

export const metadata: Metadata = {
  title: 'macOS Desktop Portfolio Demo | Daniel Magro',
  description:
    'Fullscreen macOS-style desktop shell: draggable Finder, Terminal, Safari, and Resume windows above a magnifying dock.',
};

export default function MacOsDesktopDemoPage() {
  return (
    <DemoShell title="macOS Desktop Portfolio" projectHref="/projects/macos-desktop" wide>
      <MacOsDesktop />
    </DemoShell>
  );
}
