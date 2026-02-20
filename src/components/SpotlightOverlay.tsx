import { useEffect, useState, useRef } from 'react';

interface SpotlightOverlayProps
{
    targetSelector: string;
    children: React.ReactNode;
    onClose: () => void;
}

export function SpotlightOverlay ( { targetSelector, children, onClose }: SpotlightOverlayProps )
{
    const [ rect, setRect ] = useState<DOMRect | null>( null );
    const overlayRef = useRef<HTMLDivElement>( null );

    useEffect( () =>
    {
        const el = document.querySelector( targetSelector );
        if ( el )
        {
            const r = el.getBoundingClientRect();
            setRect( r );
            el.scrollIntoView( { behavior: 'smooth', block: 'center' } );
        } else
        {
            setRect( null );
        }
    }, [ targetSelector ] );

    const padding = 8;
    const clipPath = rect
        ? `polygon(
        0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
        ${ rect.left - padding }px ${ rect.top - padding }px,
        ${ rect.left - padding }px ${ rect.bottom + padding }px,
        ${ rect.right + padding }px ${ rect.bottom + padding }px,
        ${ rect.right + padding }px ${ rect.top - padding }px,
        ${ rect.left - padding }px ${ rect.top - padding }px
      )`
        : 'none';

    // Position tooltip near the highlighted element
    const tooltipStyle: React.CSSProperties = rect ? {
        position: 'fixed',
        top: rect.bottom + padding + 16,
        left: Math.max( 20, Math.min( rect.left, window.innerWidth - 420 ) ),
        maxWidth: '400px',
        zIndex: 10001,
    } : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '500px',
        zIndex: 10001,
    };

    // If tooltip goes below viewport, place it above the target
    if ( rect && rect.bottom + 300 > window.innerHeight )
    {
        tooltipStyle.top = rect.top - padding - 16;
        tooltipStyle.transform = 'translateY(-100%)';
    }

    return (
        <>
            {/* Backdrop with cutout */ }
            <div
                ref={ overlayRef }
                onClick={ onClose }
                style={ {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    clipPath,
                    zIndex: 10000,
                    transition: 'clip-path 0.3s ease',
                } }
            />

            {/* Tooltip card */ }
            <div style={ tooltipStyle }>
                <div style={ {
                    background: 'var(--bg-card, #1e1e2e)',
                    border: '2px solid var(--accent, #6c63ff)',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    color: 'var(--text-primary, #eee)',
                } }>
                    { children }
                </div>
            </div>
        </>
    );
}
