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

    // Position tooltip near the highlighted element, clamped to viewport
    const tooltipHeight = 220; // estimated max height of tooltip card
    const tooltipWidth = 400;
    const gap = 16;

    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        maxWidth: `${ tooltipWidth }px`,
        zIndex: 10001,
    };

    if ( rect )
    {
        // Horizontal: clamp so tooltip stays within viewport
        tooltipStyle.left = Math.max( 16, Math.min( rect.left, window.innerWidth - tooltipWidth - 16 ) );

        const spaceBelow = window.innerHeight - rect.bottom - padding - gap;
        const spaceAbove = rect.top - padding - gap;

        if ( spaceBelow >= tooltipHeight )
        {
            // Prefer placing below the target
            tooltipStyle.top = rect.bottom + padding + gap;
        }
        else if ( spaceAbove >= tooltipHeight )
        {
            // Place above the target
            tooltipStyle.top = rect.top - padding - gap - tooltipHeight;
        }
        else
        {
            // Neither fits — place beside the target or center vertically
            const centeredTop = Math.max( 16, Math.min(
                rect.top + rect.height / 2 - tooltipHeight / 2,
                window.innerHeight - tooltipHeight - 16
            ) );
            tooltipStyle.top = centeredTop;
            // Shift horizontally to the right of the target if possible
            const rightOfTarget = rect.right + gap;
            if ( rightOfTarget + tooltipWidth < window.innerWidth - 16 )
            {
                tooltipStyle.left = rightOfTarget;
            }
        }
    }
    else
    {
        // No target found — center in viewport
        tooltipStyle.top = '50%';
        tooltipStyle.left = '50%';
        tooltipStyle.transform = 'translate(-50%, -50%)';
        tooltipStyle.maxWidth = '500px';
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
