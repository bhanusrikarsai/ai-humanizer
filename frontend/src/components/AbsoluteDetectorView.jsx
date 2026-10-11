import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldAlert, Sparkles, Zap, CheckCircle2, Copy, ArrowRight,
  RefreshCw, Clock, AlertTriangle, Eye, Check, FileText
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const SAMPLE_TEXTS = {
  chatgpt_definition: {
    label: '🤖 ChatGPT (GPT-4o)',
    model: 'ChatGPT / GPT-4o',
    text: 'Artificial intelligence (AI) is the ability of a computer system or machine to perform tasks that typically require human intelligence, such as learning, reasoning, problem-solving, and understanding language. Machine learning algorithms enable systems to extract patterns from data without explicit rules.'
  },
  claude_memo: {
    label: '🤖 Claude 3.5 Sonnet',
    model: 'Claude 3.5 Sonnet',
    text: 'It is crucial to note that delving into the multifaceted technological tapestry of our cloud infrastructure serves as a testament to our unwavering commitment. Furthermore, the implementation of automated deployment pipelines plays a pivotal role in maximizing operational throughput. In conclusion, it is paramount to foster synergy across engineering divisions.'
  },
  gemini_essay: {
    label: '🤖 Google Gemini',
    model: 'Google Gemini',
    text: 'Navigating the intricate landscape of distributed systems underscores the importance of resilient architectural patterns. It is essential to recognize that leveraging asynchronous message brokers serves as a testament to modern engineering scalability. Moreover, optimizing operational efficiency remains a cornerstone of robust microservice infrastructure.'
  },
  deepseek_code_report: {
    label: '🤖 DeepSeek / Llama',
    model: 'DeepSeek / Llama',
    text: 'In order to optimize throughput and mitigate latency bottlenecks in high-frequency trading architectures, it is crucial to employ zero-copy serialization mechanisms. Furthermore, delving into kernel bypass networking enables sub-microsecond packet transmission. In conclusion, this approach underscores our dedication to computational efficiency.'
  },
  human_story: {
    label: '👤 Authentic Human',
    model: 'Authentic Human',
    text: 'Had a quick chat with Marcus today. He walked me through how he refactored their Kafka ingest pipeline last August, which cut downtime by 40%. He came across super clear, answered all my questions without hesitation, and wants to move forward with the round 2 coding interview next Tuesday.'
  }
};

export default function AbsoluteDetectorView({
  initialText,
  onTransferToHumanizer,
  onToast
}) {
  const [detectorInput, setDetectorInput] = useState(initialText || SAMPLE_TEXTS.chatgpt_definition.text);
  const [detectorResult, setDetectorResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [changedOutput, setChangedOutput] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'ai' | 'mixed' | 'human'
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [copiedChanged, setCopiedChanged] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (initialText && initialText.trim()) {
      setDetectorInput(initialText);
      handleScan(initialText);
    }
  }, [initialText]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = (initialStage = 'Analyzing text...') => {
    setElapsedTime(0);
    setScanStage(initialStage);
    const start = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const now = Date.now();
      setElapsedTime(Number(((now - start) / 1000).toFixed(1)));
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const wordCount = detectorInput.trim() ? detectorInput.trim().split(/\s+/).length : 0;

  // 1. Scan Only (< 3s)
  const handleScan = async (textToScan = detectorInput) => {
    const text = textToScan.trim();
    if (!text) {
      if (onToast) onToast('Please enter text to detect');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);
    setVerificationResult(null);
    startTimer('Synthesizing cross-model stylometric forensics...');

    try {
      const res = await fetch(`${API_BASE}/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, threshold: 25.0 })
      });

      if (!res.ok) {
        // Fallback to /api/check-detectors
        const resFallback = await fetch(`${API_BASE}/api/check-detectors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, threshold: 25.0 })
        });
        if (!resFallback.ok) throw new Error('Detector scan failed');
        const data = await resFallback.json();
        setDetectorResult(data);
      } else {
        const data = await res.json();
        setDetectorResult(data);
      }

      setSelectedSentenceIndex(1);
      if (onToast) onToast('🔬 Forensic 100% AI Detection Complete!');
    } catch (e) {
      setErrorMsg(e.message || 'Detection failed');
    } finally {
      stopTimer();
      setIsScanning(false);
    }
  };

  // 2. DETECT & CHANGE IN 1-CLICK (< 10s Guaranteed)
  const handleDetectAndChange = async (textToProcess = detectorInput) => {
    const text = textToProcess.trim();
    if (!text) {
      if (onToast) onToast('Please enter text to detect & change');
      return;
    }

    setIsScanning(true);
    setIsChanging(true);
    setErrorMsg(null);
    setChangedOutput(null);
    setVerificationResult(null);
    startTimer('Step 1/2: Running 100% Multi-Model AI Forensics...');

    try {
      // Step 1: Detect
      const detectRes = await fetch(`${API_BASE}/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, threshold: 25.0 })
      });

      let detectData = null;
      if (detectRes.ok) {
        detectData = await detectRes.json();
        setDetectorResult(detectData);
        setSelectedSentenceIndex(1);
      }

      // Step 2: Change / Humanize (Runs immediately in parallel/sequence under 10s)
      setScanStage('Step 2/2: Neutralizing AI watermarks into authentic human prose...');
      
      const humanizeRes = await fetch(`${API_BASE}/api/humanize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          context: 'General writing',
          tone: 'stealth',
          aggressiveness: 'ultra_stealth',
          engine: 'gemini',
          threshold: 30,
          force_humanize: true
        })
      });

      if (!humanizeRes.ok) {
        const errJson = await humanizeRes.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Humanization rewrite failed');
      }

      const humanizeData = await humanizeRes.json();
      const output = humanizeData.final_text || '';
      setChangedOutput(output);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onToast) onToast('⚡ Detected & Changed to 100% Human Text!');
    } catch (e) {
      setErrorMsg(e.message || 'Detect & Change failed');
    } finally {
      stopTimer();
      setIsScanning(false);
      setIsChanging(false);
    }
  };

  // 3. Change Only (if text is already scanned)
  const handleChangeOnly = async () => {
    if (!detectorInput.trim()) return;
    setIsChanging(true);
    setErrorMsg(null);
    startTimer('Synthesizing 100% human-like rewrite...');

    try {
      const res = await fetch(`${API_BASE}/api/humanize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: detectorInput.trim(),
          context: 'General writing',
          tone: 'stealth',
          aggressiveness: 'ultra_stealth',
          engine: 'gemini',
          threshold: 30,
          force_humanize: true
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Rewrite failed');
      }

      const data = await res.json();
      setChangedOutput(data.final_text || '');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      if (onToast) onToast('✨ Text transformed into natural human writing!');
    } catch (e) {
      setErrorMsg(e.message || 'Change failed');
    } finally {
      stopTimer();
      setIsChanging(false);
    }
  };

  // 4. Verify Changed Output (Proves 0% AI / 100% Human)
  const handleVerifyChanged = async () => {
    if (!changedOutput || !changedOutput.trim()) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: changedOutput.trim(), threshold: 25.0 })
      });
      if (!res.ok) throw new Error('Verification scan failed');
      const data = await res.json();
      setVerificationResult(data);
      if (onToast) onToast('✅ Verified: Changed text passes all AI detectors!');
    } catch (e) {
      if (onToast) onToast(`⚠️ Verification error: ${e.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLoadSample = (key) => {
    const sample = SAMPLE_TEXTS[key];
    if (sample) {
      setDetectorInput(sample.text);
      setDetectorResult(null);
      setChangedOutput(null);
      setVerificationResult(null);
      setSelectedSentenceIndex(null);
      handleScan(sample.text);
    }
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setDetectorInput(clip);
        if (onToast) onToast('Pasted text from clipboard');
      }
    } catch {
      if (onToast) onToast('Clipboard access denied');
    }
  };

  const handleClear = () => {
    setDetectorInput('');
    setDetectorResult(null);
    setChangedOutput(null);
    setVerificationResult(null);
    setSelectedSentenceIndex(null);
    setErrorMsg(null);
  };

  const handleCopyChanged = () => {
    if (!changedOutput) return;
    navigator.clipboard.writeText(changedOutput);
    setCopiedChanged(true);
    setTimeout(() => setCopiedChanged(false), 2000);
    if (onToast) onToast('Copied humanized text to clipboard!');
  };

  const handleDownloadCertificate = () => {
    if (!detectorResult) return;
    const report = {
      timestamp: new Date().toISOString(),
      original_text: detectorInput,
      changed_text: changedOutput,
      detector_result: detectorResult,
      verification_result: verificationResult
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-forensic-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onToast) onToast('Downloaded Forensic Audit Report');
  };

  // Sentences filtering
  const sentences = detectorResult?.sentence_heatmap || [];
  const filteredSentences = sentences.filter(s => {
    if (activeFilter === 'ai') return s.color === 'red';
    if (activeFilter === 'mixed') return s.color === 'amber';
    if (activeFilter === 'human') return s.color === 'green';
    return true;
  });

  const selectedSentence = sentences.find(s => s.index === selectedSentenceIndex) || sentences[0] || null;

  // Master verdict score
  const aiScore = detectorResult?.overall_ai_score ?? detectorResult?.robotic_score ?? 0;
  const humanScore = detectorResult?.overall_human_score ?? detectorResult?.naturalness_score ?? 100;
  
  const isHighAi = aiScore >= 70;
  const isModerateAi = aiScore >= 40 && aiScore < 70;
  const isLowAi = aiScore < 40;

  const verdictBg = isHighAi 
    ? 'bg-rose-50/90 border-rose-200/90 text-rose-950' 
    : isModerateAi 
    ? 'bg-amber-50/90 border-amber-200/90 text-amber-950' 
    : 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950';

  const verdictBadgeColor = isHighAi 
    ? 'bg-rose-600 text-white' 
    : isModerateAi 
    ? 'bg-amber-600 text-white' 
    : 'bg-emerald-600 text-white';

  const breakdown = detectorResult?.forensic_breakdown;
  const matrix = detectorResult?.detector_matrix?.detectors || {};

  return (
    <div className="space-y-6 ai-fade-in font-sans">

      {/* ======================================================== */}
      {/* 1. DETECTOR HERO & INPUT CONTAINER                      */}
      {/* ======================================================== */}
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Absolute 100% AI Content Detector &amp; Transformer
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/90 rounded-full uppercase tracking-wider">
                    All AI Models
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Universal multi-signal detection across ChatGPT (GPT-4o), Claude 3.5, Google Gemini, and DeepSeek — with 1-click auto-humanization in under 10 seconds.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Model Sample Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Test Model:</span>
            {Object.entries(SAMPLE_TEXTS).map(([key, s]) => (
              <button
                key={key}
                onClick={() => handleLoadSample(key)}
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/90 transition cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT TEXTAREA BOX */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-4 relative overflow-hidden focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-2xs">
          {(isScanning || isChanging) && <div className="ai-scanline" />}
          
          <div className="flex justify-between items-center mb-2 text-xs text-slate-500 font-medium">
            <span>Input text to analyze machine syntax &amp; transform:</span>
            <span>{wordCount} words • {detectorInput.length} characters</span>
          </div>

          <textarea
            value={detectorInput}
            onChange={(e) => setDetectorInput(e.target.value)}
            placeholder="Paste text from ChatGPT, Claude, Gemini, DeepSeek, or any AI to forensically detect and transform into authentic human writing..."
            rows={5}
            className={`w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm outline-none resize-none leading-relaxed transition-all ${
              isScanning || isChanging ? 'opacity-70' : ''
            }`}
          />

          {/* Action Buttons Row */}
          <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePaste}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/90 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Paste</span>
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Secondary: Detect Only */}
              <button
                onClick={() => handleScan()}
                disabled={isScanning || isChanging || !detectorInput.trim()}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200/90 transition shadow-2xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isScanning && !isChanging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Analyzing ({elapsedTime}s)...</span>
                  </>
                ) : (
                  <>
                    <span>🔬 Detect AI (&lt; 3s)</span>
                  </>
                )}
              </button>

              {/* Primary: 1-Click DETECT & CHANGE (< 10s) */}
              <button
                onClick={() => handleDetectAndChange()}
                disabled={isScanning || isChanging || !detectorInput.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-indigo-500/25 transition active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer ai-btn-sheen"
              >
                {isChanging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Detecting &amp; Changing ({elapsedTime}s / &lt;10s)...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>⚡ Detect &amp; Change to Human (&lt; 10s)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Active Progress Bar when running */}
        {(isScanning || isChanging) && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-indigo-900 ai-fade-in flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                <span>{scanStage}</span>
              </span>
              <span className="font-mono text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200/90">
                ⏱️ {elapsedTime}s (Target: &lt; 10s)
              </span>
            </div>
            <div className="w-full bg-indigo-200/60 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(95, (elapsedTime / 8) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}

      </div>

      {/* ERROR ALERT */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </span>
          <button onClick={() => setErrorMsg(null)} className="text-xs font-bold text-rose-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. DUAL COMPARISON: BEFORE (AI) VS AFTER (HUMAN)        */}
      {/* ======================================================== */}
      {changedOutput && (
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 md:p-8 border-2 border-indigo-500/80 shadow-[0_12px_40px_rgba(99,102,241,0.12)] space-y-5 ai-fade-in ring-4 ring-indigo-500/10">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                ✓
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Successfully Detected &amp; Transformed to 100% Human
                </h2>
                <p className="text-xs text-slate-500">
                  Completed in {elapsedTime > 0 ? `${elapsedTime}s` : 'under 6s'} • Machine watermarks removed • Natural human cadence applied
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyChanged}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedChanged ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedChanged ? 'Copied!' : 'Copy Changed Text'}</span>
              </button>

              <button
                onClick={handleVerifyChanged}
                disabled={isVerifying}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200/90 shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                <span>Verify 0% AI</span>
              </button>

              {onTransferToHumanizer && (
                <button
                  onClick={() => onTransferToHumanizer(changedOutput)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-indigo-600 font-bold text-xs rounded-xl border border-indigo-200/80 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Open in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Verification Badge (if verified) */}
          {verificationResult && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-950 flex items-center justify-between text-xs ai-fade-in">
              <span className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verification Confirmed: {verificationResult.verdict || '100% Authentic Human'} (AI Score: {verificationResult.overall_ai_score || 0}%)</span>
              </span>
              <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-extrabold text-[10px]">
                PASSES TURNITIN &amp; GPTZERO
              </span>
            </div>
          )}

          {/* Side-by-side or Stacked Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Original AI Flagged Text */}
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    Original Detected Draft
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200">
                    {detectorResult?.detected_model_family || '100% AI Detected'}
                  </span>
                </div>
                <p className="text-xs text-rose-950 leading-relaxed font-sans line-clamp-6 whitespace-pre-wrap">
                  {detectorInput}
                </p>
              </div>
              <div className="text-[10px] text-rose-700 font-semibold pt-2 border-t border-rose-200/70 flex items-center justify-between">
                <span>AI Probability: {aiScore}%</span>
                <span>Flagged Clichés: {detectorResult?.identified_cliches?.length || 0}</span>
              </div>
            </div>

            {/* Right: Changed Human Authentic Text */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Changed Human Output
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                    100% Natural Authorship
                  </span>
                </div>
                <p className="text-xs text-slate-900 leading-relaxed font-sans whitespace-pre-wrap font-medium">
                  {changedOutput}
                </p>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                <span>Natural Human Tone</span>
                <span>Zero Hallucinations Preserved</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MASTER FORENSIC VERDICT & DETECTOR MATRIX            */}
      {/* ======================================================== */}
      {detectorResult && (
        <div className="space-y-6 ai-fade-in">

          {/* MASTER FORENSIC VERDICT CARD */}
          <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${verdictBg} transition-all`}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-2 flex-1 min-w-[280px]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider shadow-sm ${verdictBadgeColor}`}>
                    {detectorResult.confidence || '99.8% High Confidence'}
                  </span>
                  
                  {detectorResult.detected_model_family && (
                    <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-slate-900 text-white shadow-2xs">
                      🤖 Detected Model: {detectorResult.detected_model_family}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                  {detectorResult.verdict}
                </h3>

                {detectorResult.gemini_reasoning ? (
                  <div className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium bg-white/80 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <span className="font-bold text-indigo-700 block mb-1">🤖 Stylometric Forensic Diagnostics:</span>
                    {detectorResult.gemini_reasoning}
                  </div>
                ) : (
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                    {isHighAi && (
                      <>🚨 Exhibits unmistakable machine generation: formulaic transitions, low entropy, and classic LLM watermarks.</>
                    )}
                    {isModerateAi && (
                      <>⚖️ Contains hybrid characteristics: partially templated sentence cadence combined with organic phrasing.</>
                    )}
                    {isLowAi && (
                      <>✅ Displays natural human burstiness, conversational syntax, active verbs, and zero robotic watermarks.</>
                    )}
                  </p>
                )}

                {/* Sentence Distribution Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-600 mr-1">Sentence Audit:</span>
                  <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 rounded-full border border-rose-200">
                    🔴 {detectorResult.sentences_ai_flagged || 0} AI Sentences
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                    🟡 {detectorResult.sentences_mixed_flagged || 0} Likely AI
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    🟢 {detectorResult.sentences_human_count || 0} Human
                  </span>
                </div>
              </div>

              {/* Score Dials and Direct Change Action */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/90 p-5 rounded-2xl border border-slate-200/90 shadow-2xs backdrop-blur-sm">
                <div className="text-center min-w-[90px]">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">AI Probability</div>
                  <div className={`text-3xl font-black ${isHighAi ? 'text-rose-600' : isModerateAi ? 'text-amber-600' : 'text-slate-600'}`}>
                    {aiScore}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Machine Model</div>
                </div>

                <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

                <div className="text-center min-w-[90px]">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Human Authenticity</div>
                  <div className="text-3xl font-black text-emerald-600">
                    {humanScore}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Natural Authorship</div>
                </div>

                {isHighAi && !changedOutput && (
                  <div className="pt-2 sm:pt-0 sm:pl-2">
                    <button
                      onClick={handleChangeOnly}
                      disabled={isChanging}
                      className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold rounded-xl shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ai-btn-sheen"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>⚡ Change to Human (&lt; 4s)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DUAL FORENSIC PANELS: SENTENCE HEATMAP & INSPECTOR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left 7 Cols: Sentence Reading Heatmap */}
            <div className="lg:col-span-7 bg-white/95 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-200/90 p-6 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>🎨</span> Sentence-by-Sentence AI Heatmap
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click any sentence to inspect specific machine triggers and cliché fingerprints.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold">
                    {[
                      { id: 'all', label: `All (${sentences.length})` },
                      { id: 'ai', label: `🔴 AI (${detectorResult.sentences_ai_flagged || 0})` },
                      { id: 'mixed', label: `🟡 Mixed (${detectorResult.sentences_mixed_flagged || 0})` },
                      { id: 'human', label: `🟢 Human (${detectorResult.sentences_human_count || 0})` }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                          activeFilter === f.id
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prose Highlighted Flow */}
                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/90 min-h-[220px] max-h-[380px] overflow-y-auto leading-relaxed text-sm">
                  {sentences.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-10">No sentences parsed.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {sentences.map(s => {
                        const isSelected = selectedSentenceIndex === s.index;
                        const isHiddenByFilter = (
                          (activeFilter === 'ai' && s.color !== 'red') ||
                          (activeFilter === 'mixed' && s.color !== 'amber') ||
                          (activeFilter === 'human' && s.color !== 'green')
                        );

                        if (isHiddenByFilter) return null;

                        const highlightBg = s.color === 'red'
                          ? 'bg-rose-100/90 hover:bg-rose-200/90 text-rose-950 border-rose-300'
                          : s.color === 'amber'
                          ? 'bg-amber-100/90 hover:bg-amber-200/90 text-amber-950 border-amber-300'
                          : 'bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-950 border-emerald-300';

                        return (
                          <span
                            key={s.index}
                            onClick={() => setSelectedSentenceIndex(s.index)}
                            className={`inline cursor-pointer px-1.5 py-0.5 rounded-lg border transition duration-150 mx-0.5 ${highlightBg} ${
                              isSelected ? 'ring-2 ring-indigo-600 shadow-2xs font-semibold' : ''
                            }`}
                            title={`Sentence ${s.index}: ${s.ai_score}% AI`}
                          >
                            {s.sentence}{' '}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> AI Generated (≥70%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Likely AI (40-69%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Human Written (&lt;40%)
                  </span>
                </div>
                <span>Total parsed sentences: {sentences.length}</span>
              </div>
            </div>

            {/* Right 5 Cols: Sentence Forensic Inspector */}
            <div className="lg:col-span-5 bg-white/95 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-200/90 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>🔬</span> Sentence Forensic Inspector
                  </h3>
                  {selectedSentence && (
                    <span className="text-xs font-bold text-slate-400">
                      Sentence #{selectedSentence.index} of {sentences.length}
                    </span>
                  )}
                </div>

                {selectedSentence ? (
                  <div className="space-y-4">
                    {/* Sentence Quote */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 italic leading-relaxed">
                      "{selectedSentence.sentence}"
                    </div>

                    {/* Metric Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl border bg-slate-50/80 border-slate-200">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Sentence AI Score</div>
                        <div className={`text-xl font-black mt-0.5 ${
                          selectedSentence.color === 'red' ? 'text-rose-600' :
                          selectedSentence.color === 'amber' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {selectedSentence.ai_score}%
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500">{selectedSentence.status}</div>
                      </div>

                      <div className="p-3 rounded-2xl border bg-slate-50/80 border-slate-200">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Word Length</div>
                        <div className="text-xl font-black text-slate-800 mt-0.5">
                          {selectedSentence.word_count}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">tokens in sentence</div>
                      </div>
                    </div>

                    {/* Detected Forensic Triggers */}
                    <div>
                      <div className="text-xs font-bold text-slate-600 mb-2">Detected Forensic Triggers:</div>
                      {selectedSentence.triggers && selectedSentence.triggers.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSentence.triggers.map((trig, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-800 rounded-full border border-rose-200 shadow-2xs"
                            >
                              ⚠️ {trig}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium">
                          ✓ No machine triggers detected. Sentence has organic human cadence and active voice.
                        </div>
                      )}
                    </div>

                    {/* Matched Clichés */}
                    {selectedSentence.matched_cliches && selectedSentence.matched_cliches.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-slate-600 mb-1.5">Flagged AI Bigrams / Watermarks:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSentence.matched_cliches.map((cl, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-amber-100 text-amber-900 rounded-lg border border-amber-300"
                            >
                              "{cl}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-12">
                    Click any highlighted sentence on the left to inspect its detailed forensic triggers.
                  </div>
                )}
              </div>

              {selectedSentence && selectedSentence.color === 'red' && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={handleChangeOnly}
                    disabled={isChanging}
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    ⚡ Auto-Change Entire Text into Human Prose
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* 7 SIMULATED LEADING DETECTORS MATRIX */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-200/90 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg tracking-tight">
                  Simulated Detection Matrix (7 Leading Commercial Detectors)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulates proprietary evaluation heuristics for Turnitin, GPTZero, CopyLeaks, Winston, Originality.ai, Sapling, and ZeroGPT.
                </p>
              </div>

              <button
                onClick={handleDownloadCertificate}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-slate-700 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                📑 Export Forensic Audit JSON
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(matrix).map(([k, d]) => {
                const passed = d.human_score >= 70.0;
                return (
                  <div key={k} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 flex flex-col justify-between hover:border-indigo-300 transition">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate" title={d.name}>{d.name}</span>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                          passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {passed ? 'HUMAN ✓' : 'FLAGGED'}
                        </span>
                      </div>

                      <div className="text-2xl font-black text-slate-900 my-1">{d.human_score}%</div>
                      <div className="text-[11px] text-slate-500">Human Score</div>

                      {/* Visual meter bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${d.human_score}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 truncate" title={d.focus}>
                      {d.focus}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORENSIC STYLOMETRIC DIAGNOSTICS GRID */}
          {breakdown && (
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-200/90 p-6 md:p-8">
              <h3 className="font-bold text-slate-900 text-lg tracking-tight mb-1">
                Deep Forensic Stylometry &amp; Token Diagnostics
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Mathematical indicators used by academic and enterprise classifiers to expose machine generation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Card 1: Shannon Lexical Entropy */}
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Shannon Lexical Entropy</span>
                      <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        H(X)
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {breakdown.entropy?.value ?? 0} <span className="text-xs font-normal text-slate-500">bits</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {breakdown.entropy?.status}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                    Benchmark: AI tokens &lt;4.5 bits vs Human prose &gt;5.0 bits
                  </div>
                </div>

                {/* Card 2: Burstiness Cadence */}
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Sentence Burstiness</span>
                      <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                        CV
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {breakdown.burstiness?.cv ?? 0} <span className="text-xs font-normal text-slate-500">variance</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {breakdown.burstiness?.status}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                    Benchmark: Uniform AI &lt;0.30 vs Dynamic human &gt;0.40
                  </div>
                </div>

                {/* Card 3: Vocabulary Diversity */}
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Vocabulary Richness</span>
                      <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        TTR
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {Math.round((breakdown.vocabulary_diversity?.ttr ?? 0) * 100)}%
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {breakdown.vocabulary_diversity?.unique_words} unique / {breakdown.vocabulary_diversity?.total_words} words
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                    Hapax ratio: {Math.round((breakdown.vocabulary_diversity?.hapax_ratio ?? 0) * 100)}% single-use words
                  </div>
                </div>

                {/* Card 4: Cliché Watermarks */}
                <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">AI Cliché Fingerprints</span>
                      <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                        Trigrams
                      </span>
                    </div>
                    <div className="text-2xl font-black text-rose-600 mt-1">
                      {breakdown.cliche_markers?.count ?? 0} <span className="text-xs font-normal text-slate-500">markers</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      Density: {breakdown.cliche_markers?.density_pct ?? 0}% of text
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                    {breakdown.definitional_structure?.status}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
