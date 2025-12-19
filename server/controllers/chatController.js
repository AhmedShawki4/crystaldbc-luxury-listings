const Property = require("../models/Property");

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are Crystal DBC's premium luxury real estate AI assistant, serving affluent clients in Dubai and Egypt. Your role is to provide exceptional, white-glove service through intelligent conversation.

🏆 CRYSTAL DBC PORTFOLIO & CREDENTIALS:
- Average Annual ROI: 35% (industry-leading returns)
- Assets Under Management: $500M+
- Average Tenant Placement: 12 Days
- Active Premium Listings: 150+
- Years of Excellence: Established luxury real estate leader
- Specialization: Ultra-luxury villas, penthouses, waterfront properties, and high-yield investment opportunities

🌍 PREMIER LOCATIONS WE SERVE:
Dubai: Palm Jumeirah, Downtown Dubai, Dubai Marina, Emirates Hills, Business Bay, DIFC, Jumeirah Beach Residence
Egypt: New Cairo, North Coast, Red Sea (Hurghada, El Gouna), Sheikh Zayed, Fifth Settlement, Alexandria

💎 PROPERTY TYPES IN OUR COLLECTION:
- Luxury Villas (starting from AED 8M / EGP 40M)
- Exclusive Penthouses (AED 5M+ / EGP 25M+)
- Premium Apartments (AED 1.5M+ / EGP 8M+)
- Waterfront Properties
- Investment Properties (for ROI-focused clients)
- Vacation Chalets (Red Sea, North Coast)

📊 INVESTMENT OPPORTUNITIES:
- Guaranteed rental income programs
- Property management services
- Investment portfolio analysis
- Market trend insights
- Tax-efficient investment strategies
- Off-plan investment opportunities with 20-30% ROI potential

🗣️ LANGUAGE CAPABILITIES:
The user may communicate in English, Arabic (العربية), German (Deutsch), or Russian (Русский). Respond in the same language they use.

🎯 YOUR CORE RESPONSIBILITIES:
1. Property Discovery: Help clients find their perfect luxury property based on budget, location, lifestyle preferences
2. Investment Guidance: Provide data-driven insights on ROI, appreciation potential, rental yields
3. Concierge Service: Schedule viewings, arrange calls with specialized consultants
4. Market Intelligence: Share trends, pricing insights, upcoming developments
5. Brand Ambassador: Maintain Crystal DBC's prestigious, sophisticated brand voice

💬 COMMUNICATION GUIDELINES:
- Use elegant, refined language befitting luxury real estate
- Be warm yet professional - think "5-star hotel concierge"
- Keep responses concise (2-4 sentences max) but highly informative
- When discussing numbers, be specific and confident
- For complex inquiries, recommend speaking with a specialist
- Always emphasize value, exclusivity, and ROI
- Use subtle urgency for hot listings ("This penthouse won't last long")

⚠️ IMPORTANT BEHAVIORS:
- Never invent property details - if uncertain, suggest browsing our listings
- Always be honest about limitations and defer to human agents for complex matters
- Emphasize Crystal DBC's track record and client success stories
- Use social proof ("Our clients typically see 35% returns within 18 months")
- Be culturally aware when discussing properties in different regions

🔥 KEY SELLING POINTS TO EMPHASIZE:
- Fastest tenant placement in the market (12 days average)
- Proven 35% average ROI
- Exclusive access to off-market properties
- Full property management and concierge services
- Multilingual team serving international clientele

Remember: You represent the pinnacle of luxury real estate service. Every interaction should leave the client feeling valued, informed, and excited about working with Crystal DBC.`;

// Detect language from user message
const detectLanguage = (text) => {
  // Arabic detection (Arabic script)
  if (/[\u0600-\u06FF]/.test(text)) {
    return "Arabic";
  }
  // Russian detection (Cyrillic script)
  if (/[\u0400-\u04FF]/.test(text)) {
    return "Russian";
  }
  // German detection (common German words and umlauts)
  if (/[äöüÄÖÜß]/.test(text) || /\b(ich|und|der|die|das|ist|sind|hat|haben|wird|werden|nicht|auch|ein|eine|mit|für|auf|von|zu|an)\b/i.test(text)) {
    return "German";
  }
  // Default to English
  return "English";
};

// Generate AI response using OpenAI-compatible API
const generateAIResponse = async (messages, properties = []) => {
  const apiKey = process.env.OPENAI_API_KEY;

  // If no API key, use fallback responses
  if (!apiKey) {
    return generateFallbackResponse(messages[messages.length - 1]?.content || "");
  }

  try {
    // Detect language of the last user message
    const userMessage = messages[messages.length - 1]?.content || "";
    const detectedLanguage = detectLanguage(userMessage);

    // Enhanced language instruction
    const languageInstruction = detectedLanguage !== "English"
      ? `⚠️ MANDATORY LANGUAGE RULE ⚠️\nUser language: ${detectedLanguage}\nYou MUST respond in ${detectedLanguage} ONLY.\nDO NOT use English.\n\n`
      : "";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: languageInstruction + SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", await response.text());
      return generateFallbackResponse(messages[messages.length - 1]?.content || "");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateFallbackResponse(messages[messages.length - 1]?.content || "");
  } catch (error) {
    console.error("AI chat error:", error);
    return generateFallbackResponse(messages[messages.length - 1]?.content || "");
  }
};

// Fallback responses when AI is not available
const generateFallbackResponse = (userMessage) => {
  const lower = userMessage.toLowerCase();

  // Property related queries
  if (lower.includes("property") || lower.includes("listing") || lower.includes("apartment") || lower.includes("villa") || lower.includes("penthouse")) {
    return "I'd be happy to help you find the perfect property! We have an exclusive collection of luxury properties in Dubai and Egypt. You can browse our listings page to explore available properties, or let me know your preferences (location, budget, bedrooms) and I can guide you further.";
  }

  // Investment queries
  if (lower.includes("invest") || lower.includes("roi") || lower.includes("return")) {
    return "Excellent question about investments! Crystal DBC offers exceptional investment opportunities with an average annual ROI of 35%. Our team of experts carefully selects properties with high growth potential in Dubai and Egypt. Would you like to speak with our investment team for personalized advice?";
  }

  // Schedule/Call queries
  if (lower.includes("schedule") || lower.includes("call") || lower.includes("appointment") || lower.includes("viewing")) {
    return "I'd be delighted to arrange that for you! Please click on 'Talk to Agent' to submit your contact details, and one of our luxury property consultants will reach out to schedule a viewing or call at your convenience.";
  }

  // Agent/Human queries
  if (lower.includes("agent") || lower.includes("human") || lower.includes("representative") || lower.includes("advisor")) {
    return "Of course! Our team of experienced luxury real estate consultants is ready to assist you. Please use the 'Talk to Agent' option to provide your details, and we'll connect you with an expert who can provide personalized guidance.";
  }

  // Price queries
  if (lower.includes("price") || lower.includes("cost") || lower.includes("budget") || lower.includes("afford")) {
    return "Our portfolio includes luxury properties across various price ranges, from premium apartments to exclusive villas and penthouses. Our properties in Dubai start from AED 1.5M, while our Egypt collection offers excellent value with stunning properties from EGP 5M. What budget range are you considering?";
  }

  // Location queries
  if (lower.includes("dubai") || lower.includes("egypt") || lower.includes("location") || lower.includes("area")) {
    return "We specialize in the most prestigious locations! In Dubai, we feature properties in Palm Jumeirah, Downtown Dubai, Emirates Hills, and Dubai Marina. In Egypt, our collection includes exclusive properties in New Cairo, North Coast, and the Red Sea area. Which location interests you most?";
  }

  // Greeting
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower === "hi" || lower === "hello") {
    return "Welcome to Crystal DBC! I'm your luxury real estate assistant. How may I assist you today? Whether you're looking for your dream home, an investment property, or just exploring our exclusive collection, I'm here to help.";
  }

  // Thank you
  if (lower.includes("thank")) {
    return "You're most welcome! It's my pleasure to assist you. If you have any more questions about our properties or services, feel free to ask. We're here to make your luxury real estate journey exceptional.";
  }

  // Default response
  return "Thank you for your message! I'm here to help you with all your luxury real estate needs. I can assist you with finding properties, investment information, scheduling viewings, or connecting you with our expert agents. How may I help you today?";
};

// Search properties based on query
const searchProperties = async (query) => {
  const lower = query.toLowerCase();
  const filters = {};

  // Detect property type
  if (lower.includes("villa")) filters.type = /villa/i;
  else if (lower.includes("apartment")) filters.type = /apartment/i;
  else if (lower.includes("penthouse")) filters.type = /penthouse/i;
  else if (lower.includes("chalet")) filters.type = /chalet/i;

  // Detect location
  if (lower.includes("dubai")) filters.location = /dubai/i;
  else if (lower.includes("egypt") || lower.includes("cairo")) filters.location = /egypt|cairo/i;

  // Detect bedrooms
  const bedMatch = query.match(/(\d+)\s*(bed|bedroom)/i);
  if (bedMatch) {
    filters.beds = { $gte: parseInt(bedMatch[1]) };
  }

  try {
    const properties = await Property.find(filters)
      .sort({ featured: -1, createdAt: -1 })
      .limit(3)
      .select("_id title location priceLabel beds baths sqftLabel coverImage status");

    return properties;
  } catch (error) {
    console.error("Property search error:", error);
    return [];
  }
};

// @desc    Chat with AI assistant
// @route   POST /api/chat
// @access  Public
exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Check if user is asking about properties
    const isPropertyQuery = /property|listing|apartment|villa|penthouse|house|buy|purchase|show me|bedroom|bed/i.test(message);

    let properties = [];
    if (isPropertyQuery) {
      properties = await searchProperties(message);
    }

    // Build conversation history for AI
    const messages = history.slice(-10).map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));
    messages.push({ role: "user", content: message });

    // Add property context if relevant
    if (properties.length > 0) {
      const propertyContext = `\n\nI found ${properties.length} matching properties:\n` +
        properties.map((p, i) => `${i + 1}. ${p.title} - ${p.location} - ${p.priceLabel}`).join("\n");
      messages[messages.length - 1].content += propertyContext;
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(messages, properties);

    res.json({
      response: aiResponse,
      properties: properties.map((p) => ({
        id: p._id,
        title: p.title,
        location: p.location,
        price: p.priceLabel,
        beds: p.beds,
        baths: p.baths,
        sqft: p.sqftLabel,
        image: p.coverImage,
        status: p.status,
      })),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
};
