import React from 'react';
import { 
  FileText, 
  Tag, 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  ArrowDown, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function PipelineVisualizer({ pipelineData, isProcessing, activeTab, setActiveTab }) {
  const stages = pipelineData?.pipeline_stages;
  const metrics = pipelineData?.evaluation_metrics;
  const wasBypassed = pipelineData?.was_bypassed;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Technical Pipeline Flow</span>
            {isProcessing && <RefreshCw size={14} className="animate-spin" color="var(--accent-cyan)" />}
          </h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Real-time execution of the 5-stage architecture & factuality validation loop
          </p>
        </div>

        {/* Tab Drilldowns */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['overview', 'entities', 'style', 'validation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn btn-sm"
              style={{
                background: activeTab === tab ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                border: activeTab === tab ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.74rem',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'overview' ? 'Architecture Graph' : tab === 'entities' ? 'Locked Entities' : tab === 'style' ? 'Style Analysis' : 'NLI Entailment'}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 5-Stage Diagram */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        position: 'relative'
      }}>
        
        {/* Stage 1: Raw Input */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={15} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>Stage 1</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Raw Input</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            AI-generated candidate notes or questions ingested.
          </div>
        </div>

        {/* Stage 2: NER Module */}
        <div style={{
          background: stages?.entities ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          border: stages?.entities ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          cursor: 'pointer'
        }}
        onClick={() => setActiveTab('entities')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag size={15} color="var(--accent-cyan)" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>Stage 2</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NER Module</div>
              </div>
            </div>
            {stages?.entities && (
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                {stages.entities.length} Locked
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            SpaCy extracts scores, dates, names into JSON memory.
          </div>
        </div>

        {/* Stage 3: Style Classifier */}
        <div style={{
          background: stages?.style_analysis ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          border: stages?.style_analysis ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          cursor: 'pointer'
        }}
        onClick={() => setActiveTab('style')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={15} color="var(--accent-amber)" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>Stage 3</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Style Classifier</div>
              </div>
            </div>
            {stages?.style_analysis && (
              <span className={`badge ${stages.style_analysis.bypass_rewrite ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                {stages.style_analysis.robotic_score}% Robotic
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {wasBypassed ? (
              <span style={{ color: '#34d399', fontWeight: 600 }}>Bypassed rewrite (Human cadence detected)</span>
            ) : (
              'Flags overused clichés and rigid cadence patterns.'
            )}
          </div>
        </div>

        {/* Stage 4: Contextual Rewriter */}
        <div style={{
          background: stages?.iterations?.length ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          border: stages?.iterations?.length ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={15} color="var(--accent-violet)" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>Stage 4</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rewriter</div>
              </div>
            </div>
            {stages?.total_iterations && (
              <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                {stages.total_iterations} Iteration{stages.total_iterations > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Injects locked entities into few-shot tone prompt.
          </div>
        </div>

        {/* Stage 5: Factuality Validator (NLI) */}
        <div style={{
          background: stages?.final_validation ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          border: stages?.final_validation ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          cursor: 'pointer'
        }}
        onClick={() => setActiveTab('validation')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={15} color="var(--accent-emerald)" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>Stage 5</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Factuality NLI</div>
              </div>
            </div>
            {stages?.final_validation && (
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                {Math.round(stages.final_validation.entailment_score * 100)}% Entailment
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Cross-Encoder validates output entails original facts.
          </div>
        </div>

      </div>

      {/* Decision Gate & Loop Indicator */}
      {stages && (
        <div style={{ 
          marginTop: '14px', 
          padding: '10px 14px', 
          borderRadius: 'var(--radius-md)', 
          background: wasBypassed 
            ? 'rgba(16, 185, 129, 0.1)' 
            : stages.final_validation?.condition_met 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(244, 63, 94, 0.1)',
          border: wasBypassed 
            ? '1px solid rgba(16, 185, 129, 0.3)' 
            : stages.final_validation?.condition_met 
              ? '1px solid rgba(16, 185, 129, 0.3)' 
              : '1px solid rgba(244, 63, 94, 0.3)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color={wasBypassed || stages.final_validation?.condition_met ? '#34d399' : '#fb7185'} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              Decision Gate: {wasBypassed ? 'Condition Met (Rewrite Bypassed - Intent Preserved)' : stages.final_validation?.verdict}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem' }}>
            <span>⚡ Latency: <strong>{pipelineData?.total_duration_ms}ms</strong></span>
            <span>🔒 Entities Preserved: <strong style={{ color: '#34d399' }}>{metrics?.entity_preservation_score}%</strong></span>
            <span>📊 Naturalness: <strong style={{ color: 'var(--accent-cyan)' }}>{metrics?.naturalness_score}%</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
