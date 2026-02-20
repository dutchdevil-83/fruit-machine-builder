import { useState } from 'react';
import { useConfigStore } from '../store/configStore';
import { TEMPLATES } from '../data/templates';
import type { TemplateInfo } from '../data/templates';

export function TemplateSelector ()
{
    const exportJSON = useConfigStore( ( s ) => s.exportJSON );
    const importJSON = useConfigStore( ( s ) => s.importJSON );
    const config = useConfigStore( ( s ) => s.config );
    const [ showConfirm, setShowConfirm ] = useState<TemplateInfo | null>( null );

    const applyTemplate = ( tpl: TemplateInfo ) =>
    {
        // 1. Auto-backup current config
        const backupName = `_auto_backup_${ new Date().toISOString().replace( /[:.]/g, '-' ) }`;
        const presetsRaw = localStorage.getItem( 'fmb_presets' );
        const db = presetsRaw ? JSON.parse( presetsRaw ) : {};
        db[ backupName ] = exportJSON();
        localStorage.setItem( 'fmb_presets', JSON.stringify( db ) );

        // 2. Apply template
        importJSON( JSON.stringify( tpl.config ) );
        setShowConfirm( null );
    };

    // Impact analysis
    const analyzeImpact = ( tpl: TemplateInfo ): string[] =>
    {
        const changes: string[] = [];
        if ( tpl.config.reels !== config.reels ) changes.push( `Reels: ${ config.reels } → ${ tpl.config.reels }` );
        if ( tpl.config.rows !== config.rows ) changes.push( `Rows: ${ config.rows } → ${ tpl.config.rows }` );
        if ( tpl.config.symbols.length !== config.symbols.length ) changes.push( `Symbols: ${ config.symbols.length } → ${ tpl.config.symbols.length }` );
        if ( tpl.config.paylines.length !== config.paylines.length ) changes.push( `Paylines: ${ config.paylines.length } → ${ tpl.config.paylines.length }` );
        if ( tpl.config.stripLength !== config.stripLength ) changes.push( `Strip length: ${ config.stripLength } → ${ tpl.config.stripLength }` );
        changes.push( 'All reel strips will be reset' );
        changes.push( 'All paytable values will be replaced' );
        return changes;
    };

    return (
        <div style={ { marginBottom: '20px' } }>
            <h3 style={ { marginBottom: '12px' } }>📋 Machine Templates</h3>
            <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' } }>
                Load a pre-built configuration. Your current config will be auto-backed up before applying.
            </p>

            <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' } }>
                { TEMPLATES.map( tpl => (
                    <div
                        key={ tpl.id }
                        style={ {
                            padding: '16px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s',
                        } }
                        onClick={ () => setShowConfirm( tpl ) }
                        onMouseEnter={ e => ( e.currentTarget.style.borderColor = 'var(--accent)' ) }
                        onMouseLeave={ e => ( e.currentTarget.style.borderColor = 'var(--border)' ) }
                    >
                        <div style={ { fontWeight: 700, marginBottom: '6px' } }>{ tpl.name }</div>
                        <div style={ { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' } }>{ tpl.description }</div>
                        <div style={ { fontSize: '0.75rem', display: 'flex', gap: '10px', color: 'var(--text-secondary)' } }>
                            <span>{ tpl.reels }×{ tpl.rows }</span>
                            <span>{ tpl.paylineCount } lines</span>
                        </div>
                    </div>
                ) ) }
            </div>

            {/* Confirmation Modal */ }
            { showConfirm && (
                <div style={ {
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 11000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                } }>
                    <div className="fade-in" style={ {
                        background: 'var(--bg-card, #1e1e2e)', border: '1px solid var(--border)',
                        borderRadius: '12px', padding: '24px', maxWidth: '480px', width: '90%',
                    } }>
                        <h3 style={ { marginBottom: '12px' } }>⚠️ Apply "{ showConfirm.name }" Template?</h3>

                        <div style={ { padding: '12px', background: 'rgba(241,196,15,0.08)', border: '1px solid rgba(241,196,15,0.3)', borderRadius: '8px', marginBottom: '16px' } }>
                            <strong style={ { fontSize: '0.85rem', color: '#f1c40f', display: 'block', marginBottom: '6px' } }>What will change:</strong>
                            <ul style={ { margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)' } }>
                                { analyzeImpact( showConfirm ).map( ( msg, i ) => <li key={ i }>{ msg }</li> ) }
                            </ul>
                        </div>

                        <div style={ { padding: '12px', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '8px', marginBottom: '16px' } }>
                            <p style={ { fontSize: '0.8rem', color: '#2ecc71', margin: 0 } }>
                                ✅ Your current config will be auto-saved as a backup preset. You can revert anytime via the <strong>Preset dropdown</strong> in the header.
                            </p>
                        </div>

                        <div style={ { display: 'flex', gap: '10px', justifyContent: 'flex-end' } }>
                            <button className="btn" onClick={ () => setShowConfirm( null ) }>Cancel</button>
                            <button className="btn btn-primary" onClick={ () => applyTemplate( showConfirm ) }>
                                Apply Template
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}
