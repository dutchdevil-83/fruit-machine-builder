import { useState, useCallback, useEffect } from 'react';
import { SpotlightOverlay } from './SpotlightOverlay';
import { useConfigStore } from '../store/configStore';

import IconSlotMachine from '~icons/game-icons/slot-machine';
import IconSettings from '~icons/lucide/settings';
import IconPalette from '~icons/lucide/palette';
import IconCoins from '~icons/game-icons/coins';
import IconRuler from '~icons/lucide/baseline';
import IconPlay from '~icons/lucide/play';
import IconSave from '~icons/lucide/save';

interface WizardStep
{
    title: React.ReactNode;
    description: string;
    targetSelector: string;
    targetTab?: string;
    autoAdvance?: boolean;
}

const STEPS: WizardStep[] = [
    {
        title: <span style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>Welcome to Fruit Machine Builder! <IconSlotMachine /></span>,
        description: 'This tool lets you design, configure, and test your own custom slot machine. We\'ll walk you through each step. Click "Next" to begin!',
        targetSelector: '.app-header h1',
    },
    {
        title: 'Step 1: Navigation Sidebar',
        description: 'The sidebar contains all the design tools. Each tab configures a different aspect of your machine. Green badges mean that section is complete.',
        targetSelector: '.app-sidebar',
    },
    {
        title: <span style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>Step 2: Machine Config <IconSettings /></span>,
        description: 'Start here. Set the number of reels (columns), rows (visible symbols), and reel strip length. Click the highlighted tab to proceed.',
        targetSelector: '.nav-item',
        targetTab: 'config',
        autoAdvance: true,
    },
    {
        title: <span style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>Step 3: Symbols <IconPalette /></span>,
        description: 'Create your symbols — the images that appear on the reels. Click "Symbols" to proceed.',
        targetSelector: '.nav-item:nth-child(3)',
        targetTab: 'symbols',
        autoAdvance: true,
    },
    {
        title: <span style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>Step 4: Reel Strips <IconSlotMachine /></span>,
        description: 'Design the sequence of symbols on each reel. Drag symbols from the palette. Click "Reel Strips" to proceed.',
        targetSelector: '.nav-item:nth-child(4)',
        targetTab: 'reels',
        autoAdvance: true,
    },
    {
        title: <span style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>Step 5: Paytable <IconCoins /></span>,
        description: 'Set how much each symbol pays when matched. Click "Paytable" to proceed.',
        targetSelector: '.nav-item:nth-child(5)',
        targetTab: 'paytable',
        autoAdvance: true,
    },
    {
        title: <span style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>Step 6: Paylines <IconRuler /></span>,
        description: 'Define the winning paths across your reels. Use "Generate Standard" for common layouts. Click "Paylines".',
        targetSelector: '.nav-item:nth-child(6)',
        targetTab: 'paylines',
        autoAdvance: true,
    },
    {
        title: <span style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>Step 7: Test Your Machine! <IconPlay /></span>,
        description: 'Head to the Simulator tab to spin your machine live! Click "Simulator" to proceed.',
        targetSelector: '.nav-item:nth-child(10)',
        targetTab: 'simulator',
        autoAdvance: true,
    },
    {
        title: <span style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>Step 8: Save & Export <IconSave /></span>,
        description: 'Save your machine as a preset, export the JSON config, or build a standalone package. You\'ve mastered the basics!',
        targetSelector: '.app-header',
    },
];

const LS_KEY = 'fmb_onboarding_done';

export function OnboardingWizard ()
{
    const [ step, setStep ] = useState( 0 );
    const [ isActive, setIsActive ] = useState( false );
    const [ hint, setHint ] = useState<string | null>( null );
    const setActiveTab = useConfigStore( ( s ) => s.setActiveTab );

    // Auto-trigger on first visit
    useEffect( () =>
    {
        const done = localStorage.getItem( LS_KEY );
        if ( !done )
        {
            setIsActive( true );
        }
    }, [] );

    const handleNext = useCallback( () =>
    {
        const nextStep = step + 1;
        if ( nextStep >= STEPS.length )
        {
            localStorage.setItem( LS_KEY, 'true' );
            setIsActive( false );
            setStep( 0 );
            return;
        }
        setStep( nextStep );
        const target = STEPS[ nextStep ];
        if ( target?.targetTab )
        {
            setActiveTab( target.targetTab as any );
        }
    }, [ step, setActiveTab ] );

    const handleBack = useCallback( () =>
    {
        if ( step > 0 )
        {
            const prev = step - 1;
            setStep( prev );
            const target = STEPS[ prev ];
            if ( target?.targetTab )
            {
                setActiveTab( target.targetTab as any );
            }
        }
    }, [ step, setActiveTab ] );

    const handleSkip = useCallback( () =>
    {
        localStorage.setItem( LS_KEY, 'true' );
        setIsActive( false );
        setStep( 0 );
    }, [] );

    // Public trigger (re-open wizard)
    const handleOpen = useCallback( () =>
    {
        setStep( 0 );
        setIsActive( true );
    }, [] );

    if ( !isActive )
    {
        return (
            <button
                className="btn"
                onClick={ handleOpen }
                title="Open guided tour"
                style={ { padding: '6px 12px', fontSize: '0.85rem' } }
            >
                ❓ Tour
            </button>
        );
    }

    // Auto-advance observer
    useEffect( () =>
    {
        if ( !isActive ) return;
        const current = STEPS[ step ];
        if ( !current?.autoAdvance ) return;

        const handleGlobalClick = ( e: MouseEvent ) =>
        {
            const targetEl = document.querySelector( current.targetSelector );
            if ( targetEl && targetEl.contains( e.target as Node ) )
            {
                // Interacted with target, auto advance
                setHint( null );
                setTimeout( () =>
                {
                    handleNext();
                }, 50 ); // slight delay
            }
        };

        document.addEventListener( 'click', handleGlobalClick, true );
        return () => document.removeEventListener( 'click', handleGlobalClick, true );
    }, [ isActive, step, handleNext ] );

    const handleBackdropClick = useCallback( () =>
    {
        setHint( "👉 Please interact with the highlighted area or click 'Next'." );
        setTimeout( () => setHint( null ), 3000 );
    }, [] );

    const current = STEPS[ step ]!;

    return (
        <SpotlightOverlay
            targetSelector={ current.targetSelector }
            onClose={ handleSkip }
            onBackdropClick={ handleBackdropClick }
        >
            <style>{ `
                @keyframes fmb-shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `}</style>
            <div style={ { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } }>
                <span style={ { fontSize: '0.7rem', color: 'var(--text-muted)' } }>
                    { step + 1 } / { STEPS.length }
                </span>
                <div style={ { flex: 1, height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' } }>
                    <div style={ { width: `${ ( ( step + 1 ) / STEPS.length ) * 100 }%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' } } />
                </div>
            </div>

            <h3 style={ { marginBottom: '10px', fontSize: '1.05rem' } }>{ current.title }</h3>
            <p style={ { fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '16px' } }>
                { current.description }
            </p>

            { hint && (
                <div style={ {
                    marginBottom: '16px',
                    padding: '8px 12px',
                    background: 'rgba(231, 76, 60, 0.15)',
                    border: '1px solid var(--danger)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--danger)',
                    fontSize: '0.85rem',
                    animation: 'fmb-shake 0.4s ease',
                } }>
                    { hint }
                </div>
            ) }

            <div style={ { display: 'flex', gap: '8px', justifyContent: 'space-between' } }>
                <button
                    className="btn"
                    onClick={ handleSkip }
                    style={ { fontSize: '0.8rem', opacity: 0.7 } }
                >
                    Skip Tour
                </button>
                <div style={ { display: 'flex', gap: '8px' } }>
                    { step > 0 && (
                        <button className="btn" onClick={ handleBack } style={ { fontSize: '0.85rem' } }>
                            ← Back
                        </button>
                    ) }
                    <button
                        className="btn btn-primary"
                        onClick={ handleNext }
                        style={ { fontSize: '0.85rem', minWidth: '80px' } }
                    >
                        { step === STEPS.length - 1 ? '✅ Finish' : 'Next →' }
                    </button>
                </div>
            </div>
        </SpotlightOverlay>
    );
}
