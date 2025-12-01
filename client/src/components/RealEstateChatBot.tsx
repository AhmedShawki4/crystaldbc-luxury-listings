import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { properties, Property } from "@/data/properties";
import { cn } from "@/lib/utils";
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

const RealEstateChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    }
  }, [isOpen]);

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

    // Schedule a call
    if (
      lowerMessage.includes("schedule") ||
      lowerMessage.includes("call") ||
      lowerMessage.includes("appointment")
    ) {
      return {
        id: Date.now(),
        text: "I'd be happy to schedule a call for you! � Please contact us at +1 (888) 555-1234 or email info@crystaldbc.com. You can also visit our Contact page for more options. Our team is available Monday-Friday 9 AM - 6 PM, Saturday 10 AM - 4 PM.",
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
      return {
        id: Date.now(),
        text: "Here are some of our latest luxury listings:",
        sender: "bot",
        timestamp: new Date(),
        properties: properties.slice(0, 3),
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
      
      if (filteredProps.length > 0) {
        return {
          id: Date.now(),
          text: `I found ${filteredProps.length} ${filteredProps.length === 1 ? 'property' : 'properties'} matching your search! Here ${filteredProps.length === 1 ? 'it is' : 'are the top matches'}:`,
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

    // Generate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(messageText);
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-luxury z-50",
          "bg-accent hover:bg-accent/90 text-accent-foreground",
          "transition-all duration-300 hover-lift",
          isOpen && "scale-0"
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
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
    </>
  );
};

export default RealEstateChatBot;
