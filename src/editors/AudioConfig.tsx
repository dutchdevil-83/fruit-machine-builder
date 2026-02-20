import { useConfigStore } from '../store/configStore';
import { audioEngine } from '../utils/audioEngine';
import type { AudioEventSettings, AudioSettings } from '../types/machine';

const SYNTH_PRESETS = [ 'mechanical', 'click', 'coin', 'fanfare', 'beep' ];

export function AudioConfig ()
{
    const config = useConfigStore( ( s ) => s.config );
    const setAudioSettings = useConfigStore( ( s ) => s.setAudioSettings );
    const audio = config.settings.audio;

    const handleMasterVolume = ( vol: number ) => setAudioSettings( { masterVolume: vol } );

    const handleBGMEnabled = ( enabled: boolean ) =>
    {
        const next = { ...audio, bgmEnabled: enabled };
        setAudioSettings( { bgmEnabled: enabled } );
        audioEngine.updateBackgroundMusic( next as AudioSettings );
    };

    const handleEventChange = ( eventName: keyof AudioSettings[ 'events' ], updates: Partial<AudioEventSettings> ) =>
    {
        const nextEvents = {
            ...audio.events,
            [ eventName ]: { ...audio.events[ eventName ], ...updates }
        };
        setAudioSettings( { events: nextEvents } );
    };

    const testEvent = ( eventName: keyof AudioSettings[ 'events' ] ) =>
    {
        audioEngine.playEvent( audio.events[ eventName ], audio );
    };

    return (
        <div className="fade-in" style={ { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' } }>
            <div className="panel">
                <div className="panel-header" style={ { marginBottom: '20px' } }>
                    <h2>🎵 Audio Configuration</h2>
                    <p style={ { color: 'var(--text-muted)' } }>Configure background music and sound effects mapping.</p>
                </div>

                {/* Global Volume */ }
                <div style={ { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' } }>
                    <label style={ { fontWeight: 600, minWidth: '120px' } } htmlFor="masterVol">Master Volume</label>
                    <input
                        id="masterVol"
                        type="range" min="0" max="1" step="0.05"
                        value={ audio.masterVolume }
                        onChange={ ( e ) => handleMasterVolume( Number( e.target.value ) ) }
                        style={ { flex: 1 } }
                    />
                    <span style={ { width: '40px', textAlign: 'right' } }>{ Math.round( audio.masterVolume * 100 ) }%</span>
                </div>

                {/* BGM Module */ }
                <div style={ { padding: '15px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '30px' } }>
                    <h3 style={ { marginBottom: '15px' } }>Background Music</h3>

                    <div style={ { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' } }>
                        <label style={ { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } }>
                            <input
                                type="checkbox"
                                checked={ audio.bgmEnabled }
                                onChange={ ( e ) => handleBGMEnabled( e.target.checked ) }
                            />
                            Enable BGM
                        </label>
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '8px', opacity: audio.bgmEnabled ? 1 : 0.5, pointerEvents: audio.bgmEnabled ? 'auto' : 'none' } }>
                        <label htmlFor="bgmUrl">BGM File URL / DataURI</label>
                        <input
                            id="bgmUrl"
                            type="text"
                            className="input"
                            placeholder="/assets/track1.mp3"
                            value={ audio.bgmFileUrl || '' }
                            onChange={ ( e ) =>
                            {
                                const next = { ...audio, bgmFileUrl: e.target.value };
                                setAudioSettings( next );
                                if ( audio.bgmEnabled ) audioEngine.updateBackgroundMusic( next as AudioSettings );
                            } }
                        />

                        <div style={ { display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' } }>
                            <label htmlFor="bgmVol" style={ { minWidth: '100px' } }>BGM Volume</label>
                            <input
                                id="bgmVol"
                                type="range" min="0" max="1" step="0.05"
                                value={ audio.bgmVolume }
                                onChange={ ( e ) =>
                                {
                                    const vol = Number( e.target.value );
                                    const next = { ...audio, bgmVolume: vol };
                                    setAudioSettings( next );
                                    if ( audio.bgmEnabled ) audioEngine.updateBackgroundMusic( next as AudioSettings );
                                } }
                                style={ { flex: 1 } }
                            />
                        </div>
                    </div>
                </div>

                {/* Sound Events */ }
                <h3 style={ { marginBottom: '15px' } }>Sound Effects Mapping</h3>
                <div style={ { display: 'flex', flexDirection: 'column', gap: '20px' } }>
                    { ( Object.keys( audio.events ) as Array<keyof AudioSettings[ 'events' ]> ).map( ( evtKey ) =>
                    {
                        const ev = audio.events[ evtKey ];

                        return (
                            <div key={ evtKey } style={ { border: '1px solid var(--border)', padding: '15px', borderRadius: 'var(--radius-sm)' } }>
                                <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' } }>
                                    <label style={ { fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } }>
                                        <input
                                            type="checkbox"
                                            checked={ ev.enabled }
                                            onChange={ ( e ) => handleEventChange( evtKey, { enabled: e.target.checked } ) }
                                        />
                                        Event: { evtKey }
                                    </label>
                                    <button className="btn" onClick={ () => testEvent( evtKey ) }>▶ Test Play</button>
                                </div>

                                <div style={ { display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px', alignItems: 'center', opacity: ev.enabled ? 1 : 0.5, pointerEvents: ev.enabled ? 'auto' : 'none' } }>

                                    <label htmlFor={ `${ evtKey }-type` }>Source Type</label>
                                    <select
                                        id={ `${ evtKey }-type` }
                                        className="input"
                                        value={ ev.type }
                                        onChange={ ( e ) => handleEventChange( evtKey, { type: e.target.value as 'synth' | 'file' } ) }
                                    >
                                        <option value="synth">Web Audio API Synth</option>
                                        <option value="file">MP3/WAV File</option>
                                    </select>

                                    { ev.type === 'synth' ? (
                                        <>
                                            <label htmlFor={ `${ evtKey }-preset` }>Synth Preset</label>
                                            <select
                                                id={ `${ evtKey }-preset` }
                                                className="input"
                                                value={ ev.synthPreset || 'beep' }
                                                onChange={ ( e ) => handleEventChange( evtKey, { synthPreset: e.target.value } ) }
                                            >
                                                { SYNTH_PRESETS.map( p => <option key={ p } value={ p }>{ p }</option> ) }
                                            </select>
                                        </>
                                    ) : (
                                        <>
                                            <label htmlFor={ `${ evtKey }-file` }>File URL</label>
                                            <input
                                                id={ `${ evtKey }-file` }
                                                type="text"
                                                className="input"
                                                placeholder="/assets/sfx.mp3"
                                                value={ ev.fileUrl || '' }
                                                onChange={ ( e ) =>
                                                {
                                                    handleEventChange( evtKey, { fileUrl: e.target.value } );
                                                    if ( e.target.value ) audioEngine.loadAudioFile( e.target.value );
                                                } }
                                            />
                                        </>
                                    ) }

                                    <label htmlFor={ `${ evtKey }-vol` }>Volume</label>
                                    <input
                                        id={ `${ evtKey }-vol` }
                                        type="range" min="0" max="1" step="0.05"
                                        value={ ev.volume }
                                        onChange={ ( e ) => handleEventChange( evtKey, { volume: Number( e.target.value ) } ) }
                                    />
                                </div>
                            </div>
                        );
                    } ) }
                </div>

                {/* Future Integrations */ }
                <div style={ { marginTop: '30px', padding: '15px', border: '1px dashed var(--win-gold)', borderRadius: 'var(--radius-md)', background: 'rgba(255, 215, 0, 0.05)' } }>
                    <h4 style={ { color: 'var(--win-gold)', marginBottom: '10px' } }>✨ AI Audio Studio (Coming Soon)</h4>
                    <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)' } }>
                        The audio engine architecture is prepared to fetch dynamically generated AI SFX and music in the future.
                    </p>
                </div>
            </div>
        </div>
    );
}
