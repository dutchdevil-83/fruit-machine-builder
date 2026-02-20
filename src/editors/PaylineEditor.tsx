import { useConfigStore } from '../store/configStore';
import type { PaylinePattern } from '../types/machine';

const COLORS = [ '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6',
  '#e67e22', '#1abc9c', '#e91e63', '#00bcd4', '#8bc34a',
  '#ff7043', '#26c6da', '#ab47bc', '#66bb6a', '#ffa726',
  '#ef5350', '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc',
  '#ff7043', '#26c6da', '#ef5350', '#42a5f5', '#66bb6a',
  '#ffa726', '#ab47bc', '#ff7043', '#26c6da', '#ef5350' ];

interface PaylinePreset
{
  id: string;
  name: string;
  description: string;
  lines: number;
  generate: ( reels: number, rows: number ) => PaylinePattern[];
}

const PAYLINE_PRESETS: PaylinePreset[] = [
  {
    id: 'classic_5', name: 'Classic 5', description: 'Horizontal rows + diagonals', lines: 5,
    generate: ( reels, rows ) =>
    {
      const pls: PaylinePattern[] = [];
      // Horizontal rows (up to 3)
      for ( let r = 0; r < Math.min( rows, 3 ); r++ )
      {
        pls.push( { id: pls.length + 1, cells: Array( reels ).fill( r ) as number[], color: COLORS[ pls.length % COLORS.length ]! } );
      }
      // Diagonals
      if ( rows >= 3 )
      {
        pls.push( { id: pls.length + 1, cells: Array.from( { length: reels }, ( _, i ) => Math.min( i, rows - 1 ) ), color: COLORS[ pls.length % COLORS.length ]! } );
        pls.push( { id: pls.length + 1, cells: Array.from( { length: reels }, ( _, i ) => Math.max( rows - 1 - i, 0 ) ), color: COLORS[ pls.length % COLORS.length ]! } );
      }
      return pls.slice( 0, 5 );
    },
  },
  {
    id: 'zigzag_10', name: 'Zigzag 10', description: 'Zigzag + V-shapes', lines: 10,
    generate: ( reels, rows ) =>
    {
      const pls: PaylinePattern[] = [];
      // Horizontal rows
      for ( let r = 0; r < rows; r++ )
      {
        pls.push( { id: pls.length + 1, cells: Array( reels ).fill( r ) as number[], color: COLORS[ pls.length % COLORS.length ]! } );
      }
      // Diagonals
      pls.push( { id: pls.length + 1, cells: Array.from( { length: reels }, ( _, i ) => i % rows ), color: COLORS[ pls.length % COLORS.length ]! } );
      pls.push( { id: pls.length + 1, cells: Array.from( { length: reels }, ( _, i ) => ( rows - 1 - i % rows ) ), color: COLORS[ pls.length % COLORS.length ]! } );
      // Zigzag patterns
      pls.push( { id: pls.length + 1, cells: Array.from( { length: reels }, ( _, i ) => i % 2 === 0 ? 0 : rows - 1 ), color: COLORS[ pls.length % COLORS.length ]! } );
      pls.push( { id: pls.length + 1, cells: Array.from( { length: reels }, ( _, i ) => i % 2 === 0 ? rows - 1 : 0 ), color: COLORS[ pls.length % COLORS.length ]! } );
      // V-shape
      const mid = Math.floor( reels / 2 );
      pls.push( { id: pls.length + 1, cells: Array.from( { length: reels }, ( _, i ) => Math.min( Math.abs( i - mid ), rows - 1 ) ), color: COLORS[ pls.length % COLORS.length ]! } );
      pls.push( { id: pls.length + 1, cells: Array.from( { length: reels }, ( _, i ) => Math.max( rows - 1 - Math.abs( i - mid ), 0 ) ), color: COLORS[ pls.length % COLORS.length ]! } );
      return pls.slice( 0, 10 );
    },
  },
  {
    id: 'vegas_20', name: 'Vegas 20', description: 'Full 20-line coverage', lines: 20,
    generate: ( reels, rows ) =>
    {
      const pls: PaylinePattern[] = [];
      for ( let i = 0; i < 20; i++ )
      {
        pls.push( {
          id: i + 1,
          cells: Array.from( { length: reels }, ( _, r ) => ( i + r ) % rows ),
          color: COLORS[ i % COLORS.length ]!,
        } );
      }
      return pls;
    },
  },
  {
    id: 'mega_30', name: 'Mega 30', description: 'All possible paths', lines: 30,
    generate: ( reels, rows ) =>
    {
      const pls: PaylinePattern[] = [];
      for ( let i = 0; i < 30; i++ )
      {
        pls.push( {
          id: i + 1,
          cells: Array.from( { length: reels }, ( _, r ) => ( i + r * ( i % 3 === 0 ? 1 : i % 3 === 1 ? -1 : 2 ) + rows * 10 ) % rows ),
          color: COLORS[ i % COLORS.length ]!,
        } );
      }
      return pls;
    },
  },
];

export function PaylineEditor ()
{
  const config = useConfigStore( ( s ) => s.config );
  const setPaylines = useConfigStore( ( s ) => s.setPaylines );
  const addPayline = useConfigStore( ( s ) => s.addPayline );
  const removePayline = useConfigStore( ( s ) => s.removePayline );

  const handleCellClick = ( paylineId: number, reelIdx: number, rowIdx: number ) =>
  {
    const updated = config.paylines.map( pl =>
    {
      if ( pl.id !== paylineId ) return pl;
      const cells = [ ...pl.cells ];
      cells[ reelIdx ] = rowIdx;
      return { ...pl, cells };
    } );
    setPaylines( updated );
  };

  const handleAdd = () =>
  {
    const nextId = config.paylines.length > 0
      ? Math.max( ...config.paylines.map( pl => pl.id ) ) + 1
      : 1;
    const newPayline: PaylinePattern = {
      id: nextId,
      cells: Array( config.reels ).fill( 1 ) as number[],
      color: COLORS[ ( nextId - 1 ) % COLORS.length ]!,
    };
    addPayline( newPayline );
  };

  const loadPreset = ( preset: PaylinePreset ) =>
  {
    const paylines = preset.generate( config.reels, config.rows );
    setPaylines( paylines );
  };

  return (
    <div className="fade-in" style={ { display: 'flex', flexDirection: 'column', gap: '20px' } }>
      <div className="panel">
        <div className="panel-header">
          <h2>📐 Payline Editor</h2>
          <div style={ { display: 'flex', gap: '8px' } }>
            <button className="btn btn-primary" onClick={ handleAdd }>+ Add Payline</button>
          </div>
        </div>

        {/* Preset buttons */ }
        <div style={ { marginBottom: '16px' } }>
          <div style={ { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' } }>
            Load Preset
          </div>
          <div style={ { display: 'flex', gap: '8px', flexWrap: 'wrap' } }>
            { PAYLINE_PRESETS.map( preset => (
              <button
                key={ preset.id }
                className="btn"
                onClick={ () => loadPreset( preset ) }
                title={ preset.description }
                style={ { fontSize: '0.8rem' } }
              >
                { preset.name } ({ preset.lines } lines)
              </button>
            ) ) }
          </div>
        </div>

        <div style={ { display: 'flex', flexDirection: 'column', gap: '16px' } }>
          { config.paylines.map( ( payline ) => (
            <div key={ payline.id } style={ {
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              padding: '12px',
            } }>
              <div style={ { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' } }>
                <div style={ {
                  width: '16px', height: '16px',
                  borderRadius: '50%',
                  background: payline.color,
                  flexShrink: 0,
                } } />
                <span style={ { fontWeight: 600, fontSize: '0.85rem' } }>
                  Line { payline.id }
                </span>
                <span style={ { fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' } }>
                  [{ payline.cells.join( ', ' ) }]
                </span>
                <button
                  className="btn btn-danger"
                  style={ { marginLeft: 'auto', padding: '2px 8px', fontSize: '0.7rem' } }
                  onClick={ () => removePayline( payline.id ) }
                >
                  ✕
                </button>
              </div>

              {/* Interactive grid */ }
              <div style={ {
                display: 'grid',
                gridTemplateColumns: `repeat(${ config.reels }, 48px)`,
                gap: '4px',
              } }>
                { Array.from( { length: config.rows }, ( _, rowIdx ) =>
                  Array.from( { length: config.reels }, ( _, reelIdx ) =>
                  {
                    const isActive = payline.cells[ reelIdx ] === rowIdx;
                    return (
                      <div
                        key={ `${ rowIdx }-${ reelIdx }` }
                        onClick={ () => handleCellClick( payline.id, reelIdx, rowIdx ) }
                        style={ {
                          width: '48px', height: '32px',
                          background: isActive ? payline.color : 'var(--bg-panel)',
                          border: `1px solid ${ isActive ? payline.color : 'var(--border)' }`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          opacity: isActive ? 1 : 0.5,
                          transition: 'all 150ms ease',
                        } }
                      />
                    );
                  } )
                ) }
              </div>
            </div>
          ) ) }

          { config.paylines.length === 0 && (
            <div style={ { textAlign: 'center', padding: '40px', color: 'var(--text-muted)' } }>
              No paylines defined. Select a preset above or click "Add Payline" to create custom ones.
            </div>
          ) }
        </div>
      </div>
    </div>
  );
}
