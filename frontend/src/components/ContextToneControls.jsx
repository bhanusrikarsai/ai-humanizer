import React from 'react';
import { UserCheck, MessageSquare, HelpCircle, FileText, Zap, Shield, Sparkles } from 'lucide-react';

const CONTEXTS = [
  { id: 'Recruiter Feedback', label: 'Recruiter Feedback', icon: UserCheck, desc: 'Candidate assessments & notes' },
  { id: 'Candidate Communication', label: 'Candidate Email', icon: MessageSquare, desc: 'Outreach & correspondence' },
  { id: 'Technical Interview Questions', label: 'Interview Questions', icon: HelpCircle, desc: 'Technical & architectural questions' },
  { id: 'Summary & Report', label: 'Summary & Report', icon: FileText, desc: 'Executive briefings & metrics' },
];

const TONES = [
  { id: 'conversational', label: 'Conversational', desc: 'Contractions, warm cadence, varied rhythm' },
  { id: 'polished', label: 'Polished', desc: 'Smooth, articulate, balanced transitions' },
  { id: 'professional', label: 'Professional', desc: 'Active voice, crisp brevity, zero fluff' },
];

export default function ContextToneControls({
  context,
  setContext,
  tone,
  setTone,
  engine,
  setEngine,
  threshold,
  setThreshold,
  isProcessing
}) {
  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Context Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Communication Context
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {CONTEXTS.map((item) => {
              const Icon = item.icon;
              const isSelected = context === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setContext(item.id)}
                  disabled={isProcessing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} color={isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone Level Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Humanization Level (Tone)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {TONES.map((item) => {
                const isSelected = tone === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTone(item.id)}
                    disabled={isProcessing}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.label}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px' }}>
              💡 {TONES.find(t => t.id === tone)?.desc}
            </div>
          </div>
        </div>

        {/* Engine & Rewrite Resistance Threshold */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Resistance Threshold ({threshold}%)
            </label>
            <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
              Protects Authentic Text
            </span>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              disabled={isProcessing}
              style={{
                width: '100%',
                accentColor: 'var(--accent-primary)',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              <span>10% (Strict)</span>
              <span>25% (Standard)</span>
              <span>50% (Permissive)</span>
            </div>
          </div>

          {/* Engine Selector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Execution Engine:</span>
              <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                <Zap size={11} /> {engine === 'local' ? 'Instant Local' : engine.toUpperCase()}
              </span>
            </div>
            <select
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              disabled={isProcessing}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px 10px',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="local">Local Neural Pattern Engine (Fast & 100% Offline)</option>
              <option value="gemini">Google Gemini Pro (via API Key)</option>
              <option value="openai">OpenAI GPT-4o (via API Key)</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
