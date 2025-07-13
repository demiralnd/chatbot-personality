export const brandData = {
  name: "TechNova",
  tagline: "Innovating Your Digital Life",
  description: "TechNova is a cutting-edge technology brand specializing in smart home devices and personal electronics that seamlessly integrate into your daily life.",
  values: ["Innovation", "Sustainability", "User-Centric Design", "Quality"],
  colors: {
    primary: "#2563eb", // Blue
    secondary: "#7c3aed", // Purple
    accent: "#06b6d4", // Cyan
  }
};

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  image: string;
}

export const products: Product[] = [
  {
    id: "prod-001",
    name: "SmartHub Pro",
    category: "Smart Home",
    price: 199.99,
    description: "Central control hub for all your smart home devices with AI-powered automation.",
    features: [
      "Voice control with multiple assistants",
      "Automated scene creation",
      "Energy monitoring",
      "Mobile app control",
      "Works with 1000+ devices"
    ],
    inStock: true,
    rating: 4.8,
    reviews: 2341,
    image: "/images/smarthub-pro.jpg"
  },
  {
    id: "prod-002",
    name: "EcoTherm Smart Thermostat",
    category: "Climate Control",
    price: 249.99,
    description: "AI-powered thermostat that learns your preferences and saves up to 30% on energy bills.",
    features: [
      "Self-learning temperature control",
      "Geofencing capability",
      "Energy usage reports",
      "Remote control via app",
      "Compatible with most HVAC systems"
    ],
    inStock: true,
    rating: 4.7,
    reviews: 1892,
    image: "/images/ecotherm.jpg"
  },
  {
    id: "prod-003",
    name: "SecureView 4K Camera",
    category: "Security",
    price: 149.99,
    description: "Ultra HD security camera with night vision and AI-powered person detection.",
    features: [
      "4K HDR video quality",
      "Color night vision",
      "Two-way audio",
      "Weather resistant",
      "Free cloud storage (7 days)"
    ],
    inStock: true,
    rating: 4.6,
    reviews: 3201,
    image: "/images/secureview.jpg"
  },
  {
    id: "prod-004",
    name: "LumiSmart RGB Bulbs (4-Pack)",
    category: "Lighting",
    price: 79.99,
    description: "Color-changing smart bulbs with 16 million colors and programmable scenes.",
    features: [
      "16 million colors",
      "Music sync capability",
      "Schedule and timer functions",
      "Energy efficient LED",
      "25,000 hour lifespan"
    ],
    inStock: true,
    rating: 4.5,
    reviews: 4532,
    image: "/images/lumismart.jpg"
  },
  {
    id: "prod-005",
    name: "PowerStream Wireless Charger",
    category: "Accessories",
    price: 59.99,
    description: "Fast wireless charging pad with cooling system for all Qi-enabled devices.",
    features: [
      "15W fast charging",
      "Active cooling system",
      "Foreign object detection",
      "LED status indicator",
      "Universal compatibility"
    ],
    inStock: true,
    rating: 4.4,
    reviews: 892,
    image: "/images/powerstream.jpg"
  },
  {
    id: "prod-006",
    name: "AudioSphere 360 Speaker",
    category: "Audio",
    price: 299.99,
    description: "Premium smart speaker with 360-degree sound and room-filling audio.",
    features: [
      "360-degree omnidirectional sound",
      "Multi-room audio support",
      "Voice assistant built-in",
      "Bluetooth 5.0 and WiFi",
      "Adaptive sound technology"
    ],
    inStock: false,
    rating: 4.9,
    reviews: 1234,
    image: "/images/audiosphere.jpg"
  },
  {
    id: "prod-007",
    name: "SmartLock Elite",
    category: "Security",
    price: 329.99,
    description: "Keyless smart door lock with fingerprint recognition and remote access.",
    features: [
      "Fingerprint recognition",
      "Temporary access codes",
      "Auto-lock feature",
      "Battery backup",
      "Activity log tracking"
    ],
    inStock: true,
    rating: 4.7,
    reviews: 678,
    image: "/images/smartlock.jpg"
  },
  {
    id: "prod-008",
    name: "AirPure Smart Purifier",
    category: "Home Health",
    price: 399.99,
    description: "Advanced air purifier with real-time air quality monitoring and app control.",
    features: [
      "HEPA H13 filtration",
      "Real-time air quality display",
      "Covers up to 1000 sq ft",
      "Ultra-quiet operation",
      "Filter replacement alerts"
    ],
    inStock: true,
    rating: 4.8,
    reviews: 2103,
    image: "/images/airpure.jpg"
  },
  {
    id: "prod-009",
    name: "FitTrack Pro Band",
    category: "Wearables",
    price: 129.99,
    description: "Advanced fitness tracker with health monitoring and smart notifications.",
    features: [
      "Heart rate monitoring",
      "Sleep tracking",
      "Water resistant",
      "7-day battery life",
      "Smartphone notifications"
    ],
    inStock: true,
    rating: 4.3,
    reviews: 5421,
    image: "/images/fittrack.jpg"
  },
  {
    id: "prod-010",
    name: "StreamBox 4K Pro",
    category: "Entertainment",
    price: 179.99,
    description: "4K streaming device with gaming capabilities and voice control.",
    features: [
      "4K HDR streaming",
      "Cloud gaming support",
      "Voice remote included",
      "Dolby Atmos audio",
      "All major streaming apps"
    ],
    inStock: true,
    rating: 4.6,
    reviews: 3892,
    image: "/images/streambox.jpg"
  }
];