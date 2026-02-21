import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SeasonLite } from '../types/content';
import './SeasonSelector.css';

export type { SeasonLite };

interface SeasonSelectorProps {
  seasons: SeasonLite[];
  selectedIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  seasons,
  selectedIndex,
  onChange,
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = seasons[selectedIndex];
  const selectedLabel = (
    selected?.title || selected?.name || selected?.id || `Season ${selectedIndex + 1}`
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const toggle = () => setOpen((v) => !v);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      const next = Math.min(seasons.length - 1, selectedIndex + 1);
      onChange(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      const prev = Math.max(0, selectedIndex - 1);
      onChange(prev);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  const handleSelect = (idx: number) => {
    onChange(idx);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`season-selector ${className}`}>
      <button
        type="button"
        className={`season-trigger ${open ? 'open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        <span className="season-trigger-label">{selectedLabel}</span>
        <span className="season-trigger-caret" aria-hidden>
          {/* down chevron */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="season-list"
            role="listbox"
            aria-label="Select season"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {seasons.map((s, idx) => {
              const label = s.title || s.name || s.id || `Season ${idx + 1}`;
              return (
                <li
                  key={s.id || label || idx}
                  role="option"
                  aria-selected={idx === selectedIndex}
                  className={`season-option ${idx === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelect(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(idx);
                    }
                  }}
                  tabIndex={0}
                >
                  <span className="season-option-label">{label}</span>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeasonSelector;

