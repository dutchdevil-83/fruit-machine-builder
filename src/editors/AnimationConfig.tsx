import { useState, useRef, useEffect, useCallback } from 'react';
import { useConfigStore } from '../store/configStore';

const ANIMATION_PRESETS = [
    { id: 'elastic', name: 'Elastic Bounce', durationMs: 2000, spinSpeed: 30, bounceStrength: 0.5, blurLevel: 5 },
    { id: 'linear', name: 'Linear Stop', durationMs: 1500, spinSpeed: 25, bounceStrength: 0, blurLevel: 3 },
    { id: 'ease-out', name: 'Smooth Ease Out', durationMs: 2500, spinSpeed: 35, bounceStrength: 0.1, blurLevel: 6 },
    { id: 'instant', name: 'Instant Snap', durationMs: 500, spinSpeed: 40, bounceStrength: 0, blurLevel: 0 },
];

/** Mini canvas preview that simulates reel spin/stop animation */
function AnimationPreview ( { durationMs, spinSpeed, bounceStrength, blurLevel }: {
    durationMs: number; spinSpeed: number; bounceStrength: number; blurLevel: number;
} )
{
    const canvasRef = useRef<HTMLCanvasElement>( null );
    const animRef = useRef<number>( 0 );
    const [ isPlaying, setIsPlaying ] = useState( false );

    const CANVAS_W = 300;
    const CANVAS_H = 200;
    const REEL_COUNT = 3;
    const SYMBOL_H = 50;
    const REEL_W = CANVAS_W / REEL_COUNT;
    const SYMBOLS = [ '🍒', '🔔', '⭐', '7️⃣', '🍊', '🍇', '🍉', '🍋' ];

    const playPreview = useCallback( () =>
    {
        const canvas = canvasRef.current;
        if ( !canvas ) return;
        const ctx = canvas.getContext( '2d' );
        if ( !ctx ) return;

        setIsPlaying( true );
        const startTime = performance.now();
        const duration = Math.min( durationMs, 4000 );

        const draw = ( now: number ) =>
        {
            const elapsed = now - startTime;
            const progress = Math.min( elapsed / duration, 1 );
            ctx.clearRect( 0, 0, CANVAS_W, CANVAS_H );

            // Background
            ctx.fillStyle = '#1a1a24';
            ctx.fillRect( 0, 0, CANVAS_W, CANVAS_H );

            for ( let reel = 0; reel < REEL_COUNT; reel++ )
            {
                const reelDelay = reel * 0.15;
                const reelProgress = Math.max( 0, Math.min( ( progress - reelDelay ) / ( 1 - reelDelay * REEL_COUNT / ( REEL_COUNT - 1 ) ), 1 ) );

                // Easing with bounce
                let eased = reelProgress;
                if ( reelProgress >= 1 )
                {
                    eased = 1;
                } else if ( bounceStrength > 0 && reelProgress > 0.7 )
                {
                    const bouncePhase = ( reelProgress - 0.7 ) / 0.3;
                    eased = reelProgress + Math.sin( bouncePhase * Math.PI * 3 ) * bounceStrength * ( 1 - bouncePhase ) * 0.15;
                }

                // Offset — simulates spinning
                const maxOffset = spinSpeed * 8;
                const offset = maxOffset * ( 1 - eased );
                const blurAmount = reelProgress < 1 ? blurLevel * ( 1 - eased ) : 0;

                // Draw reel symbols
                ctx.save();
                ctx.beginPath();
                ctx.rect( reel * REEL_W + 2, 0, REEL_W - 4, CANVAS_H );
                ctx.clip();

                // Draw reel separator
                ctx.fillStyle = '#22222e';
                ctx.fillRect( reel * REEL_W + 2, 0, REEL_W - 4, CANVAS_H );

                ctx.font = `${ Math.floor( SYMBOL_H * 0.6 ) }px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Motion blur effect (opacity-based)
                const opacity = blurAmount > 2 ? 0.4 : 1;
                ctx.globalAlpha = opacity;

                for ( let row = -1; row < 5; row++ )
                {
                    const symIdx = Math.abs( Math.floor( offset / SYMBOL_H + row + reel * 3 ) ) % SYMBOLS.length;
                    const y = row * SYMBOL_H + ( offset % SYMBOL_H );
                    ctx.fillStyle = '#e8e8f0';
                    ctx.fillText( SYMBOLS[ symIdx ]!, reel * REEL_W + REEL_W / 2, y + SYMBOL_H / 2 );
                }

                ctx.globalAlpha = 1;
                ctx.restore();

                // Reel border
                ctx.strokeStyle = '#3a3a4e';
                ctx.lineWidth = 1;
                ctx.strokeRect( reel * REEL_W + 2, 0, REEL_W - 4, CANVAS_H );
            }

            // Center payline
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.setLineDash( [ 5, 3 ] );
            ctx.beginPath();
            ctx.moveTo( 0, CANVAS_H / 2 );
            ctx.lineTo( CANVAS_W, CANVAS_H / 2 );
            ctx.stroke();
            ctx.setLineDash( [] );

            if ( progress < 1 )
            {
                animRef.current = requestAnimationFrame( draw );
            } else
            {
                setIsPlaying( false );
            }
        };

        cancelAnimationFrame( animRef.current );
        animRef.current = requestAnimationFrame( draw );
    }, [ durationMs, spinSpeed, bounceStrength, blurLevel ] );

    // Draw initial static state
    useEffect( () =>
    {
        const canvas = canvasRef.current;
        if ( !canvas ) return;
        const ctx = canvas.getContext( '2d' );
        if ( !ctx ) return;

        ctx.fillStyle = '#1a1a24';
        ctx.fillRect( 0, 0, CANVAS_W, CANVAS_H );

        ctx.font = `${ Math.floor( SYMBOL_H * 0.6 ) }px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for ( let reel = 0; reel < REEL_COUNT; reel++ )
        {
            ctx.fillStyle = '#22222e';
            ctx.fillRect( reel * REEL_W + 2, 0, REEL_W - 4, CANVAS_H );
            for ( let row = 0; row < 4; row++ )
            {
                const symIdx = ( reel * 3 + row ) % SYMBOLS.length;
                ctx.fillStyle = '#e8e8f0';
                ctx.fillText( SYMBOLS[ symIdx ]!, reel * REEL_W + REEL_W / 2, row * SYMBOL_H + SYMBOL_H / 2 );
            }
            ctx.strokeStyle = '#3a3a4e';
            ctx.strokeRect( reel * REEL_W + 2, 0, REEL_W - 4, CANVAS_H );
        }

        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.setLineDash( [ 5, 3 ] );
        ctx.beginPath();
        ctx.moveTo( 0, CANVAS_H / 2 );
        ctx.lineTo( CANVAS_W, CANVAS_H / 2 );
        ctx.stroke();
        ctx.setLineDash( [] );
    }, [] );

    useEffect( () =>
    {
        return () => cancelAnimationFrame( animRef.current );
    }, [] );

    return (
        <div style={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } }>
            <canvas
                ref={ canvasRef }
                width={ CANVAS_W }
                height={ CANVAS_H }
                style={ {
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                } }
            />
            <button
                className="btn btn-primary"
                onClick={ playPreview }
                disabled={ isPlaying }
                style={ { fontSize: '0.8rem' } }
            >
                { isPlaying ? '⏳ Playing...' : '▶ Preview Animation' }
            </button>
        </div>
    );
}

export function AnimationConfig ()
{
    const config = useConfigStore( ( s ) => s.config );
    const setAnimationSettings = useConfigStore( ( s ) => s.setAnimationSettings );
    const anim = config.settings.animation;

    const handlePresetSelect = ( presetId: string ) =>
    {
        const preset = ANIMATION_PRESETS.find( p => p.id === presetId );
        if ( preset )
        {
            setAnimationSettings( {
                preset: preset.id,
                durationMs: preset.durationMs,
                spinSpeed: preset.spinSpeed,
                bounceStrength: preset.bounceStrength,
                blurLevel: preset.blurLevel,
            } );
        }
    };

    return (
        <div className="fade-in" style={ { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' } }>
            <div className="panel">
                <div className="panel-header">
                    <h2>🎬 Animation Configuration</h2>
                    <p style={ { color: 'var(--text-muted)' } }>Configure reel spin and stop animations.</p>
                </div>

                {/* Live Preview */ }
                <div style={ { marginBottom: '24px', display: 'flex', justifyContent: 'center' } }>
                    <AnimationPreview
                        durationMs={ anim.durationMs }
                        spinSpeed={ anim.spinSpeed }
                        bounceStrength={ anim.bounceStrength }
                        blurLevel={ anim.blurLevel }
                    />
                </div>

                <div style={ { marginBottom: '20px' } }>
                    <h3>Presets</h3>
                    <div style={ { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' } }>
                        { ANIMATION_PRESETS.map( p => (
                            <button
                                key={ p.id }
                                className={ anim.preset === p.id ? 'btn btn-primary' : 'btn' }
                                onClick={ () => handlePresetSelect( p.id ) }
                            >
                                { p.name }
                            </button>
                        ) ) }
                    </div>
                </div>

                <div style={ { display: 'flex', flexDirection: 'column', gap: '15px' } }>
                    <h3>Custom Settings</h3>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '5px' } }>
                        <label htmlFor="animDuration">Spin Duration (ms): { anim.durationMs }</label>
                        <input id="animDuration" type="range" min="500" max="5000" step="100"
                            value={ anim.durationMs }
                            onChange={ ( e ) => setAnimationSettings( { durationMs: Number( e.target.value ), preset: 'custom' } ) }
                        />
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '5px' } }>
                        <label htmlFor="animSpeed">Spin Speed: { anim.spinSpeed }</label>
                        <input id="animSpeed" type="range" min="10" max="100" step="5"
                            value={ anim.spinSpeed }
                            onChange={ ( e ) => setAnimationSettings( { spinSpeed: Number( e.target.value ), preset: 'custom' } ) }
                        />
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '5px' } }>
                        <label htmlFor="animBounce">Bounce Strength: { anim.bounceStrength.toFixed( 2 ) }</label>
                        <input id="animBounce" type="range" min="0" max="1" step="0.05"
                            value={ anim.bounceStrength }
                            onChange={ ( e ) => setAnimationSettings( { bounceStrength: Number( e.target.value ), preset: 'custom' } ) }
                        />
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '5px' } }>
                        <label htmlFor="animBlur">Motion Blur Level: { anim.blurLevel }</label>
                        <input id="animBlur" type="range" min="0" max="20" step="1"
                            value={ anim.blurLevel }
                            onChange={ ( e ) => setAnimationSettings( { blurLevel: Number( e.target.value ), preset: 'custom' } ) }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
