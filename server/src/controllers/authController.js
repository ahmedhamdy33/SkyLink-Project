import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/db.js';
import { users } from '../data/skylinkData.js';
import { AppError, asyncHandler } from '../utils/errors.js';

function signToken(user) {
  return jwt.sign(
    {
      id: user.user_id,
      email: user.email,
      role: user.role,
      fullName: user.full_name
    },
    process.env.JWT_SECRET || 'skylink-secret-123',
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  return {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    nationality: user.nationality,
    role: user.role,
    created_at: user.created_at
  };
}

function memoryLogin(email, password) {
  const user = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) throw new AppError('Invalid email or password.', 401);
  return user;
}

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, nationality } = req.body;

  if (!fullName || !email || !password) {
    throw new AppError('Full name, email, and password are required.', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400);
  }

  try {
    const pool = await getPool();
    const exists = await pool
      .request()
      .input('email', sql.NVarChar(180), email.trim().toLowerCase())
      .query('SELECT user_id FROM dbo.Users WHERE email = @email');

    if (exists.recordset.length) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool
      .request()
      .input('full_name', sql.NVarChar(120), fullName.trim())
      .input('email', sql.NVarChar(180), email.trim().toLowerCase())
      .input('password_hash', sql.NVarChar(255), passwordHash)
      .input('phone', sql.NVarChar(40), phone || null)
      .input('nationality', sql.NVarChar(80), nationality || null)
      .query(`
        INSERT INTO dbo.Users (full_name, email, password_hash, phone, nationality, role)
        OUTPUT inserted.user_id, inserted.full_name, inserted.email, inserted.phone, inserted.nationality, inserted.role, inserted.created_at
        VALUES (@full_name, @email, @password_hash, @phone, @nationality, N'customer')
      `);

    const user = result.recordset[0];
    return res.status(201).json({ token: signToken(user), user: sanitizeUser(user) });
  } catch (error) {
    if (error instanceof AppError && error.statusCode !== 500) throw error;
    const user = {
      user_id: users.length + 1,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone,
      nationality,
      role: 'customer',
      created_at: new Date().toISOString()
    };
    users.push(user);
    return res.status(201).json({ token: signToken(user), user: sanitizeUser(user) });
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', sql.NVarChar(180), email.trim().toLowerCase())
      .query('SELECT * FROM dbo.Users WHERE email = @email');

    let user = result.recordset[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      user = memoryLogin(email, password);
    }

    return res.json({ token: signToken(user), user: sanitizeUser(user) });
  } catch (error) {
    if (error instanceof AppError) throw error;
    const user = memoryLogin(email, password);
    return res.json({ token: signToken(user), user: sanitizeUser(user) });
  }
});
