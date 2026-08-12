'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Send, Phone, Heart, Shield, AlertTriangle,
  Loader2, Mic, MicOff
} from 'lucide-react';
import { chatApi } from '../../../lib/api';
import BrandIcon from '../../../components/BrandIcon';
import TypingIndicator from '../../../components/TypingIndicator';
import { mentalHealthSpring } from '../../../lib/animations';

function EmergencyModal({ onDismiss }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-surface-dark border-2 border-mood-negative animate-pulse rounded-[16px] p-8 md:p-12 max-w-lg w-full text-center space-y-6 shadow-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-16 h-16 bg-mood-negative/10 rounded-full flex items-center justify-center mx-auto border border-mood-negative/50"
          >
            <AlertTriangle size={28} className="text-mood-negative" />
          </motion.div>

          <div className="space-y-3 font-sans">
            <h2 className="text-2xl font-medium text-on-dark tracking-tight font-serif">
              You're Not Alone
            </h2>
            <p className="text-on-dark-soft leading-relaxed text-sm">
              It sounds like you may be going through something very difficult right now.
              Please reach out to a trained counsellor immediately — they are here for you.
            </p>
          </div>

          <div className="space-y-3 text-left font-sans">
            <a
              href="tel:1166"
              className="flex items-center gap-4 bg-surface-dark-elevated border border-mood-negative/30 rounded-xl p-4 hover:bg-mood-negative/10 hover:border-mood-negative/60 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-surface-dark rounded-lg flex items-center justify-center shrink-0 border border-mood-negative/20">
                <Phone size={16} className="text-mood-negative" />
              </div>
              <div>
                <p className="text-on-dark font-bold text-base leading-none">1166</p>
                <p className="text-on-dark-soft text-xs mt-1">Pakistan National Mental Health Helpline</p>
              </div>
            </a>

            <a
              href="tel:03174288665"
              className="flex items-center gap-4 bg-surface-dark-elevated border border-mood-negative/30 rounded-xl p-4 hover:bg-mood-negative/10 hover:border-mood-negative/60 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-surface-dark rounded-lg flex items-center justify-center shrink-0 border border-mood-negative/20">
                <Heart size={16} className="text-mood-negative" />
              </div>
              <div>
                <p className="text-on-dark font-bold text-base leading-none">0317-4288665</p>
                <p className="text-on-dark-soft text-xs mt-1">Umang Mental Health Support</p>
              </div>
            </a>

            <a
              href="tel:115"
              className="flex items-center gap-4 bg-surface-dark-elevated border border-mood-negative/30 rounded-xl p-4 hover:bg-mood-negative/10 hover:border-mood-negative/60 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-surface-dark rounded-lg flex items-center justify-center shrink-0 border border-mood-negative/20">
                <Shield size={16} className="text-mood-negative" />
              </div>
              <div>
                <p className="text-on-dark font-bold text-base leading-none">115</p>
                <p className="text-on-dark-soft text-xs mt-1">Edhi Foundation Emergency Line</p>
              </div>
            </a>
          </div>

          <p className="text-mood-negative/80 text-xs font-medium font-sans">
            MindMate AI has detected signs of crisis. Please speak to a human.
          </p>

          <button
            onClick={onDismiss}
            className="w-full py-3 px-6 bg-transparent border border-surface-dark-elevated hover:bg-surface-dark-elevated text-on-dark-soft hover:text-on-dark rounded-lg text-sm font-medium transition-colors font-sans"
          >
            I'm safe — dismiss this
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}



const bubbleVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { ...mentalHealthSpring, staggerChildren: 0.1 }
  }
};

const textVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

function MessageBubble({ msg, index }) {
  const isUser = !msg.is_ai_response;

  return (
    <motion.div
      key={index}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[85%] md:max-w-[75%] ${isUser ? 'ml-auto' : 'mr-auto'}`}
    >
      {!isUser && (
          <BrandIcon className="w-8 h-8 mb-1" />
      )}
      <div
        className={`leading-relaxed whitespace-pre-wrap break-words shadow-sm ${isUser
          ? 'bg-surface-card text-ink rounded-xl p-4 font-sans text-base'
          : 'bg-canvas border border-hairline text-ink rounded-xl p-4 font-serif text-lg tracking-wide'
          }`}
      >
        {isUser ? (
            msg.message
        ) : (
            <motion.span variants={textVariants}>
                {msg.message}
            </motion.span>
        )}
      </div>
    </motion.div>
  );
}

function ChatSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'} max-w-[70%] ${i % 2 === 0 ? '' : 'ml-auto'}`}>
          <div className="w-8 h-8 rounded-lg bg-surface-soft animate-pulse shrink-0" />
          <div className={`h-12 rounded-2xl bg-surface-card border border-hairline animate-pulse ${i % 2 === 0 ? 'w-64' : 'w-48'}`} />
        </div>
      ))}
    </div>
  );
}

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

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

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

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your current browser.");
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
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <>
      {showEmergency && <EmergencyModal onDismiss={() => setShowEmergency(false)} />}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {loadingHistory ? (
            <ChatSkeleton />
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={mentalHealthSpring}
              className="flex flex-col items-center justify-center text-center space-y-5 py-24"
            >
              <BrandIcon className="w-16 h-16 shadow-sm" />
              <div className="space-y-2 max-w-md">
                <h2 className="text-ink font-medium text-2xl tracking-tight font-serif">How are you feeling today?</h2>
                <p className="text-muted text-[15px] leading-relaxed font-sans">
                  This is a private, secure space. Share whatever is on your mind — I'm here to listen, without judgment.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 justify-center mt-6 font-sans">
                {["I'm feeling anxious", "I need to vent", "I'm having a rough day", "I'm feeling good!"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="bg-surface-card border border-hairline text-sm text-muted px-4 py-2 rounded-full transition-all hover:text-ink hover:border-muted-soft"
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
      <div className="p-4 md:p-6 shrink-0 bg-canvas font-sans sticky bottom-0 z-40 border-t border-hairline md:border-none pb-safe">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-surface-card border border-hairline focus-within:border-primary/50 transition-colors rounded-xl p-2 shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind…"
              rows={1}
              className="flex-1 bg-transparent text-ink placeholder-muted-soft text-[15px] resize-none outline-none leading-relaxed py-2.5 px-3"
              style={{ minHeight: '44px', maxHeight: '160px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
              disabled={loading}
            />

            <button
              onClick={toggleListening}
              type="button"
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all mb-0.5 ${isListening
                  ? 'bg-mood-negative/10 text-mood-negative border border-mood-negative/30 animate-pulse'
                  : 'text-muted hover:bg-canvas hover:text-ink border border-transparent'
                }`}
              title="Voice Typing"
            >
              {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 hover:bg-primary-active transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-0.5 mr-0.5 shadow-sm"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} className="ml-[-2px]" />
              )}
            </button>
          </div>
          <p className="text-center text-muted-soft text-xs mt-3 hidden md:block">
            Press <kbd className="font-sans px-1.5 py-0.5 bg-surface-soft border border-hairline rounded-md">Enter</kbd> to send · <kbd className="font-sans px-1.5 py-0.5 bg-surface-soft border border-hairline rounded-md">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </>
  );
}

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-muted" size={32} /></div>}>
      <ChatInterface />
    </Suspense>
  );
}