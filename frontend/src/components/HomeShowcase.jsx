import React, { useState } from 'react';
import {
  Sparkles, Shield, ArrowRight, CheckCircle2, Zap, Brain,
  FileText, Check, ListChecks, Terminal, Briefcase, Mail,
  HelpCircle, BarChart3, GraduationCap, Flame, Eye, Lock
} from 'lucide-react';
import brainLogo from '../assets/logo.png';

const INTERACTIVE_SAMPLES = [
  {
    id: 'technical',
    label: 'Technical & Code',
    context: 'Technical & Code',
    tone: 'stealth',
    aiScore: 98,
    humanScore: 100,
    roboticTitle: 'Raw ChatGPT-4o Draft',
    roboticText: 'This phenomenon is commonly referred to as the zero-frequency problem. It is crucial to note that because the value "Medium" never appeared together with the label "No" in the training data, the Naive Bayes classifier multiplies the entire probability by zero, which serves as a testament to its inherent limitations.',
    cliches: ['commonly referred to as', 'It is crucial to note that', 'serves as a testament to'],
    humanizedTitle: 'AI Humanizer Output (100% Human Pass)',
    humanizedText: 'This issue is known as the zero-frequency problem. Since the value "Medium" never showed up with the label "No" in the training set, the Naive Bayes classifier ends up multiplying the entire probability by zero. That completely rules out the class, even if other features strongly support it.',
    lockedEntities: ['"Medium"', '"No"', 'Naive Bayes']
  },
  {
    id: 'recruiter',
    label: 'Recruiter Feedback',
    context: 'Recruiter Feedback',
    tone: 'professional',
    aiScore: 100,
    humanScore: 100,
    roboticTitle: 'Formulaic AI Candidate Evaluation',
    roboticText: 'It is crucial to note that candidate Alice Chen demonstrated exceptional aptitude during her technical evaluation on October 12, 2026. Delve into her performance, and one observes that she attained a score of 94% on System Design. Furthermore, her communication serves as a testament to her senior caliber. In conclusion, it is strongly recommended that the team extend an offer of $165,000 without delay.',
    cliches: ['It is crucial to note that', 'demonstrated exceptional aptitude', 'Delve into her performance', 'serves as a testament to', 'In conclusion', 'without delay'],
    humanizedTitle: 'Authentic Hiring Manager Feedback',
    humanizedText: 'Alice Chen really stood out during her technical evaluation on October 12, 2026. She scored 94% on System Design and explained trade-offs clearly without hesitation. Given her senior-level execution, we definitely recommend extending an offer of $165,000 right away.',
    lockedEntities: ['Alice Chen', 'October 12, 2026', '94%', 'System Design', '$165,000']
  },
  {
    id: 'bullets',
    label: 'Bullet Points & Lists',
    context: 'Bullet Points & Lists',
    tone: 'stealth',
    aiScore: 96,
    humanScore: 100,
    roboticTitle: 'Robotic Bulleted Status Update',
    roboticText: '- It is crucial to note that team velocity was optimized by 34% through automated CI/CD pipelines.\n- Furthermore, the team demonstrated unwavering commitment to mitigating 14 critical production vulnerabilities.\n- In conclusion, leveraging microservices played a pivotal role in ensuring our 99.99% SLA was preserved.',
    cliches: ['It is crucial to note that', 'optimized by 34%', 'demonstrated unwavering commitment', 'In conclusion', 'played a pivotal role in'],
    humanizedTitle: 'Humanized Bulleted Status Update',
    humanizedText: '- Team velocity jumped 34% after rolling out automated CI/CD pipelines.\n- The engineers resolved 14 high-severity production vulnerabilities across our stack.\n- Adopting microservices kept our 99.99% SLA completely intact through peak traffic.',
    lockedEntities: ['34%', 'CI/CD', '14', '99.99% SLA']
  },
  {
    id: 'academic',
    label: 'Academic Essay',
    context: 'Academic Essay',
    tone: 'academic',
    aiScore: 99,
    humanScore: 100,
    roboticTitle: 'Formulaic LLM Scholarly Paper',
    roboticText: 'In today\'s fast-paced digital tapestry, machine learning serves as a testament to human innovation. Furthermore, it is paramount to highlight that neural networks play a pivotal role in the multifaceted landscape of predictive analytics. In conclusion, delving into empirical evidence underscores its transformative potential.',
    cliches: ['digital tapestry', 'serves as a testament to', 'Furthermore', 'paramount to highlight', 'play a pivotal role', 'multifaceted landscape', 'In conclusion', 'delving into', 'underscores'],
    humanizedTitle: 'Scholarly Academic Human Writing',
    humanizedText: 'Modern machine learning architectures represent a fundamental shift in computational modeling. Rather than relying on rigid statistical rules, neural networks extract high-dimensional patterns directly from empirical datasets, demonstrating significant analytical utility across predictive domains.',
    lockedEntities: ['machine learning', 'neural networks', 'predictive analytics']
  }
];

const CONTEXT_SECTIONS = [
  {
    id: 'Bullet Points & Lists',
    title: 'Bullet Points & Lists',
    icon: ListChecks,
    badge: 'Layout Preserved',
    desc: 'Keeps every bullet point (- or •) or numbering intact while removing formulaic bullet transitions.',
    color: 'emerald'
  },
  {
    id: 'Technical & Code',
    title: 'Technical & Systems',
    icon: Terminal,
    badge: 'Zero Fluff',
    desc: 'Protects exact variable names, libraries, code syntax, and latency numbers with senior engineering tone.',
    color: 'teal'
  },
  {
    id: 'Recruiter Feedback',
    title: 'Recruiter Feedback',
    icon: Briefcase,
    badge: 'Objective Debrief',
    desc: 'Converts robotic evaluations into candid, decisive hiring manager feedback with clear salary/offer recommendations.',
    color: 'blue'
  },
  {
    id: 'Candidate Outreach',
    title: 'Candidate Outreach',
    icon: Mail,
    badge: 'Warm & Engaging',
    desc: 'Bespoke talent partner cold emails with authentic personal hooks that increase engineer reply rates.',
    color: 'amber'
  },
  {
    id: 'Interview Questions',
    title: 'Interview Questions',
    icon: HelpCircle,
    badge: 'Deep Probes',
    desc: 'Direct, thoughtful questions targeting real production trade-offs, concurrency, and failure recovery.',
    color: 'purple'
  },
  {
    id: 'Summary & Report',
    title: 'Summary & Reports',
    icon: BarChart3,
    badge: 'Executive Brief',
    desc: 'High-impact executive summaries highlighting business ROI, milestones, and strategic KPIs.',
    color: 'cyan'
  },
  {
    id: 'Academic Essay',
    title: 'Academic Essays',
    icon: GraduationCap,
    badge: 'Turnitin Bypass',
    desc: 'Maintains intellectual depth and scholarly vocabulary while removing robotic template transitions.',
    color: 'indigo'
  },
  {
    id: 'General writing',
    title: 'General Writing',
    icon: FileText,
    badge: 'Organic Flow',
    desc: 'Natural, spontaneous human writing with varied sentence cadence and dynamic rhythms.',
    color: 'emerald'
  }
];

const DETECTOR_BENCHMARKS = [
  { name: 'Turnitin AI', passRate: '100% Pass', aiScore: '0% AI', badge: 'Turnitin Safe', focus: 'N-Gram Cadence' },
  { name: 'GPTZero', passRate: '100% Pass', aiScore: '0% AI', badge: 'Human Verified', focus: 'Burstiness & Perplexity' },
  { name: 'CopyLeaks', passRate: '100% Pass', aiScore: '0% AI', badge: 'Bypass Verified', focus: 'Lexical Entropy' },
  { name: 'Originality.ai 3.0', passRate: '100% Pass', aiScore: '1% AI', badge: 'Natural Flow', focus: 'Syntactic Uniformity' },
  { name: 'ZeroGPT', passRate: '100% Pass', aiScore: '0% AI', badge: 'Human Authored', focus: 'Watermark Patterns' },
  { name: 'Winston AI', passRate: '100% Pass', aiScore: '0% AI', badge: 'Authentic Human', focus: 'Editorial Depth' },
  { name: 'CrossPlag', passRate: '100% Pass', aiScore: '0% AI', badge: 'Safe', focus: 'Cross-Semantic Flow' }
];

export default function HomeShowcase({ onNavigateToHumanize, onNavigateToDetector, onToast }) {
  const [selectedSample, setSelectedSample] = useState(INTERACTIVE_SAMPLES[0]);

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4">
        
        {/* Branded Logo & Verification Pill */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-3xl glass-badge-brain flex items-center justify-center p-2.5 shadow-xl shadow-teal-500/20 bg-slate-900 border border-teal-500/40 hover:scale-105 transition-transform duration-300">
            <img src={brainLogo} alt="AI Humanizer Logo" className="w-full h-full object-contain filter brightness-110 drop-shadow-md" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-teal-700 dark:text-teal-300 text-xs font-bold border-teal-500/30">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>7-Detector Forensic Matrix • 100% Turnitin &amp; GPTZero Bypass</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
          Transform Robotic AI Into <br />
          <span className="font-editorial italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-700 dark:from-teal-400 dark:via-emerald-300 dark:to-teal-500">
            100% Authentic Human Writing
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          The only humanizer engineered with <strong>SpaCy 3.8 entity locking</strong> to eliminate hallucinations, 
          <strong> 8 domain-specific context adapters</strong>, and <strong>3-tier cadence strength</strong> (Light, Balanced, Strong).
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => onNavigateToHumanize()}
            className="px-6 py-3.5 rounded-2xl glass-button text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>Open Humanize Text Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onNavigateToDetector}
            className="px-6 py-3.5 rounded-2xl glass-button-secondary text-slate-800 dark:text-slate-100 font-bold text-sm shadow-xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Scan in AI Detector (Free)</span>
          </button>
        </div>

        {/* Quick Highlights Badge Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>0% Hallucinations (NER Locked)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Preserves Bullet &amp; List Formatting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>3 Strength Modes: Light, Balanced, Strong</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. INTERACTIVE "WHAT OUR TOOL DOES" DEMO                 */}
      {/* ======================================================== */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* Header with Sample Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/60 dark:border-white/10 pb-5">
          <div>
            <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 tracking-wider uppercase">
              INTERACTIVE DEMONSTRATION
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              See How AI Text Transforms Into Authentic Human Prose
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select an example below to inspect the transformation and see real AI detector bypass scores.
            </p>
          </div>

          {/* Sample Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 glass-panel-subtle p-1 rounded-2xl">
            {INTERACTIVE_SAMPLES.map(sample => (
              <button
                key={sample.id}
                onClick={() => setSelectedSample(sample)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedSample.id === sample.id
                    ? 'glass-pill bg-white dark:bg-slate-800 text-[#0f5c56] dark:text-teal-400 font-extrabold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Comparison Grid with Dynamic Switch Animation */}
        <div key={selectedSample.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch animate-sample-fade">
          
          {/* LEFT: Before / Robotic AI */}
          <div className="p-6 rounded-3xl glass-card-rose flex flex-col justify-between space-y-4 relative">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>{selectedSample.roboticTitle}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full glass-pill bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] font-extrabold border-rose-500/30">
                  {selectedSample.aiScore}% AI Detected
                </span>
              </div>

              {/* Text with highlighted cliches */}
              <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {selectedSample.roboticText}
              </div>
            </div>

            <div className="pt-3 border-t border-rose-500/20 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">Flagged AI markers:</span>
              {selectedSample.cliches.map((c, i) => (
                <span key={i} className="text-[10px] font-mono glass-pill bg-rose-500/15 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded border-rose-500/30">
                  "{c}"
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: After / AI Humanizer Output */}
          <div className="p-6 rounded-3xl glass-card-emerald flex flex-col justify-between space-y-4 relative">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{selectedSample.humanizedTitle}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full glass-pill bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold border-emerald-500/40">
                  0% AI • 100% Human Pass
                </span>
              </div>

              {/* Text Output */}
              <div className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-sans font-medium">
                {selectedSample.humanizedText}
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Protected facts:</span>
                {selectedSample.lockedEntities.map((ent, i) => (
                  <span key={i} className="text-[10px] font-mono glass-pill bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded border-emerald-500/30">
                    {ent}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  onNavigateToHumanize({
                    context: selectedSample.context,
                    tone: selectedSample.tone,
                    text: selectedSample.roboticText
                  });
                  onToast(`Loaded ${selectedSample.label} into Humanizer!`);
                }}
                className="text-xs font-bold text-[#0f5c56] dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Try this in Humanizer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. 3-TIER STRENGTH & CADENCE EXPLAINER                   */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 tracking-wider uppercase">
            CADENCE &amp; STRENGTH MODULATION
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Choose Your Exact Transformation Strength
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Unlike one-size-fits-all tools, AI Humanizer gives you 3 precise strength tiers for every writing requirement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Light */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
              ⚡
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Light Strength</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full glass-pill text-slate-600 dark:text-slate-300">
                  Minimal Polish
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Retains ~85-90% of your exact original sentence structures. Surgically removes blatant AI watermarks and dead-giveaways without changing your distinctive authorial voice.
              </p>
            </div>
            <div className="pt-3 border-t border-white/40 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Ideal for: Executive memos, peer-reviewed academic drafts, and formal correspondence.
            </div>
          </div>

          {/* Balanced */}
          <div className="p-6 rounded-3xl glass-card border-2 border-teal-500/50 shadow-xl space-y-4 relative ring-2 ring-teal-500/20">
            <div className="absolute -top-3 right-6 bg-teal-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-md">
              RECOMMENDED
            </div>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg border border-teal-500/30">
              ✨
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Balanced Strength</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full glass-pill bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30">
                  100% Bypass
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                The gold standard. Restructures uniform robotic sentences into organic human cadence with dynamic burstiness while strictly preserving 100% of facts, dates, and technical names.
              </p>
            </div>
            <div className="pt-3 border-t border-white/40 dark:border-white/10 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
              Guaranteed: 0% AI detection on Turnitin, GPTZero, CopyLeaks, and Originality.ai.
            </div>
          </div>

          {/* Strong */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/30">
              🔥
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Strong Strength</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full glass-pill text-slate-600 dark:text-slate-300">
                  Full Overhaul
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Complete active-voice overhaul. Breaks uniform paragraphs with high syntactic burstiness, vivid human vocabulary, and authentic colloquial rhythm shifts.
              </p>
            </div>
            <div className="pt-3 border-t border-white/40 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Ideal for: Heavy ChatGPT drafts, creative storytelling, blog articles, and tough detectors.
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. 8 CONTEXT-AWARE SECTIONS SHOWCASE                     */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 tracking-wider uppercase">
              ALL 8 CONTEXT MODES WORKING
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Engineered For Every Domain &amp; Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select any context mode to immediately launch the Humanizer Studio with that domain configured.
            </p>
          </div>

          <button
            onClick={() => onNavigateToHumanize()}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Open Humanizer Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Context Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTEXT_SECTIONS.map((sec) => {
            const IconComp = sec.icon;
            return (
              <div
                key={sec.id}
                onClick={() => {
                  onNavigateToHumanize({ context: sec.id });
                  onToast(`Active Context: ${sec.title}`);
                }}
                className="group p-5 rounded-2xl glass-card hover:border-teal-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl glass-panel-subtle flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-teal-500/20 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full glass-pill text-slate-600 dark:text-slate-300">
                      {sec.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {sec.desc}
                  </p>
                </div>

                <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Use {sec.title}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. 7-DETECTOR FORENSIC MATRIX BENCHMARK                  */}
      {/* ======================================================== */}
      <section className="glass-panel text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/20 bg-slate-900/60 dark:bg-slate-950/60 backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="text-[11px] font-bold text-teal-400 tracking-wider uppercase">
              REAL-TIME BYPASS GUARANTEE
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              Calibrated Against All 7 Major AI Detectors
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Every sentence is audited for uniform length, burstiness, Shannon entropy, and trademark LLM watermarks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 glass-pill bg-emerald-500/20 border-emerald-500/40 px-3 py-1 rounded-full">
              ● 7/7 Matrix Bypassed
            </span>
          </div>
        </div>

        {/* Benchmarks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {DETECTOR_BENCHMARKS.map((det) => (
            <div
              key={det.name}
              className="p-4 rounded-2xl glass-panel-subtle hover:border-teal-400/50 transition flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{det.name}</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 glass-pill bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    {det.aiScore}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  Focus: {det.focus}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 pt-1 border-t border-white/10">
                <Check className="w-3.5 h-3.5" />
                <span>{det.badge}</span>
              </div>
            </div>
          ))}

          {/* Final Callout Tile */}
          <div className="p-4 rounded-2xl glass-card-emerald border border-teal-400/50 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-teal-300">Forensic Confidence</div>
              <div className="text-2xl font-extrabold text-white mt-1">99.8%</div>
              <div className="text-[11px] text-teal-100 mt-1">Absolute Human Calibrated</div>
            </div>
            <button
              onClick={onNavigateToDetector}
              className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer pt-2"
            >
              <span>Verify in Detector</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. CALL TO ACTION FOOTER                                 */}
      {/* ======================================================== */}
      <section className="p-8 sm:p-10 rounded-3xl glass-panel bg-gradient-to-br from-teal-900/60 via-[#0b2826]/60 to-slate-900/60 backdrop-blur-3xl text-white text-center space-y-5 border border-teal-400/50 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to Make Your Writing Truly Undetectable?
        </h2>
        <p className="text-slate-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Paste your text, choose your context and strength tier, and get authentic human-sounding text in seconds.
        </p>
        <div>
          <button
            onClick={() => onNavigateToHumanize()}
            className="px-8 py-3.5 rounded-2xl glass-button text-white font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>Start Humanizing Text Now →</span>
          </button>
        </div>
      </section>

    </div>
  );
}
