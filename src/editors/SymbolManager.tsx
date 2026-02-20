import { useState } from 'react';
import { useConfigStore } from '../store/configStore';
import type { SymbolDef } from '../types/machine';

export function SymbolManager ()
{
  const symbols = useConfigStore( ( s ) => s.config.symbols );
  const addSymbol = useConfigStore( ( s ) => s.addSymbol );
  const updateSymbol = useConfigStore( ( s ) => s.updateSymbol );
  const removeSymbol = useConfigStore( ( s ) => s.removeSymbol );
  const renameSymbol = useConfigStore( ( s ) => s.renameSymbol );
  const [ editId, setEditId ] = useState<string | null>( null );

  const sanitizeId = ( name: string ): string =>
  {
    const base = name.toLowerCase().replace( /[^a-z0-9]+/g, '_' ).replace( /^_|_$/g, '' );
    return `sym_${ base || 'unnamed' }`;
  };

  const isIdTaken = ( id: string, excludeId?: string ): boolean =>
  {
    return symbols.some( s => s.id === id && s.id !== excludeId );
  };

  const generateUniqueId = ( name: string, excludeId?: string ): string =>
  {
    let id = sanitizeId( name );
    if ( !isIdTaken( id, excludeId ) ) return id;
    let counter = 2;
    while ( isIdTaken( `${ id }_${ counter }`, excludeId ) ) counter++;
    return `${ id }_${ counter }`;
  };

  const handleAdd = () =>
  {
    const name = 'New Symbol';
    const id = generateUniqueId( name );
    const newSym: SymbolDef = {
      id,
      name,
      image: '',
      isWild: false,
    };
    addSymbol( newSym );
    setEditId( id );
  };

  const handleNameChange = ( oldId: string, newName: string ) =>
  {
    updateSymbol( oldId, { name: newName } );
    const newId = generateUniqueId( newName, oldId );
    if ( newId !== oldId )
    {
      renameSymbol( oldId, newId );
      if ( editId === oldId ) setEditId( newId );
    }
  };

  const handleImageUpload = ( symId: string ) =>
  {
    const input = document.createElement( 'input' );
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () =>
    {
      const file = input.files?.[ 0 ];
      if ( !file ) return;
      const reader = new FileReader();
      reader.onload = ( e ) =>
      {
        const result = e.target?.result;
        if ( typeof result === 'string' )
        {
          updateSymbol( symId, { image: result } );
        }
      };
      reader.readAsDataURL( file );
    };
    input.click();
  };

  return (
    <div className="fade-in" style={ { display: 'flex', flexDirection: 'column', gap: '20px' } }>
      <div className="panel">
        <div className="panel-header">
          <h2>🎨 Symbol Manager</h2>
          <button className="btn btn-primary" onClick={ handleAdd }>
            + Add Symbol
          </button>
        </div>

        <div style={ {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '12px'
        } }>
          { symbols.map( ( sym ) => (
            <SymbolCard
              key={ sym.id }
              symbol={ sym }
              isEditing={ editId === sym.id }
              onEdit={ () => setEditId( editId === sym.id ? null : sym.id ) }
              onUpdate={ ( updates ) => updateSymbol( sym.id, updates ) }
              onNameChange={ ( newName ) => handleNameChange( sym.id, newName ) }
              onRemove={ () => { removeSymbol( sym.id ); if ( editId === sym.id ) setEditId( null ); } }
              onUploadImage={ () => handleImageUpload( sym.id ) }
            />
          ) ) }
        </div>
      </div>
    </div>
  );
}

function SymbolCard ( {
  symbol, isEditing, onEdit, onUpdate, onNameChange, onRemove, onUploadImage,
}: {
  symbol: SymbolDef;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: ( u: Partial<SymbolDef> ) => void;
  onNameChange: ( newName: string ) => void;
  onRemove: () => void;
  onUploadImage: () => void;
} )
{
  return (
    <div style={ {
      background: 'var(--bg-input)',
      border: `1px solid ${ isEditing ? 'var(--accent)' : 'var(--border)' }`,
      borderRadius: 'var(--radius-md)',
      padding: '12px',
      transition: 'border-color var(--transition)',
    } }>
      <div style={ { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isEditing ? '12px' : '0' } }>
        {/* Symbol preview */ }
        <div
          onClick={ onUploadImage }
          style={ {
            width: '48px', height: '48px',
            background: 'var(--bg-panel)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: '1px dashed var(--border)',
            overflow: 'hidden', flexShrink: 0,
          } }
          title="Click to upload image"
        >
          { symbol.image
            ? <img src={ symbol.image } alt={ symbol.name } style={ { width: '100%', height: '100%', objectFit: 'contain' } } />
            : <span style={ { fontSize: '1.4rem', opacity: 0.4 } }>+</span>
          }
        </div>

        <div style={ { flex: 1, minWidth: 0 } }>
          <div style={ { fontWeight: 600, fontSize: '0.9rem' } }>{ symbol.name }</div>
          <div style={ { fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' } }>
            { symbol.id }
          </div>
        </div>

        <div style={ { display: 'flex', gap: '4px', flexShrink: 0 } }>
          { symbol.isWild && <span className="badge badge-warning">WILD</span> }
          <button className="btn" onClick={ onEdit } style={ { padding: '4px 8px', fontSize: '0.75rem' } }>
            { isEditing ? '✓' : '✎' }
          </button>
        </div>
      </div>

      { isEditing && (
        <div style={ { display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' } }>
          <div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
            <label style={ { width: '50px' } }>Name</label>
            <input
              type="text"
              value={ symbol.name }
              onChange={ ( e ) => onNameChange( e.target.value ) }
              style={ { flex: 1 } }
            />
          </div>
          <div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
            <label style={ { width: '50px' } }>Wild</label>
            <input
              type="checkbox"
              checked={ symbol.isWild }
              onChange={ ( e ) => onUpdate( { isWild: e.target.checked } ) }
            />
          </div>
          <button className="btn btn-danger" onClick={ onRemove } style={ { fontSize: '0.75rem', alignSelf: 'flex-end' } }>
            Delete Symbol
          </button>
        </div>
      ) }
    </div>
  );
}
