'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { getUserChats } from '@/actions/direct-message.action';

type ChatPreview = {
  id: string;
  otherUser: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
  lastMessage: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    senderId: string;
    image: string | null; 
    content: string | null; 
    read: boolean;
    chatId: string;          
  } | null;
  unreadCount: number;
  updatedAt: Date;
};

export default function DirectMessagesList() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const data = await getUserChats();
        setChats(data);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
    
    // Refresh chats every 30 seconds
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="p-4 mt-4 bg-white dark:bg-black rounded-lg shadow transition-colors duration-300">
        <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Messages</h2>
        <div className="animate-pulse flex flex-col space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="rounded-full bg-gray-200 dark:bg-gray-600 h-10 w-10"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 mt-4 bg-white dark:bg-black rounded-lg shadow transition-colors duration-300">
      <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Messages</h2>
      
      {chats.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No messages yet</p>
      ) : (
        <div className="flex flex-col space-y-3">
          {chats.map(chat => (
            <Link 
              key={chat.id} 
              href={`/messages/${chat.id}`}
              className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <div className="relative">
                <Image 
                  src={chat.otherUser.image || '/default-avatar.png'} 
                  alt={chat.otherUser.name || chat.otherUser.username} 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
                {chat.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
              
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="font-medium text-gray-900 dark:text-white">{chat.otherUser.name || chat.otherUser.username}</p>
                
                {chat.lastMessage && (
                  <p className="text-sm text-gray-500 dark:text-gray-300 truncate">
                    {chat.lastMessage.senderId === chat.otherUser.id ? (
                      chat.lastMessage.content
                    ) : (
                      <>You: {chat.lastMessage.content}</>
                    )}
                  </p>
                )}
              </div>
              
              {chat.lastMessage && (
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { 
                    addSuffix: true
                  })}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
