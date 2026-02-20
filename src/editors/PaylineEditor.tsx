import { useConfigStore } from '../store/configStore';
import type { PaylinePattern } from '../types/machine';

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6',
  '#e67e22', '#1abc9c', '#e91e63', '#00bcd4', '#8bc34a',
  '#ff7043', '#26c6da', '#ab47bc', '#66bb6a', '#ffa726'];

export function PaylineEditor() {
  const config = useConfigStore((s) => s.config);
  const setPaylines = useConfigStore((s) => s.setPaylines);
  const addPayline = useConfigStore((s) => s.addPayline);
  const removePayline = useConfigStore((s) => s.removePayline);

  const handleCellClick = (paylineId: number, reelIdx: number, rowIdx: number) => {
    const updated = config.paylines.map(pl => {
      if (pl.id !== paylineId) return pl;
      const cells = [...pl.cells];
      cells[reelIdx] = rowIdx;
      return { ...pl, cells };
    });
    setPaylines(updated);
  };

  const handleAdd = () => {
    const nextId = config.paylines.length > 0
      ? Math.max(...config.paylines.map(pl => pl.id)) + 1
      : 1;
    const newPayline: PaylinePattern = {
      id: nextId,
      cells: Array(config.reels).fill(1) as number[],
      color: COLORS[(nextId - 1) % COLORS.length]!,
    };
    addPayline(newPayline);
  };

  const addPresets = () => {
    // Clear and add standard paylines
    const presets: PaylinePattern[] = [];
    const { reels, rows } = config;

    // Horizontal rows
    for (let r = 0; r < rows; r++) {
      presets.push({
        id: r + 1,
        cells: Array(reels).fill(r) as number[],
        color: COLORS[r % COLORS.length]!,
      });
    }

    // Diagonals (if grid is square-ish)
    if (rows >= 3) {
      presets.push({
        id: rows + 1,
        cells: Array.from({ length: reels }, (_, i) => Math.min(i, rows - 1)),
        color: COLORS[(rows) % COLORS.length]!,
      });
      presets.push({
        id: rows + 2,
        cells: Array.from({ length: reels }, (_, i) => Math.max(rows - 1 - i, 0)),
        color: COLORS[(rows + 1) % COLORS.length]!,
      });
    }

    setPaylines(presets);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="panel">
        <div className="panel-header">
          <h2>📐 Payline Editor</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" onClick={addPresets}>Add Standard</button>
            <button className="btn btn-primary" onClick={handleAdd}>+ Add Payline</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {config.paylines.map((payline) => (
            <div key={payline.id} style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '16px', height: '16px',
                  borderRadius: '50%',
                  background: payline.color,
                  flexShrink: 0,
                }} />
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Line {payline.id}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  [{payline.cells.join(', ')}]
                </span>
                <button
                  className="btn btn-danger"
                  style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: '0.7rem' }}
                  onClick={() => removePayline(payline.id)}
                >
                  ✕
                </button>
              </div>

              {/* Interactive grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${config.reels}, 48px)`,
                gap: '4px',
              }}>
                {Array.from({ length: config.rows }, (_, rowIdx) =>
                  Array.from({ length: config.reels }, (_, reelIdx) => {
                    const isActive = payline.cells[reelIdx] === rowIdx;
                    return (
                      <div
                        key={`${rowIdx}-${reelIdx}`}
                        onClick={() => handleCellClick(payline.id, reelIdx, rowIdx)}
                        style={{
                          width: '48px', height: '32px',
                          background: isActive ? payline.color : 'var(--bg-panel)',
                          border: `1px solid ${isActive ? payline.color : 'var(--border)'}`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          opacity: isActive ? 1 : 0.5,
                          transition: 'all 150ms ease',
                        }}
                      />
                    );
                  })
                )}
              </div>
            </div>
          ))}

          {config.paylines.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No paylines defined. Click "Add Standard" for classic patterns or "Add Payline" to create custom ones.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
