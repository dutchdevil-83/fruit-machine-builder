import { useState } from 'react';
import { HELP_CONTENT } from '../data/helpContent';
import type { EditorTab } from '../types/machine';

interface HelpPanelProps
{
    tab: EditorTab;
}

export function HelpPanel ( { tab }: HelpPanelProps )
{
    const [ isOpen, setIsOpen ] = useState( false );
    const help = HELP_CONTENT[ tab ];
    if ( !help ) return null;

    return (
        <div style={ { marginBottom: '16px' } }>
            <button
                className="btn"
                onClick={ () => setIsOpen( !isOpen ) }
                style={ {
                    fontSize: '0.85rem',
                    padding: '6px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isOpen ? 'var(--accent)' : undefined,
                    color: isOpen ? '#fff' : undefined,
                } }
            >
                { isOpen ? '✕ Close Help' : '❓ Help & Tips' }
            </button>

            { isOpen && (
                <div
                    className="fade-in"
                    style={ {
                        marginTop: '12px',
                        padding: '16px 20px',
                        background: 'rgba(108, 99, 255, 0.06)',
                        border: '1px solid rgba(108, 99, 255, 0.2)',
                        borderRadius: 'var(--radius-md)',
                    } }
                >
                    <h3 style={ { marginBottom: '8px', color: 'var(--accent)' } }>{ help.title }</h3>
                    <p style={ { fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 } }>
                        { help.description }
                    </p>
                    <div style={ { fontSize: '0.85rem' } }>
                        <strong style={ { display: 'block', marginBottom: '6px' } }>💡 Tips:</strong>
                        <ul style={ { margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' } }>
                            { help.tips.map( ( tip, i ) => (
                                <li key={ i } style={ { color: 'var(--text-secondary)' } }>{ tip }</li>
                            ) ) }
                        </ul>
                    </div>
                </div>
            ) }
        </div>
    );
}
