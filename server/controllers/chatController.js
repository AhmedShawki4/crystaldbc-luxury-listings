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

    // LOG FOR DEBUGGING
    console.log("🌍 Language Detection:", {
      userMessage: userMessage.substring(0, 50),
      detectedLanguage,
      hasApiKey: !!apiKey
    });

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
        model: "gpt-4o-mini", // Forcing a valid model that supports multi-language
        messages: [
          { role: "system", content: languageInstruction + SYSTEM_PROMPT },
          ...messages,
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API error:", response.status, errorText);
      return generateFallbackResponse(messages[messages.length - 1]?.content || "");
    }

    const data = await response.json();

    // LOG THE FULL DATA FOR DEBUGGING
    console.log("🔍 OpenAI Full Data:", JSON.stringify(data, null, 2));

    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.warn("⚠️ No AI content found in response, using fallback.");
      return generateFallbackResponse(messages[messages.length - 1]?.content || "");
    }

    // LOG THE AI RESPONSE
    console.log("✅ AI Response (first 100 chars):", aiResponse.substring(0, 100));

    return aiResponse;
  } catch (error) {
    console.error("❌ AI chat error:", error.message);
    return generateFallbackResponse(messages[messages.length - 1]?.content || "");
  }
};

// Fallback responses when AI is not available
const generateFallbackResponse = (userMessage) => {
  const lower = userMessage.toLowerCase();
  const lang = detectLanguage(userMessage);

  const fallbacks = {
    English: {
      property: "I'd be happy to help you find the perfect property! We have an exclusive collection of luxury properties in Dubai and Egypt. You can browse our listings page to explore available properties, or let me know your preferences (location, budget, bedrooms) and I can guide you further.",
      invest: "Excellent question about investments! Crystal DBC offers exceptional investment opportunities with an average annual ROI of 35%. Our team of experts carefully selects properties with high growth potential in Dubai and Egypt. Would you like to speak with our investment team for personalized advice?",
      schedule: "I'd be delighted to arrange that for you! Please click on 'Talk to Agent' to submit your contact details, and one of our luxury property consultants will reach out to schedule a viewing or call at your convenience.",
      agent: "Of course! Our team of experienced luxury real estate consultants is ready to assist you. Please use the 'Talk to Agent' option to provide your details, and we'll connect you with an expert who can provide personalized guidance.",
      price: "Our portfolio includes luxury properties across various price ranges, from luxury apartments to exclusive villas. Dubai properties start from AED 1.5M, and Egypt from EGP 8M. What budget are you considering?",
      general: "Thank you for your message! I'm here to help you with all your luxury real estate needs in Dubai and Egypt. How may I help you today?"
    },
    Arabic: {
      property: "يسعدني مساعدتك في العثور على العقار المثالي! لدينا مجموعة حصرية من العقارات الفاخرة في دبي ومصر. يمكنك تصفح صفحة القوائم لدينا لاستكشاف العقارات المتاحة، أو أخبرني بتفضيلاتك (الموقع، الميزانية، عدد الغرف) وسأقوم بإرشادك بشكل أكبر.",
      invest: "سؤال ممتاز عن الاستثمارات! تقدم كريستال دي بي سي فرصًا استثمارية استثنائية بمتوسط عائد سنوي على الاستثمار بنسبة 35٪. يقوم فريق الخبراء لدينا باختيار العقارات ذات إمكانات النمو العالية في دبي ومصر بعناية. هل ترغب في التحدث مع فريق الاستثمار لدينا للحصول على نصيحة مخصصة؟",
      schedule: "يسعدني ترتيب ذلك لك! يرجى النقر على 'تحدث مع وكيل' لتقديم بيانات الاتصال الخاصة بك، وسيتواصل معك أحد مستشاري العقارات الفاخرة لدينا لتحديد موعد للمعاينة أو مكالمة في الوقت الذي يناسبك.",
      agent: "بالطبع! فريقنا من مستشاري العقارات الفاخرة ذوي الخبرة مستعد لمساعدتك. يرجى استخدام خيار 'تحدث مع وكيل' لتقديم تفاصيلك، وسنقوم بتوصيلك بخبير يمكنه تقديم إرشادات مخصصة.",
      price: "تتضمن محفظتنا عقارات فاخرة عبر نطاقات أسعار مختلفة، من الشقق الفاخرة إلى الفيلات الحصرية. تبدأ العقارات في دبي من 1.5 مليون درهم، وفي مصر من 8 ملايين جنيه. ما هي الميزانية التي تفكر فيها؟",
      general: "شكراً لرسالتك! أنا هنا لمساعدتك في جميع احتياجاتك العقارية الفاخرة في دبي ومصر. كيف يمكنني مساعدتك اليوم؟"
    }
    // Russian and German fallbacks can be added similarly
  };

  const t = fallbacks[lang] || fallbacks.English;

  if (lower.includes("property") || lower.includes("listing") || lower.includes("apartment") || lower.includes("villa") || lower.includes("عقار") || lower.includes("شقة") || lower.includes("فيلا")) {
    return t.property;
  }
  if (lower.includes("invest") || lower.includes("roi") || lower.includes("return") || lower.includes("استثمار") || lower.includes("عائد")) {
    return t.invest;
  }
  if (lower.includes("schedule") || lower.includes("call") || lower.includes("appointment") || lower.includes("موعد") || lower.includes("اتصال")) {
    return t.schedule;
  }
  if (lower.includes("agent") || lower.includes("human") || lower.includes("تحدث") || lower.includes("وكيل")) {
    return t.agent;
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("budget") || lower.includes("سعر") || lower.includes("ميزانية")) {
    return t.price;
  }

  return t.general;
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
