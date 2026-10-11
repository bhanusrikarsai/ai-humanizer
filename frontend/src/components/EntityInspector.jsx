import React, { useState } from 'react';
import { Tag, Code2, ListTree, CheckCircle } from 'lucide-react';

export default function EntityInspector({ entitiesData, xmlTaggedText, promptInstruction }) {
  const [viewMode, setViewMode] = useState('badges'); // 'badges' | 'xml' | 'prompt'
  const entities = entitiesData || [];

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={16} color="var(--accent-cyan)" />
            <span>Phase 1: Entity & Fact Locking Inspector</span>
          </h3>
          <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            SpaCy & domain patterns lock names, dates, metrics, and technical terms to prevent hallucinations.
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setViewMode('badges')}
            className="btn btn-sm"
            style={{
              background: viewMode === 'badges' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              border: viewMode === 'badges' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: viewMode === 'badges' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.74rem'
            }}
          >
            <ListTree size={12} /> Entity Badges ({entities.length})
          </button>
          <button
            onClick={() => setViewMode('xml')}
            className="btn btn-sm"
            style={{
              background: viewMode === 'xml' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              border: viewMode === 'xml' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: viewMode === 'xml' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.74rem'
            }}
          >
            <Code2 size={12} /> XML Tagged View
          </button>
          <button
            onClick={() => setViewMode('prompt')}
            className="btn btn-sm"
            style={{
              background: viewMode === 'prompt' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              border: viewMode === 'prompt' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: viewMode === 'prompt' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.74rem'
            }}
          >
            LLM Directive View
          </button>
        </div>
      </div>

      {/* Content depending on viewMode */}
      {viewMode === 'badges' && (
        <div>
          {entities.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              No entities locked yet. Run the pipeline to extract and lock entities.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {entities.map((ent, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ent.text}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Source: {ent.source}</div>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.62rem', flexShrink: 0 }}>
                    {ent.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'xml' && (
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          lineHeight: 1.6,
          color: '#e2e8f0',
          whiteSpace: 'pre-wrap',
          maxHeight: '260px',
          overflowY: 'auto'
        }}>
          {xmlTaggedText || 'No XML generated yet.'}
        </div>
      )}

      {viewMode === 'prompt' && (
        <div style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          lineHeight: 1.6,
          color: '#34d399',
          whiteSpace: 'pre-wrap',
          maxHeight: '260px',
          overflowY: 'auto'
        }}>
          {promptInstruction || 'No prompt instruction generated yet.'}
        </div>
      )}
    </div>
  );
}
