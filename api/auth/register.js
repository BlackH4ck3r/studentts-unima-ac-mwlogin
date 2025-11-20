import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  try {
    // In production, you should hash the password!
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, password, created_at) VALUES ($1, $2, NOW()) RETURNING id, username',
      [username, password] // Use hashedPassword in production
    );

    res.json({ 
      success: true, 
      user: { id: result.rows[0].id, username: result.rows[0].username }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.json({ success: false, message: 'Username already exists' });
    }
    
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
}
