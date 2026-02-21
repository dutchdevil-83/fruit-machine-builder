import { useState, useMemo } from 'react';
import { useConfigStore } from '../store/configStore';
import { detectCorporateDevice } from '../utils/deviceDetector';

import IconPackage from '~icons/lucide/package';
import IconGlobe from '~icons/lucide/globe';
import IconMonitor from '~icons/lucide/monitor';
import IconLock from '~icons/lucide/lock';
import IconPartyPopper from '~icons/lucide/party-popper';
type ExportFormat = 'web' | 'exe';
type WizardStep = 'format' | 'device-check' | 'building' | 'done';

export function ExportWizard ( { onClose }: { onClose: () => void } )
{
    const exportJSON = useConfigStore( ( s ) => s.exportJSON );
    const [ format, setFormat ] = useState<ExportFormat>( 'web' );
    const [ step, setStep ] = useState<WizardStep>( 'format' );
    const [ acknowledged, setAcknowledged ] = useState( false );

    const deviceCheck = useMemo( () => detectCorporateDevice(), [] );

    const handleFormatNext = () =>
    {
        if ( format === 'exe' )
        {
            setStep( 'device-check' );
        } else
        {
            handleWebExport();
        }
    };

    const handleWebExport = () =>
    {
        // Web ZIP: just trigger download of the config JSON for now
        const json = exportJSON();
        const blob = new Blob( [ json ], { type: 'application/json' } );
        const url = URL.createObjectURL( blob );
        const a = document.createElement( 'a' );
        a.href = url;
        a.download = 'machine-config.json';
        a.click();
        URL.revokeObjectURL( url );
        setStep( 'done' );
    };

    const handleExeExport = () =>
    {
        // In browser context, show instructions for Electron build
        setStep( 'done' );
    };

    return (
        <div style={ {
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 12000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        } }>
            <div className="fade-in" style={ {
                background: 'var(--bg-card, #1e1e2e)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '28px', maxWidth: '520px', width: '90%',
            } }>
                { step === 'format' && (
                    <>
                        <h3 style={ { marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' } }><IconPackage /> Export Your Machine</h3>
                        <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' } }>
                            Choose how you want to export your fruit machine.
                        </p>

                        <div style={ { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' } }>
                            <label style={ {
                                display: 'flex', gap: '12px', padding: '14px', borderRadius: '8px',
                                border: format === 'web' ? '2px solid var(--accent)' : '1px solid var(--border)',
                                cursor: 'pointer', background: format === 'web' ? 'rgba(108,99,255,0.05)' : 'transparent',
                            } }>
                                <input type="radio" name="format" checked={ format === 'web' } onChange={ () => setFormat( 'web' ) } />
                                <div>
                                    <strong style={ { display: 'flex', alignItems: 'center', gap: '6px' } }><IconGlobe /> Web ZIP</strong>
                                    <p style={ { fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' } }>
                                        Export as a web application. Open in any browser. No installation needed.
                                    </p>
                                </div>
                            </label>

                            <label style={ {
                                display: 'flex', gap: '12px', padding: '14px', borderRadius: '8px',
                                border: format === 'exe' ? '2px solid var(--accent)' : '1px solid var(--border)',
                                cursor: 'pointer', background: format === 'exe' ? 'rgba(108,99,255,0.05)' : 'transparent',
                            } }>
                                <input type="radio" name="format" checked={ format === 'exe' } onChange={ () => setFormat( 'exe' ) } />
                                <div>
                                    <strong style={ { display: 'flex', alignItems: 'center', gap: '6px' } }><IconMonitor /> Desktop EXE</strong>
                                    <p style={ { fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' } }>
                                        Windows executable via Electron. Requires build tools.
                                    </p>
                                </div>
                            </label>
                        </div>

                        <div style={ { display: 'flex', gap: '10px', justifyContent: 'flex-end' } }>
                            <button className="btn" onClick={ onClose }>Cancel</button>
                            <button className="btn btn-primary" onClick={ handleFormatNext }>Next →</button>
                        </div>
                    </>
                ) }

                { step === 'device-check' && (
                    <>
                        <h3 style={ { marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' } }><IconLock /> Device Security Check</h3>

                        { deviceCheck.status === 'managed' ? (
                            <div style={ {
                                padding: '14px', background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.4)',
                                borderRadius: '8px', marginBottom: '16px',
                            } }>
                                <strong style={ { color: '#e74c3c', display: 'block', marginBottom: '8px' } }>
                                    ⚠️ Corporate/Managed Device Detected
                                </strong>
                                <ul style={ { margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)' } }>
                                    { deviceCheck.warnings.map( ( w, i ) => <li key={ i }>{ w }</li> ) }
                                </ul>
                                <p style={ { fontSize: '0.8rem', marginTop: '10px', color: '#e74c3c' } }>
                                    Generating an <code>.exe</code> file may trigger security alerts from EDR software
                                    (CrowdStrike, SentinelOne, Carbon Black, etc.) and could result in:
                                </p>
                                <ul style={ { margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#e74c3c' } }>
                                    <li>File quarantine or deletion</li>
                                    <li>Account lockout or security investigation</li>
                                    <li>IT security team notification</li>
                                </ul>
                            </div>
                        ) : (
                            <div style={ {
                                padding: '14px', background: 'rgba(241,196,15,0.08)', border: '1px solid rgba(241,196,15,0.3)',
                                borderRadius: '8px', marginBottom: '16px',
                            } }>
                                <strong style={ { color: '#f1c40f', display: 'block', marginBottom: '6px' } }>
                                    ⚠️ Cannot fully verify device status
                                </strong>
                                <p style={ { fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 } }>
                                    Full device detection requires the Electron runtime.
                                    If you are on a corporate device, generating an EXE is <strong>not recommended</strong>.
                                </p>
                            </div>
                        ) }

                        <div style={ {
                            padding: '12px', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.3)',
                            borderRadius: '8px', marginBottom: '16px',
                        } }>
                            <p style={ { fontSize: '0.8rem', color: '#2ecc71', margin: 0 } }>
                                💡 <strong>Recommended alternative</strong>: Export as Web ZIP and host on a local web server
                                (e.g., <code>python -m http.server</code>). Same experience, zero security risk.
                            </p>
                        </div>

                        <label style={ { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', marginBottom: '16px', cursor: 'pointer' } }>
                            <input type="checkbox" checked={ acknowledged } onChange={ ( e ) => setAcknowledged( e.target.checked ) } />
                            I understand the risks and want to proceed with EXE generation.
                        </label>

                        <div style={ { display: 'flex', gap: '10px', justifyContent: 'flex-end' } }>
                            <button className="btn" onClick={ () => { setStep( 'format' ); setAcknowledged( false ); } }>← Back</button>
                            <button className="btn btn-primary" onClick={ handleExeExport } disabled={ !acknowledged }>
                                Proceed with EXE →
                            </button>
                        </div>
                    </>
                ) }

                { step === 'done' && (
                    <>
                        <div style={ { textAlign: 'center', padding: '20px 0' } }>
                            <span style={ { fontSize: '3rem', display: 'block', margin: '0 auto', color: 'var(--accent)' } }><IconPartyPopper style={ { width: '48px', height: '48px' } } /></span>
                            <h3 style={ { marginTop: '12px' } }>Export Complete!</h3>
                            { format === 'web' ? (
                                <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' } }>
                                    Your machine config has been exported. Run <code>python build_zip.py</code> to generate the
                                    full standalone web package.
                                </p>
                            ) : (
                                <div style={ { textAlign: 'left', marginTop: '12px' } }>
                                    <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)' } }>
                                        To build the Desktop EXE:
                                    </p>
                                    <ol style={ { fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '20px' } }>
                                        <li>Install Electron: <code>npm install --save-dev electron electron-builder</code></li>
                                        <li>Run: <code>python build_zip.py --electron</code></li>
                                        <li>Save the generated EXE to a <strong>personal USB drive</strong>, not this device's filesystem.</li>
                                    </ol>
                                </div>
                            ) }
                        </div>
                        <div style={ { display: 'flex', justifyContent: 'center' } }>
                            <button className="btn btn-primary" onClick={ onClose }>Close</button>
                        </div>
                    </>
                ) }
            </div>
        </div>
    );
}
