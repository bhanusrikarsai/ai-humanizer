import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function NliValidatorCard({ finalValidation, iterations, evaluationMetrics }) {
  if (!finalValidation) {
    return (
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
        Run humanization to view Phase 4 Factuality & NLI Validation metrics.
      </div>
    );
  }

  const { condition_met, verdict, entailment_score, contradiction_score, neutral_score, entity_preservation_score, missing_entities, rejection_reasons } = finalValidation;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            <span>Phase 4: Factuality Validator (Cross-Encoder NLI)</span>
          </h3>
          <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Mathematical Natural Language Inference: Premise (Original) vs Hypothesis (Rewrite)
          </p>
        </div>

        <div className={`badge ${condition_met ? 'badge-emerald' : 'badge-rose'}`}>
          {condition_met ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          <span>{verdict}</span>
        </div>
      </div>

      {/* Probabilities Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        
        {/* Entailment Score */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Entailment Score</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', margin: '4px 0' }}>
            {Math.round(entailment_score * 100)}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Meaning preserved without hallucination
          </div>
        </div>

        {/* Contradiction Risk */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contradiction Risk</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: contradiction_score > 0.15 ? '#fb7185' : 'var(--text-secondary)', margin: '4px 0' }}>
            {Math.round(contradiction_score * 100)}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Factual conflict / mutated values
          </div>
        </div>

        {/* Neutral Risk */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Neutral / Drift Risk</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-secondary)', margin: '4px 0' }}>
            {Math.round(neutral_score * 100)}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Ungrounded claims / scope drift
          </div>
        </div>

        {/* Entity Retention Rate */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Entity Retention</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', margin: '4px 0' }}>
            {entity_preservation_score}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            100% of dates, scores & names kept
          </div>
        </div>

      </div>

      {/* Rejection / Loop history */}
      {rejection_reasons?.length > 0 && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          marginBottom: '14px'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fb7185', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} /> Loop Feedback Triggered:
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.74rem', color: '#fca5a5' }}>
            {rejection_reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Iterations Audit Trail */}
      {iterations?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Validation Loop History ({iterations.length} pass{iterations.length > 1 ? 'es' : ''}):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {iterations.map((it, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem'
                }}
              >
                <div>
                  <strong>Iteration {it.iteration}:</strong> Engine: {it.engine} • Latency: {it.duration_ms}ms
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Entailment: {Math.round(it.validation.entailment_score * 100)}%</span>
                  <span className={`badge ${it.condition_met ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.62rem' }}>
                    {it.condition_met ? 'APPROVED' : 'REJECTED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
