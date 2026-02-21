
import { useState, useCallback } from 'react';
import { useConfigStore } from '../store/configStore';
import { spin } from '../utils/spinEngine';
import { audioEngine } from '../utils/audioEngine';
import type { SpinResult } from '../types/machine';
import { PixiReels } from './PixiReels';

import IconPlayCircle from '~icons/lucide/play-circle';
import IconLoader from '~icons/lucide/loader';
import IconSlotMachine from '~icons/game-icons/slot-machine';
export function SimulatorView ()
{
  const config = useConfigStore( ( s ) => s.config );
  const symbolMap = new Map( config.symbols.map( s => [ s.id, s ] ) );

  const [ credits, setCredits ] = useState( config.settings.startCredits );
  const [ bet, setBet ] = useState( config.settings.defaultBet );
  const [ result, setResult ] = useState<SpinResult | null>( null );
  const [ isSpinning, setIsSpinning ] = useState( false );
  const [ message, setMessage ] = useState( 'Press SPIN to play' );

  const iSettings = config.settings.interface || {
    backgroundType: 'color', backgroundColor: '#1a1a2e', cabinetColor: '#111', glassOverlay: false, buttonStyle: 'classic'
  };

  const bgStyle: React.CSSProperties = iSettings.backgroundType === 'image' && iSettings.backgroundImageUrl
    ? { backgroundImage: `url(${ iSettings.backgroundImageUrl })`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: iSettings.backgroundColor };

  const getBtnStyle = ( isSpin: boolean ) =>
  {
    let base: React.CSSProperties = {};
    if ( iSettings.buttonStyle === 'glass' )
    {
      base = { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' };
    } else if ( iSettings.buttonStyle === 'modern' )
    {
      base = { borderRadius: '24px' };
    } else
    {
      base = { borderRadius: '4px' }; // classic
    }

    if ( isSpin )
    {
      return { ...base, minWidth: '140px', fontSize: '1.1rem', background: isSpinning ? 'var(--text-muted)' : ( iSettings.buttonStyle === 'glass' ? 'rgba(255,215,0,0.3)' : undefined ) };
    }
    return base;
  };

  const winPaylineIds = new Set( result?.wins.map( w => w.paylineId ) ?? [] );

  const doSpin = useCallback( () =>
  {
    if ( isSpinning ) return;
    const totalBet = bet * config.paylines.length;
    if ( credits < totalBet )
    {
      setMessage( 'Not enough credits!' );
      return;
    }

    setIsSpinning( true );
    setMessage( 'Spinning...' );
    setCredits( ( c ) => c - totalBet );

    // Play start spin audio
    audioEngine.playEvent( config.settings.audio.events.spinStart, config.settings.audio );

    // Simulate spin delay based on animation duration
    const spinDurMs = config.settings.animation.durationMs ?? 2000;
    setTimeout( () =>
    {
      const spinResult = spin( config, bet );
      setResult( spinResult );
      setIsSpinning( false );

      // Stop sound / Landing
      audioEngine.playEvent( config.settings.audio.events.reelStop, config.settings.audio );

      if ( spinResult.totalWin > 0 )
      {
        setCredits( ( c ) => c + spinResult.totalWin );
        const winLines = spinResult.wins.map( w => `Line ${ w.paylineId }` ).join( ', ' );

        if ( spinResult.totalWin >= totalBet * 10 )
        {
          audioEngine.playEvent( config.settings.audio.events.winBig, config.settings.audio );
          setMessage( `MEGA WIN ${ spinResult.totalWin } credits! (${ winLines })` );
        } else
        {
          audioEngine.playEvent( config.settings.audio.events.winNormal, config.settings.audio );
          setMessage( `WIN ${ spinResult.totalWin } credits! (${ winLines })` );
        }
      } else
      {
        setMessage( 'No win. Try again!' );
      }
    }, spinDurMs );
  }, [ config, bet, credits, isSpinning ] );

  return (
    <div className="fade-in" style={ { display: 'flex', flexDirection: 'column', gap: '20px', ...bgStyle, padding: '24px', borderRadius: '12px' } }>
      <div className="panel" style={ { textAlign: 'center', background: 'rgba(20, 20, 30, 0.85)', backdropFilter: 'blur(8px)' } }>
        <h2 style={ { marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' } }>
          <IconPlayCircle /> Live Simulator
        </h2>

        {/* Credits & bet display */ }
        <div style={ {
          display: 'flex', justifyContent: 'center', gap: '32px',
          marginBottom: '20px',
        } }>
          <LedDisplay label="CREDITS" value={ credits } />
          <LedDisplay label="BET" value={ bet } />
          <LedDisplay label="TOTAL BET" value={ bet * config.paylines.length } />
          <LedDisplay label="WIN" value={ result?.totalWin ?? 0 } highlight={ !!result?.totalWin } />
        </div>

        {/* Reel grid */ }
        <div style={ {
          display: 'inline-block',
          background: iSettings.cabinetColor,
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '3px solid var(--border)',
          marginBottom: '16px',
          position: 'relative',
        } }>
          <PixiReels
            config={ config }
            result={ result }
            isSpinning={ isSpinning }
            winPaylineIds={ winPaylineIds }
          />
          { iSettings.glassOverlay && (
            <div style={ {
              position: 'absolute', inset: 16, pointerEvents: 'none',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.3) 100%)',
              boxShadow: 'inset 0 10px 20px rgba(255,255,255,0.1)',
              borderRadius: '8px'
            } } />
          ) }
        </div>

        {/* Status message */ }
        <div style={ {
          color: result?.totalWin ? 'var(--win-gold)' : 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: '1.1rem',
          minHeight: '30px',
          marginBottom: '16px',
          textShadow: result?.totalWin ? '0 0 8px rgba(255, 215, 0, 0.5)' : 'none',
        } }>
          { message }
        </div>

        {/* Controls */ }
        <div style={ { display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' } }>
          <button
            className="btn"
            onClick={ () => setBet( Math.max( 1, bet - 1 ) ) }
            disabled={ isSpinning }
            style={ getBtnStyle( false ) }
          >
            BET −
          </button>

          <button
            className="btn btn-primary btn-lg"
            onClick={ doSpin }
            disabled={ isSpinning }
            style={ getBtnStyle( true ) }
          >
            { isSpinning ? <IconLoader className="spin-anim" /> : <><IconSlotMachine /> SPIN</> }
          </button>

          <button
            className="btn"
            onClick={ () => setBet( bet + 1 ) }
            disabled={ isSpinning }
            style={ getBtnStyle( false ) }
          >
            BET +
          </button>

          <button
            className="btn"
            onClick={ () => setCredits( config.settings.startCredits ) }
            style={ { ...getBtnStyle( false ), marginLeft: '16px' } }
          >
            Reset Credits
          </button>
        </div>

        {/* Win details */ }
        { result && result.wins.length > 0 && (
          <div style={ {
            marginTop: '20px',
            padding: '12px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--win-gold)',
            textAlign: 'left',
          } }>
            <h4 style={ { color: 'var(--win-gold)', marginBottom: '8px' } }>Win Breakdown</h4>
            { result.wins.map( ( w, i ) =>
            {
              const sym = symbolMap.get( w.symbolId );
              return (
                <div key={ i } style={ {
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '4px 0',
                  fontSize: '0.85rem',
                } }>
                  <div style={ {
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: config.paylines.find( pl => pl.id === w.paylineId )?.color ?? '#fff',
                  } } />
                  <span>Line { w.paylineId }:</span>
                  <span style={ { fontWeight: 600 } }>{ w.matchCount }× { sym?.name ?? w.symbolId }</span>
                  <span style={ { color: 'var(--win-gold)', fontWeight: 700, marginLeft: 'auto' } }>
                    +{ w.payout }
                  </span>
                </div>
              );
            } ) }
          </div>
        ) }
      </div>
    </div>
  );
}

function LedDisplay ( { label, value, highlight }: { label: string; value: number; highlight?: boolean } )
{
  return (
    <div style={ { textAlign: 'center' } }>
      <div style={ {
        fontSize: '0.65rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        marginBottom: '4px',
      } }>
        { label }
      </div>
      <div style={ {
        fontFamily: 'var(--font-mono)',
        fontSize: '1.4rem',
        fontWeight: 700,
        color: highlight ? 'var(--win-gold)' : 'var(--accent)',
        background: 'var(--bg-input)',
        padding: '6px 16px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        minWidth: '80px',
        textShadow: highlight ? '0 0 8px rgba(255, 215, 0, 0.5)' : 'none',
      } }>
        { value }
      </div>
    </div>
  );
}
