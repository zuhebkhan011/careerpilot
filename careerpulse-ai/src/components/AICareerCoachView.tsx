import React, { useState, useRef, useEffect } from 'react';
import { CoachMessage, ResumeProfile } from '../types';
import { Bot, Send, User, Sparkles, RefreshCw, Copy, Check, Lightbulb } from 'lucide-react';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { capacitorService } from '../services/capacitorService';

interface AICareerCoachViewProps {
  resume: ResumeProfile;
}

export const AICareerCoachView: React.FC<AICareerCoachViewProps> = ({ resume }) => {
  const [messages, setMessages] = useState<CoachMessage[]>(() => {
    const saved = storageService.getCoachMessages();
    if (saved.length > 0) return saved;
    return [
      {
        id: 'msg-1',
        sender: 'ai',
        text: `Hello ${resume.fullName.split(' ')[0]}! I am your AI Career Coach. I can help you prepare for technical interviews, negotiate job offers, improve your resume match scores, or plan your path to high CTC developer roles. How can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: [
          'How do I prepare for my TCS interview?',
          'Suggest top skills to get ₹20+ LPA roles',
          'Help me negotiate a job offer CTC'
        ]
      }
    ];
  });

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    storageService.saveCoachMessages(messages);
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    capacitorService.triggerHaptic(10);

    const userMsg: CoachMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          resume
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMsg: CoachMessage = {
          id: 'msg-' + Math.random().toString(36).substring(2, 9),
          sender: 'ai',
          text: data.replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedPrompts: data.suggestedPrompts
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Failed to get advice');
      }
    } catch (err) {
      console.error(err);
      notificationService.error('Coach Error', 'Could not reach AI Coach server. Try again.');
      const fallbackMsg: CoachMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 9),
        sender: 'ai',
        text: `Here are key recommendations for your request:\n\n1. **Focus on Core Fundamentals**: Revisit Data Structures, System Design basics, and REST API architecture.\n2. **Quantify Achievements**: Make sure your project descriptions mention concrete outcomes (e.g. "Improved API response speed by 35%").\n3. **Practice Live Coding**: Mock interview practice builds confidence under pressure.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: ['How do I answer "Tell me about yourself"?', 'What questions should I ask the interviewer?']
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    notificationService.info('Copied', 'Advice copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-2rem)] bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">AI Career Coach</h2>
            <p className="text-xs text-indigo-200">24/7 Interview Prep & Career Advisory</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Clear chat history?')) {
              setMessages([]);
              storageService.saveCoachMessages([]);
            }
          }}
          className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/10"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {isUser ? 'You' : 'AI Coach'}
                </span>
                <span className="text-[10px] text-slate-400">• {msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs relative ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-2xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-2xs'
                }`}
              >
                <p className="whitespace-pre-line font-sans">{msg.text}</p>

                {!isUser && (
                  <button
                    onClick={() => copyMessage(msg.id, msg.text)}
                    className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 min-h-[28px]"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy advice'}</span>
                  </button>
                )}
              </div>

              {/* Suggested Prompt Chips */}
              {!isUser && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                  {msg.suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium border border-indigo-200 transition-colors text-left flex items-center gap-1.5 min-h-[36px]"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 w-max text-xs text-slate-600">
            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>AI Coach is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Coach for interview prep, CTC tips..."
            className="flex-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`p-3 rounded-xl font-bold text-white transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] ${
              !input.trim() || loading
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200'
            }`}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
