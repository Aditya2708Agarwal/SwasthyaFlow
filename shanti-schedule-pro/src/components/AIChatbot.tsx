import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, Send, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  text: string;
  isBot: boolean;
  isLoading?: boolean;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your Ayurvedic assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI('AIzaSyBk_SVe3csCU0D20dZECX8BWjcP6WcExzg');

  const generateResponse = async (userInput: string) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    try {
      const prompt = `You are an Ayurvedic healthcare assistant. Provide accurate, helpful information about Ayurvedic treatments, wellness, and healthcare practices. Keep responses concise and focused on Ayurvedic principles.

Question: ${userInput}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      if (error instanceof Error) {
        if (error.message?.includes('404')) {
          return 'Service temporarily unavailable. Please try again later.';
        }
        if (error.message?.includes('401')) {
          return 'Authentication error. Please contact support.';
        }
      }
      return 'I apologize, but I encountered an error. Please try again.';
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);

    try {
      // Add loading message
      setMessages(prev => [...prev, {
        text: "Thinking...",
        isBot: true,
        isLoading: true
      }]);

      // Get AI response
      const response = await generateResponse(userMessage);

      // Replace loading message with actual response
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(msg => msg.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            text: response,
            isBot: true,
            isLoading: false
          };
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Error in chat:', error);
      // Remove loading message and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        return [...withoutLoading, {
          text: "I apologize, but I encountered an error. Please try again.",
          isBot: true
        }];
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
      >
        {isOpen ? <X /> : <MessageCircle />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-[350px] h-[500px] shadow-xl flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b bg-primary text-primary-foreground">
            <h3 className="font-semibold">Ayurvedic Assistant</h3>
            <p className="text-xs opacity-75">Ask me anything about Ayurvedic treatments</p>
          </div>

          {/* Chat Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground'
                  } ${message.isLoading ? 'animate-pulse' : ''}`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.isLoading && (
                    <div className="flex space-x-1 mt-2">
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-150" />
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-300" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>

          {/* Chat Input */}
          <div className="p-4 border-t mt-auto">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIChatbot;