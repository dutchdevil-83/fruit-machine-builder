import { useConfigStore } from '../store/configStore';

export function PaytableEditor() {
  const config = useConfigStore((s) => s.config);
  const setPaytableEntry = useConfigStore((s) => s.setPaytableEntry);
  const symbolMap = new Map(config.symbols.map(s => [s.id, s]));

  // Possible match counts based on reel count
  const matchCounts = Array.from({ length: config.reels - 2 }, (_, i) => i + 3);

  // Merge symbols with existing paytable entries
  const entries = config.symbols.map((sym) => {
    const existing = config.paytable.find(pt => pt.symbolId === sym.id);
    return {
      symbol: sym,
      payouts: existing?.payouts ?? {},
    };
  });

  const handlePayoutChange = (symbolId: string, matchCount: number, value: string) => {
    const numVal = parseInt(value) || 0;
    const existing = config.paytable.find(pt => pt.symbolId === symbolId);
    const payouts = { ...(existing?.payouts ?? {}), [matchCount]: numVal };
    if (numVal === 0) delete payouts[matchCount];
    setPaytableEntry(symbolId, payouts);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="panel">
        <div className="panel-header">
          <h2>💰 Paytable Editor</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {config.symbols.length} symbols × {matchCounts.length} match types
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: '0.85rem',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ ...thStyle, width: '200px', textAlign: 'left' }}>Symbol</th>
                {matchCounts.map(n => (
                  <th key={n} style={thStyle}>{n}-of-a-kind</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(({ symbol, payouts }) => {
                const sym = symbolMap.get(symbol.id);
                return (
                  <tr key={symbol.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px',
                        background: 'var(--bg-input)',
                        borderRadius: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0,
                      }}>
                        {sym?.image
                          ? <img src={sym.image} alt={sym.name} style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
                          : <span style={{ fontSize: '0.7rem' }}>?</span>
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{symbol.name}</div>
                        {symbol.isWild && <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>WILD</span>}
                      </div>
                    </td>
                    {matchCounts.map(n => (
                      <td key={n} style={{ padding: '8px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min={0}
                          value={payouts[n] ?? 0}
                          onChange={(e) => handlePayoutChange(symbol.id, n, e.target.value)}
                          style={{
                            width: '80px', textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: (payouts[n] ?? 0) > 0 ? 700 : 400,
                            color: (payouts[n] ?? 0) > 0 ? 'var(--win-gold)' : 'var(--text-muted)',
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 8px',
  fontWeight: 600,
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};
