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
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      // Verify password (you should use proper password hashing in production)
      if (user.password === password) {
        return res.json({ success: true, user: { id: user.id, username: user.username } });
      } else {
        return res.json({ success: false, message: 'Invalid password' });
      }
    } else {
      return res.json({ success: false, userNotFound: true });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
