import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  canvasContext?: {
    sectionTitle: string;
    sectionSubtitle: string;
    currentContent: string;
    projectData?: any;
  };
}

export const AIChat = ({ isOpen, onClose, canvasContext }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: canvasContext 
        ? `Hi! I'm here to help you with "${canvasContext.sectionTitle}". What would you like to know?`
        : "Hi! I'm here to help you with your canvas. What would you like to know?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-canvas-chat`;
      
      const conversationHistory = messages
        .map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text
        }));

      conversationHistory.push({
        role: "user",
        content: newMessage
      });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: conversationHistory,
          canvasContext 
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please wait a moment.",
            variant: "destructive",
          });
          return;
        }
        if (resp.status === 402) {
          toast({
            title: "Usage Limit",
            description: "AI usage limit reached. Please add credits.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to get response");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let textBuffer = "";
      let streamDone = false;

      // Create assistant message placeholder
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        text: "",
        sender: "assistant",
        timestamp: new Date(),
      }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantText += content;
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, text: assistantText }
                  : m
              ));
            }
          } catch (e) {
            console.error("Error parsing SSE:", e);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[70] w-[420px] h-[600px] glass rounded-lg shadow-elegant border border-border/50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary animate-pulse" />
          <div>
            <h3 className="font-semibold text-foreground">AI Assistant</h3>
            {canvasContext && (
              <p className="text-xs text-muted-foreground">{canvasContext.sectionTitle}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover-scale"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-muted to-muted/80 text-foreground border border-border/50"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 border border-border/50">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask me anything about this section..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            disabled={isLoading}
            className="gradient-primary text-white hover-glow shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
