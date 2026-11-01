import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  User as UserIcon,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Globe,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Scan } from '../types';

export const AssistantPage: React.FC = () => {
  const { user, language, setLanguage } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; actions?: string[] }>>([
    {
      role: 'assistant',
      content:
        `Hello ${user?.full_name || 'there'}! I am **DeepTrust Guardian**, your AI verification and anti-fraud advisory assistant.\n\n` +
        `I can explain forensic detection scores, guide you through out-of-band verification procedures, or assist in reporting digital extortion. How can I help you stay safe today?`,
      actions: [
        'Is this voice note suspicious?',
        'What should I do if someone asks for money?',
        'What does the model score mean?',
        'How can I report a cyber scam?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserScans();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserScans = async () => {
    try {
      const data = await api.getScans();
      setScans(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user' as const, content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatAssistant(text, selectedScanId || undefined, language);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          content: res.reply,
          actions: res.suggested_actions
        }
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          content: 'I encountered an error connecting to the advisory server. Please check your network and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-[#16425c]">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d9f5]/30 to-[#020914] border border-[#00d9f5] flex items-center justify-center shadow-[0_0_15px_rgba(0,217,245,0.4)]">
            <Bot className="w-5 h-5 text-[#00d9f5]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#17d9aa] animate-pulse" />
          </div>
          <div>
            <div className="font-heading font-bold text-base text-white">DeepTrust Guardian</div>
            <div className="text-[10px] font-mono text-[#00d9f5]">ACTIVE VERIFICATION ADVISOR • MULTILINGUAL</div>
          </div>
        </div>

        {/* Scan Context Dropdown */}
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-[#9bb8c9]" />
          <select
            value={selectedScanId}
            onChange={(e) => setSelectedScanId(e.target.value)}
            className="bg-[#061526] border border-[#16425c] rounded-xl px-3 py-1.5 text-xs text-[#f3fbff] focus:border-[#00d9f5] focus:outline-none"
          >
            <option value="">No Scan Attached (General Mode)</option>
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                Attach: {s.title.slice(0, 30)}... ({s.classification})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto glass-panel rounded-2xl p-4 sm:p-6 border border-[#16425c] space-y-5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-[#00d9f5]/20 border border-[#00d9f5] flex items-center justify-center text-[#00d9f5] shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-xl space-y-2.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[#00d9f5] text-[#020914] font-medium shadow-[0_0_15px_rgba(0,217,245,0.2)] rounded-br-none'
                    : 'bg-[#061526] border border-[#16425c] text-[#f3fbff] rounded-bl-none shadow-md'
                }`}
              >
                {m.content}
              </div>

              {/* Suggested Action Chips */}
              {m.actions && m.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(act)}
                      className="text-[11px] font-mono px-3 py-1 rounded-lg bg-[#020914] hover:bg-[#00d9f5]/20 border border-[#16425c] hover:border-[#00d9f5]/50 text-[#33edff] transition-colors cursor-pointer"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-[#061526] border border-[#16425c] flex items-center justify-center text-[#9bb8c9] shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4 text-[#00d9f5]" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#00d9f5] pt-2">
            <span className="w-2 h-2 rounded-full bg-[#00d9f5] animate-ping" />
            <span>Guardian is evaluating forensic context...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask Guardian about voice notes, model confidence, or cyber scam reporting..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#061526] border border-[#16425c] focus:border-[#00d9f5] rounded-2xl px-4 py-3 text-xs text-[#f3fbff] placeholder-[#9bb8c9]/50 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-[#00d9f5] hover:bg-[#33edff] text-[#020914] text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,217,245,0.4)] disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
