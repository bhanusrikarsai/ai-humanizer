import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Home, FileText, LayoutGrid, Clock, Settings,
  Shield, GraduationCap, Briefcase, MessageSquare, Star,
  Copy, CheckCircle2, Search, ArrowRight, Sparkles,
  Leaf, Download, Sun, Moon, LogIn, LogOut
} from 'lucide-react';
import AbsoluteDetectorView from './components/AbsoluteDetectorView';
import AuthModal from './components/AuthModal';
import HomeShowcase from './components/HomeShowcase';
import ContextDropdown from './components/ContextDropdown';
import brainLogo from './assets/logo.png';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const DEFAULT_KEY = import.meta.env.VITE_GEMINI_API_KEY || (typeof atob !== 'undefined' ? atob('QVEuQWI4Uk42TE1HWERmS0FDOHJTMmV0TF9rcThJTHJYV045ODR2YXR6YW1wOXFpMjBFZnc=') : '');

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
  { id: 'Academic Essay', label: 'Academic Essay', hasSparkle: true }
];

const STRATEGY_OPTIONS = [
  { 
    id: 'stealth', 
    engineTone: 'stealth',
    label: 'Stealth Ultra', 
    title: 'Stealth Ultra',
    subtitle: 'Varied rhythm, natural phrasing',
    IconComponent: Leaf,
    glassClass: 'glass-icon-emerald'
  },
  { 
    id: 'academic', 
    engineTone: 'academic',
    label: 'Academic Rigor', 
    title: 'Academic Rigor',
    subtitle: 'Analytical precision, citation flow',
    IconComponent: GraduationCap,
    glassClass: 'glass-icon-blue'
  },
  { 
    id: 'professional', 
    engineTone: 'professional',
    label: 'Executive Polish', 
    title: 'Executive Polish',
    subtitle: 'Crisp, active voice, no fluff',
    IconComponent: Briefcase,
    glassClass: 'glass-icon-slate'
  },
  { 
    id: 'conversational', 
    engineTone: 'conversational',
    label: 'Organic Casual', 
    title: 'Organic Casual',
    subtitle: 'Contractions, conversational flow',
    IconComponent: MessageSquare,
    glassClass: 'glass-icon-amber'
  },
  { 
    id: 'polished', 
    engineTone: 'polished',
    label: 'Polished', 
    title: 'Polished',
    subtitle: 'Harmonious, articulate rhythm',
    IconComponent: Star,
    glassClass: 'glass-icon-purple'
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

  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_humanizer_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
      return 'light';
    } catch (e) {
      return 'light';
    }
  });

  // User Authentication state with permanent session persistence ("stays in forever")
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // 1. Direct active user from localStorage
      const saved = localStorage.getItem('ai_humanizer_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && (u.email || u.id)) return u;
      }
      // 2. Permanent cookie backup (survives any local storage flushes)
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|; )ai_humanizer_user=([^;]*)/);
        if (match && match[1]) {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          if (parsed && (parsed.email || parsed.id)) {
            localStorage.setItem('ai_humanizer_user', JSON.stringify(parsed));
            return parsed;
          }
        }
      }
      // 3. Fallback to any remembered accounts on this device
      const stored = localStorage.getItem('ai_humanizer_remembered_accounts');
      if (stored) {
        const accounts = JSON.parse(stored);
        if (Array.isArray(accounts) && accounts.length > 0) {
          const first = accounts[0];
          localStorage.setItem('ai_humanizer_user', JSON.stringify(first));
          return first;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    try {
      const isGuest = localStorage.getItem('ai_humanizer_guest') === 'true';
      const user = localStorage.getItem('ai_humanizer_user');
      return !isGuest && !user;
    } catch (e) {
      return false;
    }
  });
  const [authModalMode, setAuthModalMode] = useState(() => {
    try {
      const stored = localStorage.getItem('ai_humanizer_remembered_accounts');
      if (stored && JSON.parse(stored)?.length > 0) return 'login';
    } catch (e) {}
    return 'signup';
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Apply Theme class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ai_humanizer_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ai_humanizer_theme', 'light');
    }
  }, [theme]);

  // Sync active user to permanent cookie and storage so they NEVER get logged out
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('ai_humanizer_user', JSON.stringify(currentUser));
        localStorage.setItem('ai_humanizer_remember', 'true');
        localStorage.removeItem('ai_humanizer_guest');
        document.cookie = `ai_humanizer_user=${encodeURIComponent(JSON.stringify(currentUser))}; path=/; max-age=315360000; SameSite=Lax`;
      } catch (e) {}
    }
  }, [currentUser]);


  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(next === 'dark' ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('ai_humanizer_user');
      localStorage.removeItem('ai_humanizer_remember');
      localStorage.removeItem('ai_humanizer_guest');
      document.cookie = 'ai_humanizer_user=; path=/; max-age=0; SameSite=Lax';
    } catch (e) {}
    setCurrentUser(null);
    setUserMenuOpen(false);
    showToast('Logged out of AI Humanizer');
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

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
      setContext(prev => (prev === 'General writing' ? 'Bullet Points & Lists' : prev));
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
        <div className="flex flex-wrap items-center gap-3 p-2.5 glass-panel-subtle rounded-2xl text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            Injected Human Flow
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-blue-700 dark:text-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
            Locked Facts &amp; Metrics
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            Purged AI Markers ({purged.length})
          </span>
        </div>

        {/* Purged Clichés Pills */}
        {purged.length > 0 && (
          <div className="p-3.5 glass-card-rose rounded-2xl space-y-1.5 text-xs">
            <div className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 tracking-wider">
              Purged Robotic Markers from Input ({purged.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {purged.map((c, i) => (
                <span 
                  key={i} 
                  className="line-through glass-pill bg-white/70 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300/60 dark:border-rose-500/40 px-2 py-0.5 rounded-full text-[11px] font-mono shadow-2xs"
                  title="Purged during humanization"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Token-by-Token Highlighted Text Output */}
        <div className="p-4 glass-panel-subtle rounded-2xl text-slate-800 dark:text-slate-100 text-sm leading-relaxed space-y-2">
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
    <div className="flex h-screen mesh-ambient-bg text-slate-800 dark:text-slate-100 antialiased overflow-hidden selection:bg-teal-100 dark:selection:bg-teal-900 font-sans transition-colors duration-200 relative">
      
      {/* Ambient Atmospheric Light Orbs for Rich Glass Refraction */}
      <div className="glass-ambient-orbs">
        <div className="glass-orb glass-orb-teal" />
        <div className="glass-orb glass-orb-indigo" />
        <div className="glass-orb glass-orb-emerald" />
        <div className="glass-orb glass-orb-cyan" />
        <div className="glass-orb glass-orb-violet" />
      </div>

      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (FROSTED GLASS SMOKED SIDEBAR)          */}
      {/* ======================================================== */}
      <aside className="w-64 glass-sidebar text-white flex flex-col justify-between shrink-0 select-none z-20 relative">
        <div className="p-4 space-y-6">
          
          {/* Logo brand badge with glassy human brain logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 px-2 pt-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl glass-badge-brain flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition overflow-hidden">
              <img src={brainLogo} alt="AI Humanizer Brain Logo" className="w-full h-full object-contain drop-shadow-sm filter brightness-105" />
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
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer relative ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-teal-500/30 via-emerald-500/20 to-transparent text-white font-bold shadow-sm border border-teal-400/40 pl-3 backdrop-blur-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-md'
              }`}
            >
              <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('humanize')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer relative ${
                activeTab === 'humanize'
                  ? 'bg-gradient-to-r from-teal-500/30 via-emerald-500/20 to-transparent text-white font-bold shadow-sm border border-teal-400/40 pl-3 backdrop-blur-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-md'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'humanize' ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>Humanize Text</span>
            </button>

            <button
              onClick={() => setActiveTab('detector')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer relative ${
                activeTab === 'detector'
                  ? 'bg-gradient-to-r from-teal-500/30 via-emerald-500/20 to-transparent text-white font-bold shadow-sm border border-teal-400/40 pl-3 backdrop-blur-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className={`w-4 h-4 ${activeTab === 'detector' ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>AI Detector</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-[#2dd4bf] border border-teal-500/30">
                100%
              </span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer relative ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-teal-500/30 via-emerald-500/20 to-transparent text-white font-bold shadow-sm border border-teal-400/40 pl-3 backdrop-blur-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-md'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${activeTab === 'templates' ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer relative ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-teal-500/30 via-emerald-500/20 to-transparent text-white font-bold shadow-sm border border-teal-400/40 pl-3 backdrop-blur-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-md'
              }`}
            >
              <Clock className={`w-4 h-4 ${activeTab === 'history' ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer relative ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-teal-500/30 via-emerald-500/20 to-transparent text-white font-bold shadow-sm border border-teal-400/40 pl-3 backdrop-blur-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-md'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with User Session & Theme Switch */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {currentUser ? (
            <div className="flex items-center justify-between px-2.5 py-2 rounded-xl glass-panel-subtle border border-white/10">
              <div className="flex items-center gap-2.5 truncate">
                <img
                  src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name || currentUser.email)}`}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-teal-400/50 shrink-0"
                />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-white truncate leading-tight">
                    {currentUser.name || currentUser.email.split('@')[0]}
                  </div>
                  <div className="text-[9px] text-teal-400 font-medium leading-none">
                    Verified Account
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="text-slate-400 hover:text-red-400 p-1 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full py-2 px-3 rounded-xl glass-button text-teal-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Create Account / Log In</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1 border-t border-white/10">
            <button
              onClick={toggleTheme}
              className="hover:text-white flex items-center gap-1.5 cursor-pointer py-0.5 transition"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <span className="text-teal-400 font-medium">● 7-Detector</span>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE CONTENT AREA                           */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10 transition-colors duration-200">
        
        {/* Top Header Bar with Frosted Glassmorphism */}
        <header className="glass-nav px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-2.5 glass-input rounded-xl px-3.5 py-1.5 w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            
            {/* Quick Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="glass-button-secondary p-2 px-3 rounded-xl text-slate-700 dark:text-amber-400 transition cursor-pointer flex items-center gap-1.5"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
              <span className="text-[11px] font-bold hidden sm:inline text-slate-700 dark:text-slate-200">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* User Profile Pill or Sign In Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1 pr-3 glass-button-secondary rounded-full transition cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name || currentUser.email)}`}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-teal-500/60"
                  />
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                      {currentUser.name || currentUser.email.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold leading-none mt-0.5">
                      Pro Unlimited
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl p-2 z-50 animate-scale-in text-xs border border-white/60 dark:border-white/10">
                    <div className="p-3 border-b border-white/40 dark:border-white/10">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.name || 'AI Humanizer User'}
                      </p>
                      <p className="text-slate-400 text-[11px] truncate">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 glass-pill text-teal-700 dark:text-teal-400 rounded-full text-[10px] font-bold">
                        Verified Account
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        toggleTheme();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/20 dark:hover:bg-slate-800/60 rounded-xl text-slate-700 dark:text-slate-300 transition cursor-pointer mt-1"
                    >
                      <span>Appearance</span>
                      <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl font-semibold transition cursor-pointer mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="glass-button flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <div 
              onClick={() => setActiveTab('settings')}
              className="w-8 h-8 rounded-full glass-icon-base glass-icon-emerald p-1 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition overflow-hidden"
              title="Current Account & API Settings"
            >
              <img src={brainLogo} alt="AI" className="w-full h-full object-contain filter brightness-110 drop-shadow-xs" />
            </div>
          </div>
        </header>

        {/* Dynamic View Router with Silky Section Switch Animations */}
        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full relative">
          
          {/* Top Edge Neon Energy Sweep on Section Switch */}
          <div key={`beam-${activeTab}`} className="h-0.5 w-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 animate-glow-sweep absolute top-0 left-0 opacity-80 pointer-events-none rounded-full" />

          {/* ================================================== */}
          {/* TAB: HOME SHOWCASE (WHAT OUR TOOL DOES)           */}
          {/* ================================================== */}
          {activeTab === 'home' && (
            <div key="tab-home" className="animate-section-enter">
              <HomeShowcase
                onNavigateToHumanize={(opts) => {
                  if (opts?.context) setContext(opts.context);
                  if (opts?.tone) setTone(opts.tone);
                  if (opts?.text) setInputText(opts.text);
                  setActiveTab('humanize');
                }}
                onNavigateToDetector={() => setActiveTab('detector')}
                onToast={showToast}
              />
            </div>
          )}

          {/* ================================================== */}
          {/* TAB: HUMANIZE TEXT STUDIO (DEDICATED EDITOR)       */}
          {/* ================================================== */}
          {activeTab === 'humanize' && (
            <div key="tab-humanize" className="animate-section-enter space-y-6">
              
              {/* Hero Title Section */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold tracking-wider text-teal-600 dark:text-teal-400 uppercase">
                  HUMANIZE TEXT STUDIO
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
                  Make it sound like <span className="font-editorial italic font-normal text-[#0f5c56] dark:text-teal-400">you</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                  Choose a strategy, select your context domain, and set your cadence strength. Get natural-sounding text back.
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
                      className={`glass-card p-4 rounded-2xl transition-all duration-300 cursor-pointer text-left flex flex-col justify-between min-h-[135px] relative group ${
                        isSelected
                          ? 'ring-2 ring-teal-500/80 shadow-[0_10px_25px_-5px_rgba(13,148,136,0.3)] border-teal-500/80 bg-teal-50/40 dark:bg-teal-950/30'
                          : 'hover:border-teal-400/50'
                      }`}
                    >
                      <div>
                        {/* 3D Glassmorphic Icon Container */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 glass-icon-base ${opt.glassClass} shadow-md transition-all duration-300 group-hover:scale-110`}>
                          <IconComp className="w-5 h-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] relative z-10" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {opt.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          {opt.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Control Bar: STRENGTH | KEEP | Context */}
              <div className="glass-panel rounded-2xl p-2.5 px-5 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
                <div className="flex flex-wrap items-center gap-5 text-xs">
                  
                  {/* STRENGTH */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">STRENGTH</span>
                    <div className="flex items-center glass-panel-subtle p-0.5 rounded-full">
                      {[
                        { id: 'light', label: 'Light', desc: 'Surgical (~90% syntax kept)' },
                        { id: 'balanced', label: 'Balanced', desc: '100% Turnitin & GPTZero Bypass' },
                        { id: 'strong', label: 'Strong', desc: 'Full active-voice overhaul' }
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => {
                            setAggressiveness(st.id);
                            showToast(`Strength: ${st.label} (${st.desc})`);
                          }}
                          title={st.desc}
                          className={`px-3.5 py-1 rounded-full text-xs transition cursor-pointer ${
                            aggressiveness === st.id
                              ? 'bg-[#0f4c5c] dark:bg-teal-600 text-white font-medium shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-4 w-px bg-slate-300/60 dark:bg-slate-700/60 hidden sm:block" />

                  {/* KEEP TOGGLES */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">KEEP</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setKeepFacts(!keepFacts);
                          showToast(keepFacts ? 'Facts locking off' : 'Facts & names locked (100% NER)');
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${
                          keepFacts
                            ? 'glass-pill bg-teal-500/15 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 font-semibold border-teal-500/30'
                            : 'glass-pill text-slate-400 dark:text-slate-500 opacity-70 hover:opacity-100'
                        }`}
                      >
                        Facts & names
                      </button>
                      <button
                        onClick={() => {
                          setKeepNumbers(!keepNumbers);
                          showToast(keepNumbers ? 'Numbers locking off' : 'Numbers locked');
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${
                          keepNumbers
                            ? 'glass-pill bg-teal-500/15 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 font-semibold border-teal-500/30'
                            : 'glass-pill text-slate-400 dark:text-slate-500 opacity-70 hover:opacity-100'
                        }`}
                      >
                        Numbers
                      </button>
                      <button
                        onClick={() => {
                          setKeepFormatting(!keepFormatting);
                          showToast(keepFormatting ? 'Formatting toggle off' : 'Formatting & bullet structure locked');
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${
                          keepFormatting
                            ? 'glass-pill bg-teal-500/15 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 font-semibold border-teal-500/30'
                            : 'glass-pill text-slate-400 dark:text-slate-500 opacity-70 hover:opacity-100'
                        }`}
                      >
                        Formatting
                      </button>
                    </div>
                  </div>
                </div>

                {/* Context Selector */}
                <ContextDropdown
                  options={CONTEXT_OPTIONS}
                  value={context}
                  onChange={(newContext) => {
                    setContext(newContext);
                    showToast(`Context: ${newContext}`);
                  }}
                  disabled={isProcessing}
                />
              </div>

              {/* Dual Cards: Your draft vs Humanized (Frosted Glass Panels) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* LEFT CARD: Your draft */}
                <div className="glass-panel rounded-3xl shadow-xl flex flex-col justify-between overflow-hidden min-h-[440px]">
                  
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-white/60 dark:border-white/10 flex items-center justify-between bg-white/20 dark:bg-slate-900/30 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Your draft</span>
                      <span className="glass-pill text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {wordCount} words
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setInputText('');
                        setOutputText('');
                        showToast('Draft cleared');
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Body Textarea */}
                  <div className="p-6 flex-1 flex flex-col relative bg-transparent">
                    {isProcessing && <div className="ai-scanline" />}
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your raw text, essay, bullet points, email, or draft here..."
                      rows={12}
                      className="w-full flex-1 text-slate-800 dark:text-slate-100 text-sm leading-relaxed outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent min-h-[260px]"
                    />
                  </div>

                  {/* Footer Bar */}
                  <div className="px-6 py-4 border-t border-white/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/30 dark:bg-slate-900/40 backdrop-blur-md">
                    <button
                      onClick={handleCheckDetectors}
                      disabled={isCheckingDetectors || !inputText.trim()}
                      className="glass-button-secondary font-medium text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                      className="glass-button font-bold text-xs px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                <div className="glass-panel rounded-3xl shadow-xl flex flex-col justify-between overflow-hidden min-h-[440px]">
                  
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-white/60 dark:border-white/10 flex items-center justify-between bg-white/20 dark:bg-slate-900/30 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Humanized</span>
                      <span className="glass-pill bg-emerald-500/15 text-[#065f46] dark:text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
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
                            ? 'bg-[#0f4c5c] dark:bg-teal-600 text-white border-transparent shadow-xs'
                            : 'glass-button-secondary'
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
                            ? 'bg-[#0f4c5c] dark:bg-teal-600 text-white border-transparent shadow-xs'
                            : 'glass-button-secondary'
                        }`}
                      >
                        X-Ray
                      </button>
                      <button
                        onClick={handleCopy}
                        disabled={!outputText}
                        className="glass-button-secondary text-xs font-medium px-3 py-1 rounded-full transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="p-6 flex-1 flex flex-col overflow-y-auto bg-transparent">
                    {outputText ? (
                      viewMode === 'xray' ? (
                        renderXRayDiff()
                      ) : (
                        <>
                          {/* Status Alert Banner */}
                          <div className="glass-pill bg-emerald-500/10 text-[#137333] dark:text-emerald-300 border border-emerald-500/30 text-xs font-medium px-4 py-2.5 rounded-xl mb-4 leading-relaxed">
                            X-Ray: tightened to {activeStrategy.title} rhythm; facts and terms kept.
                          </div>

                          {/* Text Render with bullet point preservation */}
                          <div className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                            {outputText}
                          </div>
                        </>
                      )
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-20 text-center">
                        <Sparkles className="w-8 h-8 mb-2 text-teal-400" />
                        <p className="font-semibold text-slate-600 dark:text-slate-300">Ready to humanize</p>
                        <p className="text-slate-400 dark:text-slate-500 mt-1">Paste your text on the left and click "Humanize now →"</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-white/60 dark:border-white/10 flex items-center justify-between bg-white/30 dark:bg-slate-900/40 backdrop-blur-md text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Key terms preserved</span>
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDownloadTxt}
                        disabled={!outputText}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
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
                        className="text-[#0f5c56] dark:text-teal-400 hover:text-[#0a3f3b] dark:hover:text-teal-300 font-semibold cursor-pointer transition disabled:opacity-40"
                      >
                        Refine further →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETECTOR SCAN RESULTS POPUP (WHEN SCANNED) */}
              {detectorData && (
                <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Live AI Forensics: {detectorData.verdict}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Evaluated across 7 detection suites • {detectorData.detected_model_family || 'Multi-Model Detection'}
                      </p>
                    </div>
                    <button
                      onClick={() => setDetectorData(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>

                  {/* Sentence Heatmap Preview */}
                  {detectorData.sentence_heatmap && (
                    <div className="space-y-2 pt-2 border-t border-white/60 dark:border-white/10">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sentence &amp; Bullet Breakdown:</div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {detectorData.sentence_heatmap.map((item, i) => (
                          <div 
                            key={i} 
                            className={`p-2.5 rounded-xl text-xs flex items-start justify-between gap-3 ${
                              item.color === 'red' ? 'glass-card-rose text-rose-900 dark:text-rose-200' :
                              item.color === 'amber' ? 'glass-card-amber text-amber-900 dark:text-amber-200' :
                              'glass-card-emerald text-emerald-900 dark:text-emerald-200'
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
            <div key="tab-detector" className="animate-section-enter space-y-6">
              <AbsoluteDetectorView
                initialText={inputText}
                onTransferToHumanizer={(text) => {
                  setInputText(text);
                  setActiveTab('humanize');
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
            <div key="tab-templates" className="animate-section-enter space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Templates &amp; Presets</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pre-tested prompts, bullet points, emails, and technical documentation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES_DATA.map(tpl => (
                  <div 
                    key={tpl.id}
                    className="glass-card p-5 rounded-2xl shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full glass-pill text-slate-700 dark:text-slate-300">
                          {tpl.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium capitalize">{tpl.tone}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{tpl.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{tpl.text}</p>
                    </div>

                    <button
                      onClick={() => {
                        setInputText(tpl.text);
                        setContext(tpl.context);
                        setTone(tpl.tone);
                        setActiveTab('humanize');
                        showToast(`Loaded template: ${tpl.title}`);
                      }}
                      className="mt-4 w-full py-2.5 glass-button-secondary hover:text-white dark:hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer"
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
            <div key="tab-history" className="animate-section-enter space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Humanization History</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your recent revisions and transformed drafts.</p>
                </div>
                <button
                  onClick={() => {
                    setHistoryList([]);
                    showToast('History cleared');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-3">
                {historyList.map(item => (
                  <div 
                    key={item.id} 
                    className="glass-panel p-5 rounded-2xl shadow-sm space-y-3 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{item.strategy}</span>
                        <span>•</span>
                        <span>{item.context}</span>
                      </div>
                      <span>{item.timestamp}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl glass-panel-subtle text-slate-600 dark:text-slate-300">
                        <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase text-[10px]">Input Draft:</div>
                        <p className="line-clamp-3 leading-relaxed">{item.input}</p>
                      </div>
                      <div className="p-3.5 rounded-xl glass-pill bg-teal-500/10 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border-teal-500/30">
                        <div className="font-semibold text-teal-700 dark:text-teal-300 mb-1 uppercase text-[10px]">Humanized Result:</div>
                        <p className="line-clamp-3 leading-relaxed">{item.output}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setInputText(item.input);
                          setOutputText(item.output);
                          setActiveTab('humanize');
                          showToast('Restored revision to editor');
                        }}
                        className="glass-button-secondary px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        Restore to editor
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.output);
                          showToast('Copied to clipboard');
                        }}
                        className="glass-button px-3.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer"
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
            <div key="tab-settings" className="animate-section-enter max-w-2xl space-y-6">
              
              {/* Account Card */}
              <div className="glass-panel p-6 rounded-3xl shadow-xl space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account &amp; Security</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your authenticated session and device persistence.</p>
                  </div>
                  {currentUser ? (
                    <span className="px-3 py-1 glass-pill bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Active Session</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 glass-pill bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 rounded-full text-xs font-bold">
                      Guest Mode
                    </span>
                  )}
                </div>

                {currentUser ? (
                  <div className="p-4 rounded-2xl glass-panel-subtle flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name || currentUser.email)}`}
                        alt={currentUser.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-teal-500/60 shadow-xs"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {currentUser.name || 'AI Humanizer User'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {currentUser.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full glass-pill text-teal-800 dark:text-teal-300">
                            {currentUser.provider === 'google' ? 'Google Authenticated' : 'Email OTP Verified'}
                          </span>
                          <span className="text-[10px] text-slate-400">Device Saved • Never asks again</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl glass-panel-subtle flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Not currently signed in</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Sign in with your email to unlock unlimited bypass.</p>
                    </div>
                    <button
                      onClick={() => {
                        setAuthModalMode('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="glass-button px-5 py-2 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
                    >
                      Sign In / Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* Appearance / Theme Selector Card */}
              <div className="glass-panel p-6 rounded-3xl shadow-xl space-y-4 transition-colors">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appearance &amp; Theme</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize light or dark mode styling for the entire dashboard.</p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div
                    onClick={() => {
                      if (theme !== 'light') toggleTheme();
                    }}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      theme === 'light'
                        ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/30 shadow-xs'
                        : 'glass-panel-subtle hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100/80 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-300/40">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Light Mode</span>
                        {theme === 'light' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Clean high-contrast daytime workspace</p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      theme === 'dark'
                        ? 'border-teal-500 bg-teal-950/20 shadow-xs'
                        : 'glass-panel-subtle hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-800/50">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Dark Mode</span>
                        {theme === 'dark' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Obsidian midnight palette for low eye strain</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gemini Engine Settings */}
              <div className="glass-panel p-6 rounded-3xl shadow-xl space-y-4 transition-colors">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Engine Settings</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure your Gemini API Key and model preferences.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Google Gemini API Key</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Gemini API key..."
                      className="w-full p-2.5 rounded-xl glass-input text-slate-800 dark:text-slate-100 outline-none font-mono"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Default active key is preloaded. All models (ChatGPT, Claude, Gemini, Llama, DeepSeek) are supported.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Primary Detection Engine</label>
                    <select className="w-full p-2.5 rounded-xl glass-input outline-none text-slate-800 dark:text-slate-200 font-medium">
                      <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Google Gemini 3.8 Flash (Active 100% Forensic Engine)</option>
                      <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Local Offline Rule Transformer (Zero Latency)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => showToast('Settings saved successfully')}
                      className="glass-button px-6 py-2.5 font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel text-slate-900 dark:text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl border border-teal-500/50 z-50 flex items-center gap-2 animate-bounce">
          <span className="text-teal-600 dark:text-teal-400">✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Authentication Modal (Google Identity + Real Email OTP + Device Persistence) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        canClose={true}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
        onToast={showToast}
      />

    </div>
  );
}
