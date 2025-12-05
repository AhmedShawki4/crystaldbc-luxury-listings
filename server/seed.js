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
        title: "Modern Waterfront Villa",
        location: "Miami Beach, FL",
        priceLabel: "$4,500,000",
        priceValue: 4500000,
        beds: 5,
        baths: 4,
        sqftLabel: "4,800 sqft",
        sqftValue: 4800,
        coverImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1000",
        gallery: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1000",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000",
        ],
        description:
          "Stunning modern villa with panoramic ocean views, infinity pool, and private beach access. This architectural masterpiece combines luxury living with coastal elegance.",
        features: [
          "Panoramic Ocean Views",
          "Infinity Pool",
          "Private Beach Access",
          "Smart Home System",
          "Wine Cellar",
          "Home Theater",
          "Gourmet Kitchen",
          "Master Suite Balcony",
        ],
        type: "Villa",
        status: "For Sale",
        isFeatured: true,
      },
      {
        title: "Contemporary Penthouse",
        location: "Manhattan, NY",
        priceLabel: "$8,200,000",
        priceValue: 8200000,
        beds: 4,
        baths: 3,
        sqftLabel: "3,500 sqft",
        sqftValue: 3500,
        coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000",
        gallery: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1000",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&q=80&w=1000",
        ],
        description:
          "Luxurious penthouse in the heart of Manhattan with floor-to-ceiling windows, chef's kitchen, and breathtaking city skyline views.",
        features: [
          "City Skyline Views",
          "Private Elevator",
          "Chef's Kitchen",
          "Marble Bathrooms",
          "Walk-in Closets",
          "Concierge Service",
          "Rooftop Terrace",
          "High-end Finishes",
        ],
        type: "Penthouse",
        status: "For Sale",
        isFeatured: true,
      },
      {
        title: "Mediterranean Estate",
        location: "Beverly Hills, CA",
        priceLabel: "$12,750,000",
        priceValue: 12750000,
        beds: 7,
        baths: 8,
        sqftLabel: "9,200 sqft",
        sqftValue: 9200,
        coverImage: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1000",
        gallery: [
          "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1000",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000",
          "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&q=80&w=1000",
        ],
        description:
          "Magnificent Mediterranean-style estate featuring grand architecture, lush gardens, and resort-style amenities in prestigious Beverly Hills.",
        features: [
          "Grand Entrance",
          "Resort-Style Pool",
          "Tennis Court",
          "Guest House",
          "Home Gym",
          "Library",
          "Formal Gardens",
          "Six-Car Garage",
        ],
        type: "Estate",
        status: "For Sale",
        isFeatured: true,
      },
    ]);

    await TrendingProject.insertMany([
      {
        name: "Binghatti Moonlight",
        location: "Al Jaddaf",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1400",
        status: "Presale",
        description:
          "Binghatti Moonlight is a sculptural architectural statement that rises with quiet precision from the heart of Al Jaddaf.",
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
          "The Serene at Sobha Central is a masterfully envisioned residential project that redefines Egypt's skyline.",
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
          heroSubtitle: "Excellence in luxury real estate since 1995",
          storyParagraphs: [
            "Founded in 1995, CrystalDBC has established itself as a premier luxury real estate firm, specializing in exceptional properties that define sophisticated living.",
            "With decades of combined experience, our team brings unparalleled expertise in the luxury real estate market.",
            "We pride ourselves on attention to detail, market knowledge, and dedication to delivering results that exceed expectations.",
          ],
          values: [
            { iconKey: "Award", title: "Excellence", description: "We strive for excellence in every interaction." },
            { iconKey: "Users", title: "Expertise", description: "Deep market knowledge and proven success." },
            { iconKey: "Target", title: "Integrity", description: "Honest, transparent, and ethical practices." },
            { iconKey: "Heart", title: "Service", description: "Personalized attention for every client." },
          ],
          stats: [
            { label: "Years Experience", value: "28+" },
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
    ];

    await CMSSection.insertMany(cmsPayloads);

    const sampleLead = await Lead.create({
      fullName: "John Investor",
      interestedIn: "end-user",
      phoneNumber: "+1 555 000 1111",
      email: "john@example.com",
      message: "Interested in the waterfront villa",
      source: "register-interest",
      property: properties[0]._id,
    });

    await Message.create({
      name: "Sarah Client",
      email: "sarah@example.com",
      phone: "+1 555 222 3333",
      message: "Could you share more info about Beverly Hills listings?",
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
