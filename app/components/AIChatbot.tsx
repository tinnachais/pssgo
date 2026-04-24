'use client';

import { useChat } from 'ai/react';
import { type Message } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { usePathname } from 'next/navigation';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Hide completely on /liff pages (not /liff-users)
  if (pathname === '/liff' || pathname?.startsWith('/liff/')) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-105 transition-all z-[100] ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col z-[100] transition-all origin-bottom-right duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">GP AI Assistant</h3>
              <p className="text-xs text-blue-100">à¸œà¸¹à¹‰à¸Šà¹ˆà¸§à¸¢à¸ªà¹ˆà¸§à¸™à¸•à¸±à¸§à¸‚à¸­à¸‡à¸„à¸¸à¸“</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-zinc-900/50 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-zinc-400">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Bot size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-gray-700 dark:text-zinc-300 mb-1">à¸ªà¸§à¸±à¸ªà¸”à¸µà¸„à¸£à¸±à¸š!</h4>
              <p className="text-sm">à¸œà¸¡à¸„à¸·à¸­à¸œà¸¹à¹‰à¸Šà¹ˆà¸§à¸¢ AI à¸›à¸£à¸°à¸ˆà¸³à¸£à¸°à¸šà¸š GP<br/>à¸¡à¸µà¸­à¸°à¹„à¸£à¹ƒà¸«à¹‰à¸œà¸¡à¸Šà¹ˆà¸§à¸¢à¹à¸™à¸°à¸™à¸³à¸«à¸£à¸·à¸­à¸ªà¸­à¸™à¸à¸²à¸£à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¹„à¸«à¸¡à¸„à¸£à¸±à¸š?</p>
            </div>
          ) : (
            messages.map((m: Message) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                    <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}

                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 rounded-tl-sm'
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium transition-colors"
                        />
                      ),
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 border border-gray-300 dark:border-zinc-600">
                    <User size={16} className="text-gray-600 dark:text-zinc-300" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="px-4 py-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 rounded-tl-sm flex items-center gap-1 shadow-sm">
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              handleSubmit(e);
            } catch (err) {
              console.error('Chat submit error:', err);
            }
          }}
          className="p-3 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-b-2xl flex gap-2"
        >
          <input
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all shadow-inner"
            value={input}
            placeholder="à¸žà¸´à¸¡à¸žà¹Œà¸„à¸³à¸–à¸²à¸¡à¸—à¸µà¹ˆà¸™à¸µà¹ˆ..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send size={18} className={isLoading ? 'opacity-50' : ''} />
          </button>
        </form>
      </div>
    </>
  );
}
