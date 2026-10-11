import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Home, FileText, LayoutGrid, Clock, Settings, Menu,
  Bell, Shield, GraduationCap, Briefcase, MessageSquare, Star,
  Copy, CheckCircle2, Search, ArrowRight, ChevronRight, Sparkles,
  ShieldAlert, Zap
} from 'lucide-react';
import AbsoluteDetectorView from './components/AbsoluteDetectorView';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Template Presets
const TEMPLATES_DATA = [
  {
    id: "zero_frequency",
    category: "Technical",
    title: "Zero-Frequency Problem (Machine Learning)",
    context: "General writing",
    tone: "professional",
    text: 'This phenomenon is commonly referred to as the zero-frequency problem. Because the value "Medium" never appeared together with the label "No" in the training data, the Naive Bayes classifier multiplies the entire probability by zero, which effectively eliminates that class from consideration.'
  },
  {
    id: "recruiter_feedback",
    category: "Recruitment",
    title: "Robotic Candidate Evaluation",
    context: "Recruiter Feedback",
    tone: "stealth",
    text: "It is crucial to note that candidate Alice Chen demonstrated exceptional aptitude during her technical evaluation on October 12, 2026. Delve into her performance, and one observes that she attained a score of 94% on System Design and completed 4 out of 4 LeetCode hard challenges in 45 minutes using Python and Kubernetes. Furthermore, her communication serves as a testament to her senior caliber. In conclusion, it is strongly recommended that the team extend an offer of $165,000 per annum without delay."
  },
  {
    id: "candidate_outreach",
    category: "Outreach",
    title: "Formulaic Recruiter Email",
    context: "Academic Email",
    tone: "conversational",
    text: "Dear David Kumar, I hope this email finds you well in these bustling times. In today's fast-paced technological tapestry, your multifaceted background at Stripe caught our keen eye. It is paramount to highlight that our team at CloudScale is seeking a Staff Backend Engineer with over 6 years of experience in Go and PostgreSQL. Furthermore, we are thrilled to offer a flexible remote stipend of $15,000 alongside comprehensive health benefits. Delve into this golden opportunity and let us schedule an introductory discourse on Monday at 3:00 PM EST."
  },
  {
    id: "interview_questions",
    category: "Technical",
    title: "Templated System Design Questions",
    context: "Interview Questions",
    tone: "professional",
    text: "Could you elucidate in meticulous detail the comprehensive architectural mechanisms by which you optimized database latency from 320ms down to 18ms at Acme Corp in Q2 2025? Furthermore, it is pivotal to delineate the multifaceted trade-offs between Redis caching and PostgreSQL read replicas. Please furnish empirical evidence regarding how your 99.99% SLA was preserved."
  },
  {
    id: "executive_summary",
    category: "Executive",
    title: "Robotic Engineering Performance Summary",
    context: "Summary & Report",
    tone: "polished",
    text: "In summary, Q3 2026 was a testament to our engineering division's unwavering commitment. Delving into the metrics, team velocity climbed by 34.2%, and sprint burn-down reached 98.7% fidelity. Notably, lead architect Sarah Lin mitigated 14 critical CVE vulnerabilities in the Docker pipeline. In conclusion, the multifaceted initiatives spearheaded by our 12 engineers successfully safeguarded our $2.4M enterprise contract with FinTech Global."
  },
  {
    id: "ai_definition",
    category: "Academic",
    title: "Textbook AI Definition",
    context: "General writing",
    tone: "stealth",
    text: "Artificial intelligence (AI) is the ability of a computer system or machine to perform tasks that typically require human intelligence, such as learning, reasoning, problem-solving, and understanding language."
  }
];

const CONTEXT_OPTIONS = [
  { id: 'General writing', label: 'General writing' },
  { id: 'Recruiter Feedback', label: 'Recruiter Feedback' },
  { id: 'Academic Email', label: 'Academic Email' },
  { id: 'Interview Questions', label: 'Interview Questions' },
  { id: 'Summary & Report', label: 'Summary & Report' }
];

const STRATEGY_OPTIONS = [
  { 
    id: 'stealth', 
    engineTone: 'stealth',
    label: 'Stealth Ultra', 
    IconComponent: Shield,
    title: 'Stealth Ultra',
    subtitle: 'Varied rhythm, natural phrasing'
  },
  { 
    id: 'academic', 
    engineTone: 'academic',
    label: 'Academic Rigor', 
    IconComponent: GraduationCap,
    title: 'Academic Rigor',
    subtitle: 'Analytical precision, citation flow'
  },
  { 
    id: 'professional', 
    engineTone: 'professional',
    label: 'Executive Polish', 
    IconComponent: Briefcase,
    title: 'Executive Polish',
    subtitle: 'Crisp, active voice, no fluff'
  },
  { 
    id: 'conversational', 
    engineTone: 'conversational',
    label: 'Organic Casual', 
    IconComponent: MessageSquare,
    title: 'Organic Casual',
    subtitle: 'Contractions, conversational flow'
  },
  { 
    id: 'polished', 
    engineTone: 'polished',
    label: 'Polished', 
    IconComponent: Star,
    title: 'Polished',
    subtitle: 'Harmonious, articulate rhythm'
  }
];

export default function App() {
  // Navigation Tabs: 'home' | 'humanize' | 'templates' | 'history' | 'settings'
  const [activeTab, setActiveTab] = useState('humanize');

  // Humanizer state
  const [context, setContext] = useState('General writing');
  const [tone, setTone] = useState('professional'); // Executive Polish as default
  const [aggressiveness, setAggressiveness] = useState('balanced'); // 'light' | 'balanced' | 'strong'
  const [threshold, setThreshold] = useState(40);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');

  // Toolbar KEEP toggles
  const [keepFacts, setKeepFacts] = useState(true);
  const [keepNumbers, setKeepNumbers] = useState(true);
  const [keepFormatting, setKeepFormatting] = useState(true);

  // Initial text matching user image
  const [inputText, setInputText] = useState(TEMPLATES_DATA[0].text);
  const [outputText, setOutputText] = useState(
    'This is the zero-frequency problem. "Medium" never appeared with "No" in the training data, so Naive Bayes multiplies the whole probability by zero and drops that class entirely.'
  );

  const [detectorData, setDetectorData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingDetectors, setIsCheckingDetectors] = useState(false);
  const [viewMode, setViewMode] = useState('clean'); // 'clean' | 'xray'
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // History state
  const [historyList, setHistoryList] = useState([
    {
      id: 1,
      timestamp: 'Today at 6:15 PM',
      strategy: 'Executive Polish',
      context: 'General writing',
      input: TEMPLATES_DATA[0].text,
      output: 'This is the zero-frequency problem. "Medium" never appeared with "No" in the training data, so Naive Bayes multiplies the whole probability by zero and drops that class entirely.',
      retention: 100
    },
    {
      id: 2,
      timestamp: 'Today at 4:18 PM',
      strategy: 'Stealth Ultra',
      context: 'Recruiter Feedback',
      input: TEMPLATES_DATA[1].text,
      output: "Alice Chen really stood out during her technical evaluation on October 12, 2026. She scored 94% on System Design and knocked out 4 out of 4 challenges in 45 minutes using Python and Kubernetes. Solid track record. Plus, her communication clearly proved her senior caliber. Bottom line: we definitely recommend extending an offer of $165,000 without delay.",
      retention: 100
    }
  ]);
  const [historySearch, setHistorySearch] = useState('');

  // Templates filter
  const [templateFilter, setTemplateFilter] = useState('All');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const activeStrategy = STRATEGY_OPTIONS.find(s => s.id === tone) || STRATEGY_OPTIONS[2];
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  // Core Humanization Function
  const handleHumanize = async (overrideText = inputText, overrideTone = tone) => {
    const raw = overrideText.trim();
    if (!raw) {
      showToast('Please enter text to humanize');
      return;
    }

    setIsProcessing(true);

    let mappedContext = context;
    if (context === 'Academic Email') mappedContext = 'Candidate Communication';
    if (context === 'Interview Questions') mappedContext = 'Technical Interview Questions';

    const payload = {
      text: raw,
      context: mappedContext,
      tone: overrideTone,
      aggressiveness: aggressiveness === 'strong' ? 'ultra_stealth' : aggressiveness,
      engine: 'gemini',
      api_key: apiKey,
      threshold: Number(threshold),
      force_humanize: true
    };

    try {
      const res = await fetch(`${API_BASE}/api/humanize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Humanization failed');
      }

      const data = await res.json();
      const resText = data.final_text || '';
      setOutputText(resText);

      // Add to history
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        strategy: activeStrategy.label,
        context: context,
        input: raw,
        output: resText,
        retention: data.evaluation_metrics?.entity_preservation_score || 100
      };
      setHistoryList(prev => [newEntry, ...prev]);

      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.7 }
      });
      showToast(`✨ Humanized with ${activeStrategy.label}!`);
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch tone
  const handleToneChange = (newTone) => {
    if (newTone === tone) return;
    setTone(newTone);

    const targetOpt = STRATEGY_OPTIONS.find(s => s.id === newTone);
    const title = targetOpt ? targetOpt.label : newTone;

    if (inputText.trim()) {
      handleHumanize(inputText, newTone);
    } else {
      showToast(`Switched to ${title}`);
    }
  };

  // Check Detectors
  const handleCheckDetectors = async () => {
    const textToCheck = (outputText || inputText).trim();
    if (!textToCheck) {
      showToast('No text available to inspect');
      return;
    }

    setIsCheckingDetectors(true);
    try {
      const res = await fetch(`${API_BASE}/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToCheck, threshold: 25.0 })
      });
      if (!res.ok) throw new Error('Detector scan failed');
      const data = await res.json();
      setDetectorData(data);
      showToast('🔬 Forensic AI Detection Scan Complete!');
    } catch (err) {
      showToast(`⚠️ Detector scan error: ${err.message}`);
    } finally {
      setIsCheckingDetectors(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard!');
  };

  const handlePurgeCliches = () => {
    if (!inputText.trim()) return;
    let purged = inputText;
    const cliches = [
      [/\bIt is crucial to note that\s+/gi, ""],
      [/\bIt is paramount to highlight that\s+/gi, ""],
      [/\bdelve into\s+/gi, "look at "],
      [/\bserves as a testament to\b/gi, "clearly shows"],
      [/\ba testament to\b/gi, "a strong reflection of"],
      [/\bIn conclusion,\s*/gi, "Overall, "],
      [/\bIn summary,\s*/gi, "Overall, "],
      [/\bFurthermore,\s*/gi, "Also, "],
      [/\bMoreover,\s*/gi, "In addition, "],
      [/\bmultifaceted\b/gi, "well-rounded"],
      [/\btechnological tapestry\b/gi, "tech landscape"]
    ];
    cliches.forEach(([p, r]) => { purged = purged.replace(p, r); });
    setInputText(purged);
    showToast('Purged detected AI clichés!');
  };

  const handleApplyTemplate = (tpl) => {
    setInputText(tpl.text);
    setOutputText('');
    setContext(tpl.context);
    setTone(tpl.tone);
    setActiveTab('humanize');
    showToast(`Loaded ${tpl.title}`);
  };

  const filteredHistory = historyList.filter(item => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      item.strategy.toLowerCase().includes(q) ||
      item.context.toLowerCase().includes(q) ||
      item.output.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen mesh-ambient-bg text-[#111827] font-sans flex antialiased selection:bg-indigo-600 selection:text-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* FLOATING TOAST */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 ai-fade-in">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. FLOATING FROSTED GLASS SIDEBAR                        */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col justify-between w-64 my-4 ml-4 bg-white/80 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-3xl p-5 shrink-0 sticky top-4 h-[calc(100vh-2rem)] z-30">
        <div>
          {/* Logo & Brand Header */}
          <div 
            onClick={() => setActiveTab('humanize')}
            className="flex items-center gap-3 mb-8 px-2 pt-1 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0 group-hover:scale-105 transition">
              <Menu className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              ai-humanizer
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('humanize')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'humanize'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Humanize text</span>
            </button>

            <button
              onClick={() => setActiveTab('detector')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'detector'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>AI Detector</span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                100%
              </span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-slate-500" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Subtle empty bottom for airy clean look */}
        <div />
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN DISPLAY CONTENT                                  */}
      {/* ======================================================== */}
      <main className="flex-1 min-w-0 p-5 md:p-8 space-y-6 overflow-y-auto">

        {/* Top Header Row: Breadcrumb & User Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Workspace</span>
            <span className="bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs text-slate-800 font-bold px-3.5 py-1.5 rounded-full capitalize">
              {activeTab === 'home' ? 'Dashboard Overview' : activeTab === 'humanize' ? 'Humanize Studio' : activeTab === 'detector' ? 'Universal 100% AI Detector' : activeTab === 'templates' ? 'Templates Library' : activeTab === 'history' ? 'Conversion History' : 'Engine Settings'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('No unread notifications')}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 absolute top-2 right-2"></span>
            </button>

            <div 
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer border border-indigo-400/40"
              title="Active Session: ai-humanizer"
            >
              AI
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: HUMANIZE STUDIO (EXACT MATCH TO DESIGN)       */}
        {/* ==================================================== */}
        {activeTab === 'humanize' && (
          <div className="space-y-6 ai-fade-in">
            {/* Title & Top Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-[34px] font-extrabold text-[#111827] tracking-tight">
                  Make it sound like you
                </h1>
                <p className="text-slate-500 text-xs md:text-sm mt-1">
                  Choose a strategy, paste your draft, and get natural-sounding text back.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handlePurgeCliches}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl hover:bg-white hover:border-slate-300 transition shadow-2xs cursor-pointer"
                >
                  Purge clichés
                </button>
                <button
                  onClick={handleCheckDetectors}
                  disabled={isCheckingDetectors || !inputText.trim()}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl hover:bg-white hover:border-slate-300 transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCheckingDetectors ? 'Scanning...' : 'Check detectors'}
                </button>
              </div>
            </div>

            {/* 5 Strategy Option Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {STRATEGY_OPTIONS.map((opt) => {
                const isSelected = tone === opt.id;
                const IconComp = opt.IconComponent;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToneChange(opt.id)}
                    className={`p-5 rounded-3xl transition-all duration-200 cursor-pointer text-left flex flex-col justify-between min-h-[140px] relative backdrop-blur-md ${
                      isSelected
                        ? 'bg-white border-2 border-indigo-600 shadow-[0_6px_25px_rgba(99,102,241,0.18)] ring-4 ring-indigo-500/15'
                        : 'bg-white/90 border border-slate-200/90 hover:bg-white hover:border-indigo-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div>
                      {/* Icon container */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                            : 'bg-slate-50 text-indigo-500 border border-slate-200/80'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {opt.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                        {opt.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Control Bar: STRENGTH | KEEP | Context */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 px-5 border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                {/* STRENGTH */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">STRENGTH</span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200/70">
                    {[
                      { id: 'light', label: 'Light' },
                      { id: 'balanced', label: 'Balanced' },
                      { id: 'strong', label: 'Strong' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setAggressiveness(st.id);
                          showToast(`Strength set to ${st.label}`);
                        }}
                        className={`px-3.5 py-1 rounded-full text-xs transition cursor-pointer ${
                          aggressiveness === st.id
                            ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 font-semibold'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-4 w-px bg-slate-300 hidden sm:block" />

                {/* KEEP TOGGLES */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">KEEP</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setKeepFacts(!keepFacts);
                        showToast(keepFacts ? 'Facts locking toggled off' : 'Facts & names locked (100% NER)');
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer ${
                        keepFacts
                          ? 'bg-slate-100 text-slate-800 border-slate-200/90'
                          : 'bg-white text-slate-400 border-slate-200/80'
                      }`}
                    >
                      Facts & names
                    </button>
                    <button
                      onClick={() => {
                        setKeepNumbers(!keepNumbers);
                        showToast(keepNumbers ? 'Numbers locking toggled off' : 'Numbers locked');
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer ${
                        keepNumbers
                          ? 'bg-slate-100 text-slate-800 border-slate-200/90'
                          : 'bg-white text-slate-400 border-slate-200/80'
                      }`}
                    >
                      Numbers
                    </button>
                    <button
                      onClick={() => {
                        setKeepFormatting(!keepFormatting);
                        showToast(keepFormatting ? 'Formatting toggled off' : 'Formatting preserved');
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer ${
                        keepFormatting
                          ? 'bg-slate-100 text-slate-800 border-slate-200/90'
                          : 'bg-white text-slate-400 border-slate-200/80'
                      }`}
                    >
                      Formatting
                    </button>
                  </div>
                </div>
              </div>

              {/* Context Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Context •</span>
                <select
                  value={context}
                  onChange={(e) => {
                    setContext(e.target.value);
                    showToast(`Context: ${e.target.value}`);
                  }}
                  className="font-bold text-slate-800 bg-transparent outline-none cursor-pointer hover:text-indigo-600 transition"
                >
                  {CONTEXT_OPTIONS.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dual Cards: Your draft & Humanized with CRISP, CLEAR BORDERS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* LEFT CARD: Your draft */}
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden min-h-[440px]">
                {/* Header with clear border-b */}
                <div className="px-6 py-4.5 border-b border-slate-200/90 bg-slate-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">Your draft</span>
                    <span className="bg-[#EDE9FE] border border-indigo-200/80 text-[#6D28D9] text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {wordCount} words
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setInputText('');
                      setOutputText('');
                      showToast('Draft cleared');
                    }}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer transition"
                  >
                    Clear
                  </button>
                </div>

                {/* Body Textarea */}
                <div className="p-6 flex-1 flex flex-col relative bg-white">
                  {isProcessing && <div className="ai-scanline" />}
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your raw text here..."
                    rows={12}
                    className="w-full flex-1 text-slate-800 text-sm md:text-[14.5px] leading-relaxed outline-none resize-none placeholder:text-slate-400 bg-transparent min-h-[260px]"
                  />
                </div>

                {/* Footer with clear border-t */}
                <div className="px-6 py-4 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40">
                  <button
                    onClick={() => {
                      setActiveTab('detector');
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs md:text-sm px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    <span>100% Detector &amp; Auto-Change</span>
                  </button>

                  <button
                    onClick={() => handleHumanize()}
                    disabled={isProcessing || !inputText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-indigo-500/25 active:scale-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Humanizing...</span>
                      </>
                    ) : (
                      <span>Humanize now</span>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT CARD: Humanized with CRISP, CLEAR BORDERS */}
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden min-h-[440px]">
                {/* Header with clear border-b */}
                <div className="px-6 py-4.5 border-b border-slate-200/90 bg-slate-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">Humanized</span>
                    <span className="bg-[#DCFCE7] border border-emerald-200/80 text-[#15803D] text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {isProcessing ? 'Processing' : 'Ready'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Clean / X-Ray toggle */}
                    <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-xs font-semibold border border-slate-200/80">
                      <button
                        onClick={() => setViewMode('clean')}
                        className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                          viewMode === 'clean'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/60'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Clean
                      </button>
                      <button
                        onClick={() => setViewMode('xray')}
                        className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                          viewMode === 'xray'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/60'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        X-Ray
                      </button>
                    </div>

                    <button
                      onClick={handleCopy}
                      disabled={!outputText}
                      className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1 rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 text-slate-500" />
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Body Text */}
                <div className="p-6 flex-1 flex flex-col overflow-y-auto bg-white">
                  {outputText ? (
                    <>
                      {/* X-Ray Banner with clear border */}
                      <div className="bg-[#F5F3FF]/90 border border-[#DDD6FE] text-[#6D28D9] text-xs font-medium px-4 py-3 rounded-2xl mb-4 leading-relaxed shadow-2xs">
                        <strong>X-Ray:</strong> tightened to {activeStrategy.label} rhythm; facts and terms kept.
                      </div>

                      <p className="text-slate-800 text-sm md:text-[14.5px] leading-relaxed whitespace-pre-wrap">
                        {outputText}
                      </p>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-20 text-center">
                      <Sparkles className="w-8 h-8 mb-2 text-indigo-300 ai-float" />
                      <p className="font-semibold text-slate-600">No output yet</p>
                      <p className="text-slate-400 mt-1">Click "Humanize now" to transform your draft into authentic text.</p>
                    </div>
                  )}
                </div>

                {/* Footer with clear border-t */}
                <div className="px-6 py-4 border-t border-slate-200/90 flex items-center justify-between bg-slate-50/40 text-xs">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Key terms preserved</span>
                  </span>

                  <button
                    onClick={() => {
                      if (!outputText) return;
                      setInputText(outputText);
                      setOutputText('');
                      showToast('Draft swapped for iterative refinement');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer transition"
                  >
                    Refine further
                  </button>
                </div>
              </div>
            </div>

            {/* DETECTOR SCAN RESULTS (WHEN TRIGGERED) */}
            {detectorData && detectorData.detector_matrix && (
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4 ai-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Forensic AI Detection Matrix</h3>
                      {detectorData.detected_model_family && (
                        <span className="text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                          🤖 {detectorData.detected_model_family}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{detectorData.verdict || 'Evaluated against leading academic and enterprise classifiers'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('detector')}
                      className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-full hover:bg-indigo-100 transition cursor-pointer"
                    >
                      Open Full Heatmap &rarr;
                    </button>
                    <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                      {detectorData.detector_matrix.bypass_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {Object.entries(detectorData.detector_matrix.detectors || {}).map(([dKey, dVal]) => (
                    <div key={dKey} className="p-3 bg-white rounded-2xl border border-slate-200/90 text-center shadow-2xs">
                      <div className="text-[11px] font-bold text-slate-700 truncate">{dVal.name}</div>
                      <div className="text-lg font-black text-slate-900 my-0.5">{dVal.human_score}%</div>
                      <div className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${dVal.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {dVal.passed ? 'PASSED ✓' : 'FLAGGED'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: UNIVERSAL 100% AI DETECTOR & CHANGER            */}
        {/* ==================================================== */}
        {activeTab === 'detector' && (
          <AbsoluteDetectorView
            initialText={inputText}
            onTransferToHumanizer={(text) => {
              setInputText(text);
              setActiveTab('humanize');
              handleHumanize(text);
            }}
            onToast={showToast}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 2: HOME (DASHBOARD OVERVIEW IN SAME MODERN STYLE)*/}
        {/* ==================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-6 ai-fade-in">
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-[34px] font-extrabold text-[#111827] tracking-tight">
                Make your content sound human
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1">
                Real-time AI detection bypass, grammatical variance modulation, and 100% factual entity retention.
              </p>
            </div>

            {/* Top Grid: Hero Card + Credits Card with CRISP BORDERS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Hero Banner Card */}
              <div className="lg:col-span-8 bg-white/95 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-extrabold tracking-widest text-indigo-600">NEXT-GEN ENGINE</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">ai-humanizer</h2>
                  <p className="text-sm font-semibold text-slate-700 mt-1">Human-like text. 100% natural. 100% original.</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2 max-w-lg">
                    Transform robotic AI drafts into natural, authentic prose powered by Google Gemini 3.8 Flash, sentence cadence modulation, and SpaCy entity locking.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full">
                      ✓ 100% Human-like
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full">
                      🛡️ Complete Bypass
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 rounded-full">
                      🔒 Zero Hallucinations
                    </span>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setActiveTab('humanize')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Open Humanize Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Credits & Usage Card */}
              <div className="lg:col-span-4 bg-white/95 backdrop-blur-lg rounded-3xl p-6 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-800">Credits &amp; Usage</span>
                    <span className="text-[11px] font-medium text-slate-400">Monthly Tier</span>
                  </div>

                  <div className="flex items-center gap-4 my-4">
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-indigo-600"
                          strokeDasharray="77, 100"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute font-black text-xs text-slate-900">77%</span>
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-extrabold text-slate-900">77 / 100</div>
                      <div className="text-[11px] font-medium text-slate-400">Humanization Credits</div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-200/60">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: '77%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Credits replenish automatically at the beginning of each billing cycle.
                </div>
              </div>
            </div>

            {/* Quick Action Navigation with CRISP BORDERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('humanize')}
                className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-400 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Humanize Text</div>
                    <div className="text-[11px] text-slate-500">Convert AI text to natural human-like</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition" />
              </button>

              <button
                onClick={() => setActiveTab('detector')}
                className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-400 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>AI Detector</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800">100%</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Universal detect &amp; auto-change</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-rose-600 transition" />
              </button>

              <button
                onClick={() => setActiveTab('templates')}
                className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-400 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Use Templates</div>
                    <div className="text-[11px] text-slate-500">Pre-built prompts for quick results</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition" />
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-400 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">View History</div>
                    <div className="text-[11px] text-slate-500">Check past conversions &amp; metrics</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition" />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: TEMPLATES (TEMPLATES LIBRARY)                 */}
        {/* ==================================================== */}
        {activeTab === 'templates' && (
          <div className="space-y-6 ai-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-[34px] font-extrabold text-[#111827] tracking-tight">
                  Templates Library
                </h1>
                <p className="text-slate-500 text-xs md:text-sm mt-1">
                  Choose from curated pre-built prompts to test and humanize in 1-click.
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1 bg-white/95 backdrop-blur-md p-1 rounded-full text-xs font-semibold border border-slate-200/90 shadow-2xs">
                {['All', 'Technical', 'Recruitment', 'Outreach', 'Executive', 'Academic'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setTemplateFilter(cat)}
                    className={`px-3 py-1 rounded-full transition cursor-pointer ${
                      templateFilter === cat
                        ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid with CRISP BORDERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES_DATA.filter(t => templateFilter === 'All' || t.category === templateFilter).map(tpl => (
                <div
                  key={tpl.id}
                  className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:border-indigo-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                        {tpl.category}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 capitalize">
                        {tpl.tone} mode
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">{tpl.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">{tpl.text}</p>
                  </div>

                  <button
                    onClick={() => handleApplyTemplate(tpl)}
                    className="w-full py-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-600 text-xs font-bold rounded-xl border border-slate-200/90 hover:border-indigo-600 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Use Template &amp; Humanize</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: HISTORY (CONVERSION HISTORY)                  */}
        {/* ==================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-6 ai-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-[34px] font-extrabold text-[#111827] tracking-tight">
                  Conversion History
                </h1>
                <p className="text-slate-500 text-xs md:text-sm mt-1">
                  All previous humanizations with 1-click restore and full factual retention metrics.
                </p>
              </div>

              {/* Search with CRISP BORDER */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search past conversions..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl outline-none focus:border-indigo-400 shadow-2xs"
                />
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No history entries found matching your query.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredHistory.map(item => (
                  <div
                    key={item.id}
                    className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col md:flex-row justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.strategy}</span>
                        <span className="text-[10px] text-slate-400">• {item.timestamp}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-full">
                          {item.retention}% Factual Retention
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{item.output}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.output);
                          showToast('Copied output to clipboard!');
                        }}
                        className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/90 transition cursor-pointer shadow-2xs"
                        title="Copy Output"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setInputText(item.input);
                          setOutputText(item.output);
                          setActiveTab('humanize');
                          showToast('Restored to editor!');
                        }}
                        className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200/90 transition cursor-pointer"
                      >
                        Restore &gt;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: SETTINGS (ENGINE CONFIGURATION)               */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 ai-fade-in max-w-2xl mx-auto">
            <div>
              <h1 className="text-3xl md:text-[34px] font-extrabold text-[#111827] tracking-tight">
                Engine Settings
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1">
                Configure Google Gemini 3.8 Flash, factual entity preservation, and pipeline parameters.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Google Gemini API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-3 text-xs border border-slate-200/90 rounded-2xl outline-none font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Pre-configured with your dedicated Google Gemini API key.</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Smart Guard Resistance Threshold ({threshold}%)
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/90">
                      Active
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Protects authentically human sentences from unnecessary modification.
                  </p>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">System Diagnostics</h3>
                  <div className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90 text-xs shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Model Engine:</span>
                      <span className="font-bold text-indigo-600">Google Gemini 3.8 Flash</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">NER Entity Locking:</span>
                      <span className="font-bold text-emerald-600">SpaCy en_core_web_sm (Active)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Factuality Validator:</span>
                      <span className="font-bold text-emerald-600">Cross-Encoder NLI (Zero Hallucination)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Cloudflare Edge:</span>
                      <span className="font-bold text-emerald-600">QUIC &amp; HTTP/2 Live</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Settings saved successfully!')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-indigo-500/20 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
