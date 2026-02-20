import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

interface ToastMessage
{
    id: number;
    text: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContextValue
{
    showToast: ( text: string, type?: 'success' | 'error' | 'info' ) => void;
}

const ToastContext = createContext<ToastContextValue | null>( null );

export function useToast (): ToastContextValue
{
    const ctx = useContext( ToastContext );
    if ( !ctx ) throw new Error( 'useToast must be used within <ToastProvider>' );
    return ctx;
}

export function ToastProvider ( { children }: { children: ReactNode } )
{
    const [ toasts, setToasts ] = useState<ToastMessage[]>( [] );

    const showToast = useCallback( ( text: string, type: 'success' | 'error' | 'info' = 'success' ) =>
    {
        const id = Date.now();
        setToasts( prev => [ ...prev, { id, text, type } ] );
    }, [] );

    useEffect( () =>
    {
        if ( toasts.length === 0 ) return;
        const timer = setTimeout( () =>
        {
            setToasts( prev => prev.slice( 1 ) );
        }, 3000 );
        return () => clearTimeout( timer );
    }, [ toasts ] );

    return (
        <ToastContext.Provider value={ { showToast } }>
            { children }
            <div style={ {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 20000,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            } }>
                { toasts.map( ( toast ) => (
                    <div
                        key={ toast.id }
                        style={ {
                            padding: '12px 20px',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                            animation: 'toastSlideIn 0.3s ease',
                            background: toast.type === 'success' ? '#2ecc71'
                                : toast.type === 'error' ? '#e74c3c'
                                    : 'var(--accent, #6c63ff)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            minWidth: '250px',
                        } }
                    >
                        <span>{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️' }</span>
                        { toast.text }
                    </div>
                ) ) }
            </div>
            <style>{ `
        @keyframes toastSlideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </ToastContext.Provider>
    );
}
