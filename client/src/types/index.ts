export type Role = "admin" | "employee" | "user" | "guest";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Property {
  _id: string;
  title: string;
  location: string;
  priceLabel: string;
  priceValue: number;
  beds: number;
  baths: number;
  sqftLabel: string;
  sqftValue: number;
  coverImage: string;
  gallery: string[];
  description: string;
  features: string[];
  type: string;
  status: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface TrendingProject {
  _id: string;
  name: string;
  location: string;
  image: string;
  status: string;
  description: string;
  amenities: { name: string; _id?: string }[];
  completion: string;
  startingPrice: string;
  developer: string;
  property?: Property;
}

export interface CMSSection<TContent = unknown> {
  _id: string;
  key: string;
  content: TContent;
}

export interface HeroContent {
  heading: string;
  highlight: string;
  subheading: string;
  backgroundImage: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export interface AboutContent {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  storyParagraphs: string[];
  values: { iconKey: string; title: string; description: string }[];
  stats: { label: string; value: string }[];
}

export interface ContactContent {
  title: string;
  subtitle: string;
  phone: string;
  email: string;
  office: string;
  officeHours: string[];
}

export interface FooterContent {
  description: string;
  contact: { phone: string; email: string; location: string };
  quickLinks: { label: string; href: string }[];
  propertyTypes: string[];
  social: { label: string; href: string }[];
}

export interface Lead {
  _id: string;
  fullName: string;
  interestedIn?: string;
  phoneNumber?: string;
  email: string;
  message?: string;
  source: string;
  property?: Property;
  status: string;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  page: string;
  status: string;
  createdAt: string;
}

export interface WishlistItem {
  _id: string;
  user: string;
  property: Property;
  note?: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  stats: {
    properties: number;
    leads: number;
    messages: number;
    users: number;
    wishlistItems: number;
  };
  recentLeads: Lead[];
}

export interface ActivityLog {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: Role;
  };
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
