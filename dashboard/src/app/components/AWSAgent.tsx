"use client";
import React, { useState } from 'react';
import { AWSEmailAgent } from '@/utils/awsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User } from '@/utils/awsService';

const AWSAgent = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>(['Agent: How can I assist you today?']);

  const sampleMessages = [
    "How many users are there in my account?",
    "Update my contact info",
    "Schedule a meeting",
    "Technical support needed"
  ];

  const handleSampleMessage = async (sample: string) => {
    fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.OPEN_ROUTER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "rekaai/reka-flash-3:free",
          "messages": [
            {
              "role": "system",
              "content": "You are a helpful assistant that specializes with the user management and integrates AWS tools to help with tasks."
            },
            {
              "role": "user",
              "content": sample
            }
          ]
        })
      });
    // const user: User = {
    //   name: 'John Doe',
    //   email: 'john.doe@example.com',
    //   phone: '+1234567890',
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    //   deletedAt: null
    // };

    // setChatHistory((prev) => [...prev, `You: ${sample}`]);
    
    // const response = await AWSEmailAgent.sendUserNotification(user, 'created');
    // if (response.success) {
    //   setChatHistory((prev) => [...prev, `Agent: ${response.message}`]);
    // } else {
    //   toast.error(response.message);
    // }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const user: User = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null
    };

    const response = await AWSEmailAgent.sendUserNotification(user, 'created');
    if (response.success) {
      setChatHistory((prev) => [...prev, `You: ${message}`, `Agent: ${response.message}`]);
      setMessage('');
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="chat-component flex flex-col h-full">
      <h1>AWS Agent</h1>
      <div className="chat-history flex-1 overflow-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => {
          const isUser = msg.startsWith('You:');
          return (
            <div
              key={index}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {msg}
              </div>
            </div>
          );
        })}
      </div>
      <div className="sample-messages flex flex-wrap gap-2 px-4 py-2">
        {sampleMessages.map((sample, index) => (
          <button
            key={index}
            onClick={() => handleSampleMessage(sample)}
            className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            {sample}
          </button>
        ))}
      </div>
      <footer className="chat-input flex justify-between p-4" onKeyDown={(e) => e.key === 'Enter' ? handleSendMessage() : null}>
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </footer>
    </div>
  );
};

export default AWSAgent;
