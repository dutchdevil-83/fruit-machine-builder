/**
 * Centralised access to the `fmb_presets` localStorage key.
 *
 * Presets are stored as parsed JSON objects so that the outer record can be
 * serialised with a single JSON.stringify call.  Legacy entries saved as raw
 * JSON strings (by an older version of the app) are handled transparently in
 * loadPreset().
 */

const PRESETS_KEY = 'fmb_presets';

type PresetsRecord = Record<string, unknown>;

function getPresetsDB(): PresetsRecord
{
    try
    {
        return JSON.parse( localStorage.getItem( PRESETS_KEY ) ?? '{}' ) as PresetsRecord;
    } catch
    {
        return {};
    }
}

function setPresetsDB( db: PresetsRecord ): void
{
    localStorage.setItem( PRESETS_KEY, JSON.stringify( db ) );
}

/** Returns the list of saved preset names. */
export function getPresetNames(): string[]
{
    return Object.keys( getPresetsDB() );
}

/**
 * Saves (or overwrites) a preset.
 * @param name      - The preset name / key.
 * @param configJSON - The machine config serialised as a JSON string
 *                     (as returned by `exportJSON()`).
 */
export function savePreset( name: string, configJSON: string ): void
{
    const db = getPresetsDB();
    db[ name ] = JSON.parse( configJSON ) as Record<string, unknown>;
    setPresetsDB( db );
}

/**
 * Loads a preset and returns it as a JSON string suitable for `importJSON()`.
 * Returns `null` when the preset does not exist.
 *
 * Handles both the current format (stored as an object) and the legacy format
 * where the value was stored as a raw JSON string.
 */
export function loadPreset( name: string ): string | null
{
    const db = getPresetsDB();
    const value = db[ name ];
    if ( value === undefined ) return null;
    // Legacy path: value was saved as a JSON string instead of an object.
    if ( typeof value === 'string' ) return value;
    return JSON.stringify( value );
}
