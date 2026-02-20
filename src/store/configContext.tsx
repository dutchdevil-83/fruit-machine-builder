import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { MachineConfig, SymbolDef, PaylinePattern, PaytableEntry, EditorTab } from '../types/machine';

/* ── Default payline colors ── */
const PAYLINE_COLORS = [ '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6',
    '#e67e22', '#1abc9c', '#e91e63', '#00bcd4', '#8bc34a' ];

/* ── Default classic config ── */
function createDefaultConfig (): MachineConfig
{
    const symbols: SymbolDef[] = [
        { id: 'sym_star', name: 'Star', image: '/images/star.png', isWild: true },
        { id: 'sym_seven', name: 'Seven', image: '/images/seven.png', isWild: false },
        { id: 'sym_bell', name: 'Bell', image: '/images/bell.png', isWild: false },
        { id: 'sym_watermelon', name: 'Watermelon', image: '/images/watermelon.png', isWild: false },
        { id: 'sym_grapes', name: 'Grapes', image: '/images/grapes.png', isWild: false },
        { id: 'sym_strawberry', name: 'Strawberry', image: '/images/strawberry.png', isWild: false },
        { id: 'sym_pear', name: 'Pear', image: '/images/pear.png', isWild: false },
        { id: 'sym_plum', name: 'Plum', image: '/images/plum.png', isWild: false },
        { id: 'sym_orange', name: 'Orange', image: '/images/orange.png', isWild: false },
    ];

    const symIds = symbols.map( s => s.id );
    const stripLength = 24;

    const reelStrips: string[][] = [];
    for ( let r = 0; r < 3; r++ )
    {
        const strip: string[] = [];
        for ( let p = 0; p < stripLength; p++ )
        {
            strip.push( symIds[ p % symIds.length ]! );
        }
        reelStrips.push( strip );
    }

    const paylines: PaylinePattern[] = [
        { id: 1, cells: [ 1, 1, 1 ], color: PAYLINE_COLORS[ 0 ]! },
        { id: 2, cells: [ 0, 0, 0 ], color: PAYLINE_COLORS[ 1 ]! },
        { id: 3, cells: [ 2, 2, 2 ], color: PAYLINE_COLORS[ 2 ]! },
        { id: 4, cells: [ 0, 1, 2 ], color: PAYLINE_COLORS[ 3 ]! },
        { id: 5, cells: [ 2, 1, 0 ], color: PAYLINE_COLORS[ 4 ]! },
    ];

    const paytable: PaytableEntry[] = [
        { symbolId: 'sym_star', payouts: { 3: 200 } },
        { symbolId: 'sym_seven', payouts: { 3: 80 } },
        { symbolId: 'sym_watermelon', payouts: { 3: 80 } },
        { symbolId: 'sym_grapes', payouts: { 3: 80 } },
        { symbolId: 'sym_strawberry', payouts: { 3: 80 } },
        { symbolId: 'sym_bell', payouts: { 3: 40 } },
        { symbolId: 'sym_pear', payouts: { 3: 40 } },
        { symbolId: 'sym_plum', payouts: { 3: 40 } },
        { symbolId: 'sym_orange', payouts: { 3: 40 } },
    ];

    return {
        name: 'Classic Fruit Machine',
        reels: 3,
        rows: 3,
        stripLength,
        symbols,
        reelStrips,
        paylines,
        paytable,
        settings: {
            startCredits: 1000,
            betOptions: [ 1, 2, 5, 10, 20 ],
            defaultBet: 1,
            animation: {
                preset: 'elastic',
                durationMs: 2000,
                spinSpeed: 30,
                bounceStrength: 0.5,
                blurLevel: 5,
            },
            audio: {
                masterVolume: 1.0,
                bgmEnabled: false,
                bgmVolume: 0.5,
                events: {
                    spinStart: { enabled: true, type: 'synth', synthPreset: 'mechanical', volume: 0.8 },
                    reelStop: { enabled: true, type: 'synth', synthPreset: 'click', volume: 0.8 },
                    winNormal: { enabled: true, type: 'synth', synthPreset: 'coin', volume: 1.0 },
                    winBig: { enabled: true, type: 'synth', synthPreset: 'fanfare', volume: 1.0 }
                }
            }
        },
    };
}

/* ── State shape ── */
interface ConfigState
{
    config: MachineConfig;
    activeTab: EditorTab;
}

/* ── Actions ── */
type Action =
    | { type: 'SET_TAB'; tab: EditorTab }
    | { type: 'SET_NAME'; name: string }
    | { type: 'SET_REELS'; count: number }
    | { type: 'SET_ROWS'; rows: number }
    | { type: 'SET_STRIP_LENGTH'; length: number }
    | { type: 'ADD_SYMBOL'; symbol: SymbolDef }
    | { type: 'UPDATE_SYMBOL'; id: string; updates: Partial<SymbolDef> }
    | { type: 'REMOVE_SYMBOL'; id: string }
    | { type: 'SET_REEL_STRIP'; reelIndex: number; strip: string[] }
    | { type: 'SET_REEL_POSITION'; reelIndex: number; position: number; symbolId: string }
    | { type: 'SET_PAYLINES'; paylines: PaylinePattern[] }
    | { type: 'ADD_PAYLINE'; payline: PaylinePattern }
    | { type: 'REMOVE_PAYLINE'; id: number }
    | { type: 'SET_PAYTABLE_ENTRY'; symbolId: string; payouts: Record<number, number> }
    | { type: 'SET_ANIMATION_SETTINGS'; settings: Partial<MachineConfig[ 'settings' ][ 'animation' ]> }
    | { type: 'SET_AUDIO_SETTINGS'; settings: Partial<MachineConfig[ 'settings' ][ 'audio' ]> }
    | { type: 'RENAME_SYMBOL'; oldId: string; newId: string }
    | { type: 'IMPORT_CONFIG'; config: MachineConfig }
    | { type: 'RESET' };

/* ── Reducer ── */
function configReducer ( state: ConfigState, action: Action ): ConfigState
{
    const { config } = state;

    switch ( action.type )
    {
        case 'SET_TAB':
            return { ...state, activeTab: action.tab };

        case 'SET_NAME':
            return { ...state, config: { ...config, name: action.name } };

        case 'SET_REELS': {
            const count = Math.max( 1, action.count );
            const reelStrips = [ ...config.reelStrips ];
            while ( reelStrips.length < count )
            {
                const strip: string[] = [];
                for ( let p = 0; p < config.stripLength; p++ )
                {
                    strip.push( config.symbols[ p % config.symbols.length ]?.id ?? '' );
                }
                reelStrips.push( strip );
            }
            const paylines = config.paylines.map( pl => ( {
                ...pl,
                cells: pl.cells.length < count
                    ? [ ...pl.cells, ...Array( count - pl.cells.length ).fill( 1 ) as number[] ]
                    : pl.cells.slice( 0, count ),
            } ) );
            return {
                ...state,
                config: { ...config, reels: count, reelStrips: reelStrips.slice( 0, count ), paylines },
            };
        }

        case 'SET_ROWS':
            return { ...state, config: { ...config, rows: Math.max( 1, action.rows ) } };

        case 'SET_STRIP_LENGTH': {
            const len = Math.max( 3, action.length );
            const reelStrips = config.reelStrips.map( strip =>
            {
                if ( strip.length >= len ) return strip.slice( 0, len );
                const extended = [ ...strip ];
                const symbols = config.symbols;
                while ( extended.length < len )
                {
                    extended.push( symbols[ extended.length % symbols.length ]?.id ?? '' );
                }
                return extended;
            } );
            return { ...state, config: { ...config, stripLength: len, reelStrips } };
        }

        case 'ADD_SYMBOL':
            return { ...state, config: { ...config, symbols: [ ...config.symbols, action.symbol ] } };

        case 'UPDATE_SYMBOL':
            return {
                ...state,
                config: {
                    ...config,
                    symbols: config.symbols.map( sym =>
                        sym.id === action.id ? { ...sym, ...action.updates } : sym
                    ),
                },
            };

        case 'REMOVE_SYMBOL':
            return {
                ...state,
                config: {
                    ...config,
                    symbols: config.symbols.filter( sym => sym.id !== action.id ),
                    reelStrips: config.reelStrips.map( strip =>
                        strip.map( sId => sId === action.id ? '' : sId )
                    ),
                    paytable: config.paytable.filter( pt => pt.symbolId !== action.id ),
                },
            };

        case 'SET_REEL_STRIP': {
            const reelStrips = [ ...config.reelStrips ];
            reelStrips[ action.reelIndex ] = action.strip;
            return { ...state, config: { ...config, reelStrips } };
        }

        case 'SET_REEL_POSITION': {
            const reelStrips = config.reelStrips.map( ( strip, i ) =>
            {
                if ( i !== action.reelIndex ) return strip;
                const newStrip = [ ...strip ];
                newStrip[ action.position ] = action.symbolId;
                return newStrip;
            } );
            return { ...state, config: { ...config, reelStrips } };
        }

        case 'SET_PAYLINES':
            return { ...state, config: { ...config, paylines: action.paylines } };

        case 'ADD_PAYLINE':
            return { ...state, config: { ...config, paylines: [ ...config.paylines, action.payline ] } };

        case 'REMOVE_PAYLINE':
            return {
                ...state,
                config: { ...config, paylines: config.paylines.filter( pl => pl.id !== action.id ) },
            };

        case 'SET_PAYTABLE_ENTRY': {
            const existing = config.paytable.findIndex( pt => pt.symbolId === action.symbolId );
            const paytable = [ ...config.paytable ];
            if ( existing >= 0 )
            {
                paytable[ existing ] = { symbolId: action.symbolId, payouts: action.payouts };
            } else
            {
                paytable.push( { symbolId: action.symbolId, payouts: action.payouts } );
            }
            return { ...state, config: { ...config, paytable } };
        }

        case 'SET_ANIMATION_SETTINGS':
            return {
                ...state,
                config: {
                    ...config,
                    settings: {
                        ...config.settings,
                        animation: { ...config.settings.animation, ...action.settings }
                    }
                }
            };

        case 'SET_AUDIO_SETTINGS':
            return {
                ...state,
                config: {
                    ...config,
                    settings: {
                        ...config.settings,
                        audio: { ...config.settings.audio, ...action.settings }
                    }
                }
            };

        case 'IMPORT_CONFIG':
            return { ...state, config: action.config };

        case 'RENAME_SYMBOL': {
            const { oldId, newId } = action;
            if ( oldId === newId ) return state;
            return {
                ...state,
                config: {
                    ...config,
                    symbols: config.symbols.map( sym =>
                        sym.id === oldId ? { ...sym, id: newId } : sym
                    ),
                    reelStrips: config.reelStrips.map( strip =>
                        strip.map( sId => sId === oldId ? newId : sId )
                    ),
                    paytable: config.paytable.map( pt =>
                        pt.symbolId === oldId ? { ...pt, symbolId: newId } : pt
                    ),
                },
            };
        }

        case 'RESET':
            return { ...state, config: createDefaultConfig() };

        default:
            return state;
    }
}

/* ── Context ── */
interface ConfigContextValue
{
    state: ConfigState;
    dispatch: React.Dispatch<Action>;
}

const ConfigContext = createContext<ConfigContextValue | null>( null );

export function ConfigProvider ( { children }: { children: ReactNode } )
{
    const [ state, dispatch ] = useReducer( configReducer, {
        config: createDefaultConfig(),
        activeTab: 'config' as EditorTab,
    } );

    return (
        <ConfigContext.Provider value={ { state, dispatch } }>
            { children }
        </ConfigContext.Provider>
    );
}

function useConfigContext (): ConfigContextValue
{
    const ctx = useContext( ConfigContext );
    if ( !ctx ) throw new Error( 'useConfigContext must be used within <ConfigProvider>' );
    return ctx;
}

/* ── Drop-in hook matching old Zustand API ── */
export interface ConfigStoreAPI
{
    config: MachineConfig;
    activeTab: EditorTab;
    setActiveTab: ( tab: EditorTab ) => void;
    setName: ( name: string ) => void;
    setReels: ( count: number ) => void;
    setRows: ( count: number ) => void;
    setStripLength: ( length: number ) => void;
    addSymbol: ( symbol: SymbolDef ) => void;
    updateSymbol: ( id: string, updates: Partial<SymbolDef> ) => void;
    removeSymbol: ( id: string ) => void;
    setReelStrip: ( reelIndex: number, strip: string[] ) => void;
    setReelPosition: ( reelIndex: number, position: number, symbolId: string ) => void;
    setPaylines: ( paylines: PaylinePattern[] ) => void;
    addPayline: ( payline: PaylinePattern ) => void;
    removePayline: ( id: number ) => void;
    setPaytableEntry: ( symbolId: string, payouts: Record<number, number> ) => void;
    setAnimationSettings: ( settings: Partial<MachineConfig[ 'settings' ][ 'animation' ]> ) => void;
    setAudioSettings: ( settings: Partial<MachineConfig[ 'settings' ][ 'audio' ]> ) => void;
    renameSymbol: ( oldId: string, newId: string ) => void;
    exportJSON: () => string;
    importJSON: ( json: string ) => boolean;
    resetToDefault: () => void;
}

/**
 * Drop-in replacement for useConfigStore.
 * Accepts an optional selector — `useConfigStore(s => s.config)` still works.
 */
export function useConfigStore (): ConfigStoreAPI;
export function useConfigStore<T> ( selector: ( store: ConfigStoreAPI ) => T ): T;
export function useConfigStore<T> ( selector?: ( store: ConfigStoreAPI ) => T ): T | ConfigStoreAPI
{
    const { state, dispatch } = useConfigContext();

    const setActiveTab = useCallback( ( tab: EditorTab ) => dispatch( { type: 'SET_TAB', tab } ), [ dispatch ] );
    const setName = useCallback( ( name: string ) => dispatch( { type: 'SET_NAME', name } ), [ dispatch ] );
    const setReels = useCallback( ( count: number ) => dispatch( { type: 'SET_REELS', count } ), [ dispatch ] );
    const setRows = useCallback( ( rows: number ) => dispatch( { type: 'SET_ROWS', rows } ), [ dispatch ] );
    const setStripLength = useCallback( ( length: number ) => dispatch( { type: 'SET_STRIP_LENGTH', length } ), [ dispatch ] );
    const addSymbol = useCallback( ( symbol: SymbolDef ) => dispatch( { type: 'ADD_SYMBOL', symbol } ), [ dispatch ] );
    const updateSymbol = useCallback( ( id: string, updates: Partial<SymbolDef> ) => dispatch( { type: 'UPDATE_SYMBOL', id, updates } ), [ dispatch ] );
    const removeSymbol = useCallback( ( id: string ) => dispatch( { type: 'REMOVE_SYMBOL', id } ), [ dispatch ] );
    const setReelStrip = useCallback( ( reelIndex: number, strip: string[] ) => dispatch( { type: 'SET_REEL_STRIP', reelIndex, strip } ), [ dispatch ] );
    const setReelPosition = useCallback( ( reelIndex: number, position: number, symbolId: string ) => dispatch( { type: 'SET_REEL_POSITION', reelIndex, position, symbolId } ), [ dispatch ] );
    const setPaylines = useCallback( ( paylines: PaylinePattern[] ) => dispatch( { type: 'SET_PAYLINES', paylines } ), [ dispatch ] );
    const addPayline = useCallback( ( payline: PaylinePattern ) => dispatch( { type: 'ADD_PAYLINE', payline } ), [ dispatch ] );
    const removePayline = useCallback( ( id: number ) => dispatch( { type: 'REMOVE_PAYLINE', id } ), [ dispatch ] );
    const setPaytableEntry = useCallback( ( symbolId: string, payouts: Record<number, number> ) => dispatch( { type: 'SET_PAYTABLE_ENTRY', symbolId, payouts } ), [ dispatch ] );
    const setAnimationSettings = useCallback( ( settings: Partial<MachineConfig[ 'settings' ][ 'animation' ]> ) => dispatch( { type: 'SET_ANIMATION_SETTINGS', settings } ), [ dispatch ] );
    const setAudioSettings = useCallback( ( settings: Partial<MachineConfig[ 'settings' ][ 'audio' ]> ) => dispatch( { type: 'SET_AUDIO_SETTINGS', settings } ), [ dispatch ] );
    const renameSymbol = useCallback( ( oldId: string, newId: string ) => dispatch( { type: 'RENAME_SYMBOL', oldId, newId } ), [ dispatch ] );

    const exportJSON = useCallback( () => JSON.stringify( state.config, null, 2 ), [ state.config ] );
    const importJSON = useCallback( ( json: string ): boolean =>
    {
        try
        {
            const parsed = JSON.parse( json ) as MachineConfig;
            if ( !parsed.symbols || !parsed.reelStrips || !parsed.paylines ) return false;
            dispatch( { type: 'IMPORT_CONFIG', config: parsed } );
            return true;
        } catch
        {
            return false;
        }
    }, [ dispatch ] );
    const resetToDefault = useCallback( () => dispatch( { type: 'RESET' } ), [ dispatch ] );

    const store: ConfigStoreAPI = {
        config: state.config,
        activeTab: state.activeTab,
        setActiveTab,
        setName,
        setReels,
        setRows,
        setStripLength,
        addSymbol,
        updateSymbol,
        removeSymbol,
        setReelStrip,
        setReelPosition,
        setPaylines,
        addPayline,
        removePayline,
        setPaytableEntry,
        setAnimationSettings,
        setAudioSettings,
        renameSymbol,
        exportJSON,
        importJSON,
        resetToDefault,
    };

    if ( selector ) return selector( store );
    return store;
}
