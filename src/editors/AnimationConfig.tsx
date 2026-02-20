import { useConfigStore } from '../store/configStore';

const ANIMATION_PRESETS = [
    { id: 'elastic', name: 'Elastic Bounce', durationMs: 2000, spinSpeed: 30, bounceStrength: 0.5, blurLevel: 5 },
    { id: 'linear', name: 'Linear Stop', durationMs: 1500, spinSpeed: 25, bounceStrength: 0, blurLevel: 3 },
    { id: 'ease-out', name: 'Smooth Ease Out', durationMs: 2500, spinSpeed: 35, bounceStrength: 0.1, blurLevel: 6 },
    { id: 'instant', name: 'Instant Snap', durationMs: 500, spinSpeed: 40, bounceStrength: 0, blurLevel: 0 },
];

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
                        <input
                            id="animDuration"
                            type="range"
                            min="500" max="5000" step="100"
                            value={ anim.durationMs }
                            onChange={ ( e ) => setAnimationSettings( { durationMs: Number( e.target.value ), preset: 'custom' } ) }
                        />
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '5px' } }>
                        <label htmlFor="animSpeed">Spin Speed: { anim.spinSpeed }</label>
                        <input
                            id="animSpeed"
                            type="range"
                            min="10" max="100" step="5"
                            value={ anim.spinSpeed }
                            onChange={ ( e ) => setAnimationSettings( { spinSpeed: Number( e.target.value ), preset: 'custom' } ) }
                        />
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '5px' } }>
                        <label htmlFor="animBounce">Bounce Strength: { anim.bounceStrength.toFixed( 2 ) }</label>
                        <input
                            id="animBounce"
                            type="range"
                            min="0" max="1" step="0.05"
                            value={ anim.bounceStrength }
                            onChange={ ( e ) => setAnimationSettings( { bounceStrength: Number( e.target.value ), preset: 'custom' } ) }
                        />
                    </div>

                    <div style={ { display: 'flex', flexDirection: 'column', gap: '5px' } }>
                        <label htmlFor="animBlur">Motion Blur Level: { anim.blurLevel }</label>
                        <input
                            id="animBlur"
                            type="range"
                            min="0" max="20" step="1"
                            value={ anim.blurLevel }
                            onChange={ ( e ) => setAnimationSettings( { blurLevel: Number( e.target.value ), preset: 'custom' } ) }
                        />
                    </div>
                </div>

                {/* Placeholder for future libraries */ }
                <div style={ { marginTop: '30px', padding: '15px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)' } }>
                    <h4 style={ { color: 'var(--accent)', marginBottom: '10px' } }>✨ Future Integrations</h4>
                    <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)' } }>
                        Architecture hooks are prepared here for fetching AI-generated animations and free online library presets in upcoming updates.
                    </p>
                </div>
            </div>
        </div>
    );
}
