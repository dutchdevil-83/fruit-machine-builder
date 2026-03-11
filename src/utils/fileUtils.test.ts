import { describe, it, expect, beforeEach, vi } from 'vitest';
import { downloadJSON } from './fileUtils';

describe( 'downloadJSON', () =>
{
    let clickSpy: ReturnType<typeof vi.fn>;
    let anchor: { href: string; download: string; click: ReturnType<typeof vi.fn> };

    beforeEach( () =>
    {
        clickSpy = vi.fn();
        anchor = { href: '', download: '', click: clickSpy };

        vi.stubGlobal( 'URL', {
            createObjectURL: vi.fn( () => 'blob:mock-url' ),
            revokeObjectURL: vi.fn(),
        } );

        vi.stubGlobal( 'Blob', class MockBlob
        {
            readonly _content: string[];
            constructor( content: string[] ) { this._content = content; }
        } );

        vi.stubGlobal( 'document', {
            createElement: vi.fn( () => anchor ),
        } );
    } );

    it( 'creates an object URL from a Blob and triggers a click', () =>
    {
        downloadJSON( 'test.json', '{"hello":"world"}' );
        expect( URL.createObjectURL ).toHaveBeenCalledOnce();
        expect( URL.revokeObjectURL ).toHaveBeenCalledWith( 'blob:mock-url' );
        expect( clickSpy ).toHaveBeenCalledOnce();
    } );

    it( 'sets the anchor href and download attributes correctly', () =>
    {
        downloadJSON( 'my-file.json', '{}' );
        expect( anchor.href ).toBe( 'blob:mock-url' );
        expect( anchor.download ).toBe( 'my-file.json' );
    } );
} );
