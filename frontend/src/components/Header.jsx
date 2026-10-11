import React from 'react';
import { Sparkles, Sliders, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

export default function Header({ 
  presets, 
  onSelectPreset, 
  activePresetKey, 
  onOpenSettings,
  healthStatus 
}) {
  return (
    <header className="glass-panel" style={{ padding: '18px 24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI Humanizer & Factuality Engine
              </h1>
              <span className="badge badge-indigo" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                v1.0 • Pipeline Active
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Human-Like Communication Layer with NER Entity Locking & NLI Entailment Validation
            </p>
          </div>
        </div>

        {/* System Badges & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="badge badge-emerald" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
            <Cpu size={13} />
            <span>SpaCy NER Active</span>
          </div>
          <div className="badge badge-cyan" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
            <ShieldCheck size={13} />
            <span>NLI Cross-Encoder Ready</span>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenSettings}
            title="Configure API Keys & Thresholds"
          >
            <Sliders size={14} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Preset Quick-Selector Bar */}
      <div style={{ 
        marginTop: '16px', 
        paddingTop: '14px', 
        borderTop: '1px solid var(--border-subtle)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        flexWrap: 'wrap' 
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Test Presets:
        </span>
        {Object.entries(presets).map(([key, data]) => {
          const isActive = activePresetKey === key;
          const isHuman = key === 'already_human';
          return (
            <button
              key={key}
              onClick={() => onSelectPreset(key)}
              className="btn btn-sm"
              style={{
                background: isActive 
                  ? 'rgba(99, 102, 241, 0.25)' 
                  : 'rgba(255, 255, 255, 0.04)',
                border: isActive 
                  ? '1px solid var(--accent-primary)' 
                  : '1px solid var(--border-subtle)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                padding: '5px 12px'
              }}
            >
              {isHuman ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#34d399' }}>
                  <ShieldCheck size={12} /> {data.title}
                </span>
              ) : (
                data.title
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
