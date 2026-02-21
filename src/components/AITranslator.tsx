import { useState, useCallback } from 'react';
import IconBot from '~icons/lucide/bot';

interface LLMProvider {
  id: string;
  name: string;
  icon: string;
  requiresKey: boolean;
  requiresEndpoint: boolean;
  estimateCost: (keyCount: number) => string;
}

const LLM_PROVIDERS: LLMProvider[] = [
  { id: 'openai', name: 'OpenAI GPT-4o-mini', icon: '🟢', requiresKey: true, requiresEndpoint: false, estimateCost: (n) => `~$${(n * 0.0003).toFixed(2)}` },
  { id: 'anthropic', name: 'Anthropic Claude Haiku', icon: '🟣', requiresKey: true, requiresEndpoint: false, estimateCost: (n) => `~$${(n * 0.0002).toFixed(2)}` },
  { id: 'google', name: 'Google Gemini Flash', icon: '🔵', requiresKey: true, requiresEndpoint: false, estimateCost: (n) => `~$${(n * 0.0001).toFixed(2)}` },
  { id: 'local', name: 'Local LLM (Ollama/LMStudio)', icon: '🖥️', requiresKey: false, requiresEndpoint: true, estimateCost: () => 'Free (local)' },
];

type ReviewStatus = 'pending' | 'approved' | 'rejected';

interface TranslationLine {
  key: string;
  english: string;
  translated: string;
  reviewStatus: ReviewStatus;
  reviewNote: string;
}

interface AITranslatorProps {
  isOpen: boolean;
  onClose: () => void;
  sourceLocale: Record<string, string>;
}

export function AITranslator({ isOpen, onClose, sourceLocale }: AITranslatorProps) {
  const [provider, setProvider] = useState<string>('google');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('http://localhost:11434/v1/chat/completions');
  const [targetLang, setTargetLang] = useState('German');
  const [targetCode, setTargetCode] = useState('de');

  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<TranslationLine[]>([]);
  const [step, setStep] = useState<'config' | 'translating' | 'review' | 'export'>('config');
  const [costReduction, setCostReduction] = useState<'none' | 'batch' | 'skip-similar'>('none');

  const selectedProvider = LLM_PROVIDERS.find(p => p.id === provider)!;

  // Filter out meta keys
  const sourceKeys = Object.entries(sourceLocale).filter(([k]) => !k.startsWith('_'));
  const keyCount = sourceKeys.length;

  const handleTranslate = useCallback(async () => {
    setStep( 'translating' );
    setProgress(0);

    const results: TranslationLine[] = [];
    const batchSize = costReduction === 'batch' ? 10 : 1;
    const entries = sourceKeys;

    // Simulate translation (in production this would call the actual LLM API)
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);

      // Simulated API call delay
      await new Promise(r => setTimeout(r, 50 + Math.random() * 100));

      for (const [key, english] of batch) {
        // In production: send to LLM API with the prompt:
        // `Translate the following UI string from English to ${targetLang}.
        //  Key: ${key}, Context: UI label for a slot machine builder app.
        //  English: "${english}"
        //  Return ONLY the translated string, nothing else.`

        results.push({
          key,
          english: english as string,
          translated: `[${targetCode}] ${english}`, // Placeholder — real LLM would translate
          reviewStatus: 'pending',
          reviewNote: '',
        });
      }

      setProgress(Math.min(100, Math.round(((i + batchSize) / entries.length) * 100)));
    }

    setLines( results );
    setStep('review');
  }, [sourceKeys, targetLang, targetCode, costReduction]);

  const handleReviewLine = (idx: number, status: ReviewStatus, note?: string) => {
    setLines(prev => prev.map((l, i) =>
      i === idx ? { ...l, reviewStatus: status, reviewNote: note ?? l.reviewNote } : l
    ));
  };

  const handleEditTranslation = (idx: number, newText: string) => {
    setLines(prev => prev.map((l, i) =>
      i === idx ? { ...l, translated: newText } : l
    ));
  };

  const allReviewed = lines.length > 0 && lines.every(l => l.reviewStatus !== 'pending');
  const approvedCount = lines.filter(l => l.reviewStatus === 'approved').length;
  const rejectedCount = lines.filter(l => l.reviewStatus === 'rejected').length;

  const handleExport = () => {
    const output: Record<string, unknown> = {
      _meta: {
        language_code: targetCode,
        language_name: targetLang,
        translator: `AI (${selectedProvider.name})`,
        version: '1.0',
        review_status: allReviewed ? 'reviewed' : 'partial',
        approved: approvedCount,
        rejected: rejectedCount,
        total: lines.length,
        generated_at: new Date().toISOString(),
      },
    };
    for (const line of lines) {
      if (line.reviewStatus === 'approved') {
        output[line.key] = line.translated;
      } else {
        output[line.key] = line.english; // Fallback to English for rejected
      }
    }
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStep('export');
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 15000 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '24px', zIndex: 15001, width: '700px', maxWidth: '95vw', maxHeight: '85vh',
        overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={ { display: 'flex', alignItems: 'center', gap: '8px' } }><IconBot /> AI Translator</h2>
          <button className="btn" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>

        {/* Step 1: Configuration */}
        {step === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Provider selection */}
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                LLM Provider
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {LLM_PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    className={provider === p.id ? 'btn btn-primary' : 'btn'}
                    onClick={() => setProvider(p.id)}
                    style={{ fontSize: '0.8rem', justifyContent: 'flex-start' }}
                  >
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key or endpoint */}
            {selectedProvider.requiresKey && (
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  title="API key for the selected LLM provider"
                  style={{ width: '100%', padding: '8px 12px', marginTop: '4px' }}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  🔒 Key is used client-side only. Never stored or transmitted elsewhere.
                </p>
              </div>
            )}
            {selectedProvider.requiresEndpoint && (
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Local LLM Endpoint</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  title="Local LLM API endpoint"
                  placeholder="http://localhost:11434/v1/chat/completions"
                  style={{ width: '100%', padding: '8px 12px', marginTop: '4px' }}
                />
              </div>
            )}

            {/* Target language */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Language</label>
                <input
                  type="text" value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  title="Target language name"
                  style={{ width: '100%', padding: '8px 12px', marginTop: '4px' }}
                />
              </div>
              <div style={{ width: '100px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Code</label>
                <input
                  type="text" value={targetCode}
                  onChange={(e) => setTargetCode(e.target.value)}
                  title="Language code"
                  placeholder="de"
                  style={{ width: '100%', padding: '8px 12px', marginTop: '4px' }}
                />
              </div>
            </div>

            {/* Cost reduction */}
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Cost Reduction
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'none', label: 'None (best quality)' },
                  { id: 'batch', label: 'Batch (10 per request)' },
                  { id: 'skip-similar', label: 'Skip similar keys' },
                ].map(opt => (
                  <button key={opt.id}
                    className={costReduction === opt.id ? 'btn btn-primary' : 'btn'}
                    onClick={() => setCostReduction(opt.id as typeof costReduction)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost estimate */}
            <div style={{
              padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Estimated Cost</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{keyCount} keys to translate</div>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--win-gold)' }}>
                {selectedProvider.estimateCost(keyCount)}
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleTranslate}
              disabled={selectedProvider.requiresKey && !apiKey}
              style={{ marginTop: '8px' }}
            >
              🚀 Start Translation
            </button>
          </div>
        )}

        {/* Step 2: Translating progress */}
        {step === 'translating' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤖</div>
            <h3>Translating to {targetLang}...</h3>
            <div style={{
              height: '8px', background: 'var(--bg-input)', borderRadius: '4px',
              marginTop: '20px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'var(--accent)', borderRadius: '4px',
                transition: 'width 200ms ease',
              }} />
            </div>
            <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>{progress}% — {Math.round(keyCount * progress / 100)} / {keyCount} keys</p>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '16px', padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{ fontSize: '0.85rem' }}>
                ✅ {approvedCount} approved · ❌ {rejectedCount} rejected · ⏳ {lines.length - approvedCount - rejectedCount} pending
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" onClick={() => setLines(prev => prev.map(l => ({ ...l, reviewStatus: 'approved' })))}
                  style={{ fontSize: '0.75rem' }}>✅ Approve All</button>
                <button className="btn btn-primary" onClick={handleExport} disabled={!allReviewed}
                  style={{ fontSize: '0.75rem' }}>
                  {allReviewed ? '📥 Export' : '⏳ Review all first'}
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: '12px', padding: '8px', background: 'rgba(253,203,110,0.1)', borderRadius: 'var(--radius-sm)' }}>
              ⚠️ Gallery Upload Requirement: All lines must be individually reviewed (approved/rejected) before this translation is eligible for Community Gallery upload.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '400px', overflowY: 'auto' }}>
              {lines.map((line, idx) => (
                <div key={line.key} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 1fr 80px', gap: '8px',
                  padding: '8px', alignItems: 'center', fontSize: '0.8rem',
                  background: line.reviewStatus === 'approved' ? 'rgba(0,184,148,0.05)' : line.reviewStatus === 'rejected' ? 'rgba(225,112,85,0.05)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${line.reviewStatus === 'approved' ? 'var(--success)' : line.reviewStatus === 'rejected' ? 'var(--danger)' : 'var(--border)'}`,
                }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{line.english}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{line.key}</div>
                  </div>
                  <input
                    type="text"
                    value={line.translated}
                    onChange={(e) => handleEditTranslation(idx, e.target.value)}
                    title={`Translation for ${line.key}`}
                    style={{
                      padding: '4px 8px', fontSize: '0.8rem',
                      background: 'var(--bg-input)', border: '1px solid var(--border)',
                      borderRadius: '4px', color: 'var(--text-primary)',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      className={line.reviewStatus === 'approved' ? 'btn btn-success' : 'btn'}
                      onClick={() => handleReviewLine(idx, 'approved')}
                      style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                    >✅</button>
                    <button
                      className={line.reviewStatus === 'rejected' ? 'btn btn-danger' : 'btn'}
                      onClick={() => handleReviewLine(idx, 'rejected')}
                      style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                    >❌</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Export complete */}
        {step === 'export' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h3>Translation Exported!</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              {targetCode}.json has been downloaded. Place it in <code>src/locales/</code> and import it in <code>I18nProvider.tsx</code>.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
              <button className="btn" onClick={() => setStep('config')}>Translate Another</button>
              <button className="btn btn-primary" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
