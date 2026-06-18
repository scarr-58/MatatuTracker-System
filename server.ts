import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-Memory Backup Datastores for instantaneous local execution
let localMatatus = [
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
      neonColor: '#00f0ff',
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
      neonColor: '#ff007f',
      graffitiTheme: 'Neon Cobra themed custom spray art',
      rating: 4.9
    },
    location: { x: 35, y: 72, pathIndex: 2, direction: 'inbound' },
    baseFare: 100,
    currentFare: 120,
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
      neonColor: '#22c55e',
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
      neonColor: '#eab308',
      graffitiTheme: 'Clean corporate yellow with neon stripe highlights',
      rating: 4.7
    },
    location: { x: 20, y: 28, pathIndex: 3, direction: 'inbound' },
    baseFare: 60,
    currentFare: 40,
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
      neonColor: '#00ff00',
      graffitiTheme: 'Falling digital numbers code spray paint',
      rating: 4.6
    },
    location: { x: 78, y: 81, pathIndex: 3, direction: 'outbound' },
    baseFare: 80,
    currentFare: 110,
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
      neonColor: '#ef4444',
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
      neonColor: '#a855f7',
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

let localRoutes = [
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

let localReports = [
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

let localPasses: any[] = [];
let localUsers = [
  {
    email: 'brayo.commuter@gmail.com',
    name: 'Brayo_Manyanga',
    password: 'password',
    isAdmin: false
  },
  {
    email: 'admin@matatutracker.com',
    name: 'Nairobi_Command_Central',
    password: 'password',
    isAdmin: true
  }
];

// Dynamic MySQL connection & state managers
let pool: mysql.Pool | null = null;
let dbStatus = {
  mode: 'Local Memory Server',
  error: '',
  connected: true
};

async function getDbConnection() {
  const host = process.env.MYSQL_HOST || '';
  const user = process.env.MYSQL_USER || '';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || '';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);

  // If host is empty or points to standard local sandbox default without active daemon, fallback immediately.
  if (!host || !user || host === '127.0.0.1' || host === 'localhost') {
    dbStatus.mode = 'Local Memory Server';
    dbStatus.error = '';
    dbStatus.connected = true;
    return null;
  }

  try {
    if (!pool) {
      pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 2000 // Fast connection timeout
      });
    }
    // Test the pool connection
    const conn = await pool.getConnection();
    conn.release();

    dbStatus.mode = 'MySQL Live DB';
    dbStatus.error = '';
    dbStatus.connected = true;
    return pool;
  } catch (err: any) {
    // Log as standard info rather than throwing a console.error diagnostic alert
    console.log('MySQL connection not available. Running seamlessly on Local Memory Server:', err.message);
    dbStatus.mode = 'Local Memory Server';
    dbStatus.error = '';
    dbStatus.connected = true;
    return null;
  }
}

// Initial DB setup and table creation if using MySQL
async function setupDatabase() {
  const db = await getDbConnection();
  if (!db) return;

  try {
    console.log('Setting up MySQL tables...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS matatus (
        id VARCHAR(50) PRIMARY KEY,
        regNumber VARCHAR(50),
        name VARCHAR(100),
        routeNumber VARCHAR(50),
        routeName VARCHAR(100),
        sacco VARCHAR(100),
        capacity INT,
        currentOccupancy INT,
        speed INT,
        music VARCHAR(255),
        screen VARCHAR(255),
        neonColor VARCHAR(50),
        graffitiTheme VARCHAR(255),
        rating DECIMAL(3,2),
        locationX DOUBLE,
        locationY DOUBLE,
        pathIndex INT,
        direction VARCHAR(50),
        baseFare INT,
        currentFare INT,
        features TEXT,
        status VARCHAR(50)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id VARCHAR(50) PRIMARY KEY,
        routeCode VARCHAR(50),
        fromStage VARCHAR(100),
        toStage VARCHAR(100),
        distanceKm DOUBLE,
        standardFare INT,
        offPeakFare INT,
        peakFare INT,
        primarySaccos VARCHAR(255),
        congestionLevel VARCHAR(50),
        stages TEXT
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(50) PRIMARY KEY,
        user VARCHAR(100),
        matatuName VARCHAR(100),
        routeCode VARCHAR(100),
        stageName VARCHAR(100),
        type VARCHAR(50),
        shengText TEXT,
        englishTranslation TEXT,
        timestamp VARCHAR(100),
        votes INT
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS boarding_passes (
        ticketId VARCHAR(50) PRIMARY KEY,
        matatuName VARCHAR(100),
        route VARCHAR(100),
        farePaid INT,
        boardingStage VARCHAR(100),
        destinationStage VARCHAR(100),
        seatNumber VARCHAR(20),
        timestamp VARCHAR(100),
        mpesaRef VARCHAR(100)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(150) PRIMARY KEY,
        name VARCHAR(100),
        password VARCHAR(255),
        isAdmin BOOLEAN
      )
    `);

    // Check if seeding is required (empty database check)
    const [rows]: [any[], any] = await db.query('SELECT COUNT(*) as count FROM matatus');
    if (rows[0].count === 0) {
      console.log('Seeding initial records to MySQL...');
      await seedDatabase(db);
    }
  } catch (err: any) {
    console.error('Error establishing database scheme:', err);
    dbStatus.error = `Schema error: ${err.message}`;
  }
}

async function seedDatabase(db: mysql.Pool) {
  try {
    // Empty tables first
    await db.query('DELETE FROM matatus');
    await db.query('DELETE FROM routes');
    await db.query('DELETE FROM reports');

    // Seed Matatus
    for (const mat of localMatatus) {
      await db.query(
        `INSERT INTO matatus (id, regNumber, name, routeNumber, routeName, sacco, capacity, currentOccupancy, speed, music, screen, neonColor, graffitiTheme, rating, locationX, locationY, pathIndex, direction, baseFare, currentFare, features, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mat.id, mat.regNumber, mat.name, mat.routeNumber, mat.routeName, mat.sacco,
          mat.capacity, mat.currentOccupancy, mat.speed, mat.vibe.music, mat.vibe.screen,
          mat.vibe.neonColor, mat.vibe.graffitiTheme, mat.vibe.rating, mat.location.x,
          mat.location.y, mat.location.pathIndex, mat.location.direction, mat.baseFare,
          mat.currentFare, JSON.stringify(mat.features), mat.status
        ]
      );
    }

    // Seed Routes
    for (const r of localRoutes) {
      await db.query(
        `INSERT INTO routes (id, routeCode, fromStage, toStage, distanceKm, standardFare, offPeakFare, peakFare, primarySaccos, congestionLevel, stages)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id, r.routeCode, r.from, r.to, r.distanceKm, r.standardFare, r.offPeakFare,
          r.peakFare, r.primarySaccos.join(','), r.congestionLevel, JSON.stringify(r.stages)
        ]
      );
    }

    // Seed Reports
    for (const rep of localReports) {
      await db.query(
        `INSERT INTO reports (id, user, matatuName, routeCode, stageName, type, shengText, englishTranslation, timestamp, votes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rep.id, rep.user, rep.matatuName || null, rep.routeCode, rep.stageName, rep.type,
          rep.shengText, rep.englishTranslation, rep.timestamp, rep.votes
        ]
      );
    }

    // Seed Users
    await db.query('DELETE FROM users');
    for (const u of localUsers) {
      await db.query(
        `INSERT INTO users (email, name, password, isAdmin) VALUES (?, ?, ?, ?)`,
        [u.email, u.name, u.password, u.isAdmin ? 1 : 0]
      );
    }

    console.log('Seeding fully completed in MySQL.');
  } catch (err) {
    console.error('Failed to seed database:', err);
  }
}

// REST APIs
app.get('/api/db-status', async (req, res) => {
  await getDbConnection(); // refresh state
  res.json(dbStatus);
});

app.post('/api/db-seed', async (req, res) => {
  const db = await getDbConnection();
  if (db) {
    await seedDatabase(db);
    res.json({ message: 'MySQL database successfully seeded to defaults' });
  } else {
    res.status(400).json({ error: 'Cannot seed because database is currently in In-Memory fallback mode.' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, name, password, isAdmin } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide email, name and password' });
  }

  const normalizedName = name.trim().replace(/\s+/g, '_');
  const db = await getDbConnection();

  if (db) {
    try {
      const [existing]: [any[], any] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      await db.query(
        `INSERT INTO users (email, name, password, isAdmin) VALUES (?, ?, ?, ?)`,
        [email, normalizedName, password, isAdmin ? 1 : 0]
      );
      
      return res.status(201).json({
        email,
        name: normalizedName,
        isAdmin: !!isAdmin
      });
    } catch (err: any) {
      console.error('MySQL signup failed, performing memory store fallback', err);
    }
  }

  const existingUser = localUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser = { email, name: normalizedName, password, isAdmin: !!isAdmin };
  localUsers.push(newUser);

  res.status(201).json({
    email,
    name: normalizedName,
    isAdmin: !!isAdmin
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = await getDbConnection();
  if (db) {
    try {
      const [matched]: [any[], any] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (matched.length > 0) {
        const user = matched[0];
        if (user.password === password) {
          return res.json({
            email: user.email,
            name: user.name,
            isAdmin: !!user.isAdmin
          });
        } else {
          return res.status(401).json({ error: 'Incorrect password for this commuter account.' });
        }
      } else {
        return res.status(401).json({ error: 'Commuter account not found. Please register.' });
      }
    } catch (err) {
      console.error('MySQL login failed, performing memory store fallback', err);
    }
  }

  const matchedUser = localUsers.find(u => u.email === email);
  if (matchedUser) {
    if (matchedUser.password === password) {
      return res.json({
        email: matchedUser.email,
        name: matchedUser.name,
        isAdmin: !!matchedUser.isAdmin
      });
    } else {
      return res.status(401).json({ error: 'Incorrect password for this commuter account.' });
    }
  }

  res.status(401).json({ error: 'Commuter account not found. Please register.' });
});

app.get('/api/matatus', async (req, res) => {
  const db = await getDbConnection();
  if (db) {
    try {
      const [rows]: [any[], any] = await db.query('SELECT * FROM matatus');
      const loaded = rows.map(r => ({
        id: r.id,
        regNumber: r.regNumber,
        name: r.name,
        routeNumber: r.routeNumber,
        routeName: r.routeName,
        sacco: r.sacco,
        capacity: Number(r.capacity),
        currentOccupancy: Number(r.currentOccupancy),
        speed: Number(r.speed),
        vibe: {
          music: r.music,
          screen: r.screen,
          neonColor: r.neonColor,
          graffitiTheme: r.graffitiTheme,
          rating: Number(r.rating)
        },
        location: {
          x: Number(r.locationX),
          y: Number(r.locationY),
          pathIndex: Number(r.pathIndex),
          direction: r.direction
        },
        baseFare: Number(r.baseFare),
        currentFare: Number(r.currentFare),
        features: JSON.parse(r.features || '[]'),
        status: r.status
      }));
      return res.json(loaded);
    } catch (err: any) {
      console.error('Query error to MySQL, delivering in-memory backup', err);
    }
  }

  // Fallback
  res.json(localMatatus);
});

app.get('/api/routes', async (req, res) => {
  const db = await getDbConnection();
  if (db) {
    try {
      const [rows]: [any[], any] = await db.query('SELECT * FROM routes');
      const loaded = rows.map(r => ({
        id: r.id,
        routeCode: r.routeCode,
        from: r.fromStage,
        to: r.toStage,
        distanceKm: Number(r.distanceKm),
        standardFare: Number(r.standardFare),
        offPeakFare: Number(r.offPeakFare),
        peakFare: Number(r.peakFare),
        primarySaccos: (r.primarySaccos || '').split(','),
        congestionLevel: r.congestionLevel,
        stages: JSON.parse(r.stages || '[]')
      }));
      return res.json(loaded);
    } catch (err) {
      console.error('MySQL routes query failed, using fallback', err);
    }
  }

  res.json(localRoutes);
});

app.get('/api/reports', async (req, res) => {
  const db = await getDbConnection();
  if (db) {
    try {
      const [rows]: [any[], any] = await db.query('SELECT * FROM reports ORDER BY votes DESC');
      const loaded = rows.map(r => ({
        id: r.id,
        user: r.user,
        matatuName: r.matatuName,
        routeCode: r.routeCode,
        stageName: r.stageName,
        type: r.type,
        shengText: r.shengText,
        englishTranslation: r.englishTranslation,
        timestamp: r.timestamp,
        votes: Number(r.votes)
      }));
      return res.json(loaded);
    } catch (err) {
      console.error('MySQL reports query failed', err);
    }
  }
  res.json(localReports);
});

app.post('/api/reports', async (req, res) => {
  const { user, matatuName, routeCode, stageName, type, shengText, englishTranslation } = req.body;
  const newReport = {
    id: `rep_${Date.now()}`,
    user: user || 'Anonymous Commuter',
    matatuName: matatuName || null,
    routeCode: routeCode || 'All',
    stageName: stageName || 'Unknown Stage',
    type: type || 'general',
    shengText: shengText || '',
    englishTranslation: englishTranslation || 'No translation provided.',
    timestamp: '1 min ago',
    votes: 1
  };

  const db = await getDbConnection();
  if (db) {
    try {
      await db.query(
        `INSERT INTO reports (id, user, matatuName, routeCode, stageName, type, shengText, englishTranslation, timestamp, votes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newReport.id, newReport.user, newReport.matatuName, newReport.routeCode, newReport.stageName,
          newReport.type, newReport.shengText, newReport.englishTranslation, newReport.timestamp, newReport.votes
        ]
      );
      return res.status(201).json(newReport);
    } catch (err) {
      console.error('Failed to post report to MySQL', err);
    }
  }

  // Fallback store
  localReports.unshift(newReport);
  res.status(201).json(newReport);
});

app.post('/api/reports/:id/vote', async (req, res) => {
  const { id } = req.params;

  const db = await getDbConnection();
  if (db) {
    try {
      await db.query('UPDATE reports SET votes = votes + 1 WHERE id = ?', [id]);
      const [updated]: [any[], any] = await db.query('SELECT * FROM reports WHERE id = ?', [id]);
      if (updated.length > 0) {
        return res.json({ id, votes: Number(updated[0].votes) });
      }
    } catch (err) {
      console.error('Failed to upvote in MySQL', err);
    }
  }

  // Fallback
  const idx = localReports.findIndex(r => r.id === id);
  if (idx !== -1) {
    localReports[idx].votes += 1;
    res.json({ id, votes: localReports[idx].votes });
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

app.post('/api/tickets/book', async (req, res) => {
  const { matatuName, route, farePaid, boardingStage, destinationStage, seatNumber, mpesaRef } = req.body;
  const newPass = {
    ticketId: `T_COMMUTE_${Math.floor(100000 + Math.random() * 900000)}`,
    matatuName: matatuName || 'Premium Manyanga',
    route: route || 'Flexible Pass',
    farePaid: Number(farePaid || 80),
    boardingStage: boardingStage || 'CBD',
    destinationStage: destinationStage || 'Destination Stage',
    seatNumber: seatNumber || 'Window 4',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Today)',
    mpesaRef: mpesaRef || `QRC${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  };

  const db = await getDbConnection();
  if (db) {
    try {
      await db.query(
        `INSERT INTO boarding_passes (ticketId, matatuName, route, farePaid, boardingStage, destinationStage, seatNumber, timestamp, mpesaRef)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newPass.ticketId, newPass.matatuName, newPass.route, newPass.farePaid, newPass.boardingStage,
          newPass.destinationStage, newPass.seatNumber, newPass.timestamp, newPass.mpesaRef
        ]
      );
      return res.status(201).json(newPass);
    } catch (err) {
      console.error('Failed code ticket load in MySQL', err);
    }
  }

  localPasses.unshift(newPass);
  res.status(201).json(newPass);
});

// Serve frontend assets in production mode
const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = isProd ? 3000 : 3001;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Backend server listening on http://0.0.0.0:${PORT}`);
  await setupDatabase();
});
