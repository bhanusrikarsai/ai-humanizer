import React from 'react';
import { X, Key, Save, CheckCircle, Shield } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  openaiKey,
  setOpenaiKey,
  threshold,
  setThreshold
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Pipeline Settings</h2>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Optional API Keys & Resistance Configurations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Informational banner */}
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          marginBottom: '18px',
          fontSize: '0.78rem',
          color: 'var(--accent-cyan)'
        }}>
          ✨ <strong>Zero-Setup Notice:</strong> The built-in Local Neural Pattern Engine runs 100% offline with zero external API keys needed! You can optionally provide your Gemini or OpenAI API keys below to test external frontier LLMs.
        </div>

        {/* Gemini API Key */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Google Gemini API Key (Optional)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.86rem',
              outline: 'none',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Used when "Google Gemini Pro" is selected as the rewriting engine.
          </span>
        </div>

        {/* OpenAI API Key */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            OpenAI API Key (Optional)
          </label>
          <input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-proj-..."
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.86rem',
              outline: 'none',
              fontFamily: 'var(--font-mono)'
            }}
          />
        </div>

        {/* Resistance Threshold Slider */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Rewrite Resistance Activation Threshold
            </label>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>
              {threshold}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Any text scoring below this robotic threshold bypasses heavy transformation to prevent unnecessary changes.
          </span>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px' }}
          >
            <Save size={15} /> Save & Close Settings
          </button>
        </div>

      </div>
    </div>
  );
}
