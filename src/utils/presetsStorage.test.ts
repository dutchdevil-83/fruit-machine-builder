import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPresetNames, savePreset, loadPreset } from './presetsStorage';

// Use a simple in-memory map to simulate localStorage
const store: Record<string, string> = {};
const localStorageMock = {
    getItem: ( key: string ) => store[ key ] ?? null,
    setItem: ( key: string, value: string ) => { store[ key ] = value; },
    removeItem: ( key: string ) => { delete store[ key ]; },
    clear: () => { Object.keys( store ).forEach( k => delete store[ k ] ); },
};

vi.stubGlobal( 'localStorage', localStorageMock );

describe( 'presetsStorage', () =>
{
    beforeEach( () =>
    {
        localStorageMock.clear();
    } );

    describe( 'getPresetNames', () =>
    {
        it( 'returns an empty array when no presets exist', () =>
        {
            expect( getPresetNames() ).toEqual( [] );
        } );

        it( 'returns the names of saved presets', () =>
        {
            savePreset( 'Alpha', '{"name":"Alpha"}' );
            savePreset( 'Beta', '{"name":"Beta"}' );
            expect( getPresetNames() ).toEqual( expect.arrayContaining( [ 'Alpha', 'Beta' ] ) );
        } );
    } );

    describe( 'savePreset / loadPreset', () =>
    {
        it( 'saves a config string and loads it back as a JSON string', () =>
        {
            const configStr = '{"name":"Test","reels":3}';
            savePreset( 'TestMachine', configStr );
            const loaded = loadPreset( 'TestMachine' );
            expect( loaded ).not.toBeNull();
            expect( JSON.parse( loaded! ) ).toMatchObject( { name: 'Test', reels: 3 } );
        } );

        it( 'returns null for a missing preset', () =>
        {
            expect( loadPreset( 'does-not-exist' ) ).toBeNull();
        } );

        it( 'overwrites an existing preset with the same name', () =>
        {
            savePreset( 'Machine', '{"name":"v1"}' );
            savePreset( 'Machine', '{"name":"v2"}' );
            const loaded = loadPreset( 'Machine' );
            expect( JSON.parse( loaded! ) ).toMatchObject( { name: 'v2' } );
        } );

        it( 'handles legacy presets stored as raw JSON strings', () =>
        {
            // Simulate old TemplateSelector behaviour: value was a JSON string
            const legacyJSON = '{"name":"Legacy","reels":5}';
            const db = { LegacyMachine: legacyJSON };
            localStorageMock.setItem( 'fmb_presets', JSON.stringify( db ) );

            const loaded = loadPreset( 'LegacyMachine' );
            expect( loaded ).toBe( legacyJSON );
        } );
    } );
} );
