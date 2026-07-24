'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Phone, 
  ArrowUp, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';

// Official Messenger SVG Icon
const MessengerIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.516 3.737 7.23V22l3.415-1.874c.905.251 1.864.387 2.848.387 5.523 0 10-4.145 10-9.255C22 6.145 17.523 2 12 2zm1.09 12.445l-2.584-2.757-5.044 2.757 5.548-5.889 2.646 2.757 4.982-2.757-5.548 5.889z"/>
  </svg>
);

// Official Zalo Badge Icon
const ZaloIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <span className={`font-black tracking-tighter leading-none text-[11px] font-sans ${className}`}>Zalo</span>
);

// Official TikTok SVG Icon
const TikTokIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.18V9.24a6.34 6.34 0 0 0-5.07 2.61A6.34 6.34 0 0 0 5 15.68a6.34 6.34 0 0 0 10.82 4.47 6.3 6.3 0 0 0 1.87-4.47V8.6a8.28 8.28 0 0 0 4.79 1.54V6.69a4.83 4.83 0 0 1-2.89 0z"/>
  </svg>
);

export default function FloatingCTA() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{ id: number; sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Cacao Thai Snack Shop có thể giúp gì cho bạn hôm nay?',
      time: '12:00',
    },
  ]);

  // Monitor scroll height to show Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    // eslint-disable-next-line react-hooks/purity
    const userMsg = { id: Date.now(), sender: 'user' as const, text: query, time: timeStr };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Mock bot auto-response
    setTimeout(() => {
      let botReplyText = 'Cảm ơn bạn đã nhắn tin! Nhân viên tư vấn của Cacao Thai Snack Shop sẽ phản hồi bạn trong giây lát.';
      if (query.toLowerCase().includes('bento')) {
        botReplyText = 'Snack Bento có 3 vị bán chạy nhất: Cay Ngọt (Gói Đỏ), Siêu Cay (Gói Cam) và Mực Nướng (Gói Xanh). Bạn muốn chọn vị nào?';
      } else if (query.toLowerCase().includes('ship') || query.toLowerCase().includes('phí')) {
        botReplyText = 'Shop miễn phí giao hàng cho đơn hàng từ 500k toàn quốc. Đơn nội thành giao hỏa tốc trong 2h!';
      } else if (query.toLowerCase().includes('đơn hàng') || query.toLowerCase().includes('mã')) {
        botReplyText = 'Bạn có thể kiểm tra trạng thái đơn hàng trong trang Tài khoản hoặc nhập Mã đơn hàng tại đây để shop tra cứu nhé!';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReplyText,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 pointer-events-none">
      
      {/* ─── Cửa Sổ Live Chat Box (Hiển thị bên trái cụm nút nổi) ──────────── */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto w-[340px] sm:w-[380px] bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col h-[480px]"
          >
            {/* Header Chat */}
            <div className="p-4 bg-[#191715] text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-[#F5C542] text-[#191715] flex items-center justify-center font-bold shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#191715]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Hỗ Trợ Trực Tuyến <Sparkles className="w-3.5 h-3.5 text-[#F5C542]" />
                  </h3>
                  <span className="text-[10px] text-zinc-400">Cacao Thai Snack Shop • Online</span>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50/50 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl font-medium leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#191715] text-[#F5C542] rounded-br-xs shadow-xs'
                        : 'bg-white text-zinc-800 border border-zinc-200/90 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-1 px-1 flex items-center gap-1">
                    {msg.time} {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                '🌶️ Tư vấn vị Bento',
                '🚚 Phí ship & Freeship',
                '📦 Tra cứu đơn hàng',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-900 text-[10px] font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 border border-zinc-200/60"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Chat Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Nhập tin nhắn tư vấn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#F5C542] focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="p-2 bg-[#F5C542] hover:bg-[#E5B32E] text-[#191715] rounded-xl transition-all shadow-xs cursor-pointer"
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4 font-bold" />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Nút Nổi Điều Hướng & Actions Bar (Bên Phải) ────────────────── */}
      <div className="pointer-events-auto flex flex-col items-end gap-2.5">
        
        {/* Nút Cuộn Lên Đầu Trang (Back to Top) */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={scrollToTop}
              className="p-3 bg-white text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-2xl shadow-md transition-all cursor-pointer"
              title="Cuộn lên đầu trang"
            >
              <ArrowUp className="w-4 h-4 font-bold" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Menu Mở Rộng 3 Kênh: Messenger, Zalo, TikTok */}
        <AnimatePresence>
          {isContactMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-end gap-2.5 mb-1"
            >
              {/* Messenger */}
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  toast.success('Đang chuyển hướng sang Facebook Messenger...');
                  window.open('https://m.me', '_blank');
                }}
                className="flex items-center gap-2 px-3 py-2 bg-[#0084FF] hover:bg-[#0078E7] text-white text-xs font-bold rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                <span>Messenger</span>
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessengerIcon className="w-4 h-4 text-white" />
                </div>
              </motion.button>

              {/* Zalo */}
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  toast.success('Đang mở ứng dụng Zalo Official Account...');
                  window.open('https://zalo.me', '_blank');
                }}
                className="flex items-center gap-2 px-3 py-2 bg-[#0068FF] hover:bg-[#0055D4] text-white text-xs font-bold rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                <span>Zalo OA</span>
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                  <ZaloIcon className="text-white" />
                </div>
              </motion.button>

              {/* TikTok */}
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  toast.success('Đang chuyển hướng sang kênh TikTok Shop...');
                  window.open('https://tiktok.com', '_blank');
                }}
                className="flex items-center gap-2 px-3 py-2 bg-[#000000] hover:bg-zinc-900 text-white text-xs font-bold rounded-2xl shadow-lg border border-zinc-700 transition-all cursor-pointer"
              >
                <span>TikTok Shop</span>
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                  <TikTokIcon className="w-4 h-4 text-white" />
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nút Trigger Mở Rộng Kênh Liên Hệ (Sub CTA Button) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsContactMenuOpen(!isContactMenuOpen)}
          className={`relative p-3.5 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center group ${
            isContactMenuOpen
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
          title="Liên hệ tư vấn (Messenger, Zalo, TikTok)"
        >
          {!isContactMenuOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300" />
            </span>
          )}
          {isContactMenuOpen ? (
            <X className="w-5 h-5 font-bold" />
          ) : (
            <Phone className="w-5 h-5 fill-white" />
          )}
        </motion.button>

        {/* Nút Trigger Chat Trực Tuyến Main CTA */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative p-3.5 bg-[#191715] hover:bg-[#282420] text-[#F5C542] border-2 border-[#F5C542]/80 rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center group"
          title="Chat tư vấn trực tuyến"
        >
          <MessageCircle className="w-6 h-6 fill-[#F5C542]/20" />
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-extrabold rounded-full animate-bounce">
            1
          </span>
        </motion.button>

      </div>

    </div>
  );
}
