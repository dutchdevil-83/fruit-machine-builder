import { useEffect, useRef, useState } from 'react';
import WaveformPlaylist from 'waveform-playlist';
import { useConfigStore } from '../store/configStore';

interface AudioEditorProps
{
    isOpen: boolean;
    onClose: () => void;
}

export function AudioEditor ( { isOpen, onClose }: AudioEditorProps )
{
    const config = useConfigStore( s => s.config );
    const containerRef = useRef<HTMLDivElement>( null );
    const [ isLoaded, setIsLoaded ] = useState( false );
    const [ ee, setEe ] = useState<any>( null ); // EventEmitter
    const [ isPlaying, setIsPlaying ] = useState( false );

    useEffect( () =>
    {
        if ( !isOpen || !containerRef.current ) return;

        // Ensure we only mount it once
        containerRef.current.innerHTML = '';

        const playlist = WaveformPlaylist( {
            container: containerRef.current,
            timescale: true,
            state: "cursor",
            colors: {
                waveOutlineColor: "var(--accent)",
                timeColor: "var(--text-secondary)",
                fadeColor: "rgba(0,0,0,0.5)"
            },
            controls: {
                show: true,
                width: 150
            },
            zoomLevels: [ 500, 1000, 3000, 5000 ],
            samplesPerPixel: 1000,
            isAutomaticScroll: true,
        } );

        const eventEmitter = playlist.getEventEmitter();
        setEe( eventEmitter );

        const events = config.settings.audio.events;

        const tracks = [
            { src: events.spinStart?.fileUrl, name: "Spin Start", customClass: 'track-spin' },
            { src: events.reelStop?.fileUrl, name: "Reel Stop", customClass: 'track-stop' },
            { src: events.winNormal?.fileUrl, name: "Win Normal", customClass: 'track-win' },
            { src: events.winBig?.fileUrl, name: "Win MEGA", customClass: 'track-mega' }
        ].filter( t => t.src ); // Only load tracks that actually have files attached

        if ( tracks.length === 0 )
        {
            setIsLoaded( true );
            return;
        }

        playlist.load( tracks ).then( () =>
        {
            playlist.initExporter();
            setIsLoaded( true );
        } ).catch( ( err: any ) =>
        {
            console.error( "Waveform load failed", err );
            setIsLoaded( true );
        } );

        // Track play state for UI buttons
        eventEmitter.on( 'play', () => setIsPlaying( true ) );
        eventEmitter.on( 'pause', () => setIsPlaying( false ) );
        eventEmitter.on( 'stop', () => setIsPlaying( false ) );

        return () =>
        {
            eventEmitter.emit( 'stop' );
            eventEmitter.emit( 'clear' );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ isOpen ] );

    if ( !isOpen ) return null;

    return (
        <>
            <div onClick={ onClose } style={ { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 12000 } } />
            <div className="fade-in" style={ {
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: 'var(--bg-card)', border: '1px solid var(--win-gold)', borderRadius: '12px',
                padding: '0', zIndex: 12001, width: '900px', maxWidth: '95vw', height: '600px',
                display: 'flex', flexDirection: 'column', boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
                overflow: 'hidden'
            } }>
                <div style={ { padding: '16px 24px', background: 'rgba(255, 215, 0, 0.1)', borderBottom: '1px solid rgba(255, 215, 0, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
                    <h2 style={ { margin: 0, display: 'flex', alignItems: 'center', gap: '8px' } }>
                        🎛️ Audio Editor
                    </h2>
                    <button className="btn" onClick={ onClose }>✕</button>
                </div>

                <div style={ { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-panel)', position: 'relative' } }>

                    {/* Controls Bar */ }
                    <div style={ { display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--bg-input)', borderBottom: '1px solid var(--border)', alignItems: 'center' } }>
                        <button className="btn btn-primary" onClick={ () => ee?.emit( isPlaying ? 'pause' : 'play' ) } disabled={ !isLoaded }>
                            { isPlaying ? '⏸ Pause' : '▶ Play' }
                        </button>
                        <button className="btn" onClick={ () => ee?.emit( 'stop' ) } disabled={ !isLoaded }>
                            ⏹ Stop
                        </button>
                        <div style={ { marginLeft: 'auto', display: 'flex', gap: '8px' } }>
                            <button className="btn" onClick={ () => ee?.emit( 'zoomin' ) } title="Zoom In">🔍 +</button>
                            <button className="btn" onClick={ () => ee?.emit( 'zoomout' ) } title="Zoom Out">🔍 -</button>
                        </div>
                    </div>

                    {/* Waveform Container */ }
                    <div style={ { flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px' } }>
                        { !isLoaded && (
                            <div style={ { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' } }>
                                Loading wave data...
                            </div>
                        ) }

                        <div ref={ containerRef } className="wp-container" style={ { visibility: isLoaded ? 'visible' : 'hidden' } } />
                    </div>
                </div>

                {/* Need simple global styles for playlist plugins to look correct against dark mode */ }
                <style>
                    { `
                        .wp-container .playlist-time-scale { background-color: var(--bg-card) !important; color: var(--text-secondary); }
                        .wp-container .channel-wrapper { border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
                        .wp-container .channel { background: var(--bg-input) !important; }
                        .wp-container .controls { background: var(--bg-card) !important; border-right: 1px solid var(--border); color: var(--text-primary); }
                        .wp-container .cursor { background: var(--danger) !important; }
                    `}
                </style>
            </div>
        </>
    );
}
