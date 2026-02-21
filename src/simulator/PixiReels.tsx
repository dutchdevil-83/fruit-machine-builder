import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import type { MachineConfig, SpinResult } from '../types/machine';

interface PixiReelsProps
{
    config: MachineConfig;
    result: SpinResult | null;
    isSpinning: boolean;
    winPaylineIds: Set<number>;
}

export function PixiReels ( { config, result, isSpinning, winPaylineIds }: PixiReelsProps )
{
    const containerRef = useRef<HTMLDivElement>( null );
    const appRef = useRef<PIXI.Application | null>( null );
    const texturesRef = useRef<Map<string, PIXI.Texture>>( new Map() );

    // Animation state refs
    const containersRef = useRef<PIXI.Container[]>( [] );
    const spritesRef = useRef<PIXI.Sprite[][]>( [] );
    const tickerRef = useRef<PIXI.Ticker | null>( null );
    const spinStateRef = useRef( {
        spinning: false,
        speed: 0,
        landingOffset: 0,
    } );

    const CELL_SIZE = 86;
    const SYM_SIZE = 80;

    // Re-build standard background grid (run once)
    const drawBackground = ( app: PIXI.Application ) =>
    {
        const bgLayer = new PIXI.Container();
        app.stage.addChildAt( bgLayer, 0 );

        for ( let reel = 0; reel < config.reels; reel++ )
        {
            for ( let row = 0; row < config.rows; row++ )
            {
                const bg = new PIXI.Graphics();
                bg.roundRect( 0, 0, SYM_SIZE, SYM_SIZE, 8 );
                bg.fill( 0xf5f5f5 );
                bg.stroke( { color: 0xdddddd, width: 1 } );
                bg.x = reel * CELL_SIZE;
                bg.y = row * CELL_SIZE;
                bgLayer.addChild( bg );
            }
        }
    };

    // Build the reel columns
    const buildReels = ( app: PIXI.Application, textures: Map<string, PIXI.Texture> ) =>
    {
        // Clear old
        containersRef.current.forEach( c => c.destroy( { children: true } ) );
        containersRef.current = [];
        spritesRef.current = [];

        for ( let reel = 0; reel < config.reels; reel++ )
        {
            const container = new PIXI.Container();
            container.x = reel * CELL_SIZE;
            container.y = 0;

            // We need config.rows + 1 sprites to allow smooth rolling
            const reelSprites: PIXI.Sprite[] = [];
            const symbolsToUse = config.reelStrips[ reel ] || config.symbols.map( s => s.id );

            for ( let i = 0; i <= config.rows; i++ )
            {
                const symId = symbolsToUse[ Math.floor( Math.random() * symbolsToUse.length ) ];
                const tex = textures.get( symId! ) || PIXI.Texture.WHITE;
                const sprite = new PIXI.Sprite( tex );

                sprite.anchor.set( 0.5 );
                sprite.width = 56;
                sprite.height = 56;
                sprite.x = SYM_SIZE / 2; // Center horizontally
                sprite.y = i * CELL_SIZE + ( SYM_SIZE / 2 ); // Center vertically

                // Custom property to track what symbol this is
                ( sprite as any ).symId = symId;

                container.addChild( sprite );
                reelSprites.push( sprite );
            }

            // Add a mask to hide symbols outside the grid
            const mask = new PIXI.Graphics();
            mask.rect( container.x, 0, SYM_SIZE, config.rows * CELL_SIZE );
            mask.fill( 0xffffff );
            app.stage.addChild( mask );
            container.mask = mask;

            app.stage.addChild( container );
            containersRef.current.push( container );
            spritesRef.current.push( reelSprites );
        }
    };

    const updateStaticSymbols = ( textures: Map<string, PIXI.Texture> ) =>
    {
        if ( !result ) return;
        for ( let reel = 0; reel < config.reels; reel++ )
        {
            const sprites = spritesRef.current[ reel ];
            if ( !sprites ) continue;

            for ( let row = 0; row < config.rows; row++ )
            {
                const sprite = sprites[ row ];
                if ( !sprite ) continue;

                const symId = result.grid[ row ]?.[ reel ];
                if ( symId && textures.has( symId ) )
                {
                    sprite.texture = textures.get( symId )!;
                    ( sprite as any ).symId = symId;
                }
                sprite.y = row * CELL_SIZE + ( SYM_SIZE / 2 );
                sprite.alpha = 1;
            }
            // Hide the extra sprite used for wrapping
            const wrapSprite = sprites[ config.rows ];
            if ( wrapSprite )
            {
                wrapSprite.alpha = 0;
            }
        }
    };

    useEffect( () =>
    {
        if ( !containerRef.current ) return;

        let isMounted = true;
        let isInitialized = false;
        const app = new PIXI.Application();

        const initPixi = async () =>
        {
            await app.init( {
                width: config.reels * CELL_SIZE - 6, // Remove last gap
                height: config.rows * CELL_SIZE - 6,
                backgroundAlpha: 0,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            } );

            isInitialized = true;

            if ( !isMounted )
            {
                try
                {
                    app.destroy( true );
                } catch ( e ) { }
                return;
            }

            if ( containerRef.current )
            {
                containerRef.current.appendChild( app.canvas );
            }
            appRef.current = app;

            // Load all textures
            const texturePromises = config.symbols
                .filter( ( s ) => s.image )
                .map( async ( s ) =>
                {
                    try
                    {
                        const tex = await PIXI.Assets.load( s.image );
                        // optimize texture for tiling/sliding
                        tex.source.scaleMode = 'nearest';
                        return { id: s.id, tex };
                    } catch ( e )
                    {
                        return null;
                    }
                } );

            const loaded = await Promise.all( texturePromises );
            const textureMap = new Map<string, PIXI.Texture>();
            loaded.forEach( ( lt ) =>
            {
                if ( lt ) textureMap.set( lt.id, lt.tex );
            } );
            texturesRef.current = textureMap;

            drawBackground( app );
            buildReels( app, textureMap );

            // Create Animation Ticker
            tickerRef.current = new PIXI.Ticker();
            tickerRef.current.add( ( ticker ) =>
            {
                const state = spinStateRef.current;
                if ( !state.spinning && state.landingOffset === 0 ) return;

                const animConfig = config.settings.animation || {
                    preset: 'elastic',
                    durationMs: 2000,
                    spinSpeed: 30,
                    bounceStrength: 0.5,
                    blurLevel: 5
                };
                const { spinSpeed, blurLevel, bounceStrength } = animConfig;
                const dt = ticker.deltaTime;

                if ( state.spinning )
                {
                    state.speed = spinSpeed;
                } else
                {
                    // Landing easing
                    state.speed *= 0.85;
                    if ( state.speed < 0.5 )
                    {
                        state.speed = 0;
                        state.landingOffset = bounceStrength > 0 ? bounceStrength * 20 : 0; // Simple bounce trigger
                    }
                }

                // Process each reel
                for ( let reel = 0; reel < config.reels; reel++ )
                {
                    const sprites = spritesRef.current[ reel ];
                    if ( !sprites ) continue;

                    const symbolsToUse = config.reelStrips[ reel ] || config.symbols.map( s => s.id );

                    for ( let i = 0; i < sprites.length; i++ )
                    {
                        const sprite = sprites[ i ]!;

                        if ( state.spinning || state.speed > 0 )
                        {
                            sprite.alpha = blurLevel > 0 ? 0.7 : 1;
                            sprite.y += state.speed * dt;

                            // If moved below the view, wrap to top
                            const bottomLimit = config.rows * CELL_SIZE + ( SYM_SIZE / 2 );
                            if ( sprite.y > bottomLimit )
                            {
                                sprite.y -= ( config.rows + 1 ) * CELL_SIZE;
                                // change texture
                                const symId = symbolsToUse[ Math.floor( Math.random() * symbolsToUse.length ) ];
                                if ( symId && texturesRef.current.has( symId ) )
                                {
                                    sprite.texture = texturesRef.current.get( symId )!;
                                }
                            }
                        }
                    }

                    // Bounce logic
                    if ( !state.spinning && state.speed === 0 )
                    {
                        updateStaticSymbols( texturesRef.current );
                        // apply bounce offset
                        if ( state.landingOffset > 0 )
                        {
                            sprites.forEach( s => s.y += state.landingOffset );
                            state.landingOffset -= dt * 2;
                            if ( state.landingOffset < 0 )
                            {
                                state.landingOffset = 0;
                                updateStaticSymbols( texturesRef.current ); // reset exact
                            }
                        }
                    }
                }
            } );

            tickerRef.current.start();

            // Initial render sync
            if ( result ) updateStaticSymbols( textureMap );
        };

        initPixi();

        return () =>
        {
            isMounted = false;
            if ( tickerRef.current )
            {
                tickerRef.current.destroy();
                tickerRef.current = null;
            }
            if ( isInitialized )
            {
                try
                {
                    app.destroy( true );
                } catch ( e ) { }
            }
            appRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ config.reels, config.rows, config.symbols ] );

    // Handle spin state changes
    useEffect( () =>
    {
        spinStateRef.current.spinning = isSpinning;
        if ( !isSpinning && result && spritesRef.current.length > 0 && spinStateRef.current.speed === 0 )
        {
            // If not spinning and somehow speed was already 0 (e.g. initial load)
            updateStaticSymbols( texturesRef.current );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ isSpinning, result, winPaylineIds ] );

    return <div ref={ containerRef } />;
}
