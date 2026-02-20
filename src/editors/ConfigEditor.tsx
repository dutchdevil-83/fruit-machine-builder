import { useConfigStore } from '../store/configStore';
import { TemplateSelector } from '../components/TemplateSelector';

export function ConfigEditor ()
{
  const config = useConfigStore( ( s ) => s.config );
  const setName = useConfigStore( ( s ) => s.setName );
  const setReels = useConfigStore( ( s ) => s.setReels );
  const setRows = useConfigStore( ( s ) => s.setRows );
  const setStripLength = useConfigStore( ( s ) => s.setStripLength );
  const resetToDefault = useConfigStore( ( s ) => s.resetToDefault );

  return (
    <div className="fade-in" style={ { display: 'flex', flexDirection: 'column', gap: '20px' } }>
      <TemplateSelector />
      <div className="panel">
        <div className="panel-header">
          <h2>⚙️ Machine Configuration</h2>
          <button className="btn btn-danger" onClick={ resetToDefault }>
            Reset to Default
          </button>
        </div>

        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' } }>
          <FieldGroup label="Machine Name">
            <input
              type="text"
              value={ config.name }
              onChange={ ( e ) => setName( e.target.value ) }
              style={ { width: '100%' } }
            />
          </FieldGroup>

          <FieldGroup label="Number of Reels">
            <input
              type="number"
              min={ 1 }
              value={ config.reels }
              onChange={ ( e ) => setReels( Number( e.target.value ) ) }
              style={ { width: '100%' } }
            />
          </FieldGroup>

          <FieldGroup label="Visible Rows">
            <input
              type="number"
              min={ 1 }
              value={ config.rows }
              onChange={ ( e ) => setRows( Number( e.target.value ) ) }
              style={ { width: '100%' } }
            />
          </FieldGroup>

          <FieldGroup label="Strip Length">
            <input
              type="number"
              min={ 3 }
              value={ config.stripLength }
              onChange={ ( e ) => setStripLength( Number( e.target.value ) ) }
              style={ { width: '100%' } }
            />
          </FieldGroup>
        </div>
      </div>

      <div className="panel">
        <h3 style={ { marginBottom: '12px' } }>Machine Summary</h3>
        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' } }>
          <StatCard label="Symbols" value={ config.symbols.length } />
          <StatCard label="Reels" value={ config.reels } />
          <StatCard label="Rows" value={ config.rows } />
          <StatCard label="Strip Length" value={ config.stripLength } />
          <StatCard label="Paylines" value={ config.paylines.length } />
          <StatCard label="Start Credits" value={ config.settings.startCredits } />
        </div>
      </div>
    </div>
  );
}

function FieldGroup ( { label, children }: { label: string; children: React.ReactNode } )
{
  return (
    <div style={ { display: 'flex', flexDirection: 'column', gap: '4px' } }>
      <label>{ label }</label>
      { children }
    </div>
  );
}

function StatCard ( { label, value }: { label: string; value: number } )
{
  return (
    <div style={ {
      background: 'var(--bg-input)', padding: '12px 16px',
      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
    } }>
      <div style={ { fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' } }>{ value }</div>
      <div style={ { fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' } }>{ label }</div>
    </div>
  );
}
