import React from 'react';
import { BarChart3, AlertTriangle, ShieldCheck, Activity, Compass } from 'lucide-react';

export default function StyleMetricsCard({ styleAnalysis, wasBypassed, threshold }) {
  if (!styleAnalysis) {
    return (
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
        Run humanization to view Phase 2 style analysis & robotic language detection metrics.
      </div>
    );
  }

  const { robotic_score, naturalness_score, robotic_level, flagged_phrases, metrics, bypass_reason } = styleAnalysis;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} color="var(--accent-amber)" />
            <span>Phase 2: Robotic Language Detection & Style Analysis</span>
          </h3>
          <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Measures cliché density, sentence burstiness, and triggers resistance to unnecessary rewriting.
          </p>
        </div>

        <div className={`badge ${wasBypassed ? 'badge-emerald' : 'badge-amber'}`}>
          {wasBypassed ? 'Rewrite Bypassed (Human Intent Preserved)' : `${robotic_level}`}
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        
        {/* Metric 1: Robotic Score */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Robotic Score</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: robotic_score > 40 ? 'var(--accent-amber)' : '#34d399', margin: '4px 0' }}>
            {robotic_score}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Threshold: {threshold}%
          </div>
        </div>

        {/* Metric 2: Naturalness Score */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Naturalness Index</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '4px 0' }}>
            {naturalness_score}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Human authenticity rating
          </div>
        </div>

        {/* Metric 3: Burstiness Coefficient */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cadence Burstiness</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-violet)', margin: '4px 0' }}>
            {metrics?.burstiness_coefficient ?? 0}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Std Dev: {metrics?.sentence_std_dev ?? 0} words
          </div>
        </div>

        {/* Metric 4: Cliché Count */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Flagged AI Markers</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: flagged_phrases?.length > 0 ? '#fb7185' : '#34d399', margin: '4px 0' }}>
            {flagged_phrases?.length || 0}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Density: {metrics?.cliche_density_pct ?? 0}%
          </div>
        </div>

      </div>

      {/* Bypass Explanation Pill */}
      {bypass_reason && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: wasBypassed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
          border: wasBypassed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: wasBypassed ? '#34d399' : 'var(--text-secondary)',
          marginBottom: '14px'
        }}>
          <strong>Resistance Status:</strong> {bypass_reason}
        </div>
      )}

      {/* Flagged AI Phrasing Details */}
      {flagged_phrases?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Flagged AI Phrases & Tropes:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
            {flagged_phrases.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(244, 63, 94, 0.06)',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fb7185' }}>
                  "{item.phrase}"
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
