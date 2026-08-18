'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  ArrowUp, 
  X, 
  Send, 
  Bot, 
  CheckCheck
} from 'lucide-react';

export default function FloatingCTA() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{ id: number; sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Bạn cần tư vấn về sản phẩm Cacao hoặc Snack Thái Lan nào ạ?',
      time: '12:00',
    },
  ]);

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
    const userMsg = { id: Date.now(), sender: 'user' as const, text: query, time: timeStr };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    setTimeout(() => {
      let botReplyText = 'Cảm ơn bạn đã liên hệ! Tư vấn viên sẽ hỗ trợ bạn ngay lập tức.';
      if (query.toLowerCase().includes('bento')) {
        botReplyText = 'Snack Bento có các vị: Cay Ngọt (Đỏ), Siêu Cay (Cam) và Mực Nướng (Xanh). Bạn cần tư vấn chọn loại nào?';
      } else if (query.toLowerCase().includes('ship') || query.toLowerCase().includes('phí')) {
        botReplyText = 'Shop miễn phí giao hàng toàn quốc cho đơn từ 500k. Đơn nội thành giao hỏa tốc trong 2 giờ!';
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
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 pointer-events-none">
      
      {/* Live Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-auto w-[340px] sm:w-[360px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[460px]"
          >
            {/* Header */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Hỗ trợ trực tuyến</h3>
                  <span className="text-[10px] text-slate-400">Phản hồi thường trong 5 phút</span>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Chat Messages */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl font-normal leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                    {msg.time} {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                'Tư vấn vị Bento',
                'Phí ship & Freeship',
                'Tra cứu đơn hàng',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-[10px] font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 border border-slate-200/60"
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
              className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer"
                title="Gửi"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        
        {/* Back to Top */}
        <AnimatePresence>
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="p-2.5 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer hover:border-blue-300"
              title="Cuộn lên đầu trang"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </AnimatePresence>

        {/* Chat Trigger Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all cursor-pointer border border-blue-600 flex items-center justify-center"
          title="Hỗ trợ trực tuyến"
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </button>

      </div>

    </div>
  );
}
