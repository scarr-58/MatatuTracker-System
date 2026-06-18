export interface Matatu {
  id: string;
  regNumber: string;
  name: string;
  routeNumber: string;
  routeName: string;
  sacco: string;
  capacity: number;
  currentOccupancy: number;
  speed: number;
  vibe: {
    music: string;
    screen: string;
    neonColor: string;
    graffitiTheme: string;
    rating: number; // out of 5
  };
  location: {
    x: number; // 0 to 100 on canvas
    y: number; // 0 to 100 on canvas
    pathIndex: number;
    direction: 'inbound' | 'outbound';
  };
  baseFare: number;
  currentFare: number;
  features: string[];
  status: 'Moving' | 'Boarding' | 'Stuck in Traffic' | 'Idle';
}

export interface RouteDetail {
  id: string;
  routeCode: string;
  from: string;
  to: string;
  distanceKm: number;
  standardFare: number;
  offPeakFare: number;
  peakFare: number;
  primarySaccos: string[];
  congestionLevel: 'Low' | 'Medium' | 'High' | 'Gridlock';
  stages: string[];
}

export interface CommuterReport {
  id: string;
  user: string;
  matatuName?: string;
  routeCode: string;
  stageName: string;
  type: 'traffic' | 'fare_drop' | 'fare_spike' | 'police_crackdown' | 'heavy_rain' | 'general';
  shengText: string;
  englishTranslation: string;
  timestamp: string; // "3 mins ago" etc
  votes: number;
}

export interface BoardingPass {
  ticketId: string;
  matatuName: string;
  route: string;
  farePaid: number;
  boardingStage: string;
  destinationStage: string;
  seatNumber: string;
  timestamp: string;
  mpesaRef: string;
}
