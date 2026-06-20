import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NumberBoard = ({ calledNumbers = [], currentNumber = null }) => {
  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers]);

  const columns = [
    { label: 'B', range: [1, 9], color: '#6366f1' },
    { label: 'I', range: [10, 19], color: '#8b5cf6' },
    { label: 'N', range: [20, 29], color: '#a855f7' },
    { label: 'G', range: [30, 39], color: '#3b82f6' },
    { label: 'O', range: [40, 49], color: '#06b6d4' },
    { label: '', range: [50, 59], color: '#10b981' },
    { label: '', range: [60, 69], color: '#f59e0b' },
    { label: '', range: [70, 79], color: '#ef4444' },
    { label: '', range: [80, 90], color: '#ec4899' },
  ];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
          📊 Number Board
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {calledNumbers.length} / 90 called
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '3px' }}>
        {columns.map(({ label, range, color }) => {
          const nums = [];
          for (let i = range[0]; i <= range[1]; i++) nums.push(i);
          return nums.map((num) => {
            const isCalled = calledSet.has(num);
            const isCurrent = num === currentNumber;
            return (
              <AnimatePresence key={num} mode="wait">
                <motion.div
                  className={`number-ball ${isCurrent ? 'current' : isCalled ? 'called' : 'not-called'}`}
                  style={isCurrent ? {} : isCalled ? { background: `${color}33`, color: color, border: `1px solid ${color}66` } : {}}
                  initial={isCurrent ? { scale: 0.5, rotate: -10 } : {}}
                  animate={isCurrent ? { scale: 1, rotate: 0 } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
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
