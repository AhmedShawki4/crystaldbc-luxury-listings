import { useState, useRef, useEffect, FormEvent } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { properties, Property } from "@/data/properties";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  properties?: Property[];
}

const QUICK_ACTIONS = [
  "Can I schedule a call?",
  "I'm looking to buy a property.",
  "Can you share latest listings?",
];

const getSuggestedReplies = (message: Message): string[] => {
  const base: string[] = [];
  const text = message.text.toLowerCase();

  if (message.properties && message.properties.length > 0) {
    base.push("Show more options", "Schedule a viewing", "Talk to an agent", "Save this listing");
  } else if (text.includes("invest")) {
    base.push("Share top investment areas", "Expected ROI?", "Talk to an agent");
  } else if (text.includes("schedule") || text.includes("call")) {
    base.push("Schedule a call", "Talk to an agent", "Show latest listings");
  } else {
    base.push("Show latest listings", "Talk to an agent", "What are your fees?");
  }

  return Array.from(new Set(base)).slice(0, 4);
};

const isPropertyQuery = (query: string) => {
  const lower = query.toLowerCase();
  return (
    /listing|property|apartment|villa|house|penthouse|chalet/.test(lower) ||
    /(\d+)\s*(million|m|k|thousand|egp|aed)/.test(lower) ||
    /bed|bedroom/.test(lower) ||
    lower.includes("buy") ||
    lower.includes("purchase") ||
    lower.includes("show me")
  );
};

const wantsHumanSupport = (query: string) => {
  const lower = query.toLowerCase();
  return lower.includes("agent") || lower.includes("human") || lower.includes("representative") || lower.includes("advisor");
};

const detectPropertyType = (query: string): string | null => {
  const lower = query.toLowerCase();
  if (lower.includes("apartment")) return "apartment";
  if (lower.includes("villa")) return "villa";
  if (lower.includes("penthouse")) return "penthouse";
  if (lower.includes("chalet")) return "chalet";
  if (lower.includes("house")) return "house";
  return null;
};

const RealEstateChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [showHandoffDialog, setShowHandoffDialog] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [handoffForm, setHandoffForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Show welcome message when chat is first opened
      setMessages([
        {
          id: 1,
          text: "Hello! 👋 I'm your real estate expert from CrystalDBC. I can help you find, buy, sell, or rent properties in Egypt, provide investment advice, share the latest listings, and answer any questions about the Egypt property market. Let me know how I can assist you today! 🏡🌟",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setSuggestedReplies([
        "Show latest listings",
        "Talk to an agent",
        "Share investment tips",
      ]);
    }
  }, [isOpen, messages.length]);

  const filterProperties = (query: string): Property[] => {
    const lowerQuery = query.toLowerCase();

    // Extract price from query
    const priceMatch = query.match(/(\d+)\s*(million|m|k|thousand)/i);
    let maxPrice = Infinity;
    
    if (priceMatch) {
      const number = parseFloat(priceMatch[1]);
      const unit = priceMatch[2].toLowerCase();
      
      if (unit === "million" || unit === "m") {
        maxPrice = number * 1000000;
      } else if (unit === "k" || unit === "thousand") {
        maxPrice = number * 1000;
      }
    }

    // Filter properties based on query
    return properties.filter((property) => {
      const matchesPrice = property.priceValue <= maxPrice;
      
      const matchesType =
        lowerQuery.includes("apartment") ||
        lowerQuery.includes("villa") ||
        lowerQuery.includes("penthouse") ||
        lowerQuery.includes("house") ||
        lowerQuery.includes("estate") ||
        lowerQuery.includes("mansion") ||
        lowerQuery.includes("chalet") ||
        lowerQuery.includes("contemporary")
          ? property.type.toLowerCase().includes(lowerQuery) ||
            lowerQuery.includes(property.type.toLowerCase())
          : true;

      const matchesLocation = property.location
        .toLowerCase()
        .includes(lowerQuery);

      const matchesBeds = (() => {
        const bedsMatch = query.match(/(\d+)\s*(bed|bedroom)/i);
        if (bedsMatch) {
          return property.beds >= parseInt(bedsMatch[1]);
        }
        return true;
      })();

      return matchesPrice && (matchesType || matchesLocation || matchesBeds);
    });
  };

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();

    if (wantsHumanSupport(userMessage)) {
      return {
        id: Date.now(),
        text: "No problem—I can connect you to a live agent. Please share your name, email, and the best phone number. You can also press 'Talk to an agent' below to send your details now.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    // Schedule a call
    if (
      lowerMessage.includes("schedule") ||
      lowerMessage.includes("call") ||
      lowerMessage.includes("appointment")
    ) {
      return {
        id: Date.now(),
        text: "I'd be happy to schedule a call for you! Please contact us at +1 (888) 555-1234 or email info@crystaldbc.com. You can also visit our Contact page for more options. Our team is available Monday-Friday 9 AM - 6 PM, Saturday 10 AM - 4 PM.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    // Looking to buy
    if (
      lowerMessage.includes("buy") ||
      lowerMessage.includes("purchase") ||
      lowerMessage.includes("looking for")
    ) {
      const filteredProps = filterProperties(userMessage);
      
      if (filteredProps.length > 0) {
        return {
          id: Date.now(),
          text: `Great! I found ${filteredProps.length} ${filteredProps.length === 1 ? 'property' : 'properties'} that match your criteria. Here ${filteredProps.length === 1 ? 'is what' : 'are some options'} I found:`,
          sender: "bot",
          timestamp: new Date(),
          properties: filteredProps.slice(0, 3),
        };
      } else {
        return {
          id: Date.now(),
          text: "I'd love to help you find the perfect property! Could you tell me more about what you're looking for? For example:\n\n• Your budget\n• Preferred location\n• Number of bedrooms\n• Property type (villa, apartment, penthouse, etc.)",
          sender: "bot",
          timestamp: new Date(),
        };
      }
    }

    // Share latest listings
    if (
      lowerMessage.includes("latest") ||
      lowerMessage.includes("listings") ||
      lowerMessage.includes("available") ||
      lowerMessage.includes("show me")
    ) {
      const type = detectPropertyType(userMessage);
      const availableText = lowerMessage.includes("available") || lowerMessage.includes("availability");
      const typeFiltered = type ? properties.filter((p) => p.type.toLowerCase().includes(type)) : properties;
      const result = typeFiltered.slice(0, 3);

      return {
        id: Date.now(),
        text: availableText
          ? `Yes, here ${result.length === 1 ? "is" : "are"} the ${type ? `${type} ` : ""}options available right now:`
          : "Here are some of our latest luxury listings:",
        sender: "bot",
        timestamp: new Date(),
        properties: result,
      };
    }

    // Property search with filters
    if (
      lowerMessage.match(/(\d+)\s*(million|k|egp|aed)/i) ||
      lowerMessage.includes("apartment") ||
      lowerMessage.includes("villa") ||
      lowerMessage.includes("bed") ||
      lowerMessage.includes("bedroom")
    ) {
      const filteredProps = filterProperties(userMessage);
      const type = detectPropertyType(userMessage);
      const availableText = lowerMessage.includes("available") || lowerMessage.includes("availability");
      
      if (filteredProps.length > 0) {
        return {
          id: Date.now(),
          text: availableText
            ? `Yes, here ${filteredProps.length === 1 ? "is" : "are"} the ${type ? `${type} ` : ""}options available right now:`
            : `I found ${filteredProps.length} ${filteredProps.length === 1 ? "property" : "properties"} matching your search! Here ${filteredProps.length === 1 ? "it is" : "are the top matches"}:`,
          sender: "bot",
          timestamp: new Date(),
          properties: filteredProps.slice(0, 3),
        };
      } else {
        return {
          id: Date.now(),
          text: "I couldn't find properties matching those exact criteria, but I have many other amazing listings! Would you like to see our featured properties or adjust your search?",
          sender: "bot",
          timestamp: new Date(),
        };
      }
    }

    // Sell/rent property
    if (lowerMessage.includes("sell") || lowerMessage.includes("rent out")) {
      return {
        id: Date.now(),
        text: "Looking to sell or rent out your property? Perfect! 🏡 Our team can help you get the best value. Please contact us at info@crystaldbc.com or call +1 (888) 555-1234 to discuss your property details and get a free valuation.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    // Investment advice
    if (
      lowerMessage.includes("invest") ||
      lowerMessage.includes("investment") ||
      lowerMessage.includes("advice")
    ) {
      return {
        id: Date.now(),
        text: "I'd be happy to provide investment guidance! 💼 The Egypt property market offers excellent opportunities. Our investment specialists can provide personalized advice based on your goals. Would you like to schedule a consultation? You can also browse our premium listings to see current opportunities.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    // Default response
    return {
      id: Date.now(),
      text: "I'm here to help you with all your real estate needs! I can:\n\n• Help you find properties to buy or rent\n• Schedule property viewings\n• Provide market insights\n• Answer questions about listings\n• Connect you with our expert agents\n\nWhat would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    };
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setShowQuickActions(false);
    setSuggestedReplies([]);
    setIsTyping(true);
    setIsLoadingProperties(isPropertyQuery(messageText));

    // Generate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(messageText);
      setMessages((prev) => [...prev, botResponse]);
      setSuggestedReplies(getSuggestedReplies(botResponse));
      setIsTyping(false);
      setIsLoadingProperties(false);

      if (wantsHumanSupport(messageText)) {
        setShowHandoffDialog(true);
      }
    }, 500);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleSuggestedReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
    setIsOpen(false);
  };

  const handleHandoffSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!handoffForm.fullName.trim() || !handoffForm.email.trim()) {
      toast({ title: "Please add your name and email", variant: "destructive" });
      return;
    }

    setIsSubmittingLead(true);

    try {
      await apiClient.post("/leads", {
        ...handoffForm,
        source: "other",
        interestedIn: "Chatbot handoff",
      });

      setIsSubmittingLead(false);
      setShowHandoffDialog(false);
      setHandoffForm({ fullName: "", email: "", phoneNumber: "", message: "" });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Thanks! A human agent will reach out shortly with a tailored response.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setSuggestedReplies(["Call me back", "Share the latest listings"]);
    } catch (error) {
      console.error("Failed to submit handoff", error);
      setIsSubmittingLead(false);
      toast({ title: "Could not send your details", description: "Please try again in a moment.", variant: "destructive" });
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-luxury z-50 group",
          "text-white transition-all duration-500 hover:scale-105",
          "bg-gradient-to-br from-[#FFE53B] via-[#FF7A3D] to-[#FF2525] bg-[length:220%_220%] hover:bg-[position:85%_85%]",
          isOpen && "scale-0"
        )}
        aria-label="Open chat"
      >
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6"
          viewBox="0 0 1000 1000"
          role="img"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M881.1,720.5H434.7L173.3,941V720.5h-54.4C58.8,720.5,10,671.1,10,610.2v-441C10,108.4,58.8,59,118.9,59h762.2C941.2,59,990,108.4,990,169.3v441C990,671.1,941.2,720.5,881.1,720.5L881.1,720.5z M935.6,169.3c0-30.4-24.4-55.2-54.5-55.2H118.9c-30.1,0-54.5,24.7-54.5,55.2v441c0,30.4,24.4,55.1,54.5,55.1h54.4h54.4v110.3l163.3-110.2H500h381.1c30.1,0,54.5-24.7,54.5-55.1V169.3L935.6,169.3z M717.8,444.8c-30.1,0-54.4-24.7-54.4-55.1c0-30.4,24.3-55.2,54.4-55.2c30.1,0,54.5,24.7,54.5,55.2C772.2,420.2,747.8,444.8,717.8,444.8L717.8,444.8z M500,444.8c-30.1,0-54.4-24.7-54.4-55.1c0-30.4,24.3-55.2,54.4-55.2c30.1,0,54.4,24.7,54.4,55.2C554.4,420.2,530.1,444.8,500,444.8L500,444.8z M282.2,444.8c-30.1,0-54.5-24.7-54.5-55.1c0-30.4,24.4-55.2,54.5-55.2c30.1,0,54.4,24.7,54.4,55.2C336.7,420.2,312.3,444.8,282.2,444.8L282.2,444.8z"
          />
        </svg>
        <span className="absolute -top-9 sm:-top-10 px-2 py-1 text-[11px] sm:text-xs bg-amber-400 text-white rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat
        </span>
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:bottom-6 sm:right-6 sm:left-auto w-full sm:w-[420px] h-[85vh] sm:h-[600px] max-h-[85vh] sm:max-h-[600px] bg-background border-t sm:border border-border rounded-t-2xl sm:rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden fade-in">
          {/* Header */}
          <div className="bg-accent text-accent-foreground p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-accent-foreground/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">CrystalDBC Agent</h3>
                <p className="text-[10px] sm:text-xs opacity-90">Online now</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-accent-foreground/10 h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[80%] rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm",
                      message.sender === "user"
                        ? "bg-accent text-accent-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    )}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                    
                    {/* Property Cards */}
                    {message.properties && message.properties.length > 0 && (
                      <div className="mt-2 sm:mt-3 space-y-2">
                        {message.properties.map((property) => (
                          <div
                            key={property.id}
                            onClick={() => handlePropertyClick(property.id)}
                            className="bg-background border border-border rounded-lg p-2 sm:p-3 cursor-pointer hover:border-accent transition-colors"
                          >
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-full h-24 sm:h-32 object-cover rounded mb-1.5 sm:mb-2"
                            />
                            <h4 className="font-semibold text-[10px] sm:text-xs mb-0.5 sm:mb-1 line-clamp-1">
                              {property.title}
                            </h4>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 line-clamp-1">
                              {property.location}
                            </p>
                            <p className="text-accent font-bold text-xs sm:text-sm">
                              {property.price}
                            </p>
                            <div className="flex gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
                              <span>{property.beds} beds</span>
                              <span>•</span>
                              <span>{property.baths} baths</span>
                              <span>•</span>
                              <span>{property.sqft}</span>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-1.5 sm:mt-2 text-xs sm:text-sm h-8 sm:h-9"
                          onClick={() => {
                            navigate("/listings");
                            setIsOpen(false);
                          }}
                        >
                          View All Listings
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm max-w-[75%] sm:max-w-[70%] rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] sm:text-xs">CrystalDBC Agent is typing</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce" />
                        <span className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:80ms]" />
                        <span className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:160ms]" />
                      </div>
                    </div>

                    {isLoadingProperties && (
                      <div className="mt-2 space-y-2">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="bg-background border border-border rounded-lg p-2 sm:p-3 animate-pulse"
                          >
                            <div className="w-full h-20 sm:h-24 bg-muted rounded mb-2" />
                            <div className="h-3 bg-muted rounded w-2/3 mb-1" />
                            <div className="h-3 bg-muted rounded w-1/2 mb-1" />
                            <div className="h-3 bg-muted rounded w-1/3" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {showQuickActions && messages.length === 1 && (
                <div className="flex flex-col gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                  {QUICK_ACTIONS.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="justify-start text-left h-auto py-2 px-2.5 sm:px-3 whitespace-normal text-xs sm:text-sm"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              )}

              {suggestedReplies.length > 0 && !showQuickActions && (
                <div className="flex flex-wrap gap-2 mt-1 sm:mt-2">
                  {suggestedReplies.map((reply) => (
                    <Button
                      key={reply}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedReply(reply)}
                      className="h-auto py-2 px-2.5 sm:px-3 text-xs sm:text-sm"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}

              {/* Human handoff card */}
              <div className="mt-3 sm:mt-4 border border-border bg-muted/30 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold">Need a human?</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Talk directly to an agent for tailored help.</p>
                  </div>
                  <Button size="sm" variant="secondary" className="text-xs sm:text-sm" onClick={() => setShowHandoffDialog(true)}>
                    Talk to an agent
                  </Button>
                </div>
              </div>

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-border bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10 rounded-full px-3 sm:px-4"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-accent hover:bg-accent/90 rounded-full h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                disabled={!inputValue.trim()}
              >
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      <Dialog open={showHandoffDialog} onOpenChange={(open) => !isSubmittingLead && setShowHandoffDialog(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Talk to an agent</DialogTitle>
            <DialogDescription>
              Share your details and a human agent will reach out quickly.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleHandoffSubmit}>
            <Input
              value={handoffForm.fullName}
              onChange={(e) => setHandoffForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="Full name"
              required
            />
            <Input
              type="email"
              value={handoffForm.email}
              onChange={(e) => setHandoffForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              required
            />
            <Input
              value={handoffForm.phoneNumber}
              onChange={(e) => setHandoffForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="Phone (optional)"
            />
            <textarea
              value={handoffForm.message}
              onChange={(e) => setHandoffForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="What do you need help with?"
              className="w-full rounded-md border border-border bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              rows={4}
            />
            <DialogFooter className="flex gap-2 sm:gap-3">
              <Button type="submit" disabled={isSubmittingLead}>
                {isSubmittingLead ? "Sending..." : "Send to agent"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowHandoffDialog(false)} disabled={isSubmittingLead}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RealEstateChatBot;
