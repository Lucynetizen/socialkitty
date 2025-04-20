'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createChat } from '@/actions/direct-message.action';

type ChatButtonProps = {
  userId: string;
  className?: string;
};

export default function ChatButton({ userId, className = '' }: ChatButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleChat = async () => {
    try {
      setLoading(true);
      const chatId = await createChat(userId);
      router.push(`/messages/${chatId}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('Could not start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleChat}
      disabled={loading}
      className={`text-sm flex items-center justify-center px-3 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors ${loading ? 'opacity-70' : ''} ${className}`}
    >
      {loading ? 'Loading...' : 'Message'}
    </button>
  );
}