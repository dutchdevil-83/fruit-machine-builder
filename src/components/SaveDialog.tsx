import { useState } from 'react';
import { useConfigStore } from '../store/configStore';
import { useToast } from './Toast';

import IconSave from '~icons/lucide/save';
import IconDatabase from '~icons/lucide/database';
import IconDownload from '~icons/lucide/download';
interface SaveDialogProps
{
    isOpen: boolean;
    onClose: () => void;
}

export function SaveDialog ( { isOpen, onClose }: SaveDialogProps )
{
    const config = useConfigStore( ( s ) => s.config );
    const exportJSON = useConfigStore( ( s ) => s.exportJSON );
    const { showToast } = useToast();
    const [ saveName, setSaveName ] = useState( config.name || 'My Machine' );
    const [ storageType, setStorageType ] = useState<'internal' | 'external'>( 'internal' );

    if ( !isOpen ) return null;

    const handleSave = () =>
    {
        const json = exportJSON();

        if ( storageType === 'internal' )
        {
            // Save to localStorage
            const presets = JSON.parse( localStorage.getItem( 'fmb_presets' ) || '{}' );
            presets[ saveName ] = JSON.parse( json );
            localStorage.setItem( 'fmb_presets', JSON.stringify( presets ) );
            showToast( `Saved "${ saveName }" to browser storage` );
        } else
        {
            // Download as .fmb.json file
            const blob = new Blob( [ json ], { type: 'application/json' } );
            const url = URL.createObjectURL( blob );
            const a = document.createElement( 'a' );
            a.href = url;
            a.download = `${ saveName.replace( /\s+/g, '_' ).toLowerCase() }.fmb.json`;
            a.click();
            URL.revokeObjectURL( url );
            showToast( `Exported "${ saveName }" as .fmb.json file` );
        }
        onClose();
    };

    return (
        <>
            <div
                onClick={ onClose }
                style={ {
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 15000,
                } }
            />
            <div style={ {
                position: 'fixed',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'var(--bg-card, #1e1e2e)',
                border: '1px solid var(--border, #333)',
                borderRadius: '12px',
                padding: '24px',
                zIndex: 15001,
                width: '420px',
                maxWidth: '90vw',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            } }>
                <h3 style={ { marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' } }><IconSave /> Save Machine</h3>

                {/* Name input */ }
                <div style={ { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' } }>
                    <label style={ { fontSize: '0.85rem', color: 'var(--text-secondary)' } }>Preset Name</label>
                    <input
                        type="text"
                        value={ saveName }
                        onChange={ ( e ) => setSaveName( e.target.value ) }
                        title="Preset Name"
                        placeholder="Enter preset name"
                        style={ { padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.9rem' } }
                        autoFocus
                    />
                </div>

                {/* Storage type toggle */ }
                <div style={ { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' } }>
                    <label style={ { fontSize: '0.85rem', color: 'var(--text-secondary)' } }>Save Location</label>
                    <div style={ { display: 'flex', gap: '8px' } }>
                        <button
                            className={ storageType === 'internal' ? 'btn btn-primary' : 'btn' }
                            onClick={ () => setStorageType( 'internal' ) }
                            style={ { flex: 1, fontSize: '0.85rem' } }
                        >
                            <IconDatabase /> Browser Storage
                        </button>
                        <button
                            className={ storageType === 'external' ? 'btn btn-primary' : 'btn' }
                            onClick={ () => setStorageType( 'external' ) }
                            style={ { flex: 1, fontSize: '0.85rem' } }
                        >
                            <IconDownload /> Download File
                        </button>
                    </div>
                    <p style={ { fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 } }>
                        { storageType === 'internal'
                            ? 'Saved in your browser — available on this device only.'
                            : `Downloads as "${ saveName.replace( /\s+/g, '_' ).toLowerCase() }.fmb.json" — share or edit externally.` }
                    </p>
                </div>

                {/* Actions */ }
                <div style={ { display: 'flex', gap: '8px', justifyContent: 'flex-end' } }>
                    <button className="btn" onClick={ onClose }>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={ handleSave }
                        disabled={ !saveName.trim() }
                    >
                        { storageType === 'internal' ? <><IconSave /> Save</> : <><IconDownload /> Export</> }
                    </button>
                </div>
            </div>
        </>
    );
}
