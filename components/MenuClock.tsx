'use client';

import { useEffect, useState } from 'react';

const timeFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function MenuClock() {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const update = () => setLabel(timeFormat.format(new Date()));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time className="menu-clock" suppressHydrationWarning>
      {label || '\u00a0'}
    </time>
  );
}
