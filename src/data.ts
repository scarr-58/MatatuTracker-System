import { Matatu, RouteDetail, CommuterReport } from './types';

export const ROUTES: RouteDetail[] = [
  {
    id: 'r_45',
    routeCode: '45',
    from: 'CBD (Odeon)',
    to: 'Githurai 45',
    distanceKm: 18,
    standardFare: 80,
    offPeakFare: 40,
    peakFare: 120,
    primarySaccos: ['Super Metro', 'Zuri', 'Forward Travelers'],
    congestionLevel: 'High',
    stages: ['CBD (Odeon)', 'Pangani', 'Muthaiga', 'Roysambu', 'Githurai 45']
  },
  {
    id: 'r_125',
    routeCode: '125',
    from: 'CBD (Railways)',
    to: 'Rongai (Tuala)',
    distanceKm: 26,
    standardFare: 100,
    offPeakFare: 60,
    peakFare: 150,
    primarySaccos: ['Oromats', 'Rongai One', 'Prime East'],
    congestionLevel: 'Gridlock',
    stages: ['CBD (Railways)', 'Nyayo Stadium', 'Galleria Mall', 'Multi-Media', 'Rongai Town']
  },
  {
    id: 'r_58',
    routeCode: '58',
    from: 'CBD (Commercial)',
    to: 'Buruburu Phase 4',
    distanceKm: 11,
    standardFare: 70,
    offPeakFare: 30,
    peakFare: 100,
    primarySaccos: ['Double M', 'Buruburu Sacco', 'Metro Trans'],
    congestionLevel: 'Medium',
    stages: ['CBD (Commercial)', 'Landhies Rd', 'City Stadium', 'Makadara', 'Buruburu 4']
  },
  {
    id: 'r_23',
    routeCode: '23',
    from: 'CBD (Khoja)',
    to: 'Kangemi / Uthiru',
    distanceKm: 13,
    standardFare: 60,
    offPeakFare: 30,
    peakFare: 90,
    primarySaccos: ['Super Metro', 'Kangemi Express', 'Uthiru Genesis'],
    congestionLevel: 'Low',
    stages: ['CBD (Khoja)', 'Westlands', 'Safcom/Abbots', 'Kangemi Stage', 'Uthiru']
  },
  {
    id: 'r_33',
    routeCode: '33',
    from: 'CBD (Ambassadeur)',
    to: 'Embakasi',
    distanceKm: 16,
    standardFare: 80,
    offPeakFare: 50,
    peakFare: 110,
    primarySaccos: ['Embassava', 'City Shuttle', 'Raha Sacco'],
    congestionLevel: 'Medium',
    stages: ['CBD (Ambassadeur)', 'Belle Vue', 'Standard', 'Cabanas', 'Embakasi Pipeline']
  }
];

// Defining route pathways for visual map. CBD is positioned around (50, 48)
export const ROUTE_PATHWAYS: { [key: string]: { x: number; y: number; name: string }[] } = {
  '45': [
    { x: 50, y: 45, name: 'CBD (Odeon)' },
    { x: 57, y: 36, name: 'Pangani' },
    { x: 64, y: 29, name: 'Muthaiga' },
    { x: 74, y: 20, name: 'Roysambu' },
    { x: 85, y: 12, name: 'Githurai 45' }
  ],
  '125': [
    { x: 50, y: 52, name: 'CBD (Railways)' },
    { x: 44, y: 62, name: 'Nyayo Stadium' },
    { x: 35, y: 72, name: 'Galleria Mall' },
    { x: 26, y: 80, name: 'Multi-Media' },
    { x: 15, y: 90, name: 'Rongai Town' }
  ],
  '58': [
    { x: 52, y: 49, name: 'CBD (Commercial)' },
    { x: 61, y: 51, name: 'Landhies Rd' },
    { x: 70, y: 54, name: 'City Stadium' },
    { x: 80, y: 57, name: 'Makadara' },
    { x: 92, y: 60, name: 'Buruburu 4' }
  ],
  '23': [
    { x: 48, y: 46, name: 'CBD (Khoja)' },
    { x: 38, y: 40, name: 'Westlands' },
    { x: 29, y: 34, name: 'Safcom/Abbots' },
    { x: 20, y: 28, name: 'Kangemi' },
    { x: 10, y: 22, name: 'Uthiru' }
  ],
  '33': [
    { x: 51, y: 51, name: 'CBD (Ambassadeur)' },
    { x: 60, y: 63, name: 'Belle Vue' },
    { x: 69, y: 73, name: 'Standard' },
    { x: 78, y: 81, name: 'Cabanas' },
    { x: 88, y: 89, name: 'Embakasi Pipeline' }
  ]
};

export const INITIAL_MATATUS: Matatu[] = [
  {
    id: 'mat_01',
    regNumber: 'KCU 450Y',
    name: 'The Catalyst',
    routeNumber: '45',
    routeName: 'Githurai 45',
    sacco: 'Super Metro',
    capacity: 33,
    currentOccupancy: 28,
    speed: 65,
    vibe: {
      music: 'Khaligraph Jones & Bensoul live mix',
      screen: '2x 24" screens displaying music videos',
      neonColor: '#00f0ff', // Cyan
      graffitiTheme: 'Cyberpunk Nairobi Graffiti with metallic stickers',
      rating: 4.8
    },
    location: { x: 57, y: 36, pathIndex: 1, direction: 'outbound' },
    baseFare: 80,
    currentFare: 80,
    features: ['Wi-Fi', 'USB Charging', 'LED Neons', 'Bass Woofer', 'Custom Seats'],
    status: 'Moving'
  },
  {
    id: 'mat_02',
    regNumber: 'KDJ 125B',
    name: 'Phantom Venom',
    routeNumber: '125',
    routeName: 'Rongai Express',
    sacco: 'Rongai One',
    capacity: 29,
    currentOccupancy: 12,
    speed: 40,
    vibe: {
      music: 'Late Night Slow Jams / Soul Session',
      screen: '32" Ultra HD Screen with high-fidelity acoustics',
      neonColor: '#ff007f', // Cyber Pink
      graffitiTheme: 'Neon Cobra themed custom spray art',
      rating: 4.9
    },
    location: { x: 35, y: 72, pathIndex: 2, direction: 'inbound' },
    baseFare: 100,
    currentFare: 120, // Raining or Peak hour markup
    features: ['Vibe-Ambient Sound', 'Water Cooler', 'A/C', 'Velvet Seats', 'VIP Screen'],
    status: 'Stuck in Traffic'
  },
  {
    id: 'mat_03',
    regNumber: 'KCC 580M',
    name: 'Jazzman Old School',
    routeNumber: '58',
    routeName: 'Buruburu 4',
    sacco: 'Buruburu Sacco',
    capacity: 14,
    currentOccupancy: 14,
    speed: 0,
    vibe: {
      music: 'Classic Reggae Riddims - Tarrus Riley',
      screen: 'No screens - Classic tape deck vibe',
      neonColor: '#22c55e', // Emerald Green
      graffitiTheme: 'Vintage Bob Marley graffiti and custom wood finish',
      rating: 4.3
    },
    location: { x: 52, y: 49, pathIndex: 0, direction: 'outbound' },
    baseFare: 70,
    currentFare: 70,
    features: ['Classic Reggae', 'Super Soft Foam Seats', 'Ample Legroom'],
    status: 'Boarding'
  },
  {
    id: 'mat_04',
    regNumber: 'KDA 230G',
    name: 'Safaricom Swift',
    routeNumber: '23',
    routeName: 'Waiyaki Way / Kangemi',
    sacco: 'Super Metro',
    capacity: 14,
    currentOccupancy: 3,
    speed: 75,
    vibe: {
      music: 'International Top 40 Radio',
      screen: 'Digital dynamic ledger display for next stops',
      neonColor: '#eab308', // Amber Gold
      graffitiTheme: 'Clean corporate yellow with neon stripe highlights',
      rating: 4.7
    },
    location: { x: 20, y: 28, pathIndex: 3, direction: 'inbound' },
    baseFare: 60,
    currentFare: 40, // Off peak discount
    features: ['Fast Commuter', 'Spacious Isle', 'Reliable Driver', 'Air Freshener'],
    status: 'Moving'
  },
  {
    id: 'mat_05',
    regNumber: 'KDE 330F',
    name: 'The Matrix Resurrections',
    routeNumber: '33',
    routeName: 'Embakasi Pipeline',
    sacco: 'Embassava',
    capacity: 33,
    currentOccupancy: 33,
    speed: 10,
    vibe: {
      music: 'Gengetone Anthem Mix 2026',
      screen: 'Overhead projector style laser projections',
      neonColor: '#00ff00', // Green
      graffitiTheme: 'Falling digital numbers code spray paint',
      rating: 4.6
    },
    location: { x: 78, y: 81, pathIndex: 3, direction: 'outbound' },
    baseFare: 80,
    currentFare: 110, // Evening high peak
    features: ['High Bass Outlets', 'Interactive LED lights', 'Strobe lighting', 'Full Screen'],
    status: 'Stuck in Traffic'
  },
  {
    id: 'mat_06',
    regNumber: 'KCU 459P',
    name: 'Red Alert',
    routeNumber: '45',
    routeName: 'Githurai via Thika Hwy',
    sacco: 'Zuri',
    capacity: 29,
    currentOccupancy: 22,
    speed: 55,
    vibe: {
      music: 'Afrobeat Vibe (Burna Boy & Rema)',
      screen: 'Dual front 20" widescreen indicators',
      neonColor: '#ef4444', // Red
      graffitiTheme: 'Cherry Red Gloss Paint with dynamic flame decals',
      rating: 4.5
    },
    location: { x: 74, y: 20, pathIndex: 3, direction: 'inbound' },
    baseFare: 80,
    currentFare: 60,
    features: ['USB ports', 'Red Neon lighting', 'Surround Sound'],
    status: 'Moving'
  },
  {
    id: 'mat_07',
    regNumber: 'KDF 125L',
    name: 'The Commando',
    routeNumber: '125',
    routeName: 'Rongai Magadi Road',
    sacco: 'Prime East',
    capacity: 33,
    currentOccupancy: 0,
    speed: 0,
    vibe: {
      music: 'Hip Hop / Drake & Kendrick live mix',
      screen: '4K Ultra Screen in passenger cabin',
      neonColor: '#a855f7', // Purple
      graffitiTheme: 'Military desert camo custom airbrush graffiti',
      rating: 4.9
    },
    location: { x: 50, y: 52, pathIndex: 0, direction: 'outbound' },
    baseFare: 100,
    currentFare: 100,
    features: ['Extreme Sound Bass', 'A/C', 'Padded Armrests', 'Leather Seats'],
    status: 'Boarding'
  }
];

export const INITIAL_REPORTS: CommuterReport[] = [
  {
    id: 'rep_1',
    user: 'Mwas',
    matatuName: 'Phantom Venom',
    routeCode: '125',
    stageName: 'Nyayo Stadium',
    type: 'traffic',
    shengText: 'Noma sana! Kuna kanyabagi kubwa hapa Nyayo, gari zimesimama. Kama unakuja upitishwe flyover.',
    englishTranslation: 'Huge traffic standstill at Nyayo Stadium. If you are heading this route, ensure the driver takes the flyover bypass.',
    timestamp: '2 mins ago',
    votes: 14
  },
  {
    id: 'rep_2',
    user: 'Shiko_K',
    routeCode: '45',
    stageName: 'Roysambu',
    type: 'fare_drop',
    shengText: 'Cheki niaje, Super Metro bei imedrop offpeak fika 50 bob hapa Roysambu. Hakuna jam, gari zinatambaa tu!',
    englishTranslation: 'Heads up! Super Metro fares have dropped to 50 bob offpeak at Roysambu. No traffic, smooth sailing!',
    timestamp: '8 mins ago',
    votes: 9
  },
  {
    id: 'rep_3',
    user: 'Brayo_Vibe',
    matatuName: 'The Catalyst',
    routeCode: '45',
    stageName: 'CBD (Odeon)',
    type: 'general',
    shengText: 'Niaje wadau! Catalyst imejaza iko tayari kuondoka. Hapa Odeon msururu si mrefu saiti gari zipo mob.',
    englishTranslation: 'Hey everyone! "Catalyst" is fully loaded and ready to leave. The queue at Odeon is short, many matatus are available.',
    timestamp: '15 mins ago',
    votes: 5
  },
  {
    id: 'rep_4',
    user: 'Kamau_M',
    routeCode: '23',
    stageName: 'Westlands',
    type: 'fare_spike',
    shengText: 'Sacco za Kangemi zimeanza kuitisha 80 KES ju ya mvua kidogo imeanza kuanguka. Afadhali upande yule wa nne.',
    englishTranslation: 'Kangemi matatus are demanding 80 KES because of the slight rain that just started. Better board the other Sacco.',
    timestamp: '22 mins ago',
    votes: 11
  }
];

export const GENERAL_TIPS = [
  {
    title: 'How do off-peak hours work?',
    desc: 'Off-peak hours are typically 10:00 AM to 3:30 PM, and after 8:30 PM. Fares can drop by up to 50% during these times! Super Metro and other Saccos lower tickets to fill seats.'
  },
  {
    title: 'Nairobi Stage Guide (CBD Boarding Spots)',
    desc: '• Route 45 (Thika Road): Odeon Cinema, Ngara or Commercial. \n• Route 111/125 (Rongai): Railways Station or Kencom. \n• Route 58 (Buruburu): Commercial, Ambassador, or Muthurwa. \n• Route 23 (Waiyaki): Khoja Mosque, Fire Station, or Odeon.'
  },
  {
    title: 'What does "Manyanga" or "Nganya" mean?',
    desc: 'These are highly customized Nairobi matatus complete with custom airbrush graffiti, flashing LEDs, visual screens, and immense subwoofers. They have a loyal fanbase of loyal commuters!'
  },
  {
    title: 'Sacco Cards vs Cash vs M-PESA',
    desc: 'While some commuter lines experimented with cash-lite cards, standard modes of payment are Cash and M-PESA. Always confirm the Conductor\'s M-PESA Till number before boarding!'
  }
];
