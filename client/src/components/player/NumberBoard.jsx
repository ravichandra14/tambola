import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = [
  { label: '1-9',   range: [1, 9],   color: '#6366f1', bg: 'rgba(99,102,241,0.25)' },
  { label: '10-19', range: [10, 19], color: '#8b5cf6', bg: 'rgba(139,92,246,0.25)' },
  { label: '20-29', range: [20, 29], color: '#a855f7', bg: 'rgba(168,85,247,0.25)' },
  { label: '30-39', range: [30, 39], color: '#3b82f6', bg: 'rgba(59,130,246,0.25)' },
  { label: '40-49', range: [40, 49], color: '#06b6d4', bg: 'rgba(6,182,212,0.25)' },
  { label: '50-59', range: [50, 59], color: '#10b981', bg: 'rgba(16,185,129,0.25)' },
  { label: '60-69', range: [60, 69], color: '#f59e0b', bg: 'rgba(245,158,11,0.25)' },
  { label: '70-79', range: [70, 79], color: '#ef4444', bg: 'rgba(239,68,68,0.25)' },
  { label: '80-90', range: [80, 90], color: '#ec4899', bg: 'rgba(236,72,153,0.25)' },
];

const NumberBoard = ({ calledNumbers = [], currentNumber = null }) => {
  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers]);

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: 0, fontSize: '1rem' }}>
          📊 Number Board
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            <span style={{ color: '#6366f1', fontWeight: 700 }}>{calledNumbers.length}</span> / 90 called
          </span>
        </div>
      </div>

      {/* Column color legend strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '3px', marginBottom: '4px' }}>
        {COLUMNS.map(({ color, label }) => (
          <div key={label} style={{
            height: '3px', borderRadius: '2px',
            background: color, opacity: 0.6,
          }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '3px' }}>
        {COLUMNS.map(({ range, color, bg }) => {
          const nums = [];
          for (let i = range[0]; i <= range[1]; i++) nums.push(i);
          return nums.map((num) => {
            const isCalled = calledSet.has(num);
            const isCurrent = num === currentNumber;
            return (
              <AnimatePresence key={num} mode="wait">
                <motion.div
                  className={`number-ball ${isCurrent ? 'current' : isCalled ? 'called' : 'not-called'}`}
                  style={isCurrent
                    ? {}
                    : isCalled
                      ? { background: bg, color, border: `1px solid ${color}55`, boxShadow: `0 0 8px ${color}30` }
                      : {}
                  }
                  initial={isCurrent ? { scale: 0.4, rotate: -15 } : {}}
                  animate={isCurrent ? { scale: 1, rotate: 0 } : {}}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                >
                  {num}
                </motion.div>
              </AnimatePresence>
            );
          });
        })}
      </div>
    </div>
  );
};

export default NumberBoard;
