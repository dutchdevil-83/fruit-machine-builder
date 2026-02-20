import { useState, useRef, useEffect } from 'react';
import { useConfigStore } from '../store/configStore';
// Import the Vite worker
import RtpWorker from '../simulator/rtpWorker?worker';
import type { WorkerResponse, WorkerMessage } from '../simulator/rtpWorker';

export function StatsDashboard ()
{
    const config = useConfigStore( ( s ) => s.config );

    const workerRef = useRef<Worker | null>( null );

    const [ iterationsStr, setIterationsStr ] = useState( '100000' );
    const [ isRunning, setIsRunning ] = useState( false );

    // Progress & Stats
    const [ progress, setProgress ] = useState( 0 );
    const [ currentRtp, setCurrentRtp ] = useState( 0 );
    const [ finalStats, setFinalStats ] = useState<{ rtp: number, hitFreq: number, maxWin: number, totalCost: number, totalWon: number } | null>( null );

    useEffect( () =>
    {
        // initialize worker
        workerRef.current = new RtpWorker();

        workerRef.current.onmessage = ( e: MessageEvent<WorkerResponse> ) =>
        {
            const { data } = e;
            if ( data.type === 'PROGRESS' )
            {
                setProgress( data.progress * 100 );
                setCurrentRtp( data.currentRtp );
            } else if ( data.type === 'RESULT' )
            {
                setFinalStats( {
                    rtp: data.rtp,
                    hitFreq: data.hitFrequency,
                    maxWin: data.maxWin,
                    totalCost: data.totalCost,
                    totalWon: data.totalWon
                } );
                setProgress( 100 );
                setIsRunning( false );
            }
        };

        return () =>
        {
            workerRef.current?.terminate();
        };
    }, [] );

    const handleStart = () =>
    {
        if ( !workerRef.current || isRunning ) return;
        const iters = parseInt( iterationsStr, 10 );
        if ( isNaN( iters ) || iters <= 0 ) return;

        setIsRunning( true );
        setProgress( 0 );
        setCurrentRtp( 0 );
        setFinalStats( null );

        workerRef.current.postMessage( {
            type: 'START',
            config,
            iterations: iters
        } as WorkerMessage );
    };

    const handleStop = () =>
    {
        if ( !workerRef.current ) return;
        workerRef.current.postMessage( { type: 'STOP' } as WorkerMessage );
        setIsRunning( false );
    };

    return (
        <div className="fade-in" style={ { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' } }>
            <div className="panel">
                <div className="panel-header" style={ { marginBottom: '20px' } }>
                    <h2>📊 RTP & Statistics Dashboard</h2>
                    <p style={ { color: 'var(--text-muted)' } }>Simulate millions of spins to calculate actual Return to Player and Hit Frequency.</p>
                </div>

                <div style={ { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' } }>
                    <label htmlFor="simIters" style={ { fontWeight: 600 } }>Simulate Spins:</label>
                    <select
                        id="simIters"
                        title="Number of spins to simulate"
                        className="input"
                        value={ iterationsStr }
                        onChange={ ( e ) => setIterationsStr( e.target.value ) }
                        disabled={ isRunning }
                    >
                        <option value="10000">10,000</option>
                        <option value="100000">100,000</option>
                        <option value="1000000">1,000,000</option>
                        <option value="10000000">10,000,000</option>
                    </select>

                    { !isRunning ? (
                        <button className="btn btn-primary" onClick={ handleStart }>
                            ▶ Start Simulation
                        </button>
                    ) : (
                        <button className="btn" style={ { color: 'var(--win-gold)', borderColor: 'var(--win-gold)' } } onClick={ handleStop }>
                            ⏹ Stop Early
                        </button>
                    ) }
                </div>

                {/* Progress Bar */ }
                { ( isRunning || progress > 0 ) && (
                    <div style={ { marginBottom: '30px' } }>
                        <div style={ { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' } }>
                            <span>Progress: { progress.toFixed( 1 ) }%</span>
                            { isRunning && <span style={ { color: 'var(--accent)' } }>Calculating live RTP: { currentRtp.toFixed( 2 ) }%...</span> }
                        </div>
                        <div style={ { width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' } }>
                            <div style={ { width: `${ progress }%`, height: '100%', background: 'var(--accent)', transition: 'width 200ms ease' } } />
                        </div>
                    </div>
                ) }

                {/* Final Results */ }
                { finalStats && (
                    <div className="fade-in" style={ { display: 'flex', flexDirection: 'column', gap: '15px' } }>
                        <h3 style={ { color: 'var(--win-gold)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' } }>Simulation Results</h3>

                        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' } }>
                            <StatBox label="Return To Player (RTP)" value={ `${ finalStats.rtp.toFixed( 3 ) }%` } highlight />
                            <StatBox label="Hit Frequency" value={ `${ finalStats.hitFreq.toFixed( 2 ) }%` } />
                            <StatBox label="Max Win (Credits)" value={ finalStats.maxWin.toLocaleString() } />
                        </div>

                        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '10px' } }>
                            <StatBox label="Total Bet Cost" value={ finalStats.totalCost.toLocaleString() } small />
                            <StatBox label="Total Won" value={ finalStats.totalWon.toLocaleString() } small />
                        </div>
                    </div>
                ) }
            </div>
        </div>
    );
}

function StatBox ( { label, value, highlight, small }: { label: string, value: string | number, highlight?: boolean, small?: boolean } )
{
    return (
        <div style={ {
            background: highlight ? 'rgba(255, 215, 0, 0.05)' : 'var(--bg-input)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: highlight ? '1px solid var(--win-gold)' : '1px solid var(--border)',
            textAlign: 'center'
        } }>
            <div style={ { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' } }>
                { label }
            </div>
            <div style={ { fontSize: small ? '1.5rem' : '2rem', fontWeight: 700, color: highlight ? 'var(--win-gold)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' } }>
                { value }
            </div>
        </div>
    );
}
