'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { getChatById, getChatMessages, sendDirectMessage } from '@/actions/direct-message.action';

type User = {
  id: string;
  username: string;
  name?: string | null;
  image?: string | null;
};

type Message = {
  id: string;
  content?: string | null;
  image?: string | null;
  senderId: string;
  createdAt: Date;
  sender: User;
};

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const router = useRouter();
  const { chatId } = params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);
        
        // Get chat details
        const chatData = await getChatById(chatId);
        setOtherUser(chatData.otherUser);
        
        // Get messages
        const messagesData = await getChatMessages(chatId);
        setMessages(messagesData);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatData();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(async () => {
      try {
        const messagesData = await getChatMessages(chatId);
        setMessages(messagesData);
      } catch (err) {
        console.error('Error polling messages:', err);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [chatId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || sending) return;
    
    try {
      setSending(true);
      
      const formData = new FormData();
      formData.append('chatId', chatId);
      formData.append('content', content);
      
      const result = await sendDirectMessage(formData);
      
      if (result.success) {
        setContent('');
        formRef.current?.reset();
        
        // Refresh messages
        const messagesData = await getChatMessages(chatId);
        setMessages(messagesData);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };
  
  if (loading && !messages.length) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
        <div className="border-b p-4 flex items-center">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="flex-1 p-4"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
        <div className="border-b p-4">
          <button 
            onClick={() => router.back()}
            className="text-blue-500"
          >
            &larr; Back
          </button>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Header - Fixed at top */}
      <div className="border-b p-3 flex items-center bg-white dark:bg-gray-900 z-10 flex-shrink-0">
        <button 
          onClick={() => router.back()}
          className="text-blue-500 mr-4"
        >
          &larr;
        </button>
        
        {otherUser && (
          <div className="flex items-center">
            <Image 
              src={otherUser.image || '/default-avatar.png'} 
              alt={otherUser.name || otherUser.username} 
              width={40} 
              height={40} 
              className="rounded-full"
            />
            <div className="ml-3">
              <p className="font-medium">{otherUser.name || otherUser.username}</p>
              <p className="text-sm text-gray-500">@{otherUser.username}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Messages - Scrollable area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Send your first message!</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`flex ${message.sender.id === otherUser?.id ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`
                    max-w-[70%] p-3 rounded-lg
                    ${message.sender.id === otherUser?.id 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                      : 'bg-blue-500 text-white'}
                  `}
                >
                  {message.content && <p>{message.content}</p>}
                  {message.image && (
                    <Image 
                      src={message.image} 
                      alt="Message attachment" 
                      width={200} 
                      height={200} 
                      className="mt-2 rounded-md"
                    />
                  )}
                  <p 
                    className={`
                      text-xs mt-1 
                      ${message.sender.id === otherUser?.id 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-blue-100'}
                    `}
                  >
                    {formatDistanceToNow(new Date(message.createdAt), { 
                      addSuffix: false
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input - Fixed at bottom */}
      <div className="border-t p-3 bg-white dark:bg-gray-900 flex-shrink-0">
        <form ref={formRef} onSubmit={handleSubmit} className="flex w-full">
          <input
            type="text"
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="text-white px-4 py-2 rounded-r-lg disabled:opacity-50 transition-colors
              bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}