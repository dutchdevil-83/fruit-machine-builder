import { useConfigStore } from '../store/configStore';
import IconPalette from '~icons/lucide/palette';

function FieldGroup ( { label, children }: { label: string; children: React.ReactNode } )
{
    return (
        <label style={ { display: 'flex', flexDirection: 'column', gap: '8px' } }>
            <span style={ { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' } }>{ label }</span>
            { children }
        </label>
    );
}

export function InterfaceDesigner ()
{
    const config = useConfigStore( ( s ) => s.config );
    const setInterfaceSettings = useConfigStore( ( s ) => s.setInterfaceSettings );
    const interfaceSettings = config.settings.interface;

    if ( !interfaceSettings ) return null; // Safe guard for older configs

    const handleChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> ) =>
    {
        const { name, value, type } = e.target;

        if ( type === 'checkbox' )
        {
            const checked = ( e.target as HTMLInputElement ).checked;
            setInterfaceSettings( { [ name ]: checked } );
        } else
        {
            setInterfaceSettings( { [ name ]: value } );
        }
    };

    return (
        <div className="fade-in">
            <h2 style={ { display: 'flex', alignItems: 'center', gap: '8px' } }><IconPalette /> Interface Design</h2>
            <p style={ { color: 'var(--text-secondary)', marginBottom: '24px' } }>
                Customize the visual appearance of the simulator environment. Connect themes, cabinet colors, and button styling to create a unique atmosphere.
            </p>

            <div className="panel" style={ { display: 'flex', flexDirection: 'column', gap: '20px' } }>
                <h3>Background Settings</h3>
                <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)' } }>Configure the area behind the slot machine.</p>

                <FieldGroup label="Background Type">
                    <select
                        name="backgroundType"
                        value={ interfaceSettings.backgroundType }
                        onChange={ handleChange }
                        title="Background Type"
                    >
                        <option value="color">Solid Theme Color</option>
                        <option value="image">Custom Image</option>
                    </select>
                </FieldGroup>

                { interfaceSettings.backgroundType === 'color' && (
                    <FieldGroup label="Background Color">
                        <div style={ { display: 'flex', gap: '12px', alignItems: 'center' } }>
                            <input
                                type="color"
                                name="backgroundColor"
                                value={ interfaceSettings.backgroundColor }
                                onChange={ handleChange }
                                title="Background Color Picker"
                                style={ { padding: '0', width: '40px', height: '40px', borderRadius: '4px', cursor: 'pointer' } }
                            />
                            <span style={ { fontFamily: 'var(--font-mono)' } }>{ interfaceSettings.backgroundColor }</span>
                        </div>
                    </FieldGroup>
                ) }

                { interfaceSettings.backgroundType === 'image' && (
                    <FieldGroup label="Background Image URL">
                        <input
                            type="text"
                            name="backgroundImageUrl"
                            value={ interfaceSettings.backgroundImageUrl || '' }
                            onChange={ handleChange }
                            placeholder="e.g. https://example.com/casino-bg.jpg"
                            title="Background Image URL Input"
                        />
                    </FieldGroup>
                ) }
            </div>

            <div className="panel" style={ { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' } }>
                <h3>Machine Cabinet</h3>
                <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)' } }>Style the slot machine chassis framing the reels.</p>

                <FieldGroup label="Cabinet Color">
                    <div style={ { display: 'flex', gap: '12px', alignItems: 'center' } }>
                        <input
                            type="color"
                            name="cabinetColor"
                            value={ interfaceSettings.cabinetColor }
                            onChange={ handleChange }
                            title="Cabinet Color Picker"
                            style={ { padding: '0', width: '40px', height: '40px', borderRadius: '4px', cursor: 'pointer' } }
                        />
                        <span style={ { fontFamily: 'var(--font-mono)' } }>{ interfaceSettings.cabinetColor }</span>
                    </div>
                </FieldGroup>

                <label style={ { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border)' } }>
                    <input
                        type="checkbox"
                        name="glassOverlay"
                        checked={ interfaceSettings.glassOverlay }
                        onChange={ handleChange }
                    />
                    <span>
                        <strong>Reel Glass Overlay Effect</strong>
                        <span style={ { display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' } }>Adds a subtle curved reflection over the spinning reels.</span>
                    </span>
                </label>
            </div>

            <div className="panel" style={ { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' } }>
                <h3>Control Panel</h3>
                <p style={ { fontSize: '0.85rem', color: 'var(--text-muted)' } }>Select the visual style of the interaction buttons.</p>

                <FieldGroup label="Button Style">
                    <select
                        name="buttonStyle"
                        value={ interfaceSettings.buttonStyle }
                        onChange={ handleChange }
                        title="Button Style"
                    >
                        <option value="classic">Retro Arcade (Square blocks)</option>
                        <option value="modern">Modern Video Slot (Rounded)</option>
                        <option value="glass">Glassmorphism (Translucent)</option>
                    </select>
                </FieldGroup>
            </div>
        </div>
    );
}
