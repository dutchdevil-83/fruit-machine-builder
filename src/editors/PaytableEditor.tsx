import { useConfigStore } from '../store/configStore';

export function PaytableEditor ()
{
  const config = useConfigStore( ( s ) => s.config );
  const setPaytableEntry = useConfigStore( ( s ) => s.setPaytableEntry );
  const symbolMap = new Map( config.symbols.map( s => [ s.id, s ] ) );

  // Possible match counts based on reel count and minMatchCount
  const minMatch = config.minMatchCount ?? 3;
  const matchCounts = Array.from( { length: config.reels - minMatch + 1 }, ( _, i ) => i + minMatch );

  // Merge symbols with existing paytable entries
  const entries = config.symbols.map( ( sym ) =>
  {
    const existing = config.paytable.find( pt => pt.symbolId === sym.id );
    return {
      symbol: sym,
      payouts: existing?.payouts ?? {},
      twoSymbolStrategy: existing?.twoSymbolStrategy ?? { enabled: false, payout: 0 },
    };
  } );

  const handlePayoutChange = ( symbolId: string, matchCount: number, value: string ) =>
  {
    const numVal = parseInt( value ) || 0;
    const existing = config.paytable.find( pt => pt.symbolId === symbolId );
    const payouts = { ...( existing?.payouts ?? {} ), [ matchCount ]: numVal };
    if ( numVal === 0 ) delete payouts[ matchCount ];
    setPaytableEntry( symbolId, payouts );
  };

  const handleTwoSymbolToggle = ( symbolId: string, enabled: boolean ) =>
  {
    const existing = config.paytable.find( pt => pt.symbolId === symbolId );
    const payouts = existing?.payouts ?? {};
    const twoSymbolStrategy = { enabled, payout: existing?.twoSymbolStrategy?.payout ?? 5 };
    setPaytableEntry( symbolId, payouts );
    // Update the entry with twoSymbolStrategy via direct paytable mutation
    // For now we piggyback on the 2-match payout key
    if ( enabled && twoSymbolStrategy.payout > 0 )
    {
      setPaytableEntry( symbolId, { ...payouts, 2: twoSymbolStrategy.payout } );
    } else
    {
      const cleaned = { ...payouts };
      delete cleaned[ 2 ];
      setPaytableEntry( symbolId, cleaned );
    }
  };

  const handleTwoSymbolPayout = ( symbolId: string, value: string ) =>
  {
    const numVal = parseInt( value ) || 0;
    const existing = config.paytable.find( pt => pt.symbolId === symbolId );
    if ( !existing ) return;
    setPaytableEntry( symbolId, { ...existing.payouts, 2: numVal } );
  };

  return (
    <div className="fade-in" style={ { display: 'flex', flexDirection: 'column', gap: '20px' } }>
      <div className="panel">
        <div className="panel-header">
          <h2>💰 Paytable Editor</h2>
          <span style={ { color: 'var(--text-secondary)', fontSize: '0.8rem' } }>
            { config.symbols.length } symbols × { matchCounts.length } match types
            { minMatch === 2 && ' (2-symbol wins enabled)' }
          </span>
        </div>

        <div style={ { overflowX: 'auto' } }>
          <table style={ {
            width: '100%', borderCollapse: 'collapse',
            fontSize: '0.85rem',
          } }>
            <thead>
              <tr style={ { borderBottom: '2px solid var(--border)' } }>
                <th style={ { ...thStyle, width: '200px', textAlign: 'left' } }>Symbol</th>
                { matchCounts.map( n => (
                  <th key={ n } style={ thStyle }>{ n }-of-a-kind</th>
                ) ) }
              </tr>
            </thead>
            <tbody>
              { entries.map( ( { symbol, payouts } ) =>
              {
                const sym = symbolMap.get( symbol.id );
                return (
                  <tr key={ symbol.id } style={ { borderBottom: '1px solid rgba(255,255,255,0.05)' } }>
                    <td style={ { padding: '8px', display: 'flex', alignItems: 'center', gap: '10px' } }>
                      <div style={ {
                        width: '32px', height: '32px',
                        background: 'var(--bg-input)',
                        borderRadius: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0,
                      } }>
                        { sym?.image
                          ? <img src={ sym.image } alt={ sym.name } style={ { width: '90%', height: '90%', objectFit: 'contain' } } />
                          : <span style={ { fontSize: '0.7rem' } }>?</span>
                        }
                      </div>
                      <div>
                        <div style={ { fontWeight: 500 } }>{ symbol.name }</div>
                        { symbol.isWild && <span className="badge badge-warning" style={ { fontSize: '0.6rem' } }>WILD</span> }
                      </div>
                    </td>
                    { matchCounts.map( n => (
                      <td key={ n } style={ { padding: '8px', textAlign: 'center' } }>
                        <input
                          type="number"
                          min={ 0 }
                          title={ `${ symbol.name } ${ n }-of-a-kind payout` }
                          value={ payouts[ n ] ?? 0 }
                          onChange={ ( e ) => handlePayoutChange( symbol.id, n, e.target.value ) }
                          style={ {
                            width: '80px', textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: ( payouts[ n ] ?? 0 ) > 0 ? 700 : 400,
                            color: ( payouts[ n ] ?? 0 ) > 0 ? 'var(--win-gold)' : 'var(--text-muted)',
                          } }
                        />
                      </td>
                    ) ) }
                  </tr>
                );
              } ) }
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Symbol Strategy Section */ }
      { minMatch <= 2 && (
        <div className="panel">
          <div className="panel-header">
            <h2>🎯 2-Symbol Strategy</h2>
            <span style={ { color: 'var(--text-secondary)', fontSize: '0.8rem' } }>
              Configure which symbols pay for 2-of-a-kind matches
            </span>
          </div>
          <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' } }>
            Select symbols that should pay when only 2 matching symbols appear on a payline (patterns like [x,x,0]).
            Only non-wild symbols are eligible.
          </p>
          <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' } }>
            { config.symbols.filter( s => !s.isWild ).map( sym =>
            {
              const ptEntry = config.paytable.find( pt => pt.symbolId === sym.id );
              const twoStrat = ptEntry?.twoSymbolStrategy;
              const enabled = twoStrat?.enabled ?? false;
              const payout = twoStrat?.payout ?? 5;
              return (
                <div key={ sym.id } style={ {
                  background: 'var(--bg-input)',
                  border: `1px solid ${ enabled ? 'var(--accent)' : 'var(--border)' }`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'border-color 150ms ease',
                } }>
                  <input
                    type="checkbox"
                    title={ `Enable 2-symbol payout for ${ sym.name }` }
                    checked={ enabled }
                    onChange={ ( e ) => handleTwoSymbolToggle( sym.id, e.target.checked ) }
                  />
                  <span style={ { fontSize: '0.85rem', flex: 1 } }>{ sym.name }</span>
                  { enabled && (
                    <input
                      type="number"
                      title={ `2-symbol payout for ${ sym.name }` }
                      min={ 1 }
                      value={ payout }
                      onChange={ ( e ) => handleTwoSymbolPayout( sym.id, e.target.value ) }
                      style={ {
                        width: '60px', textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--win-gold)',
                      } }
                    />
                  ) }
                </div>
              );
            } ) }
          </div>
        </div>
      ) }
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
