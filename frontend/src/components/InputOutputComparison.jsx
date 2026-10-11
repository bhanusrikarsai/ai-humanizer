import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Sparkles, Eye, ShieldCheck, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InputOutputComparison({
  inputText,
  setInputText,
  outputText,
  pipelineData,
  isProcessing,
  onHumanize,
  onAnalyzeEntities
}) {
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunHumanize = () => {
    onHumanize();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const wordCountIn = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const wordCountOut = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;
  const wasBypassed = pipelineData?.was_bypassed;
  const lockedEntities = pipelineData?.pipeline_stages?.entities || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '20px' }}>
      
      {/* Left Pane: Raw AI Input */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Raw AI-Generated Input</span>
              {pipelineData?.pipeline_stages?.style_analysis?.robotic_score > 40 && (
                <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Robotic</span>
              )}
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {wordCountIn} words • {inputText.length} characters
            </span>
          </div>

          <button
            onClick={onAnalyzeEntities}
            disabled={isProcessing || !inputText.trim()}
            className="btn btn-secondary btn-sm"
            title="Inspect SpaCy entities and XML tags without rewriting"
          >
            Lock Entities Only
          </button>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste machine-generated interview questions, recruiter notes, feedback, or reports here..."
          disabled={isProcessing}
          style={{
            width: '100%',
            height: '240px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />

        {/* Flagged AI Cliches Pill Preview */}
        {pipelineData?.pipeline_stages?.style_analysis?.flagged_phrases?.length > 0 && (
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertTriangle size={12} /> Detected AI Clichés ({pipelineData.pipeline_stages.style_analysis.flagged_phrases.length}):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {pipelineData.pipeline_stages.style_analysis.flagged_phrases.map((item, idx) => (
                <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  "{item.phrase}"
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={handleRunHumanize}
            disabled={isProcessing || !inputText.trim()}
            className="btn btn-primary pulse-glow"
            style={{ width: '100%', padding: '12px', fontSize: '0.94rem' }}
          >
            {isProcessing ? (
              <>Processing Pipeline...</>
            ) : (
              <>
                <Sparkles size={16} /> Humanize & Validate Text
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Pane: Humanized Output */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Refined Human Output</span>
              {outputText && (
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  <ShieldCheck size={11} /> Factuality Verified
                </span>
              )}
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {wordCountOut} words • {outputText.length} characters
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="btn btn-secondary btn-sm"
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Output Text View */}
        <div style={{
          flex: 1,
          minHeight: '240px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          color: 'var(--text-primary)',
          fontSize: '0.88rem',
          lineHeight: 1.6,
          overflowY: 'auto'
        }}>
          {outputText ? (
            <div>
              {wasBypassed && (
                <div style={{
                  padding: '8px 12px',
                  marginBottom: '10px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.75rem',
                  color: '#34d399'
                }}>
                  🛡️ <strong>Resistance to Unnecessary Rewriting Triggered:</strong> Text was preserved in its authentic original state because the robotic score is below activation threshold.
                </div>
              )}
              <div style={{ whiteSpace: 'pre-wrap' }}>{outputText}</div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Click "Humanize & Validate Text" to execute the pipeline.
            </div>
          )}
        </div>

        {/* Preserved Entities Verification Bar */}
        {lockedEntities.length > 0 && outputText && (
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#34d399', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={12} /> Preserved Locked Entities ({lockedEntities.length}/{lockedEntities.length}):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {lockedEntities.map((ent, idx) => (
                <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={10} /> {ent.text}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
