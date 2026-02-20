import { useState, useCallback, useEffect, useMemo } from 'react';
import { useConfigStore } from './store/configStore';
import { ConfigEditor } from './editors/ConfigEditor';
import { SymbolManager } from './editors/SymbolManager';
import { ReelStripDesigner } from './editors/ReelStripDesigner';
import { PaytableEditor } from './editors/PaytableEditor';
import { PaylineEditor } from './editors/PaylineEditor';
import { AnimationConfig } from './editors/AnimationConfig';
import { AudioConfig } from './editors/AudioConfig';
import { StatsDashboard } from './editors/StatsDashboard';
import { SimulatorView } from './simulator/SimulatorView';
import { validateConfig } from './utils/configValidator';
import { OnboardingWizard } from './components/OnboardingWizard';
import { HelpPanel } from './components/HelpPanel';
import { ExportWizard } from './components/ExportWizard';
import { SaveDialog } from './components/SaveDialog';
import { useTranslation } from './i18n/I18nProvider';
import { useTheme } from './themes/ThemeProvider';
import type { EditorTab } from './types/machine';
import type { ValidationStatus } from './utils/configValidator';

const STATUS_ICONS: Record<ValidationStatus, string> = { valid: '✅', warning: '⚠️', error: '❌' };
const TAB_VAL_MAP: Partial<Record<EditorTab, 'symbols' | 'reels' | 'paylines' | 'paytable' | 'settings'>> = {
  config: 'settings', symbols: 'symbols', reels: 'reels', paylines: 'paylines', paytable: 'paytable',
};

const NAV_ITEMS: { tab: EditorTab; icon: string; label: string }[] = [
  { tab: 'config', icon: '⚙️', label: 'Machine Config' },
  { tab: 'symbols', icon: '🎨', label: 'Symbols' },
  { tab: 'reels', icon: '🎰', label: 'Reel Strips' },
  { tab: 'paytable', icon: '💰', label: 'Paytable' },
  { tab: 'paylines', icon: '📐', label: 'Paylines' },
  { tab: 'animation', icon: '🎬', label: 'Animation' },
  { tab: 'audio', icon: '🎵', label: 'Audio' },
  { tab: 'simulator', icon: '▶️', label: 'Simulator' },
  { tab: 'statistics', icon: '📊', label: 'Statistics' },
];

function App ()
{
  const activeTab = useConfigStore( ( s ) => s.activeTab );
  const setActiveTab = useConfigStore( ( s ) => s.setActiveTab );
  const machineName = useConfigStore( ( s ) => s.config.name );
  const config = useConfigStore( ( s ) => s.config );
  const validation = useMemo( () => validateConfig( config ), [ config ] );

  // Player-only mode: ?mode=play
  const isPlayMode = useMemo( () =>
  {
    const params = new URLSearchParams( window.location.search );
    return params.get( 'mode' ) === 'play';
  }, [] );

  if ( isPlayMode )
  {
    return (
      <div style={ { width: '100vw', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' } }>
        <SimulatorView />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>🎰 Fruit Machine Builder</h1>
        <div style={ { display: 'flex', alignItems: 'center', gap: '12px' } }>
          <span style={ { color: 'var(--text-secondary)', fontSize: '0.85rem' } }>{ machineName }</span>
          <span
            title={ validation.overall === 'valid' ? 'Machine is playable!' : 'Machine has issues' }
            style={ {
              fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 600,
              background: validation.overall === 'valid' ? 'rgba(46,204,113,0.15)' : validation.overall === 'warning' ? 'rgba(241,196,15,0.15)' : 'rgba(231,76,60,0.15)',
              color: validation.overall === 'valid' ? '#2ecc71' : validation.overall === 'warning' ? '#f1c40f' : '#e74c3c',
              border: `1px solid ${ validation.overall === 'valid' ? '#2ecc71' : validation.overall === 'warning' ? '#f1c40f' : '#e74c3c' }`,
            } }
          >
            { STATUS_ICONS[ validation.overall ] } { validation.overall === 'valid' ? 'Ready' : 'Issues' }
          </span>
        </div>
        <div style={ { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } }>
          <LanguageSelector />
          <ThemeSelector />
          <OnboardingWizard />
          <PresetManager />
          <SaveButton />
          <ExportButton />
          <ImportButton />
        </div>
      </header>

      <nav className="app-sidebar">
        <div className="nav-section">
          <div className="nav-section-title">Design</div>
          { NAV_ITEMS.slice( 0, 7 ).map( ( item ) =>
          {
            const catKey = TAB_VAL_MAP[ item.tab ];
            const badge = catKey ? STATUS_ICONS[ validation.categories[ catKey ].status ] : '';
            return (
              <div
                key={ item.tab }
                className={ `nav-item ${ activeTab === item.tab ? 'active' : '' }` }
                onClick={ () => setActiveTab( item.tab ) }
                title={ catKey ? validation.categories[ catKey ].messages.join( ' ' ) : '' }
              >
                <span className="icon">{ item.icon }</span>
                { item.label }
                { badge && <span style={ { marginLeft: 'auto', fontSize: '0.7rem' } }>{ badge }</span> }
              </div>
            );
          } ) }
        </div>
        <div className="nav-section">
          <div className="nav-section-title">Test</div>
          { NAV_ITEMS.slice( 7 ).map( ( item ) => (
            <div
              key={ item.tab }
              className={ `nav-item ${ activeTab === item.tab ? 'active' : '' }` }
              onClick={ () => setActiveTab( item.tab ) }
            >
              <span className="icon">{ item.icon }</span>
              { item.label }
            </div>
          ) ) }
        </div>
      </nav>

      <main className="app-main">
        <ActiveEditor tab={ activeTab } />
      </main>
    </div>
  );
}

function ActiveEditor ( { tab }: { tab: EditorTab } )
{
  return (
    <>
      <HelpPanel tab={ tab } />
      { renderEditor( tab ) }
    </>
  );
}

function renderEditor ( tab: EditorTab )
{
  switch ( tab )
  {
    case 'config': return <ConfigEditor />;
    case 'symbols': return <SymbolManager />;
    case 'reels': return <ReelStripDesigner />;
    case 'paytable': return <PaytableEditor />;
    case 'paylines': return <PaylineEditor />;
    case 'animation': return <AnimationConfig />;
    case 'audio': return <AudioConfig />;
    case 'simulator': return <SimulatorView />;
    case 'statistics': return <StatsDashboard />;
    default: return null;
  }
}

function ExportButton ()
{
  const [ showWizard, setShowWizard ] = useState( false );
  return (
    <>
      <button className="btn" onClick={ () => setShowWizard( true ) }>📦 Export</button>
      { showWizard && <ExportWizard onClose={ () => setShowWizard( false ) } /> }
    </>
  );
}

function ImportButton ()
{
  const importJSON = useConfigStore( ( s ) => s.importJSON );
  const handleImport = useCallback( () =>
  {
    const input = document.createElement( 'input' );
    input.type = 'file';
    input.accept = '.json,.fmb.json';
    input.onchange = async () =>
    {
      const file = input.files?.[ 0 ];
      if ( !file ) return;
      const text = await file.text();
      const ok = importJSON( text );
      if ( !ok ) alert( 'Invalid config file.' );
    };
    input.click();
  }, [ importJSON ] );

  return (
    <button className="btn" onClick={ handleImport }>
      📂 Open JSON
    </button>
  );
}

function SaveButton ()
{
  const [ showDialog, setShowDialog ] = useState( false );
  return (
    <>
      <button className="btn" onClick={ () => setShowDialog( true ) }>💾 Save</button>
      <SaveDialog isOpen={ showDialog } onClose={ () => setShowDialog( false ) } />
    </>
  );
}

function PresetManager ()
{
  const importJSON = useConfigStore( ( s ) => s.importJSON );
  const [ presets, setPresets ] = useState<string[]>( [] );
  const [ selected, setSelected ] = useState<string>( '' );

  useEffect( () =>
  {
    const p = localStorage.getItem( 'fmb_presets' );
    if ( p )
    {
      const keys = Object.keys( JSON.parse( p ) );
      setPresets( keys );
      if ( keys.length > 0 ) setSelected( keys[ 0 ]! );
    }
  }, [] );

  const loadPreset = () =>
  {
    if ( !selected ) return;
    const p = localStorage.getItem( 'fmb_presets' );
    if ( p )
    {
      const db = JSON.parse( p );
      if ( db[ selected ] )
      {
        importJSON( db[ selected ] );
      }
    }
  };

  return (
    <div style={ { display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-input)', padding: '4px', borderRadius: '4px' } }>
      <select
        title="Saved Presets"
        className="input"
        style={ { padding: '4px 8px', fontSize: '0.85rem' } }
        value={ selected }
        onChange={ ( e ) => setSelected( e.target.value ) }
      >
        <option value="" disabled>Saved Presets</option>
        { presets.map( p => <option key={ p } value={ p }>{ p }</option> ) }
      </select>
      <button className="btn" style={ { padding: '6px 12px' } } onClick={ loadPreset } disabled={ !selected }>Load</button>
    </div>
  );
}

function LanguageSelector ()
{
  const { locale, setLocale, availableLocales, languageName, browserLanguage, isBrowserLanguageAvailable } = useTranslation();
  return (
    <div style={ { display: 'flex', alignItems: 'center', gap: '4px' } }>
      <select
        title="Language"
        className="input"
        style={ { padding: '4px 8px', fontSize: '0.8rem' } }
        value={ locale }
        onChange={ ( e ) => setLocale( e.target.value ) }
      >
        { availableLocales.map( code => (
          <option key={ code } value={ code }>{ languageName( code ) }</option>
        ) ) }
      </select>
      { !isBrowserLanguageAvailable && (
        <span
          style={ {
            fontSize: '0.7rem',
            color: 'var(--accent)',
            cursor: 'pointer',
            textDecoration: 'underline',
            whiteSpace: 'nowrap',
          } }
          title={ `Your browser language (${ browserLanguage }) isn't available yet` }
        >
          🌐 Help translate?
        </span>
      ) }
    </div>
  );
}

function ThemeSelector ()
{
  const { theme, setTheme, availableThemes } = useTheme();
  return (
    <select
      title="Theme"
      className="input"
      style={ { padding: '4px 8px', fontSize: '0.8rem' } }
      value={ theme }
      onChange={ ( e ) => setTheme( e.target.value ) }
    >
      { availableThemes.map( t => (
        <option key={ t.id } value={ t.id }>{ t.name }</option>
      ) ) }
    </select>
  );
}

export default App;
