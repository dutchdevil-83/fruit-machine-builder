import type { CSSProperties, ReactNode } from 'react';

interface ModalProps
{
    /** Called when the user clicks the backdrop. Omit to make the backdrop non-interactive. */
    onClose?: () => void;
    children: ReactNode;
    /** z-index applied to the backdrop overlay. The content box uses zIndex + 1. Defaults to 12000. */
    zIndex?: number;
    /** Opacity of the black backdrop. Defaults to 0.6. */
    backdropOpacity?: number;
    /** Width of the content box (e.g. '420px'). Unset by default (content-sized up to maxWidth). */
    width?: string;
    /** Max-width of the content box. Defaults to '90%'. */
    maxWidth?: string;
    /** Fixed height of the content box. */
    height?: string;
    /** Max-height of the content box. Triggers overflow:auto when set. */
    maxHeight?: string;
    /** Inner padding of the content box. Defaults to '24px'. */
    padding?: string;
    /** Extra className applied to the content box (e.g. 'fade-in'). */
    className?: string;
    /** Extra inline styles merged onto the content box. These take precedence over defaults. */
    style?: CSSProperties;
}

/**
 * Reusable modal overlay.
 *
 * Renders a fixed semi-transparent backdrop that optionally closes when clicked,
 * with a centred content box on top.  All sizing and appearance props have
 * sensible defaults that cover the most common use-cases; pass `style` to
 * override individual properties for specialised dialogs.
 */
export function Modal( {
    onClose,
    children,
    zIndex = 12000,
    backdropOpacity = 0.6,
    width,
    maxWidth = '90%',
    height,
    maxHeight,
    padding = '24px',
    className,
    style,
}: ModalProps )
{
    return (
        <div
            onClick={ onClose }
            style={ {
                position: 'fixed', inset: 0,
                background: `rgba(0,0,0,${ backdropOpacity })`,
                zIndex,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            } }
        >
            <div
                className={ className }
                onClick={ ( e ) => e.stopPropagation() }
                style={ {
                    background: 'var(--bg-card, #1e1e2e)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding,
                    width,
                    maxWidth,
                    height,
                    maxHeight,
                    overflow: maxHeight ? 'auto' : undefined,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    ...style,
                } }
            >
                { children }
            </div>
        </div>
    );
}
