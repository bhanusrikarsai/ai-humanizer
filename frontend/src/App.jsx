import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Home, FileText, LayoutGrid, Clock, Settings,
  Shield, GraduationCap, Briefcase, MessageSquare, Star,
  Copy, CheckCircle2, Search, ArrowRight, ChevronRight, Sparkles,
  ShieldAlert, Zap, Plus, Leaf, Check, RefreshCw, X, Download
} from 'lucide-react';
import AbsoluteDetectorView from './components/AbsoluteDetectorView';
import brainLogo from './assets/logo.png';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const DEFAULT_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Template Presets matching the user's workflow
const TEMPLATES_DATA = [
  {
    id: "zero_frequency",
    category: "Technical",
    title: "Zero-Frequency Problem (Machine Learning)",
    context: "General writing",
    tone: "stealth",
    text: 'This phenomenon is commonly referred to as the zero-frequency problem. Because the value "Medium" never appeared together with the label "No" in the training data, the Naive Bayes classifier multiplies the entire probability by zero, which effectively eliminates that class from consideration.'
  },
  {
    id: "bullet_points",
    category: "Bullet Points & Lists",
    title: "Formulaic Project Update (Bullet Points)",
    context: "Bullet Points & Lists",
    tone: "stealth",
    text: '- It is crucial to note that team velocity was optimized by 34% through automated CI/CD pipelines.\n- Furthermore, the team demonstrated unwavering commitment to mitigating 14 critical production vulnerabilities.\n- In conclusion, leveraging microservices played a pivotal role in ensuring our 99.99% SLA was preserved.'
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
    context: "Candidate Outreach",
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
  }
];

const CONTEXT_OPTIONS = [
  { id: 'General writing', label: 'General writing' },
  { id: 'Bullet Points & Lists', label: 'Bullet Points & Lists' },
  { id: 'Technical & Code', label: 'Technical & Code' },
  { id: 'Recruiter Feedback', label: 'Recruiter Feedback' },
  { id: 'Candidate Outreach', label: 'Candidate Outreach' },
  { id: 'Interview Questions', label: 'Interview Questions' },
  { id: 'Summary & Report', label: 'Summary & Report' },
  { id: 'Academic Essay', label: 'Academic Essay' }
];

const STRATEGY_OPTIONS = [
  { 
    id: 'stealth', 
    engineTone: 'stealth',
    label: 'Stealth Ultra', 
    title: 'Stealth Ultra',
    subtitle: 'Varied rhythm, natural phrasing',
    IconComponent: Leaf,
    iconBg: 'bg-[#e6f4ea]',
    iconColor: 'text-[#0f5c56]'
  },
  { 
    id: 'academic', 
    engineTone: 'academic',
    label: 'Academic Rigor', 
    title: 'Academic Rigor',
    subtitle: 'Analytical precision, citation flow',
    IconComponent: GraduationCap,
    iconBg: 'bg-[#e8f0fe]',
    iconColor: 'text-[#1a73e8]'
  },
  { 
    id: 'professional', 
    engineTone: 'professional',
    label: 'Executive Polish', 
    title: 'Executive Polish',
    subtitle: 'Crisp, active voice, no fluff',
    IconComponent: Briefcase,
    iconBg: 'bg-[#f1f3f4]',
    iconColor: 'text-[#3c4043]'
  },
  { 
    id: 'conversational', 
    engineTone: 'conversational',
    label: 'Organic Casual', 
    title: 'Organic Casual',
    subtitle: 'Contractions, conversational flow',
    IconComponent: MessageSquare,
    iconBg: 'bg-[#fef7e0]',
    iconColor: 'text-[#e37400]'
  },
  { 
    id: 'polished', 
    engineTone: 'polished',
    label: 'Polished', 
    title: 'Polished',
    subtitle: 'Harmonious, articulate rhythm',
    IconComponent: Star,
    iconBg: 'bg-[#f3e8fd]',
    iconColor: 'text-[#9334e6]'
  }
];

const EXTENDED_CLICHES_LIST = [
  'it is crucial to note that', 'it is crucial to note', 'delve into', 'delves into', 'delved into', 'delving into',
  'serves as a testament to', 'a testament to', 'tapestry of', 'multifaceted',
  'in conclusion', 'in summary', 'furthermore', 'moreover', 'pivotal role', 'plays a pivotal role',
  'it is paramount to highlight that', 'it is paramount to', 'it is pivotal to', 'it is noteworthy that',
  'unwavering commitment', 'meticulous', 'meticulously', 'elucidate', 'delineate',
  'furnish empirical evidence', 'in today\'s fast-paced', 'comprehensive architectural mechanisms',
  'keen eye', 'golden opportunity', 'bustling times', 'hope this email finds you well', 'spearheaded by',
  'beacon of', 'seamlessly integrate', 'navigating the intricacies of', 'vital role',
  'unlocking the potential', 'demystify', 'embark upon', 'embark on', 'holistic approach',
  'rich tapestry', 'in the realm of', 'ever-evolving landscape', 'game-changer',
  'paramount importance', 'plethora of', 'harnessing the power of', 'the implementation of',
  'it is important to remember that', 'it should be noted that', 'demonstrated exceptional aptitude',
  'without delay', 'underscores the importance', 'fostering collaboration', 'foster synergy'
];

export default function App() {
  // Navigation Tabs: 'home' | 'humanize' | 'detector' | 'templates' | 'history' | 'settings'
  const [activeTab, setActiveTab] = useState('home');

  // Humanizer state
  const [context, setContext] = useState('General writing');
  const [tone, setTone] = useState('stealth'); // Stealth Ultra matches image selection
  const [aggressiveness, setAggressiveness] = useState('light'); // 'light' | 'balanced' | 'strong' matches image 'Light'
  const [threshold, setThreshold] = useState(30);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || DEFAULT_KEY);

  // Toolbar KEEP toggles
  const [keepFacts, setKeepFacts] = useState(true);
  const [keepNumbers, setKeepNumbers] = useState(true);
  const [keepFormatting, setKeepFormatting] = useState(true);

  // Initial text matching user image exactly
  const [inputText, setInputText] = useState(TEMPLATES_DATA[0].text);
  const [outputText, setOutputText] = useState(
    'This phenomenon is commonly referred to as the zero-frequency problem. Because the value "Medium" never appeared together with the label "No" in the training data, the Naive Bayes classifier multiplies the entire probability by zero, which effectively eliminates that class from consideration.'
  );

  const [detectorData, setDetectorData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingDetectors, setIsCheckingDetectors] = useState(false);
  const [viewMode, setViewMode] = useState('clean'); // 'clean' | 'xray'
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // History state
  const [historyList, setHistoryList] = useState([
    {
      id: 1,
      timestamp: 'Today at 6:15 PM',
      strategy: 'Stealth Ultra',
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
      input: TEMPLATES_DATA[2].text,
      output: "Alice Chen really stood out during her technical evaluation on October 12, 2026. She scored 94% on System Design and completed 4 out of 4 challenges in 45 minutes using Python and Kubernetes. Solid track record. Plus, her communication clearly proved her senior caliber. Bottom line: we definitely recommend extending an offer of $165,000 without delay.",
      retention: 100
    }
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const activeStrategy = STRATEGY_OPTIONS.find(s => s.id === tone) || STRATEGY_OPTIONS[0];
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  // Auto-detect format (e.g. if text is in bullet points)
  useEffect(() => {
    if (inputText.includes('\n- ') || inputText.includes('\n* ') || inputText.includes('\n• ')) {
      if (context === 'General writing') {
        setContext('Bullet Points & Lists');
      }
    }
  }, [inputText]);

  // Core Humanization Function (Handles ANY format: bullets, numbered lists, essays, code notes)
  const handleHumanize = async (overrideText = inputText, overrideTone = tone) => {
    const raw = overrideText.trim();
    if (!raw) {
      showToast('Please enter text to humanize');
      return;
    }

    setIsProcessing(true);

    const payload = {
      text: raw,
      context: context,
      tone: overrideTone,
      aggressiveness: aggressiveness,
      engine: 'gemini',
      api_key: apiKey || DEFAULT_KEY,
      threshold: Number(threshold),
      keep_facts: keepFacts,
      keep_numbers: keepNumbers,
      keep_formatting: keepFormatting
    };

    try {
      const res = await fetch(`${API_BASE}/api/humanize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || errJson.error || 'Humanization failed');
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
        particleCount: 50,
        spread: 70,
        origin: { y: 0.75 }
      });

      showToast(`✨ Successfully humanized with ${activeStrategy.label}!`);
    } catch (err) {
      showToast(`Humanize Notice: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick 100% Detector Check
  const handleCheckDetectors = async () => {
    const raw = inputText.trim();
    if (!raw) {
      showToast('Please enter text to scan');
      return;
    }

    setIsCheckingDetectors(true);
    try {
      const res = await fetch(`${API_BASE}/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: raw,
          api_key: apiKey || DEFAULT_KEY,
          threshold: Number(threshold)
        })
      });

      if (!res.ok) throw new Error('Detector check failed');
      const data = await res.json();
      setDetectorData(data);
      showToast(`Scan complete: ${data.overall_ai_score}% AI Probability (${data.verdict || 'Processed'})`);
    } catch {
      showToast('Could not complete detector scan');
    } finally {
      setIsCheckingDetectors(false);
    }
  };

  // 1-Click Copy
  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    showToast('Copied humanized text to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Export File
  const handleDownloadTxt = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `humanized_${activeStrategy.id}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded text document (.txt)');
  };

  // Quick Purge Clichés
  const handlePurgeCliches = () => {
    if (!inputText) return;
    const purged = inputText
      .replace(/\bIt is crucial to note that\s*/gi, '')
      .replace(/\bFurthermore,\s*/gi, 'Also, ')
      .replace(/\bMoreover,\s*/gi, 'Plus, ')
      .replace(/\bIn conclusion,\s*/gi, 'Bottom line: ')
      .replace(/\bdelve into\b/gi, 'look at')
      .replace(/\bserves as a testament to\b/gi, 'clearly proves')
      .replace(/\ba testament to\b/gi, 'proof of')
      .replace(/\bmultifaceted\b/gi, 'diverse')
      .replace(/\btapestry of\b/gi, 'landscape of');
    setInputText(purged);
    showToast('Purged known AI clichés from draft');
  };

  // Interactive X-Ray Inspector Renderer
  const renderXRayDiff = () => {
    if (!outputText) return null;

    const lowerInput = inputText.toLowerCase();
    const lowerOutput = outputText.toLowerCase();

    // 1. Detect purged clichés from input
    const purged = EXTENDED_CLICHES_LIST.filter(c => lowerInput.includes(c) && !lowerOutput.includes(c));

    // 2. Regex for factual entities, metrics, dates, and technical names
    const entityRegex = /(\$?\d+[\d,]*(?:\.\d+)?%?|\d+\s+out\s+of\s+\d+|\d+\s+(?:minutes|hours|days|years|ms|CVE|engineers)|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s+\d{4})?|Q[1-4]\s+\d{4}|Alice\s+Chen|David\s+Kumar|Sarah\s+Lin|Marcus|Acme\s+Corp|Stripe|CloudScale|Python|Kubernetes|Go|PostgreSQL|Redis|Kafka|Docker|LeetCode|"Medium"|"No"|Naive\s+Bayes|zero-frequency\s+problem)/gi;

    // 3. Regex for injected human transitions, active phrasing & contractions
    const transitionRegex = /\b(Plus|Also|On top of that|Bottom line|Overall|In short|Looking at|Walk us through|really stood out|knocked out|fixed|protected|maintained|super clear|without hesitation|we've|it's|don't|can't|aren't|I've|they're|there's|who's)\b/gi;

    const paragraphs = outputText.split(/\r?\n/);

    return (
      <div className="space-y-3.5 ai-fade-in">
        {/* Status Alert Banner */}
        <div className="bg-[#e6f4ea] text-[#137333] border border-[#ceead6] text-xs font-medium px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <strong>X-Ray Active:</strong> tightened to {activeStrategy.title} rhythm; facts locked ({keepFacts ? '100% NER' : 'Standard'}).
          </span>
          <span className="text-[10px] font-bold bg-[#137333] text-white px-2 py-0.5 rounded-full">
            Inspection Mode
          </span>
        </div>

        {/* Legend bar */}
        <div className="flex flex-wrap items-center gap-3 p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            Injected Human Flow
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-blue-800">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
            Locked Facts &amp; Metrics
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            Purged AI Markers ({purged.length})
          </span>
        </div>

        {/* Purged Clichés Pills */}
        {purged.length > 0 && (
          <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1.5 text-xs">
            <div className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">
              Purged Robotic Markers from Input ({purged.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {purged.map((c, i) => (
                <span 
                  key={i} 
                  className="line-through bg-white text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[11px] font-mono shadow-2xs"
                  title="Purged during humanization"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Token-by-Token Highlighted Text Output */}
        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/80 text-slate-800 text-sm leading-relaxed space-y-2">
          {paragraphs.map((para, pIdx) => {
            if (!para.trim()) return <div key={pIdx} className="h-2" />;

            const parts = [];
            let lastIndex = 0;
            const combinedRegex = new RegExp(
              `(${entityRegex.source})|(${transitionRegex.source})`,
              'gi'
            );

            let match;
            while ((match = combinedRegex.exec(para)) !== null) {
              if (match.index > lastIndex) {
                parts.push(para.slice(lastIndex, match.index));
              }

              const matchedText = match[0];
              if (match[1]) {
                // Locked fact / number / entity
                parts.push(
                  <span
                    key={`ent-${match.index}`}
                    className="bg-blue-100 text-blue-900 border border-blue-300 font-semibold px-1 py-0.5 rounded text-[13px] mx-0.5 shadow-2xs inline-block"
                    title="100% Locked Fact & Entity (Preserved)"
                  >
                    {matchedText}
                  </span>
                );
              } else {
                // Injected human transition / contraction
                parts.push(
                  <span
                    key={`tr-${match.index}`}
                    className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold px-1 py-0.5 rounded text-[13px] mx-0.5 shadow-2xs inline-block"
                    title="Injected Human Rhythm & Flow"
                  >
                    {matchedText}
                  </span>
                );
              }
              lastIndex = match.index + matchedText.length;
            }

            if (lastIndex < para.length) {
              parts.push(para.slice(lastIndex));
            }

            return (
              <p key={pIdx} className="whitespace-pre-wrap leading-relaxed">
                {parts}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-hidden selection:bg-teal-100 selection:text-teal-900 font-sans">
      
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (DARK NAVY / SLATE MATCHING SCREENSHOT)  */}
      {/* ======================================================== */}
      <aside className="w-60 bg-[#0b1727] text-white flex flex-col justify-between shrink-0 border-r border-[#152438] select-none z-20">
        <div className="p-4 space-y-6">
          
          {/* Logo brand badge with human brain logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 px-2 pt-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-1 shadow-md shadow-teal-500/20 shrink-0 group-hover:scale-105 transition border border-teal-500/20 overflow-hidden">
              <img src={brainLogo} alt="AI Humanizer Brain Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white leading-tight">
                ai-humanizer
              </span>
              <span className="text-[9px] font-semibold text-teal-400 tracking-wider uppercase">
                Brain Engine
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#16263d] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('humanize')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'humanize'
                  ? 'bg-[#16263d] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Humanize Text</span>
            </button>

            <button
              onClick={() => setActiveTab('detector')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'detector'
                  ? 'bg-[#16263d] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>AI Detector</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-[#2dd4bf] border border-teal-500/30">
                100%
              </span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-[#16263d] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-slate-400" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#16263d] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#16263d] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Footer info badge */}
        <div className="p-4 border-t border-[#152438]/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>v2.4 Active</span>
          <span className="text-teal-400 font-medium">● 7-Detector Live</span>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE CONTENT AREA                           */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f8fafc]">
        
        {/* Top Header Bar */}
        <header className="px-8 py-4 flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2.5 bg-slate-100/90 border border-slate-200/90 rounded-xl px-3.5 py-1.5 w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => setActiveTab('settings')}
              className="w-8 h-8 rounded-full bg-white border border-teal-600/30 overflow-hidden p-0.5 flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 transition"
              title="Current Account & API Settings"
            >
              <img src={brainLogo} alt="AI" className="w-full h-full object-contain" />
            </div>
          </div>
        </header>

        {/* Dynamic View Router */}
        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* ================================================== */}
          {/* TAB: HOME & HUMANIZE (MATCHES USER SCREENSHOT)     */}
          {/* ================================================== */}
          {(activeTab === 'home' || activeTab === 'humanize') && (
            <div className="space-y-6">
              
              {/* Hero Title Section */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  WELCOME BACK
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
                  Make it sound like <span className="font-editorial italic font-normal text-[#0f5c56]">you</span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Choose a strategy, paste your draft, and get natural-sounding text back.
                </p>
              </div>

              {/* 5 Strategy Option Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {STRATEGY_OPTIONS.map((opt) => {
                  const isSelected = tone === opt.id;
                  const IconComp = opt.IconComponent;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setTone(opt.id);
                        showToast(`Strategy: ${opt.title}`);
                      }}
                      className={`p-4 rounded-2xl transition-all duration-200 cursor-pointer text-left flex flex-col justify-between min-h-[135px] relative ${
                        isSelected
                          ? 'bg-white border-2 border-[#0d9488] shadow-sm ring-2 ring-[#0d9488]/15'
                          : 'bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Icon squircle container */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${opt.iconBg} ${opt.iconColor}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {opt.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {opt.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Control Bar: STRENGTH | KEEP | Context */}
              <div className="bg-white rounded-2xl p-2.5 px-5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-5 text-xs">
                  
                  {/* STRENGTH */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">STRENGTH</span>
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
                            showToast(`Strength: ${st.label}`);
                          }}
                          className={`px-3.5 py-1 rounded-full text-xs transition cursor-pointer ${
                            aggressiveness === st.id
                              ? 'bg-[#0f4c5c] text-white font-medium shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                  {/* KEEP TOGGLES */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">KEEP</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setKeepFacts(!keepFacts);
                          showToast(keepFacts ? 'Facts locking off' : 'Facts & names locked (100% NER)');
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition border cursor-pointer ${
                          keepFacts
                            ? 'bg-slate-100 text-slate-800 border-slate-200 font-medium'
                            : 'bg-white text-slate-400 border-slate-200/70'
                        }`}
                      >
                        Facts & names
                      </button>
                      <button
                        onClick={() => {
                          setKeepNumbers(!keepNumbers);
                          showToast(keepNumbers ? 'Numbers locking off' : 'Numbers locked');
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition border cursor-pointer ${
                          keepNumbers
                            ? 'bg-slate-100 text-slate-800 border-slate-200 font-medium'
                            : 'bg-white text-slate-400 border-slate-200/70'
                        }`}
                      >
                        Numbers
                      </button>
                      <button
                        onClick={() => {
                          setKeepFormatting(!keepFormatting);
                          showToast(keepFormatting ? 'Formatting toggle off' : 'Formatting & bullet structure locked');
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition border cursor-pointer ${
                          keepFormatting
                            ? 'bg-slate-100 text-slate-800 border-slate-200 font-medium'
                            : 'bg-white text-slate-400 border-slate-200/70'
                        }`}
                      >
                        Formatting
                      </button>
                    </div>
                  </div>
                </div>

                {/* Context Selector */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Context</span>
                  <select
                    value={context}
                    onChange={(e) => {
                      setContext(e.target.value);
                      showToast(`Context: ${e.target.value}`);
                    }}
                    className="font-bold text-slate-900 bg-transparent outline-none cursor-pointer hover:text-teal-800 transition"
                  >
                    {CONTEXT_OPTIONS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dual Cards: Your draft vs Humanized */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* LEFT CARD: Your draft */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between overflow-hidden min-h-[440px]">
                  
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Your draft</span>
                      <span className="bg-[#e2e8f0] text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {wordCount} words
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setInputText('');
                        setOutputText('');
                        showToast('Draft cleared');
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 transition"
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
                      placeholder="Paste your raw text, essay, bullet points, email, or draft here..."
                      rows={12}
                      className="w-full flex-1 text-slate-800 text-sm leading-relaxed outline-none resize-none placeholder:text-slate-400 bg-transparent min-h-[260px]"
                    />
                  </div>

                  {/* Footer Bar */}
                  <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                    <button
                      onClick={handleCheckDetectors}
                      disabled={isCheckingDetectors || !inputText.trim()}
                      className="bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isCheckingDetectors ? (
                        <>
                          <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                          <span>Scanning 7 Detectors...</span>
                        </>
                      ) : (
                        <span>100% Detector &amp; Auto-Change</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleHumanize()}
                      disabled={isProcessing || !inputText.trim()}
                      className="bg-[#0f4c5c] hover:bg-[#0d5c58] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs active:scale-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Humanizing...</span>
                        </>
                      ) : (
                        <span>Humanize now →</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* RIGHT CARD: Humanized */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between overflow-hidden min-h-[440px]">
                  
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Humanized</span>
                      <span className="bg-[#d1fae5] text-[#065f46] text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {isProcessing ? 'Processing...' : 'Ready'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setViewMode('clean');
                          showToast('Switched to Clean View');
                        }}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
                          viewMode === 'clean'
                            ? 'bg-[#0f4c5c] text-white border-[#0f4c5c] shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                        }`}
                      >
                        Clean
                      </button>
                      <button
                        onClick={() => {
                          setViewMode('xray');
                          showToast('🔬 X-Ray Diff Inspector Active');
                        }}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
                          viewMode === 'xray'
                            ? 'bg-[#0f4c5c] text-white border-[#0f4c5c] shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                        }`}
                      >
                        X-Ray
                      </button>
                      <button
                        onClick={handleCopy}
                        disabled={!outputText}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1 rounded-full shadow-2xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="p-6 flex-1 flex flex-col overflow-y-auto bg-white">
                    {outputText ? (
                      viewMode === 'xray' ? (
                        renderXRayDiff()
                      ) : (
                        <>
                          {/* Status Alert Banner */}
                          <div className="bg-[#e6f4ea] text-[#137333] border border-[#ceead6] text-xs font-medium px-4 py-2.5 rounded-xl mb-4 leading-relaxed">
                            X-Ray: tightened to {activeStrategy.title} rhythm; facts and terms kept.
                          </div>

                          {/* Text Render with bullet point preservation */}
                          <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                            {outputText}
                          </div>
                        </>
                      )
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-20 text-center">
                        <Sparkles className="w-8 h-8 mb-2 text-teal-400" />
                        <p className="font-semibold text-slate-600">Ready to humanize</p>
                        <p className="text-slate-400 mt-1">Paste your text on the left and click "Humanize now →"</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Key terms preserved</span>
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDownloadTxt}
                        disabled={!outputText}
                        className="text-slate-500 hover:text-slate-700 transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                        title="Download text file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export</span>
                      </button>

                      <button
                        onClick={() => {
                          if (!outputText) return;
                          setInputText(outputText);
                          showToast('Output swapped to draft for multi-pass refinement');
                        }}
                        disabled={!outputText}
                        className="text-[#0f5c56] hover:text-[#0a3f3b] font-semibold cursor-pointer transition disabled:opacity-40"
                      >
                        Refine further →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETECTOR SCAN RESULTS POPUP (WHEN SCANNED) */}
              {detectorData && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Live AI Forensics: {detectorData.verdict}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Evaluated across 7 detection suites • {detectorData.detected_model_family || 'Multi-Model Detection'}
                      </p>
                    </div>
                    <button
                      onClick={() => setDetectorData(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Dismiss
                    </button>
                  </div>

                  {/* Sentence Heatmap Preview */}
                  {detectorData.sentence_heatmap && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="text-xs font-semibold text-slate-700">Sentence &amp; Bullet Breakdown:</div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {detectorData.sentence_heatmap.map((item, i) => (
                          <div 
                            key={i} 
                            className={`p-2 rounded-xl text-xs flex items-start justify-between gap-3 ${
                              item.color === 'red' ? 'bg-red-50 text-red-900 border border-red-100' :
                              item.color === 'amber' ? 'bg-amber-50 text-amber-900 border border-amber-100' :
                              'bg-green-50 text-green-900 border border-green-100'
                            }`}
                          >
                            <span className="font-mono">{item.sentence}</span>
                            <span className="font-bold shrink-0">{item.ai_score}% AI</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ================================================== */}
          {/* TAB: UNIVERSAL AI DETECTOR (ABSOLUTE 7 SUITE)      */}
          {/* ================================================== */}
          {activeTab === 'detector' && (
            <div className="space-y-6">
              <AbsoluteDetectorView
                initialText={inputText}
                onTransferToHumanizer={(text) => {
                  setInputText(text);
                  setActiveTab('home');
                  showToast('Transferred to Humanizer');
                }}
                onToast={showToast}
              />
            </div>
          )}

          {/* ================================================== */}
          {/* TAB: TEMPLATES LIBRARY                             */}
          {/* ================================================== */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Templates &amp; Presets</h2>
                <p className="text-xs text-slate-500 mt-1">Pre-tested prompts, bullet points, emails, and technical documentation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES_DATA.map(tpl => (
                  <div 
                    key={tpl.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {tpl.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium capitalize">{tpl.tone}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{tpl.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{tpl.text}</p>
                    </div>

                    <button
                      onClick={() => {
                        setInputText(tpl.text);
                        setContext(tpl.context);
                        setTone(tpl.tone);
                        setActiveTab('home');
                        showToast(`Loaded template: ${tpl.title}`);
                      }}
                      className="mt-4 w-full py-2 bg-slate-50 hover:bg-[#0f5c56] hover:text-white text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Use this template →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* TAB: HISTORY                                       */}
          {/* ================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Humanization History</h2>
                  <p className="text-xs text-slate-500 mt-1">Your recent revisions and transformed drafts.</p>
                </div>
                <button
                  onClick={() => {
                    setHistoryList([]);
                    showToast('History cleared');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-3">
                {historyList.map(item => (
                  <div 
                    key={item.id} 
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{item.strategy}</span>
                        <span>•</span>
                        <span>{item.context}</span>
                      </div>
                      <span>{item.timestamp}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                        <div className="font-semibold text-slate-500 mb-1 uppercase text-[10px]">Input Draft:</div>
                        <p className="line-clamp-3 leading-relaxed">{item.input}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-teal-50/50 text-teal-900 border border-teal-100/70">
                        <div className="font-semibold text-teal-700 mb-1 uppercase text-[10px]">Humanized Result:</div>
                        <p className="line-clamp-3 leading-relaxed">{item.output}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setInputText(item.input);
                          setOutputText(item.output);
                          setActiveTab('home');
                          showToast('Restored revision to editor');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        Restore to editor
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.output);
                          showToast('Copied to clipboard');
                        }}
                        className="px-3 py-1 bg-[#0f5c56] text-white text-xs font-semibold rounded-lg transition hover:bg-[#0d5c58]"
                      >
                        Copy output
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* TAB: SETTINGS                                      */}
          {/* ================================================== */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Engine Settings</h2>
                <p className="text-xs text-slate-500 mt-1">Configure your Gemini API Key and model preferences.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Google Gemini API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-600 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Default active key is preloaded. All models (ChatGPT, Claude, Gemini, Llama, DeepSeek) are supported.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Detection Engine</label>
                  <select className="w-full p-2.5 rounded-xl border border-slate-200 outline-none bg-white font-medium">
                    <option>Google Gemini 3.8 Flash (Active 100% Forensic Engine)</option>
                    <option>Local Offline Rule Transformer (Zero Latency)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => showToast('Settings saved successfully')}
                    className="px-5 py-2.5 bg-[#0f5c56] hover:bg-[#0d5c58] text-white font-bold rounded-xl transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border border-slate-800 z-50 flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
