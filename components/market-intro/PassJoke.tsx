'use client';

import { motion } from 'framer-motion';

type PassJokeProps = {
  onContinue: () => void;
};

export function PassJoke({ onContinue }: PassJokeProps) {
  return (
    <motion.div
      className="pass-joke"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="pass-joke-card"
        role="alertdialog"
        aria-labelledby="pass-joke-title"
        aria-describedby="pass-joke-body"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="pass-joke-eyebrow">SYSTEM NOTE</p>
        <h2 id="pass-joke-title" className="pass-joke-title">
          You passed.
        </h2>
        <p id="pass-joke-body" className="pass-joke-body">
          I didn&apos;t think anyone would ever pick this one so this is all I&apos;ve got.
        </p>
        <button type="button" className="pass-joke-btn" onClick={onContinue}>
          Continue to site
        </button>
      </motion.div>
    </motion.div>
  );
}
