const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'omnisecai_security',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'omnisecai_secure_2024',
});

async function createUser() {
  try {
    // User details
    const email = 'kola@omnisecai.com';
    const password = 'Kola@2024!Secure'; // Strong password for the user
    const firstName = 'Kola';
    const lastName = 'User';
    const role = 'admin'; // Admin role for full access

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Get default organization
    const orgResult = await pool.query(
      'SELECT id FROM organizations WHERE slug = $1',
      ['omnisecai-demo']
    );

    if (orgResult.rows.length === 0) {
      throw new Error('Default organization not found');
    }

    const organizationId = orgResult.rows[0].id;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ User already exists:', email);
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👤 Role: admin');
      return;
    }

    // Create user
    const result = await pool.query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [organizationId, email, passwordHash, firstName, lastName, role]
    );

    const user = result.rows[0];

    console.log('🎉 User created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', `${firstName} ${lastName}`);
    console.log('🛡️ Role:', role);
    console.log('🏢 Organization:', 'omnisecai-demo');
    console.log('📅 Created:', user.created_at);
    console.log('🆔 User ID:', user.id);

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await pool.end();
  }
}

createUser();