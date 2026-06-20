import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TambolaTicket = ({ ticket, calledNumbers = [], highlightNew = null }) => {
  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers]);

  if (!ticket) {
    return (
      <div className="card text-center" style={{ padding: '2rem' }}>
        <p style={{ color: '#64748b' }}>Waiting for ticket...</p>
      </div>
    );
  }

  const rowLabels = ['Top', 'Middle', 'Bottom'];
  const rowColors = ['rgba(99,102,241,0.15)', 'rgba(168,85,247,0.1)', 'rgba(59,130,246,0.1)'];

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
          🎫 Your Ticket
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {ticket.numbers?.filter(n => calledSet.has(n)).length || 0} / {ticket.numbers?.length || 15} matched
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {ticket.rows?.map((row, rowIdx) => (
          <div key={rowIdx} style={{ background: rowColors[rowIdx], borderRadius: '8px', padding: '6px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '4px' }}>
              {row.map((num, colIdx) => {
                const isEmpty = num === 0;
                const isMatched = !isEmpty && calledSet.has(num);
                const isNew = num === highlightNew;

                return (
                  <AnimatePresence key={colIdx} mode="wait">
                    <motion.div
                      className={`ticket-cell ${isEmpty ? 'empty' : isMatched ? 'matched' : 'uncalled'}`}
                      initial={isNew ? { scale: 0.5 } : {}}
                      animate={isNew ? { scale: [0.5, 1.2, 1] } : {}}
                      transition={{ duration: 0.4 }}
                      style={{ minHeight: '44px' }}
                    >
                      {isEmpty ? '' : num}
                    </motion.div>
                  </AnimatePresence>
                );
              })}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', paddingLeft: '2px' }}>
              {rowLabels[rowIdx]} Row
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ height: '4px', background: 'rgba(30,42,74,0.8)', borderRadius: '2px', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '2px' }}
            initial={{ width: 0 }}
            animate={{ width: `${((ticket.numbers?.filter(n => calledSet.has(n)).length || 0) / (ticket.numbers?.length || 15)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default TambolaTicket;
