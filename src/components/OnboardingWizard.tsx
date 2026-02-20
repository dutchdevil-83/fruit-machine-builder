import { useState, useCallback, useEffect } from 'react';
import { SpotlightOverlay } from './SpotlightOverlay';
import { useConfigStore } from '../store/configStore';

interface WizardStep
{
    title: string;
    description: string;
    targetSelector: string;
    targetTab?: string;
}

const STEPS: WizardStep[] = [
    {
        title: 'Welcome to Fruit Machine Builder! 🎰',
        description: 'This tool lets you design, configure, and test your own custom slot machine. We\'ll walk you through each step. Click "Next" to begin!',
        targetSelector: '.app-header h1',
    },
    {
        title: 'Step 1: Navigation Sidebar',
        description: 'The sidebar contains all the design tools. Each tab configures a different aspect of your machine. Green badges mean that section is complete.',
        targetSelector: '.app-sidebar',
    },
    {
        title: 'Step 2: Machine Config ⚙️',
        description: 'Start here. Set the number of reels (columns), rows (visible symbols), and reel strip length. A classic fruit machine is 3×3.',
        targetSelector: '.nav-item',
        targetTab: 'config',
    },
    {
        title: 'Step 3: Symbols 🎨',
        description: 'Create your symbols — the images that appear on the reels. Upload custom graphics, name each symbol, and mark one as "Wild" (substitutes for any symbol).',
        targetSelector: '.nav-item:nth-child(2)',
        targetTab: 'symbols',
    },
    {
        title: 'Step 4: Reel Strips 🎰',
        description: 'Design the sequence of symbols on each reel. Drag symbols from the palette onto each reel strip. More copies of a symbol = higher frequency.',
        targetSelector: '.nav-item:nth-child(3)',
        targetTab: 'reels',
    },
    {
        title: 'Step 5: Paytable 💰',
        description: 'Set how much each symbol pays when matched. Define payouts for 3-of-a-kind (or more on 5-reel machines).',
        targetSelector: '.nav-item:nth-child(4)',
        targetTab: 'paytable',
    },
    {
        title: 'Step 6: Paylines 📐',
        description: 'Define the winning paths across your reels. Click cells to create patterns. Use "Generate Standard" for common layouts.',
        targetSelector: '.nav-item:nth-child(5)',
        targetTab: 'paylines',
    },
    {
        title: 'Step 7: Test Your Machine! ▶️',
        description: 'Head to the Simulator tab to spin your machine live. Check the Statistics tab to verify your RTP over millions of spins.',
        targetSelector: '.nav-section:nth-child(2)',
        targetTab: 'simulator',
    },
    {
        title: 'Step 8: Save & Export 💾',
        description: 'Save your machine as a preset, export the JSON config, or build a standalone package. You can also import configs from other creators.',
        targetSelector: '.app-header',
    },
];

const LS_KEY = 'fmb_onboarding_done';

export function OnboardingWizard ()
{
    const [ step, setStep ] = useState( 0 );
    const [ isActive, setIsActive ] = useState( false );
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

    const current = STEPS[ step ]!;

    return (
        <SpotlightOverlay
            targetSelector={ current.targetSelector }
            onClose={ handleSkip }
        >
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
