import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Volume2,
  Smartphone,
  CreditCard,
  UserCheck
} from 'lucide-react';

export const AwarenessCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'modules' | 'quiz'>('modules');

  // Interactive Quiz State
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const quizQuestions = [
    {
      question: "You receive an urgent voice note from your 'CEO' asking you to wire $25,000 immediately to a vendor before an international flight. What should you do first?",
      options: [
        "Process the wire immediately to avoid executive reprimand.",
        "Hang up and call the CEO back on their verified mobile number via an independent phone channel.",
        "Reply to the message asking for bank details.",
        "Forward the audio to a coworker."
      ],
      correctIndex: 1,
      explanation: "Scammers clone voices from social media or webinars using modern AI vocoders. Always verify executive financial requests through an independent, out-of-band communication channel."
    },
    {
      question: "A caller claiming to be from your bank states your account has been blocked and demands your 6-digit OTP to unfreeze it. Is this legitimate?",
      options: [
        "Yes, banks require OTPs to unfreeze accounts.",
        "No, banks will never ask for OTPs or login PINs over phone calls or SMS.",
        "Only if they already know your full name and account number.",
        "Yes, as long as you provide it within 5 minutes."
      ],
      correctIndex: 1,
      explanation: "OTPs are private authentication tokens designed exclusively for the account holder. Bank representatives never require your OTP to unblock accounts."
    },
    {
      question: "Which of the following is a physical acoustic clue that a voice note might be an AI voice clone?",
      options: [
        "Natural room echo and organic breathing pauses.",
        "Sudden high-frequency cutoff (around 7-8kHz), absence of breath sounds, and flat robotic pitch micro-jitter.",
        "The speaker having a foreign accent.",
        "The voice sounding louder than usual."
      ],
      correctIndex: 1,
      explanation: "Neural vocoders (e.g. HiFi-GAN) frequently exhibit unnatural phase smoothness, regularized pitch contours, and abrupt high-frequency spectral rolloffs."
    },
    {
      question: "What is an IDN Homograph / Punycode phishing attack?",
      options: [
        "A virus that crashes your operating system.",
        "Using foreign Unicode characters that look identical to Latin letters (e.g., Cyrillic 'а' replacing Latin 'a' in 'paypаl.com') to deceive users.",
        "Sending an email with large file attachments.",
        "A type of password guessing attack."
      ],
      correctIndex: 1,
      explanation: "Homograph attacks exploit visual similarities between distinct alphabet characters in browser address bars. DeepTrust AI automatically detects 'xn--' Punycode prefixes to protect you."
    },
    {
      question: "You see a breaking news video of a high-profile official making an inflammatory speech. How can you spot a potential deepfake face swap?",
      options: [
        "Look for unnatural eye blinking frequency, fuzzy ear/jawline boundaries, and mismatched teeth or collar lighting.",
        "Check if the video is longer than 2 minutes.",
        "Assume it's authentic if it has over 10,000 likes on social media.",
        "Listen to the volume of the background applause."
      ],
      correctIndex: 0,
      explanation: "Face-swapping algorithms typically struggle with fine temporal details like natural micro-saccades, irregular eye blinking, and color blending along jawline contours."
    }
  ];

  const handleSelectOption = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === quizQuestions[currentQ].correctIndex) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  const modules = [
    {
      title: "AI Voice Cloning & Executive Extortion",
      icon: Volume2,
      desc: "Attackers need only 5 seconds of sample speech to clone a target voice. Learn how to identify neural vocoder phase artifacts and establish out-of-band authentication codes.",
      tips: [
        "Never transfer money based solely on voice notes.",
        "Create a secret emergency family passphrase.",
        "Listen for absence of natural room acoustic reverb."
      ]
    },
    {
      title: "Banking KYC & Power Cutoff Phishing",
      icon: Smartphone,
      desc: "Scammers induce panic with threats of immediate electricity disconnection or frozen bank cards. Learn the anatomy of SMS social engineering.",
      tips: [
        "Look for short-lived high-abuse TLDs (.xyz, .top).",
        "Official government agencies do not send Telegram/WhatsApp warnings.",
        "Check official statements on physical utility bills."
      ]
    },
    {
      title: "Deepfake Video & Facial Landmark Replacement",
      icon: UserCheck,
      desc: "From celebrity endorsements to political disinformation, face-swapping algorithms manipulate video. Learn keyframe inspection techniques.",
      tips: [
        "Watch eye blink frequency and corneal reflections.",
        "Inspect jawline boundary motion blur.",
        "Cross-reference speech audio with lip sync articulation."
      ]
    },
    {
      title: "Remote Access APK Trojan Traps",
      icon: CreditCard,
      desc: "Scammers persuade victims to install apps like AnyDesk or malicious Android APKs to bypass SMS OTP protections.",
      tips: [
        "Never download .apk files from WhatsApp or browser links.",
        "Never grant screen-sharing permissions to unknown callers.",
        "Banks will never ask you to install TeamViewer or QuickSupport."
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-semibold text-[#00d9f5] tracking-widest uppercase">
          CYBERSECURITY DEFENSE ACADEMY
        </span>
        <h1 className="font-heading text-3xl font-extrabold text-white">
          Awareness Center & Scam Defense
        </h1>
        <p className="text-xs text-[#9bb8c9] max-w-xl mx-auto">
          Understand modern AI impersonation techniques, master out-of-band verification, and test your fraud detection skills with interactive quizzes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-[#061526] border border-[#16425c] gap-1">
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'modules'
                ? 'bg-[#00d9f5] text-[#020914] shadow-[0_0_15px_rgba(0,217,245,0.4)]'
                : 'text-[#9bb8c9] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Educational Modules</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-[#00d9f5] text-[#020914] shadow-[0_0_15px_rgba(0,217,245,0.4)]'
                : 'text-[#9bb8c9] hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Interactive Scam Quiz</span>
          </button>
        </div>
      </div>

      {/* Modules View */}
      {activeTab === 'modules' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 border border-[#16425c] hover:border-[#00d9f5]/50 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00d9f5]/15 border border-[#00d9f5]/40 flex items-center justify-center text-[#00d9f5]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-white">{m.title}</h3>
                  <p className="text-xs text-[#9bb8c9] leading-relaxed">{m.desc}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#061526] border border-[#16425c]/50 space-y-1.5 text-xs text-[#f3fbff]">
                  <span className="text-[10px] font-mono text-[#00d9f5] font-bold block uppercase tracking-wider">
                    Defense Recommendations:
                  </span>
                  {m.tips.map((t, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[#9bb8c9] text-[11px]">
                      <span className="text-[#17d9aa]">•</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Interactive Scam Quiz View */
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-[#00d9f5]/40 shadow-2xl space-y-6 max-w-3xl mx-auto">
          {!quizFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#16425c] text-xs font-mono">
                <span className="text-[#00d9f5] font-bold">
                  QUESTION {currentQ + 1} OF {quizQuestions.length}
                </span>
                <span className="text-[#9bb8c9]">Current Score: {score}/{currentQ}</span>
              </div>

              <h3 className="font-heading text-base sm:text-lg font-bold text-white leading-snug">
                {quizQuestions[currentQ].question}
              </h3>

              <div className="space-y-3 pt-2">
                {quizQuestions[currentQ].options.map((opt, oIdx) => {
                  const isChosen = selectedAnswer === oIdx;
                  const isCorrect = oIdx === quizQuestions[currentQ].correctIndex;
                  let btnStyle = 'bg-[#061526] border-[#16425c] text-[#f3fbff] hover:border-[#00d9f5]';

                  if (showExplanation) {
                    if (isCorrect) {
                      btnStyle = 'bg-[#17d9aa]/15 border-[#17d9aa] text-white font-bold';
                    } else if (isChosen && !isCorrect) {
                      btnStyle = 'bg-[#ff4969]/15 border-[#ff4969] text-white';
                    } else {
                      btnStyle = 'bg-[#061526]/50 border-[#16425c]/50 text-[#9bb8c9]/50';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={showExplanation}
                      className={`w-full text-left p-4 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {showExplanation && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#17d9aa] shrink-0" />
                      )}
                      {showExplanation && isChosen && !isCorrect && (
                        <XCircle className="w-4 h-4 text-[#ff4969] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Box */}
              {showExplanation && (
                <div className="p-4 rounded-xl bg-[#020914] border border-[#00d9f5]/40 space-y-2 animate-in fade-in duration-200">
                  <div className="text-xs font-mono text-[#00d9f5] font-bold uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Forensic Explanation</span>
                  </div>
                  <p className="text-xs text-[#9bb8c9] leading-relaxed">
                    {quizQuestions[currentQ].explanation}
                  </p>
                  <div className="pt-2 text-right">
                    <button
                      onClick={nextQuestion}
                      className="px-5 py-2 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-xs font-semibold text-[#020914] inline-flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,217,245,0.4)] cursor-pointer"
                    >
                      <span>{currentQ < quizQuestions.length - 1 ? 'Next Question' : 'View Results'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Score Card */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#00d9f5]/20 border border-[#00d9f5] flex items-center justify-center mx-auto text-[#00d9f5]">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">Quiz Completed!</h3>
              <p className="text-xs text-[#9bb8c9]">
                You scored <span className="text-[#00d9f5] font-mono font-bold text-lg">{score}</span> out of{' '}
                <span className="font-mono text-lg">{quizQuestions.length}</span> ({Math.round((score / quizQuestions.length) * 100)}%)
              </p>
              <div className="p-4 rounded-xl bg-[#061526] border border-[#16425c] text-xs text-[#33edff] max-w-md mx-auto">
                {score >= 4
                  ? 'Excellent awareness! You possess forensic-level vigilance against social engineering and AI deepfakes.'
                  : 'Good effort! Review the educational modules above to sharpen your defense against modern digital fraud.'}
              </div>
              <button
                onClick={restartQuiz}
                className="px-6 py-2.5 rounded-xl bg-[#00d9f5] hover:bg-[#33edff] text-xs font-semibold text-[#020914] transition-all shadow-[0_0_15px_rgba(0,217,245,0.4)] cursor-pointer"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
