import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateRoom } from '../../api/rooms';
import { FiEdit2, FiCheck } from 'react-icons/fi';

const PointConfig = ({ room, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [config, setConfig] = useState(room?.pointConfig || {
    earlyFive: 10, topLine: 20, middleLine: 20, bottomLine: 20, fullHouse: 50
  });
  const [saving, setSaving] = useState(false);

  const fields = [
    { key: 'earlyFive', label: 'Early Five', icon: '5️⃣' },
    { key: 'topLine', label: 'Top Line', icon: '⬆️' },
    { key: 'middleLine', label: 'Middle Line', icon: '➡️' },
    { key: 'bottomLine', label: 'Bottom Line', icon: '⬇️' },
    { key: 'fullHouse', label: 'Full House', icon: '🏠' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRoom(room._id, { pointConfig: config });
      onUpdate?.({ ...room, pointConfig: config });
      toast.success('Point configuration saved!');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
          🏆 Point Configuration
        </h3>
        {!editing ? (
          <button
            className="btn-outline"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setEditing(true)}
          >
            <FiEdit2 size={14} /> Edit
          </button>
        ) : (
          <button
            className="btn-success"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={handleSave}
            disabled={saving}
          >
            <FiCheck size={14} /> {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {fields.map(({ key, label, icon }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(30,42,74,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{icon}</span>
              <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
            </div>
            {editing ? (
              <input
                type="number"
                min={0}
                max={999}
                value={config[key]}
                onChange={(e) => setConfig({ ...config, [key]: Number(e.target.value) })}
                style={{ width: '70px', background: 'rgba(15,15,26,0.8)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', color: '#e2e8f0', textAlign: 'center', fontWeight: 700 }}
              />
            ) : (
              <span className="badge badge-yellow">{config[key]} pts</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PointConfig;
