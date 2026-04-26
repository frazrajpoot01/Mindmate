'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Brain, Send, LogOut, BarChart2, Menu, X,
  Phone, Heart, Shield, AlertTriangle,
  MessageSquare, Trash2, Loader2, BookOpen, Settings,
  Mic, MicOff
} from 'lucide-react';
import Link from 'next/link';
import { chatApi } from '../../lib/api';

// ─── Emergency Modal ─────────────────────────────────────────────────────────
function EmergencyModal({ onDismiss }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
      >
        {/* Pulsing red border overlay */}
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 border-[3px] border-red-600 pointer-events-none"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-zinc-950 border border-red-900/50 rounded-2xl p-8 md:p-10 max-w-lg w-full text-center space-y-6 shadow-2xl"
        >
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mx-auto border border-red-900/50"
          >
            <AlertTriangle size={28} className="text-red-500" />
          </motion.div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-zinc-50 tracking-tight">
              You're Not Alone
            </h2>
            <p className="text-zinc-400 leading-relaxed text-sm">
              It sounds like you may be going through something very difficult right now.
              Please reach out to a trained counsellor immediately — they are here for you.
            </p>
          </div>

          {/* Helplines */}
          <div className="space-y-3 text-left">
            <a
              href="tel:1166"
              className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-red-900/50 hover:bg-red-950/20 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                <Phone size={16} className="text-zinc-300" />
              </div>
              <div>
                <p className="text-zinc-50 font-bold text-base leading-none">1166</p>
                <p className="text-zinc-500 text-xs mt-1">Pakistan National Mental Health Helpline</p>
              </div>
            </a>

            <a
              href="tel:03174288665"
              className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-red-900/50 hover:bg-red-950/20 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                <Heart size={16} className="text-zinc-300" />
              </div>
              <div>
                <p className="text-zinc-50 font-bold text-base leading-none">0317-4288665</p>
                <p className="text-zinc-500 text-xs mt-1">Umang Mental Health Support</p>
              </div>
            </a>

            <a
              href="tel:115"
              className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-red-900/50 hover:bg-red-950/20 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                <Shield size={16} className="text-zinc-300" />
              </div>
              <div>
                <p className="text-zinc-50 font-bold text-base leading-none">115</p>
                <p className="text-zinc-500 text-xs mt-1">Edhi Foundation Emergency Line</p>
              </div>
            </a>
          </div>

          <p className="text-red-500/80 text-xs font-medium">
            MindMate AI has detected signs of crisis. Please speak to a human.
          </p>

          <button
            onClick={onDismiss}
            className="w-full py-3 px-6 bg-transparent border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 rounded-lg text-sm font-medium transition-colors"
          >
            I'm safe — dismiss this
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-end gap-3 max-w-[70%]"
    >
      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
        <Brain size={14} className="text-zinc-300" />
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center h-[46px]">
        <div className="flex items-center gap-1.5">
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, index }) {
  const isUser = !msg.is_ai_response;

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[85%] md:max-w-[75%] ${isUser ? 'ml-auto' : 'mr-auto'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0 mb-1">
          <Brain size={14} className="text-zinc-300" />
        </div>
      )}
      <div
        className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap break-words ${isUser
          ? 'bg-zinc-100 text-zinc-950 rounded-br-sm'
          : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-sm'
          }`}
      >
        {msg.message}
      </div>
    </motion.div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function ChatSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'} max-w-[70%] ${i % 2 === 0 ? '' : 'ml-auto'}`}>
          <div className="w-8 h-8 rounded-lg bg-zinc-800/50 animate-pulse shrink-0" />
          <div className={`h-12 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 animate-pulse ${i % 2 === 0 ? 'w-64' : 'w-48'}`} />
        </div>
      ))}
    </div>
  );
}

// ─── Child Component to wrap searchParams logic ───────────────────────────────
function ChatInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Voice to text states
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history based on sessionId
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await chatApi.getHistory(sessionId);
        const history = res.data?.messages || res.data || [];
        setMessages(Array.isArray(history) ? history : []);
      } catch {
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [sessionId]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleLogout = () => {
    localStorage.removeItem('mindmate_token');
    document.cookie = "mindmate_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = '/login';
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Stop listening if user hits send while mic is active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = { message: text, is_ai_response: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const res = await chatApi.sendMessage(text);
      const data = res.data;

      setIsTyping(false);

      if (data.action === 'SHOW_EMERGENCY_PANEL' || data.is_emergency === true) {
        setShowEmergency(true);
        return;
      }

      const aiMsg = { message: data.reply || data.message || 'I hear you.', is_ai_response: true };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setIsTyping(false);
      const errMsg = {
        message: 'Something went wrong. Please try again.',
        is_ai_response: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    try {
      await chatApi.clearChat();
      setMessages([]);
      if (sessionId) {
        router.push('/chat');
      }
    } catch (error) {
      console.error("Failed to clear chat from the database:", error);
    }
  };

  // ─── Voice to Text Logic ───────────────────────────────────────────────
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your current browser. Please try using Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-zinc-950 font-sans antialiased flex overflow-hidden text-zinc-50">
      {/* Emergency Modal */}
      {showEmergency && <EmergencyModal onDismiss={() => setShowEmergency(false)} />}

      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <>
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <aside
          className={`fixed md:relative z-40 w-64 shrink-0 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
        >
          {/* Sidebar Header */}
          <div className="h-16 px-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-7 h-7 rounded-lg bg-zinc-50 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                <Brain size={14} className="text-zinc-950" />
              </div>
              <span className="text-zinc-50 font-semibold tracking-tight text-[15px]">
                MindMate<span className="text-zinc-600">.ai</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sidebar Nav (Chat Active) */}
          <nav className="flex-1 p-4 space-y-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 flex items-center gap-3 text-zinc-100">
              <MessageSquare size={16} className="text-zinc-100" />
              <span className="text-sm font-medium">AI Chat</span>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm mt-1"
            >
              <BarChart2 size={16} />
              Mood Dashboard
            </Link>
            <Link
              href="/journal"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm mt-1"
            >
              <BookOpen size={16} />
              Journal Archive
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm mt-1"
            >
              <Settings size={16} />
              Account Settings
            </Link>
          </nav>

          {/* Clear chat */}
          <div className="p-4 border-t border-zinc-800 space-y-1">
            <button
              onClick={handleClearChat}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all text-sm"
            >
              <Trash2 size={15} />
              Clear conversation
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all text-sm"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </aside>
      </>

      {/* ─── Chat Area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {/* Chat Topbar */}
        <header className="h-16 border-b border-zinc-800 flex items-center px-4 md:px-6 gap-3 shrink-0 bg-zinc-950/80 backdrop-blur-sm z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-zinc-400 hover:text-zinc-100 transition-colors p-1"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
              <Brain size={14} className="text-zinc-300" />
            </div>
            <div>
              <p className="text-zinc-100 text-sm font-semibold leading-none">MindMate AI</p>
              <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                {sessionId ? "Viewing past session" : "Online & ready"}
              </p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {loadingHistory ? (
              <ChatSkeleton />
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center space-y-5 py-24"
              >
                <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-sm">
                  <Brain size={24} className="text-zinc-300" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h2 className="text-zinc-50 font-semibold text-xl tracking-tight">How are you feeling today?</h2>
                  <p className="text-zinc-400 text-[15px] leading-relaxed">
                    This is a private, secure space. Share whatever is on your mind — I'm here to listen, without judgment.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 justify-center mt-6">
                  {["I'm feeling anxious", "I need to vent", "I'm having a rough day", "I'm feeling good!"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 px-4 py-2 rounded-full transition-all hover:text-zinc-50 hover:bg-zinc-800 hover:border-zinc-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} index={i} />
                ))}
                <AnimatePresence>
                  {isTyping && <TypingIndicator />}
                </AnimatePresence>
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-zinc-950 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600 transition-colors rounded-xl p-2 shadow-sm">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind…"
                rows={1}
                className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-[15px] resize-none outline-none leading-relaxed max-h-40 py-2.5 px-3"
                style={{ minHeight: '44px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                }}
                disabled={loading}
              />

              {/* ─── NEW MICROPHONE BUTTON ─── */}
              <button
                onClick={toggleListening}
                type="button"
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all mb-0.5 ${isListening
                    ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  }`}
                title="Voice Typing"
              >
                {isListening ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                id="send-message"
                className="w-10 h-10 rounded-lg bg-zinc-50 text-zinc-950 flex items-center justify-center shrink-0 hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-0.5 mr-0.5"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} className="ml-[-2px]" />
                )}
              </button>
            </div>
            <p className="text-center text-zinc-500 text-xs mt-3 hidden md:block">
              Press <kbd className="font-sans px-1.5 py-0.5 bg-zinc-800 rounded-md">Enter</kbd> to send · <kbd className="font-sans px-1.5 py-0.5 bg-zinc-800 rounded-md">Shift + Enter</kbd> for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div className="h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" size={32} /></div>}>
      <ChatInterface />
    </Suspense>
  );
}