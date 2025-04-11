"use client";

import { useState, useRef, useEffect, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Send, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendGroupMessage } from "@/actions/group-message.action";
import ImageUpload from "../ImageUpload";

interface Message {
  id: string;
  content: string | null;
  image: string | null;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
}

interface GroupChatProps {
  messages: Message[];
  groupId: string;
  isJoined: boolean;
}

export default function GroupChat({ messages, groupId, isJoined }: GroupChatProps) {
  const [messageText, setMessageText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if ((!messageText.trim() && !image) || isSubmitting || !isJoined) {
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set("groupId", groupId);
    if (image) {
      formData.set("image", image);
    }
    
    const result = await sendGroupMessage(formData);
    
    if (result.success) {
      setMessageText("");
      setImage(null);
      setShowImageUpload(false);
      formRef.current?.reset();
      router.refresh(); // Refresh to see the new message
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div key={message.id} className="flex items-start">
              <div className="mr-3">
                {message.sender.image ? (
                  <img 
                    src={message.sender.image} 
                    alt={message.sender.name || message.sender.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    {(message.sender.name || message.sender.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="font-medium mr-2">{message.sender.name || message.sender.username}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  {message.content && (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {message.image && (
                    <div className="mt-2">
                      <img 
                        src={message.image} 
                        alt="Message attachment"
                        className="max-w-full rounded-lg max-h-80 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No messages yet. Be the first to send a message!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {showImageUpload && (
        <div className="bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Add Image</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowImageUpload(false);
                setImage(null);
              }}
            >
              Cancel
            </Button>
          </div>
          <ImageUpload
            value={image}
            onChange={(url) => setImage(url)}
            endpoint="messageImage"
            label="Upload an image"
          />
        </div>
      )}
      
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
      >
        {!isJoined ? (
          <div className="flex justify-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              You need to join this group to send messages
            </p>
          </div>
        ) : (
          <div className="flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setShowImageUpload(!showImageUpload)}
            >
              <ImageIcon size={20} />
            </Button>
            
            <Textarea
              name="content"
              placeholder="Type a message..."
              className="flex-1 resize-none"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={1}
              disabled={isSubmitting || !isJoined}
            />
            
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="ml-2"
              disabled={(!messageText.trim() && !image) || isSubmitting || !isJoined}
            >
              <Send size={20} />
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}