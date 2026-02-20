import { useMemo } from 'react';
import { useConfigStore } from '../store/configStore';
import type { MachineConfig, EditorTab } from '../types/machine';

export interface WorkflowStep
{
    id: string;
    title: string;
    description: string;
    isComplete: ( config: MachineConfig ) => boolean;
    targetTab?: EditorTab;
}

export interface WorkflowDef
{
    id: string;
    title: string;
    description: string;
    steps: WorkflowStep[];
}

interface WorkflowGuideProps
{
    workflow: WorkflowDef;
    onClose: () => void;
}

export function WorkflowGuide ( { workflow, onClose }: WorkflowGuideProps )
{
    const config = useConfigStore( ( s ) => s.config );
    const setActiveTab = useConfigStore( ( s ) => s.setActiveTab );

    const stepStatuses = useMemo( () =>
    {
        return workflow.steps.map( step => step.isComplete( config ) );
    }, [ workflow, config ] );

    // Find first incomplete step
    const activeIndex = stepStatuses.findIndex( done => !done );
    const allDone = activeIndex === -1;

    return (
        <div
            className="fade-in"
            style={ {
                position: 'fixed',
                right: '20px',
                top: '80px',
                width: '320px',
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto',
                background: 'var(--bg-card, #1e1e2e)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                zIndex: 9000,
                padding: '20px',
            } }
        >
            {/* Header */ }
            <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } }>
                <h3 style={ { fontSize: '1rem', margin: 0 } }>📋 { workflow.title }</h3>
                <button className="btn" onClick={ onClose } style={ { padding: '4px 8px', fontSize: '0.75rem' } }>✕</button>
            </div>
            <p style={ { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 } }>
                { workflow.description }
            </p>

            {/* Steps */ }
            <div style={ { display: 'flex', flexDirection: 'column', gap: '2px' } }>
                { workflow.steps.map( ( step, i ) =>
                {
                    const done = stepStatuses[ i ]!;
                    const isActive = i === activeIndex;
                    const icon = done ? '✅' : isActive ? '🔄' : '⬜';

                    return (
                        <div key={ step.id } style={ { display: 'flex', gap: '12px', alignItems: 'flex-start' } }>
                            {/* Vertical line + circle */ }
                            <div style={ { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '24px' } }>
                                <span style={ { fontSize: '1rem' } }>{ icon }</span>
                                { i < workflow.steps.length - 1 && (
                                    <div style={ {
                                        width: '2px',
                                        height: '32px',
                                        background: done ? 'var(--accent)' : 'var(--border)',
                                        marginTop: '4px',
                                    } } />
                                ) }
                            </div>

                            {/* Content */ }
                            <div style={ { flex: 1, paddingBottom: '12px' } }>
                                <div
                                    style={ {
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.85rem',
                                        color: done ? 'var(--text-muted)' : isActive ? 'var(--accent)' : 'var(--text-primary)',
                                        textDecoration: done ? 'line-through' : undefined,
                                        cursor: step.targetTab ? 'pointer' : undefined,
                                    } }
                                    onClick={ () =>
                                    {
                                        if ( step.targetTab ) setActiveTab( step.targetTab );
                                    } }
                                >
                                    { step.title }
                                </div>
                                { isActive && (
                                    <p style={ { fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 } }>
                                        { step.description }
                                    </p>
                                ) }
                                { isActive && step.targetTab && (
                                    <button
                                        className="btn"
                                        onClick={ () => setActiveTab( step.targetTab! ) }
                                        style={ { marginTop: '6px', padding: '4px 10px', fontSize: '0.75rem' } }
                                    >
                                        Go to { step.targetTab } →
                                    </button>
                                ) }
                            </div>
                        </div>
                    );
                } ) }
            </div>

            {/* Completion */ }
            { allDone && (
                <div className="fade-in" style={ {
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(46,204,113,0.1)',
                    border: '1px solid #2ecc71',
                    borderRadius: '8px',
                    textAlign: 'center',
                } }>
                    <span style={ { fontSize: '1.2rem' } }>🎉</span>
                    <p style={ { fontSize: '0.85rem', fontWeight: 600, color: '#2ecc71', marginTop: '4px' } }>
                        Workflow Complete!
                    </p>
                    <button className="btn" onClick={ onClose } style={ { marginTop: '8px' } }>Close</button>
                </div>
            ) }
        </div>
    );
}
