const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const Property = require("./models/Property");
const TrendingProject = require("./models/TrendingProject");
const CMSSection = require("./models/CMSSection");
const Lead = require("./models/Lead");
const Message = require("./models/Message");
const WishlistItem = require("./models/WishlistItem");
const ActivityLog = require("./models/ActivityLog");
const { ROLES } = require("./utils/constants");

dotenv.config({ path: path.join(__dirname, ".env") });

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Property.deleteMany({}),
      TrendingProject.deleteMany({}),
      CMSSection.deleteMany({}),
      Lead.deleteMany({}),
      Message.deleteMany({}),
      WishlistItem.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    const admin = await User.create({
      name: "Crystal Admin",
      email: process.env.DEFAULT_ADMIN_EMAIL,
      password: process.env.DEFAULT_ADMIN_PASSWORD,
      role: ROLES.ADMIN,
    });

        const handler = process.env.DEFAULT_PROPERTY_HANDLER_EMAIL
          ? await User.create({
              name: "Property Handler",
              email: process.env.DEFAULT_PROPERTY_HANDLER_EMAIL,
              password: process.env.DEFAULT_PROPERTY_HANDLER_PASSWORD,
              role: ROLES.PROPERTY_HANDLER,
            })
          : null;

    const employee = await User.create({
      name: "Crystal Employee",
      email: process.env.DEFAULT_EMPLOYEE_EMAIL,
      password: process.env.DEFAULT_EMPLOYEE_PASSWORD,
      role: ROLES.EMPLOYEE,
    });

    const regularUser = await User.create({
      name: "Crystal User",
      email: process.env.DEFAULT_USER_EMAIL,
      password: process.env.DEFAULT_USER_PASSWORD,
      role: ROLES.USER,
    });

    await User.create({
      name: "Crystal Guest",
      email: process.env.DEFAULT_GUEST_EMAIL,
      password: process.env.DEFAULT_GUEST_PASSWORD,
      role: ROLES.GUEST,
    });

    const properties = await Property.insertMany([
      {
        title: "Al Jaddaf Skyline Residence",
        location: "Al Jaddaf, Dubai",
        currencyCode: "AED",
        priceLabel: "AED 4,800,000",
        priceValue: 4800000,
        beds: 3,
        baths: 4,
        sqftLabel: "2,650 sqft",
        sqftValue: 2650,
        coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1400",
        gallery: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1400",
        ],
        description:
          "High-floor residence overlooking Dubai Creek with a wraparound terrace and curated interiors designed for effortless city living.",
        features: [
          "Creek Views",
          "Wraparound Terrace",
          "Infinity Pool Access",
          "Residents Lounge",
          "Smart Home Lighting",
          "Chef's Kitchen",
          "Fitness Studio",
          "Valet Parking",
        ],
        type: "Apartment",
        status: "For Sale",
        constructionStatus: "Under Construction",
        companyName: "CrystalDBC Dubai",
        phone: "+971 50 123 4567",
        isFeatured: true,
      },
      {
        title: "Sobha Hartland Lagoon Villa",
        location: "Sobha Hartland, Dubai",
        currencyCode: "AED",
        priceLabel: "AED 9,600,000",
        priceValue: 9600000,
        beds: 5,
        baths: 6,
        sqftLabel: "5,900 sqft",
        sqftValue: 5900,
        coverImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1400",
        gallery: [
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&q=80&w=1400",
        ],
        description:
          "Lagoon-front villa with private garden access, double-height living spaces, and a serene boardwalk setting.",
        features: [
          "Lagoon Access",
          "Private Garden",
          "Double-height Living Room",
          "Show + Prep Kitchen",
          "Private Garage",
          "Outdoor Dining Terrace",
          "Maid's Suite",
          "Community Clubhouse",
        ],
        type: "Villa",
        status: "For Sale",
        constructionStatus: "Finished Construction",
        companyName: "CrystalDBC Dubai",
        phone: "+971 50 555 0180",
        isFeatured: true,
      },
      {
        title: "Zamalek Riverside Residence",
        location: "Zamalek, Cairo",
        currencyCode: "EGP",
        priceLabel: "EGP 42,000,000",
        priceValue: 42000000,
        beds: 4,
        baths: 4,
        sqftLabel: "3,700 sqft",
        sqftValue: 3700,
        coverImage: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1400",
        gallery: [
          "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1400",
        ],
        description:
          "Elegant riverfront residence with classic proportions, updated finishes, and a calm balcony overlooking the Nile.",
        features: [
          "Nile Views",
          "Private Elevator Landing",
          "Formal Dining",
          "Library Nook",
          "Marble Baths",
          "Hardwood Floors",
          "Balcony Seating",
          "Concierge Services",
        ],
        type: "Residence",
        status: "For Sale",
        constructionStatus: "Finished Construction",
        companyName: "CrystalDBC Cairo",
        phone: "+20 2 5550 1234",
        isFeatured: true,
      },
      {
        title: "New Capital Horizon Suite",
        location: "New Administrative Capital, Cairo",
        currencyCode: "EGP",
        priceLabel: "EGP 18,500,000",
        priceValue: 18500000,
        beds: 3,
        baths: 3,
        sqftLabel: "2,150 sqft",
        sqftValue: 2150,
        coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1400",
        gallery: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1400",
        ],
        description:
          "Smart-enabled suite in a landmark new district with landscaped promenades and a vibrant retail podium.",
        features: [
          "Smart Home Controls",
          "Co-working Lounge",
          "Sky Garden Access",
          "EV Charging",
          "Kids Play Zone",
          "24/7 Security",
          "Retail Podium",
          "Walk-in Closets",
        ],
        type: "Apartment",
        status: "For Sale",
        constructionStatus: "Under Construction",
        companyName: "CrystalDBC Cairo",
        phone: "+20 2 5550 5678",
      },
      {
        title: "Al Olaya Sky Residence",
        location: "Al Olaya, Riyadh",
        currencyCode: "SAR",
        priceLabel: "SAR 9,800,000",
        priceValue: 9800000,
        beds: 4,
        baths: 5,
        sqftLabel: "3,800 sqft",
        sqftValue: 3800,
        coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1400",
        gallery: [
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1400",
        ],
        description:
          "Signature residence above the city center with private lift access, concierge services, and refined designer finishes.",
        features: [
          "Skyline Views",
          "Private Lift",
          "Concierge Service",
          "Resident Lounge",
          "Infinity Pool Deck",
          "Spa and Sauna",
          "Smart Climate Control",
          "Designer Finishes",
        ],
        type: "Penthouse",
        status: "For Sale",
        constructionStatus: "Finished Construction",
        companyName: "CrystalDBC Riyadh",
        phone: "+966 11 555 2211",
      },
      {
        title: "Diriyah Heritage Courtyard Villa",
        location: "Diriyah, Riyadh",
        currencyCode: "SAR",
        priceLabel: "SAR 13,600,000",
        priceValue: 13600000,
        beds: 5,
        baths: 6,
        sqftLabel: "6,200 sqft",
        sqftValue: 6200,
        coverImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1400",
        gallery: [
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1400",
        ],
        description:
          "Courtyard villa blending Najdi-inspired architecture with modern comfort, featuring shaded outdoor living and a private guest suite.",
        features: [
          "Private Courtyard",
          "Majlis Reception",
          "Shaded Pergola",
          "Home Office",
          "Landscape Lighting",
          "Separate Guest Suite",
          "Family Lounge",
          "Three-Car Garage",
        ],
        type: "Villa",
        status: "For Sale",
        constructionStatus: "Finished Construction",
        companyName: "CrystalDBC Riyadh",
        phone: "+966 11 555 3344",
        isFeatured: true,
      },
      {
        title: "Tiergarten Gallery Loft",
        location: "Tiergarten, Berlin",
        currencyCode: "EUR",
        priceLabel: "EUR 8,900 / month",
        priceValue: 8900,
        beds: 2,
        baths: 2,
        sqftLabel: "1,900 sqft",
        sqftValue: 1900,
        coverImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1400",
        gallery: [
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1400",
        ],
        description:
          "Gallery loft with mezzanine, floor-to-ceiling windows, and a quiet Tiergarten setting minutes from the cultural district.",
        features: [
          "Gallery Mezzanine",
          "Open Plan Living",
          "Heated Floors",
          "Designer Kitchen",
          "Bike Storage",
          "Concierge Desk",
          "Pet Friendly",
          "Private Storage",
        ],
        type: "Loft",
        status: "For Rent",
        rentPayPeriod: "month",
        companyName: "CrystalDBC Berlin",
        phone: "+49 30 1234 5678",
      },
      {
        title: "Tegernsee Modern Lodge",
        location: "Tegernsee, Bavaria",
        currencyCode: "EUR",
        priceLabel: "EUR 6,400,000",
        priceValue: 6400000,
        beds: 4,
        baths: 4,
        sqftLabel: "4,900 sqft",
        sqftValue: 4900,
        coverImage: "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&q=80&w=1400",
        gallery: [
          "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1400",
        ],
        description:
          "Alpine modern lodge with panoramic lake views, warm timber detailing, and a private spa suite.",
        features: [
          "Lake Views",
          "Fireplace Lounge",
          "Spa Room",
          "Wine Cellar",
          "Outdoor Sauna",
          "Ski Room",
          "Stone Terrace",
          "Smart Security",
        ],
        type: "Lodge",
        status: "For Sale",
        constructionStatus: "Finished Construction",
        companyName: "CrystalDBC Germany",
        phone: "+49 89 456 7788",
      },
      {
        title: "Khamovniki Riverside Duplex",
        location: "Khamovniki, Moscow",
        currencyCode: "RUB",
        priceLabel: "RUB 295,000,000",
        priceValue: 295000000,
        beds: 3,
        baths: 3,
        sqftLabel: "3,200 sqft",
        sqftValue: 3200,
        coverImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1400",
        gallery: [
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1400",
        ],
        description:
          "Two-level duplex with park and river views, premium finishes, and a calm, gated riverside setting.",
        features: [
          "Riverfront Promenade",
          "Double-height Living",
          "Private Study",
          "Steam Room",
          "Gallery Hallway",
          "Chef's Kitchen",
          "Guarded Entry",
          "Underground Parking",
        ],
        type: "Duplex",
        status: "For Sale",
        constructionStatus: "Finished Construction",
        companyName: "CrystalDBC Moscow",
        phone: "+7 495 123 4567",
      },
      {
        title: "Downtown Opera View Apartment",
        location: "Downtown Dubai, Dubai",
        currencyCode: "AED",
        priceLabel: "AED 850,000 / year",
        priceValue: 850000,
        beds: 2,
        baths: 2,
        sqftLabel: "1,450 sqft",
        sqftValue: 1450,
        coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1400&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1400&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1400",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1400",
        ],
        description:
          "Opera district apartment with boulevard views, hotel-style amenities, and immediate access to Downtown dining.",
        features: [
          "Opera District Views",
          "Serviced Lobby",
          "Infinity Pool",
          "Gym and Yoga",
          "Housekeeping Optional",
          "Rooftop Terrace",
          "Resident Cinema",
          "Walk to Metro",
        ],
        type: "Apartment",
        status: "For Rent",
        rentPayPeriod: "year",
        companyName: "CrystalDBC Dubai",
        phone: "+971 50 888 2233",
      },
    ]);

    await TrendingProject.insertMany([
      {
        name: "Binghatti Moonlight",
        location: "Al Jaddaf",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1400",
        status: "Presale",
        description:
          "Binghatti Moonlight is a sculptural architectural statement rising from Al Jaddaf's waterfront district in Dubai.",
        amenities: [
          { name: "Common Gym" },
          { name: "Swimming Pool" },
          { name: "Seating Area" },
          { name: "Retail Shops" },
        ],
        completion: "June 2026",
        startingPrice: "1.5M AED",
        developer: "Binghatti",
        property: properties[0]._id,
      },
      {
        name: "The Serene at Sobha Central",
        location: "Sobha Hartland",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1400",
        status: "Presale",
        description:
          "The Serene at Sobha Central is a masterfully envisioned community bringing lagoon living to the heart of Dubai.",
        amenities: [
          { name: "Swimming Pool" },
          { name: "Jogging Track" },
          { name: "Sport Courts" },
          { name: "Outdoor Cinema" },
        ],
        completion: "December 2029",
        startingPrice: "1.8M AED",
        developer: "Sobha",
        property: properties[1]._id,
      },
    ]);

    const cmsPayloads = [
      {
        key: "hero",
        content: {
          heading: "Discover Your Dream",
          highlight: "Luxury Property",
          subheading:
            "Exceptional homes, unparalleled service, and a commitment to excellence in every detail",
          backgroundImage:
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000",
          primaryCta: { label: "Explore Properties", href: "/listings" },
          secondaryCta: { label: "Contact Us", href: "/contact" },
        },
      },
      {
        key: "about",
        content: {
          heroImage:
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000",
          heroTitle: "About CrystalDBC",
          heroSubtitle: "Excellence in luxury real estate since 2002",
          storyParagraphs: [
            "Founded in 2002, CrystalDBC has established itself as a premier luxury real estate firm, specializing in exceptional properties that define sophisticated living.",
            "With decades of combined experience, our team brings unparalleled expertise in the luxury real estate market.",
            "We pride ourselves on attention to detail, market knowledge, and dedication to delivering results that exceed expectations.",
          ],
          impactItems: ["Egypt", "Saudi Arabia", "Germany", "United Arab Emirates", "Russia", "Iraq"],
          values: [
            { iconKey: "Award", title: "Excellence", description: "We strive for excellence in every interaction." },
            { iconKey: "Users", title: "Expertise", description: "Deep market knowledge and proven success." },
            { iconKey: "Target", title: "Integrity", description: "Honest, transparent, and ethical practices." },
            { iconKey: "Heart", title: "Service", description: "Personalized attention for every client." },
          ],
          stats: [
            { label: "Years Experience", value: "24+" },
            { label: "Properties Sold", value: "2,500+" },
            { label: "Total Sales Volume", value: "$5B+" },
            { label: "Client Satisfaction", value: "98%" },
          ],
        },
      },
      {
        key: "contact",
        content: {
          title: "Contact Information",
          subtitle:
            "Reach out to our team of luxury real estate experts. We're available to answer your questions and schedule property viewings.",
          phone: "+1 (888) 555-1234",
          email: "info@crystaldbc.com",
          office: "123 Luxury Avenue, Beverly Hills, CA 90210",
          officeHours: [
            "Monday - Friday: 9:00 AM - 6:00 PM",
            "Saturday: 10:00 AM - 4:00 PM",
            "Sunday: By Appointment Only",
          ],
        },
      },
      {
        key: "footer",
        content: {
          description:
            "Your trusted partner in Egypt real estate. We provide premium properties and exceptional service to help you find your perfect home or investment opportunity.",
          contact: {
            phone: "(800) 110-220",
            email: "info@crystaldbc.com",
            location: "Egypt",
          },
          quickLinks: [
            { label: "Home", href: "/" },
            { label: "Properties", href: "/listings" },
            { label: "Info", href: "/about" },
            { label: "Contact", href: "/contact" },
          ],
          propertyTypes: ["Apartment", "Villa", "Townhouse", "Penthouse"],
          social: [
            { label: "Instagram", href: "https://instagram.com" },
            { label: "LinkedIn", href: "https://linkedin.com" },
          ],
        },
      },
      {
        key: "siteSettings",
        content: {
          rentButtonEnabled: true,
        },
      },
    ];

    await CMSSection.insertMany(cmsPayloads);

    const sampleLead = await Lead.create({
      fullName: "John Investor",
      interestedIn: "end-user",
      phoneNumber: "+1 555 000 1111",
      email: "john@example.com",
      message: "Interested in the Al Jaddaf skyline residence",
      source: "register-interest",
      property: properties[0]._id,
    });

    await Message.create({
      name: "Sarah Client",
      email: "sarah@example.com",
      phone: "+1 555 222 3333",
      message: "Could you share more info about Zamalek riverfront listings?",
      page: "contact",
    });

    await WishlistItem.create({
      user: regularUser._id,
      property: properties[1]._id,
      note: "Schedule viewing in March",
    });

    await ActivityLog.create({
      user: admin._id,
      action: "seed-data",
      entityType: "System",
      metadata: { message: "Initial dataset created" },
    });

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed error", error);
    process.exit(1);
  }
};

seed();
