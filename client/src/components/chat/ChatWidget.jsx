// src/components/chat/ChatWidget.jsx
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Minimize2 } from 'lucide-react';
import { aiApi } from '../../services/api';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ASSISTANT', content: "Hey! 👋 I'm AutoNexus AI. Tell me what kind of car you're looking for — budget, use case, anything — and I'll help you find the perfect match." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'USER', content: msg }]);
    setLoading(true);
    try {
      const res = await aiApi.chat({ message: msg, sessionId, history: messages });
      setMessages(prev => [...prev, { role: 'ASSISTANT', content: res.reply }]);
      setSessionId(res.sessionId);
    } catch {
      setMessages(prev => [...prev, { role: 'ASSISTANT', content: 'Sorry, I had a hiccup! Please try again.' }]);
    } finally { setLoading(false); }
  };

  const suggestions = ['Find me an SUV under 5M', 'Best family cars?', 'Compare diesel vs petrol'];

  return (
    <>
      {/* Toggle Button */}
    <button
      onClick={() => setOpen(!open)}
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-2xl flex items-center justify-center transition-colors duration-200 active:scale-95 transform-gpu isolate"
    >
      {open ? <X size={22} /> : <MessageCircle size={22} />}
      {!open && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-900" />
      )}
    </button>

      {/* Chat Window */}
      {open && (
        <div className={`
          fixed z-50 bg-dark-800 border border-white/10 shadow-2xl flex flex-col overflow-hidden
          /* Mobile: full screen bottom sheet */
          bottom-0 left-0 right-0 rounded-t-3xl
          /* Desktop: floating window */
          sm:bottom-24 sm:right-5 sm:left-auto sm:rounded-2xl sm:w-[380px]
          animate-fade-up
        `}
          style={{ maxHeight: 'calc(100vh - 5rem)' }}
        >
          {/* Header */}
          <div className="bg-dark-700 px-5 py-4 border-b border-white/5 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">AutoNexus AI</p>
              <p className="text-xs text-white/30">Powered by Groq · Always available</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/5 rounded-lg sm:hidden">
                <Minimize2 size={16} className="text-white/40" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 200 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] text-sm px-4 py-2.5 rounded-2xl leading-relaxed ${
                  m.role === 'USER'
                    ? 'bg-brand-500 text-white rounded-br-sm'
                    : 'bg-dark-700 text-white/80 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-dark-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only on first message */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => setInput(s)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:border-brand-500/40 hover:text-brand-400 transition-colors whitespace-nowrap">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/5 flex gap-2 shrink-0 pb-safe">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              className="input !py-2.5 !text-sm flex-1"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="btn-primary !px-3 !py-2.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 sm:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
