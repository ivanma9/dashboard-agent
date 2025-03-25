"use client";


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { marked } from 'marked';
import { useQuery } from '@tanstack/react-query';


const AWSAgent = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>(['Agent: How can I assist you today?']);
  const [isLoading, setIsLoading] = useState(false);

  const { data: userData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      
      return data.users;
    }
  });

  const sampleMessages = [
    "How many users are there in my account?",
    "Update contact info",
    "Send a custom email",
    "Technical support needed"
  ];

  const handleSampleMessage = async (sample: string) => {
    if (!userData) {
      toast.error('User data is not available yet');
      return;
    }

    const newChatHistory = [...chatHistory, `You: ${sample}`];
    setChatHistory(newChatHistory);
    setIsLoading(true);
    try {
      console.log("About to send userData:", userData);
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sample,
          userData // Include userData in the request
        }),
      });
      const data = await response.json();
      
      // Handle the structured response
      let newMessage;
      if (data.parsed && data.parsed.text) {
        newMessage = data.parsed.text;
        
        // If there was an action performed, add it to the chat
        if (data.parsed.action && data.parsed.actionResult) {
          const actionResult = data.parsed.actionResult;
          const actionType = data.parsed.action.action;
          
          // Add action result message
          newMessage += `\n\n**Action Performed**: ${actionType}`;
          
          if (actionResult.success) {
            newMessage += `\n**Result**: Success`;
            if (actionType === 'sendEmail') {
              newMessage += `\nEmail sent to: ${data.parsed.action.recipient}`;
            }
          } else {
            newMessage += `\n**Result**: Failed - ${actionResult.message || 'Unknown error'}`;
          }
        }
      } else {
        // Fallback to old format if parsing fails
        newMessage = data.choices[0].message.content;
      }

      const formattedMessage = `**Response from Agent:** ${newMessage}`;
      const markedMessage = marked(formattedMessage);
      
      setChatHistory((prev) => [...prev, markedMessage as string]);
    } catch (error: unknown) {
      console.error('Message handling error:', error);
      setChatHistory([...newChatHistory, `Agent: Sorry, I encountered an error. Please try again.`]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const lastThreeUserMessages = chatHistory.filter((_, index) => index % 2 === 1).slice(-3);
    console.log("Last three user messages:", lastThreeUserMessages);
    
    const newChatHistory = [...chatHistory, `You: ${message}`];
    
    setChatHistory(newChatHistory);
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pastUserMessages: lastThreeUserMessages,
          sample: message,
          userData
        }),
      });
      const data = await response.json();

      // Handle the structured response
      let newMessage;
      if (data.parsed && data.parsed.text) {
        newMessage = data.parsed.text;
        
        // If there was an action performed, add it to the chat
        if (data.parsed.action && data.parsed.actionResult) {
          const actionResult = data.parsed.actionResult;
          const actionType = data.parsed.action.action;
          
          // Add action result message
          newMessage += `\n\n**Action Performed**: ${actionType}`;
          
          if (actionResult.success) {
            newMessage += `\n**Result**: Success`;
            if (actionType === 'sendEmail') {
              newMessage += `\nEmail sent to: ${data.parsed.action.recipient}`;
            }
          } else {
            newMessage += `\n**Result**: Failed - ${actionResult.error || 'Unknown error'}`;
          }
        }
      } else {
        // Fallback to old format if parsing fails
        newMessage = data.choices[0].message.content;
      }

      const formattedMessage = `**Response from Agent:** ${newMessage}`;
      const markedMessage = marked(formattedMessage);

      setChatHistory((prev) => [...prev, markedMessage as string]);
    } catch (error: unknown) {
      console.error('Message handling error:', error);
      setChatHistory([...newChatHistory, `Agent: Sorry, I encountered an error. Please try again.`]);
    } finally {
      setIsLoading(false);
    }
    setMessage('');
  };

  return (
    <div className="chat-component flex flex-col h-full">
      <h1>AWS Agent</h1>
      <div className="chat-history flex-1 overflow-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => {
          
          // Handle regular text messages
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
                dangerouslySetInnerHTML={{ __html: msg }}
              />
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg max-w-[80%] bg-primary text-primary-foreground">
              Agent: typing...
            </div>
          </div>
        )}
      </div>
      <div className="sample-messages flex flex-wrap gap-2 px-4 py-2">
        {sampleMessages.map((sample, index) => (
          <button
            key={index}
            onClick={() => handleSampleMessage(sample)}
            className="px-3 py-1 text-sm rounded-full bg-blue-600 text-white 
              hover:bg-blue-500 hover:scale-105 
              active:bg-blue-800 active:scale-95 
              transition-all duration-150"
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

