export type Occasion = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export type FilterOption = {
  id: string;
  name: string;
  icon: string;
  occasionIds: string[];
};

export type Category = {
  id: string;
  name: string;
  occasionIds: string[];
};

export type Vendor = {
  id: string;
  name: string;
  rating: number;
  distance: string;
  description: string;
  imageUrls: string[];
  priceRange: string;
  venueFee?: string; // Optional because decorators etc don't have venue fees usually
  about: string;
  amenities: { icon: string; text: string }[];
  location: string;
  occasionIds: string[];
  categoryId: string; // Map explicitly to a category
  filterOptionIds: string[]; // Map to filter options like "Hotel", "Acoustic Band", "Buffet"
};

export const occasions: Occasion[] = [
  { id: 'wedding', name: 'Wedding', icon: 'heart', description: 'Plan the perfect big day.' },
  { id: 'birthday', name: 'Birthday', icon: 'gift', description: 'Celebrate another year.' },
  { id: 'anniversary', name: 'Anniversary', icon: 'star', description: 'Mark your milestones.' },
  { id: 'corporate', name: 'Corporate', icon: 'briefcase', description: 'Professional events & team building.' },
  { id: 'party', name: 'House Party', icon: 'music', description: 'Intimate gatherings and bashes.' },
  { id: 'baby-shower', name: 'Baby Shower', icon: 'smile', description: 'Welcome the new arrival.' },
];

export const filterOptions: FilterOption[] = [
  // Wedding Venue Types
  { id: 'hotel', name: 'Hotel', icon: 'home', occasionIds: ['wedding', 'corporate', 'anniversary'] },
  { id: 'banquet', name: 'Banquet Hall', icon: 'grid', occasionIds: ['wedding', 'birthday', 'anniversary', 'baby-shower'] },
  { id: 'resort', name: 'Resort', icon: 'sun', occasionIds: ['wedding', 'corporate'] },
  
  // Party/Birthday Venue Types
  { id: 'club', name: 'Night Club', icon: 'music', occasionIds: ['birthday', 'party'] },
  { id: 'restaurant', name: 'Restaurant', icon: 'coffee', occasionIds: ['birthday', 'anniversary', 'corporate'] },
  { id: 'villa', name: 'Private Villa', icon: 'key', occasionIds: ['party', 'wedding', 'birthday'] },

  // Catering Types
  { id: 'buffet', name: 'Buffet Style', icon: 'archive', occasionIds: ['wedding', 'corporate', 'birthday', 'anniversary'] },
  { id: 'plated', name: 'Plated Dinner', icon: 'award', occasionIds: ['wedding', 'anniversary', 'corporate'] },
  { id: 'food-truck', name: 'Food Trucks', icon: 'truck', occasionIds: ['party', 'birthday'] },

  // Music/Entertainment
  { id: 'dj', name: 'DJ', icon: 'headphones', occasionIds: ['wedding', 'birthday', 'party', 'anniversary'] },
  { id: 'live-band', name: 'Live Band', icon: 'mic', occasionIds: ['wedding', 'corporate', 'anniversary'] },
];

export const categories: Category[] = [
  { id: 'venues', name: 'Venues', occasionIds: ['wedding', 'birthday', 'anniversary', 'corporate', 'party', 'baby-shower'] },
  { id: 'catering', name: 'Catering', occasionIds: ['wedding', 'birthday', 'anniversary', 'corporate', 'party', 'baby-shower'] },
  { id: 'decor', name: 'Decor & Flowers', occasionIds: ['wedding', 'anniversary', 'baby-shower'] },
  { id: 'photo', name: 'Photography', occasionIds: ['wedding', 'birthday', 'anniversary', 'corporate', 'baby-shower'] },
  { id: 'music', name: 'Entertainment', occasionIds: ['wedding', 'birthday', 'party', 'corporate', 'anniversary'] },
  { id: 'gifts', name: 'Return Gifts', occasionIds: ['wedding', 'baby-shower', 'birthday'] },
  { id: 'av', name: 'A/V & Staging', occasionIds: ['corporate'] }, // Exclusive to Corporate
  { id: 'cake', name: 'Bakeries', occasionIds: ['birthday', 'wedding', 'anniversary', 'baby-shower'] },
];

export const vendors: Vendor[] = [
  // --- VENUES ---
  {
    id: 'v1',
    name: 'Grand Plaza Hotel',
    rating: 4.8,
    distance: '2.5 km away',
    description: 'Elegant downtown venue with breathtaking views and premium amenities for your special day.',
    imageUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1_y4GA_Rcjm73dzaFfwWR5R1A6LQwM8_061H8qsev6vLUoeG_F1-FEiTrH_MolJvTh6_rmovwMW1K5OvjB3Xe-33k4sCviPEQ4M0VdXfllS-B7EF4XBlb4zZ_ffPuepzTH2yADIhV4iCNTYL_ku6zJy8rfgetEe3C99vLnWWRy9lSF0LLlfQRGUn18FF6zh2zUJkEqXFGo1y1wjPEApbYgdLclLoQsRRD3MTaDc5xUkO8WVHlihiHJ3s_5w7JRAXo5GjdLpPTrg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC3wtcdVVMhL6Y7Mv_dkN4E0bihTG2pngxmuyhtDd7_JZ2KNeM7w70EkFLEsB5c4hmjCSSyKbkT37xFql9KWUHYqGfa7Ch2yGQsCfhROoYXbh8-FLrOORCLuZbLmL2IlHRCryP212OZTY97XK-zXjZk-VHL1OFPP1eFn251uRQ5eXdgRJJCIDkQoKa_ASXzhgiGccezH3QMW50tpzCcKTqppCkTRlsj7EknGKbur-HTSZsQQV-lT1wrIVzFiUr4Af1QbWgllc-Mpw'
    ],
    priceRange: '$120 - $250 / plate',
    venueFee: '$3,500',
    about: 'The Grand Ballroom offers a sophisticated and versatile space for your most memorable events. Located in the heart of the city.',
    amenities: [
      { icon: 'users', text: 'Up to 500 Guests' },
      { icon: 'navigation', text: 'Valet Parking' },
    ],
    location: 'Downtown',
    occasionIds: ['wedding', 'corporate', 'anniversary'],
    categoryId: 'venues',
    filterOptionIds: ['hotel'],
  },
  {
    id: 'v2',
    name: 'Neon Nights Club',
    rating: 4.6,
    distance: '1.2 km away',
    description: 'The ultimate party destination with state-of-the-art sound systems and VIP lounges.',
    imageUrls: [
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=2070&auto=format&fit=crop'
    ],
    priceRange: '$50 - $100 / person',
    venueFee: '$1,000 min spend',
    about: 'Neon Nights is the citys premier nightlife venue, now available for private booking. Perfect for milestone birthdays and wild house parties.',
    amenities: [
      { icon: 'users', text: 'Up to 300 Guests' },
      { icon: 'music', text: 'In-House DJ' },
    ],
    location: 'Downtown',
    occasionIds: ['birthday', 'party'],
    categoryId: 'venues',
    filterOptionIds: ['club'],
  },
  
  // --- DECORATORS ---
  {
    id: 'd1',
    name: 'Enchanted Florals & Decor',
    rating: 4.9,
    distance: '4.0 km away',
    description: 'Award-winning floral design and venue transformations for luxury weddings.',
    imageUrls: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop'
    ],
    priceRange: '$2,000 - $10,000+ package',
    about: 'We specialize in creating breathtaking, immersive floral experiences. From cascading centerpieces to grand entrance arches, our team turns any venue into a dreamscape.',
    amenities: [
      { icon: 'truck', text: 'Delivery & Setup Included' },
      { icon: 'edit-2', text: 'Custom Design Consultations' },
    ],
    location: 'Uptown',
    occasionIds: ['wedding', 'anniversary'],
    categoryId: 'decor',
    filterOptionIds: [],
  },
  {
    id: 'd2',
    name: 'Balloons & Bashes',
    rating: 4.7,
    distance: '3.1 km away',
    description: 'Fun, vibrant balloon arches, backdrops, and theme decor for playful events.',
    imageUrls: [
      'https://images.unsplash.com/photo-1530103862676-de8892bf7315?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=2069&auto=format&fit=crop'
    ],
    priceRange: '$200 - $800 package',
    about: 'Make your party pop! We offer custom balloon garlands, photo booths, and neon signs tailored to your birthday or baby shower theme.',
    amenities: [
      { icon: 'camera', text: 'Photo Backdrops' },
      { icon: 'smile', text: 'Kid-Friendly Themes' },
    ],
    location: 'Suburbs',
    occasionIds: ['birthday', 'baby-shower', 'party'],
    categoryId: 'decor',
    filterOptionIds: [],
  },

  // --- PHOTOGRAPHY ---
  {
    id: 'p1',
    name: 'Lumina Wedding Studios',
    rating: 5.0,
    distance: '8.5 km away',
    description: 'Cinematic wedding videography and candid, emotional photography.',
    imageUrls: [
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop'
    ],
    priceRange: '$3,500 - $6,000 / day',
    about: 'We don’t just take pictures; we capture legacies. With 10 years of experience in luxury weddings, our unobtrusive style catches the real, raw moments of your day.',
    amenities: [
      { icon: 'video', text: 'Drone Footage Available' },
      { icon: 'book-open', text: 'Premium Albums' },
    ],
    location: 'Downtown',
    occasionIds: ['wedding', 'anniversary'],
    categoryId: 'photo',
    filterOptionIds: [],
  },

  // --- CATERING ---
  {
    id: 'c1',
    name: 'Gourmet Global Feast',
    rating: 4.8,
    distance: '1.0 km away',
    description: 'Exquisite multi-course plated dinners and interactive luxury buffets.',
    imageUrls: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop'
    ],
    priceRange: '$80 - $150 / head',
    about: 'Led by Michelin-trained chefs, we bring world-class dining to your event. We specialize in dietary accommodations and stunning culinary presentations.',
    amenities: [
      { icon: 'coffee', text: 'Tasting Sessions Available' },
      { icon: 'check-circle', text: 'Vegan & Gluten-Free Menus' },
    ],
    location: 'Midtown',
    occasionIds: ['wedding', 'corporate', 'anniversary'],
    categoryId: 'catering',
    filterOptionIds: ['plated', 'buffet'],
  },
  {
    id: 'c2',
    name: 'Street Bites Taco Truck',
    rating: 4.9,
    distance: '5.2 km away',
    description: 'Authentic street tacos, churros, and margaritas served fresh from our vintage truck.',
    imageUrls: [
      'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?q=80&w=2071&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625938144755-652e08e359b7?q=80&w=2069&auto=format&fit=crop'
    ],
    priceRange: '$25 - $45 / head',
    about: 'Keep it casual and absolutely delicious. Our taco truck is a massive hit for house parties and casual birthdays. We handle all the prep and cleanup so you can enjoy the fiesta.',
    amenities: [
      { icon: 'clock', text: 'Fast Service' },
      { icon: 'droplet', text: 'Margarita Machine Included' },
    ],
    location: 'Suburbs',
    occasionIds: ['party', 'birthday'],
    categoryId: 'catering',
    filterOptionIds: ['food-truck'],
  },

  // --- ENTERTAINMENT / MUSIC ---
  {
    id: 'm1',
    name: 'Sonic Groove DJs',
    rating: 4.7,
    distance: '2.2 km away',
    description: 'High-energy DJ services guaranteed to keep your dance floor packed all night.',
    imageUrls: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=2070&auto=format&fit=crop'
    ],
    priceRange: '$800 - $1,500 / event',
    about: 'From classic floor fillers to modern club hits, we tailor the soundtrack to your crowd. Our packages include premium lighting and sound systems.',
    amenities: [
      { icon: 'mic', text: 'MC Services Included' },
      { icon: 'speaker', text: 'Pro Sound & Lighting' },
    ],
    location: 'Downtown',
    occasionIds: ['wedding', 'party', 'birthday', 'corporate'],
    categoryId: 'music',
    filterOptionIds: ['dj'],
  },

  // --- AUDIO VISUAL (Corporate) ---
  {
    id: 'a1',
    name: 'TechStage Solutions',
    rating: 4.8,
    distance: '6.0 km away',
    description: 'Professional projection, staging, and audio for seamless corporate presentations.',
    imageUrls: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?q=80&w=2070&auto=format&fit=crop'
    ],
    priceRange: '$1,500 - $5,000 / event',
    about: 'Don\'t let a technical glitch ruin your keynote. TechStage provides robust A/V setups, LED walls, and dedicated on-site technicians for corporate events of any scale.',
    amenities: [
      { icon: 'monitor', text: 'High-Res LED Screens' },
      { icon: 'wifi', text: 'Event Wi-Fi Solutions' },
    ],
    location: 'Business Park',
    occasionIds: ['corporate'],
    categoryId: 'av',
    filterOptionIds: [],
  }
];
