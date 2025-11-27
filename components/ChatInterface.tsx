import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, RefreshCcw, Copy, Check } from 'lucide-react';
import { Chat, GenerateContentResponse } from '@google/genai';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Message, ModelId } from '../types';
import { Button } from './Button';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>(ModelId.FLASH);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Chat
  useEffect(() => {
    chatRef.current = createChatSession(selectedModel);
    
    // Welcome message
    setMessages([{
      id: 'welcome',
      role: 'model',
      content: `Hello! I'm Open WebUI, powered by **${selectedModel}**. How can I help you optimize your workflow today?`,
      timestamp: new Date()
    }]);
  }, [selectedModel]);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Model Change
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value as ModelId);
    setMessages([]); // Clear chat on model switch for simplicity in this demo
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatRef.current || isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Add Placeholder for Model Response
      const modelMessageId = (Date.now() + 1).toString();
      const modelMessage: Message = {
        id: modelMessageId,
        role: 'model',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };
      setMessages(prev => [...prev, modelMessage]);

      const stream = await sendMessageStream(chatRef.current, userMessageText);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        const chunkText = (chunk as GenerateContentResponse).text || '';
        fullText += chunkText;
        
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, content: fullText }
            : msg
        ));
      }

       setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        ));

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "I apologize, but I encountered an error connecting to the AI service. Please ensure your API Key is configured correctly.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Basic Text Formatter for code blocks and bold text since we aren't using a heavy markdown library
  const formatText = (text: string) => {
    const lines = text.split('\n');
    let inCodeBlock = false;

    return lines.map((line, idx) => {
      // Toggle code block
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return null; // Don't render the backticks line
      }

      if (inCodeBlock) {
        return <div key={idx} className="bg-slate-950 font-mono text-xs sm:text-sm p-1 px-2 my-0.5 text-emerald-400 rounded-sm border-l-2 border-emerald-500 overflow-x-auto whitespace-pre">{line}</div>;
      }

      // Basic formatting for bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} className={`min-h-[1.5rem] ${line.trim() === '' ? 'h-4' : ''}`}>
          {parts.map((part, pIdx) => {
             if (part.startsWith('**') && part.endsWith('**')) {
               return <strong key={pIdx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
             }
             return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      {/* Chat Header */}
      <div className="h-16 border-b border-slate-700/50 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <Sparkles className="h-5 w-5 text-indigo-400" />
           <h2 className="font-semibold text-slate-100">Assistant</h2>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedModel} 
            onChange={handleModelChange}
            className="bg-slate-800 border border-slate-700 text-xs sm:text-sm rounded-lg px-3 py-1.5 text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value={ModelId.FLASH}>Gemini Flash 2.5 (Fast)</option>
            <option value={ModelId.PRO}>Gemini Pro 3 (Reasoning)</option>
          </select>
          <button onClick={() => setMessages([])} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-indigo-900/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}
            
            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-5 py-3.5 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-700 text-white rounded-br-none' 
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'
              }`}>
                <div className="text-sm leading-relaxed">
                  {msg.role === 'user' ? msg.content : formatText(msg.content)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-1.5 ml-1">
                 <span className="text-[10px] text-slate-500 font-medium">
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
                 {msg.role === 'model' && !msg.isStreaming && (
                    <button className="text-slate-600 hover:text-slate-400 transition-colors" title="Copy">
                      <Copy className="h-3 w-3" />
                    </button>
                 )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="h-5 w-5 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/50 flex items-center justify-center flex-shrink-0 mt-1">
                   <Bot className="h-5 w-5 text-white/50" />
                </div>
                <div className="flex items-center gap-1 mt-3">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur">
        <div className="max-w-4xl mx-auto relative bg-slate-800 rounded-xl border border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 px-4 py-3.5 pr-14 focus:outline-none resize-none max-h-[200px] overflow-y-auto rounded-xl"
            style={{ minHeight: '52px' }}
          />
          <div className="absolute right-2 bottom-2">
            <Button 
                size="sm" 
                variant="primary" 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="h-9 w-9 p-0 rounded-lg"
            >
                <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-2">
            AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};