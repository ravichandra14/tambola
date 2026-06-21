import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TambolaTicket = ({ ticket, calledNumbers = [], highlightNew = null }) => {
  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers]);
  const matchedCount = ticket?.numbers?.filter(n => calledSet.has(n)).length || 0;
  const totalCount = ticket?.numbers?.length || 15;
  const progressPct = (matchedCount / totalCount) * 100;

  if (!ticket) {
    return (
      <div style={{
        position: 'relative', borderRadius: '1.1rem', padding: '2px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.2))',
      }}>
        <div className="card" style={{ borderRadius: '1rem', textAlign: 'center', padding: '2.5rem', border: 'none' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎫</div>
          <p style={{ color: '#64748b', fontWeight: 500 }}>Waiting for ticket...</p>
          <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.25rem' }}>Your ticket will appear when the game starts</p>
        </div>
      </div>
    );
  }

  const rowLabels = ['Top Row', 'Middle Row', 'Bottom Row'];
  const rowGradients = [
    'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.06))',
    'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(124,58,237,0.05))',
    'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))',
  ];
  const rowBorders = [
    'rgba(99,102,241,0.18)',
    'rgba(168,85,247,0.15)',
    'rgba(59,130,246,0.15)',
  ];

  return (
    <div style={{
      position: 'relative', borderRadius: '1.1rem', padding: '2px',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.45), rgba(168,85,247,0.35), rgba(59,130,246,0.25))',
      boxShadow: '0 8px 32px rgba(99,102,241,0.12)',
    }}>
      <div style={{ background: 'rgba(13,13,24,0.95)', borderRadius: '1rem', padding: '1rem 1rem 0.875rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: '#e2e8f0', margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎫 <span>Your Ticket</span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              {matchedCount}/{totalCount}
            </span>
            {matchedCount > 0 && (
              <span className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                {Math.round(progressPct)}% matched
              </span>
            )}
          </div>
        </div>

        {/* Ticket rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {ticket.rows?.map((row, rowIdx) => (
            <div key={rowIdx} style={{
              background: rowGradients[rowIdx],
              border: `1px solid ${rowBorders[rowIdx]}`,
              borderRadius: '8px', padding: '5px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '3px' }}>
                {row.map((num, colIdx) => {
                  const isEmpty = num === 0;
                  const isMatched = !isEmpty && calledSet.has(num);
                  const isNew = num === highlightNew;

                  return (
                    <AnimatePresence key={colIdx} mode="wait">
                      <motion.div
                        className={`ticket-cell ${isEmpty ? 'empty' : isMatched ? 'matched' : 'uncalled'}`}
                        initial={isNew ? { scale: 0.4, rotate: -15 } : {}}
                        animate={isNew ? { scale: [0.4, 1.25, 1], rotate: [- 15, 5, 0] } : {}}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                      >
                        {isEmpty ? '' : num}
                      </motion.div>
                    </AnimatePresence>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: '3px', paddingLeft: '2px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {rowLabels[rowIdx]}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ height: '5px', background: 'rgba(30,42,74,0.8)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7, #22c55e)', borderRadius: '3px' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TambolaTicket;
