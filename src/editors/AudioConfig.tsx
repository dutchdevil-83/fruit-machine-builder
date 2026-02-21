import { useState } from 'react';
import { useConfigStore } from '../store/configStore';
import { audioEngine } from '../utils/audioEngine';
import { AudioEditor } from '../components/AudioEditor';
import type { AudioEventSettings, AudioSettings } from '../types/machine';

import IconFolderOpen from '~icons/lucide/folder-open';
import IconMusic from '~icons/lucide/music';
import IconPlay from '~icons/lucide/play';
import IconCheck from '~icons/lucide/check';
import IconSliders from '~icons/lucide/sliders-horizontal';
import IconArrowRight from '~icons/lucide/arrow-right';
const SYNTH_PRESETS = [ 'mechanical', 'click', 'coin', 'fanfare', 'beep' ];

/** Audio file upload + library panel */
function AudioLibrary ( { onSelect }: { onSelect: ( dataUrl: string, name: string ) => void } )
{
    const [ files, setFiles ] = useState<{ name: string; dataUrl: string }[]>( () =>
    {
        try
        {
            return JSON.parse( localStorage.getItem( 'fmb_audio_library' ) || '[]' );
        } catch { return []; }
    } );

    const handleUpload = () =>
    {
        const input = document.createElement( 'input' );
        input.type = 'file';
        input.accept = 'audio/wav,audio/mp3,audio/mpeg,audio/ogg,.wav,.mp3,.ogg';
        input.multiple = true;
        input.onchange = () =>
        {
            const fileList = input.files;
            if ( !fileList ) return;
            Array.from( fileList ).forEach( file =>
            {
                const reader = new FileReader();
                reader.onload = ( e ) =>
                {
                    const dataUrl = e.target?.result as string;
                    if ( !dataUrl ) return;
                    const entry = { name: file.name, dataUrl };
                    setFiles( prev =>
                    {
                        const next = [ ...prev, entry ];
                        localStorage.setItem( 'fmb_audio_library', JSON.stringify( next.map( f => ( { name: f.name, dataUrl: f.dataUrl.substring( 0, 200 ) + '...' } ) ) ) );
                        return next;
                    } );
                };
                reader.readAsDataURL( file );
            } );
        };
        input.click();
    };

    const handleRemove = ( idx: number ) =>
    {
        setFiles( prev =>
        {
            const next = prev.filter( ( _, i ) => i !== idx );
            return next;
        } );
    };

    return (
        <div style={ {
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '15px', marginBottom: '20px',
            background: 'var(--bg-input)',
        } }>
            <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' } }>
                <h3 style={ { display: 'flex', alignItems: 'center', gap: '8px' } }><IconFolderOpen /> Audio Library</h3>
                <button className="btn btn-primary" onClick={ handleUpload } style={ { fontSize: '0.8rem' } }>
                    + Upload Audio
                </button>
            </div>
            { files.length === 0 ? (
                <p style={ { color: 'var(--text-muted)', fontSize: '0.85rem' } }>
                    No audio files uploaded. Click "Upload Audio" to add WAV/MP3/OGG files.
                </p>
            ) : (
                <div style={ { display: 'flex', flexDirection: 'column', gap: '6px' } }>
                    { files.map( ( f, i ) => (
                        <div key={ i } style={ {
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '6px 10px', background: 'var(--bg-panel)',
                            borderRadius: 'var(--radius-sm)', fontSize: '0.85rem',
                        } }>
                            <span style={ { flex: 1, display: 'flex', gap: '6px', alignItems: 'center' } }><IconMusic /> { f.name }</span>
                            <button className="btn" title="Play Audio" aria-label="Play Audio" style={ { padding: '2px 8px', fontSize: '0.75rem' } }
                                onClick={ () =>
                                {
                                    const audio = new Audio( f.dataUrl );
                                    audio.play().catch( () => { } );
                                } }
                            ><IconPlay style={ { width: '12px', height: '12px' } } /></button>
                            <button className="btn" style={ { padding: '2px 8px', fontSize: '0.75rem' } }
                                onClick={ () => onSelect( f.dataUrl, f.name ) }
                            >Use</button>
                            <button className="btn btn-danger" style={ { padding: '2px 8px', fontSize: '0.75rem' } }
                                onClick={ () => handleRemove( i ) }
                            >✕</button>
                        </div>
                    ) ) }
                </div>
            ) }
        </div>
    );
}

export function AudioConfig ()
{
    const config = useConfigStore( ( s ) => s.config );
    const setAudioSettings = useConfigStore( ( s ) => s.setAudioSettings );
    const audio = config.settings.audio;
    const [ activeEventForLibrary, setActiveEventForLibrary ] = useState<keyof AudioSettings[ 'events' ] | null>( null );
    const [ showAudioEditor, setShowAudioEditor ] = useState( false );

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

    const handleLibrarySelect = ( dataUrl: string ) =>
    {
        if ( activeEventForLibrary )
        {
            handleEventChange( activeEventForLibrary, { type: 'file', fileUrl: dataUrl } );
            audioEngine.loadAudioFile( dataUrl );
            setActiveEventForLibrary( null );
        }
    };

    return (
        <div className="fade-in" style={ { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' } }>
            <div className="panel">
                <div className="panel-header" style={ { marginBottom: '20px' } }>
                    <h2 style={ { display: 'flex', alignItems: 'center', gap: '8px' } }><IconMusic style={ { width: '28px', height: '28px' } } /> Audio Configuration</h2>
                    <p style={ { color: 'var(--text-muted)' } }>Configure background music and sound effects mapping.</p>
                </div>

                {/* Audio Library */ }
                <AudioLibrary onSelect={ ( dataUrl ) =>
                {
                    if ( activeEventForLibrary )
                    {
                        handleLibrarySelect( dataUrl );
                    }
                } } />

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
                        const isActiveForLibrary = activeEventForLibrary === evtKey;

                        return (
                            <div key={ evtKey } style={ {
                                border: `1px solid ${ isActiveForLibrary ? 'var(--accent)' : 'var(--border)' }`,
                                padding: '15px', borderRadius: 'var(--radius-sm)',
                                transition: 'border-color 150ms ease',
                            } }>
                                <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' } }>
                                    <label style={ { fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } }>
                                        <input
                                            type="checkbox"
                                            checked={ ev.enabled }
                                            onChange={ ( e ) => handleEventChange( evtKey, { enabled: e.target.checked } ) }
                                        />
                                        Event: { evtKey }
                                    </label>
                                    <div style={ { display: 'flex', gap: '4px' } }>
                                        <button className="btn" onClick={ () => testEvent( evtKey ) } style={ { fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' } }><IconPlay /> Test</button>
                                        <button
                                            className={ isActiveForLibrary ? 'btn btn-primary' : 'btn' }
                                            onClick={ () => setActiveEventForLibrary( isActiveForLibrary ? null : evtKey ) }
                                            style={ { fontSize: '0.75rem' } }
                                        >
                                            { isActiveForLibrary ? <span style={ { display: 'flex', gap: '4px', alignItems: 'center' } }><IconCheck /> Select from library</span> : <span style={ { display: 'flex', gap: '4px', alignItems: 'center' } }><IconFolderOpen /> From Library</span> }
                                        </button>
                                    </div>
                                </div>

                                <div style={ {
                                    display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px', alignItems: 'center',
                                    opacity: ev.enabled ? 1 : 0.5, pointerEvents: ev.enabled ? 'auto' : 'none',
                                } }>
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
                                                    placeholder="/assets/sfx.mp3 or upload via library"
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

                {/* Audio Editor Placeholder */ }
                <div style={ {
                    marginTop: '30px', padding: '20px',
                    border: '1px dashed var(--win-gold)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 215, 0, 0.05)',
                    textAlign: 'center',
                } }>
                    <h4 style={ { color: 'var(--win-gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' } }><IconSliders /> Multi-Track Audio Editor</h4>
                    <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' } }>
                        Full waveform editing with Waveform Playlist v5 — coming in a future update.
                    </p>
                    <button className="btn btn-primary" onClick={ () => setShowAudioEditor( true ) } style={ { display: 'inline-flex', alignItems: 'center', gap: '6px' } }>
                        <IconArrowRight /> Open Audio Editor
                    </button>
                    <AudioEditor isOpen={ showAudioEditor } onClose={ () => setShowAudioEditor( false ) } />
                </div>
            </div>
        </div>
    );
}
