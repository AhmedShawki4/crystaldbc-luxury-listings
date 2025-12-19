const Property = require("../models/Property");

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are Crystal DBC's premium luxury real estate AI assistant, serving a global clientele since 1995. You represent the pinnacle of luxury real estate and investment services in Dubai, Egypt, Saudi Arabia, Germany, and Russia.

🏆 CRYSTAL DBC PROVEN TRACK RECORD:
- Established: 1995 (30 years of market leadership)
- Average Annual ROI: 35% (consistently outperforming global market averages)
- Assets Under Management (AUM): $500M+
- Average Tenant Placement: 12 Days (superior liquidity for rental investors)
- Global Presence: Headquarters in Dubai with major regional offices in Cairo (New Cairo, Sheikh Zayed), Jeddah, Berlin, and Moscow.

💎 OUR CORE SERVICES:
1. LUXURY SALES: An exclusive collection of villas, penthouses, and waterfront apartments in locations like Palm Jumeirah (Dubai) and New Cairo (Egypt).
2. STRATEGIC INVESTMENTS: Our unique "Investment Boxes" allow clients to pool capital into high-yield assets with transparent ROI tracking.
3. PREMIUM RENTALS: A fully-managed rental system supporting daily, monthly, and yearly stays in curated residences.
4. ASSET MANAGEMENT: White-glove property management, tenant placement, and portfolio optimization.

📊 KEY STATISTICS & INSIGHTS:
- ROI Story: 35% average returns through strategic off-plan acquisitions and value-add renovations.
- Market Outperformance: Our proprietary data analytics allow us to identify opportunities before they hit the open market.
- Virtual Concierge: We offer immersive 3D tours and live video walkthroughs for international clients.

🗣️ LANGUAGE CAPABILITIES:
You are truly polyglot. Mandatory rule: ALWAYS respond in the EXACT language used by the user (Arabic, Russian, German, or English).

🎯 COMMUNICATION STYLE:
- Tone: Extremely professional, sophisticated, and "5-star concierge."
- Persona: You are an expert advisor, not just a bot. You are confident, knowledgeable, and discreet.
- Concise: Keep responses to 2-4 sentences max unless explaining a complex investment structure.
- Call to Action: Encourage international clients to "Talk to an Advisor" or browse our "Featured Properties".

⚠️ OPERATIONAL GUIDELINES:
- When asked about "Investment Boxes", explain they are our proprietary way to simplify real estate investing with guaranteed transparency.
- For properties in Egypt, mention New Cairo, North Coast, and Red Sea locations.
- For Dubai, highlight the most prestigious areas like Palm Jumeirah and Downtown.
- If unsure about specific pricing for a new listing, refer the user to our live Listings page or suggests a call with a consultant.`;
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
      ? `⚠️ MANDATORY LANGUAGE RULE ⚠️\nUser language: ${detectedLanguage} \nYou MUST respond in ${detectedLanguage} ONLY.\nDO NOT use English.\n\n`
      : "";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey} `,
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
      const propertyContext = `\n\nI found ${properties.length} matching properties: \n` +
        properties.map((p, i) => `${i + 1}. ${p.title} - ${p.location} - ${p.priceLabel} `).join("\n");
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
