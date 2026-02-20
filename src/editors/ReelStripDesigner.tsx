import { useConfigStore } from '../store/configStore';

export function ReelStripDesigner() {
  const config = useConfigStore((s) => s.config);
  const setReelPosition = useConfigStore((s) => s.setReelPosition);

  const symbolMap = new Map(config.symbols.map(s => [s.id, s]));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="panel">
        <div className="panel-header">
          <h2>🎰 Reel Strip Designer</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {config.reels} reels × {config.stripLength} positions
          </span>
        </div>

        {/* Symbol palette */}
        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap',
          padding: '12px', background: 'var(--bg-input)',
          borderRadius: 'var(--radius-sm)', marginBottom: '16px',
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '8px' }}>
            Drag from palette:
          </span>
          {config.symbols.map((sym) => (
            <div
              key={sym.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', sym.id)}
              style={{
                width: '40px', height: '40px',
                background: 'var(--bg-panel)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'grab', border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
              title={sym.name}
            >
              {sym.image
                ? <img src={sym.image} alt={sym.name} style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
                : <span style={{ fontSize: '0.7rem' }}>{sym.name.slice(0, 2)}</span>
              }
            </div>
          ))}
          {/* Clear button */}
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', '__clear__')}
            style={{
              width: '40px', height: '40px',
              background: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'grab', color: '#fff', fontSize: '1.1rem',
            }}
            title="Clear position"
          >
            ✕
          </div>
        </div>

        {/* Reel strips */}
        <div style={{
          display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px',
        }}>
          {config.reelStrips.map((strip, reelIdx) => (
            <div key={reelIdx} style={{
              flex: `0 0 ${Math.max(120, 100)}px`,
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '8px', textAlign: 'center',
                fontWeight: 600, fontSize: '0.85rem',
                color: 'var(--warning)',
                background: 'var(--bg-panel)',
                borderBottom: '1px solid var(--border)',
                position: 'sticky', top: 0, zIndex: 2,
              }}>
                Reel {reelIdx + 1}
              </div>
              <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '4px' }}>
                {strip.map((symId, pos) => {
                  const sym = symbolMap.get(symId);
                  return (
                    <div
                      key={pos}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const droppedId = e.dataTransfer.getData('text/plain');
                        setReelPosition(reelIdx, pos, droppedId === '__clear__' ? '' : droppedId);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '4px 8px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: symId ? 'transparent' : 'rgba(255,0,0,0.05)',
                        minHeight: '44px',
                      }}
                    >
                      <span style={{
                        width: '24px', textAlign: 'right',
                        fontSize: '0.7rem', color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)', flexShrink: 0,
                      }}>
                        {pos + 1}
                      </span>
                      <div style={{
                        width: '36px', height: '36px',
                        background: 'var(--bg-panel)',
                        borderRadius: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0,
                        border: '1px solid var(--border)',
                      }}>
                        {sym?.image
                          ? <img src={sym.image} alt={sym.name} style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
                          : <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>—</span>
                        }
                      </div>
                      <span style={{ fontSize: '0.75rem', color: sym ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {sym?.name ?? '(empty)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
