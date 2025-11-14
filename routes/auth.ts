import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db';
import { generateUniqueReferralCode } from '../utils/referralGenerator';
import { randomUUID } from 'crypto';

const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const GLOBAL_REFERRAL_CODE = 'BCA332'; // Código de referido global requerido

// Interfaz para el payload del JWT
interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

/**
 * POST /api/auth/register
 * Registra un nuevo usuario.
 */
authRouter.post('/register', async (req: Request, res: Response) => {
    const { email, password, referral_code: referredByCode } = req.body;

    if (!email || !password || !referredByCode) {
        return res.status(400).json({ error: 'Email, password, and referral code are required.' });
    }

    // 1. Validar código de referido global
    if (referredByCode !== GLOBAL_REFERRAL_CODE) {
        return res.status(400).json({ error: 'Invalid global referral code.' });
    }

    try {
        // 2. Verificar si el usuario ya existe
        const existingUser = await db.execute({
            sql: "SELECT id FROM users WHERE email = ?",
            args: [email]
        });

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }

        // 3. Hashing de la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 4. Generar código de referido único (ABC123)
        const uniqueReferralCode = await generateUniqueReferralCode();
        
        const userId = randomUUID();
        const defaultRole = 'usuario';
        const createdAt = Date.now();

        // 5. Insertar nuevo usuario
        await db.execute({
            sql: `INSERT INTO users (id, email, password_hash, role, referral_code, referred_by, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [userId, email, password_hash, defaultRole, uniqueReferralCode, referredByCode, createdAt]
        });

        console.log(`[AUTH] Nuevo usuario registrado: ${email} con código: ${uniqueReferralCode}`);

        // 6. Generar JWT para iniciar sesión automáticamente
        const token = jwt.sign({ id: userId, email, role: defaultRole } as JwtPayload, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: 'Registration successful.',
            token,
            user: {
                id: userId,
                email,
                role: defaultRole,
                referral_code: uniqueReferralCode
            }
        });

    } catch (error) {
        console.error('[REGISTER ERROR]', error);
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
});

/**
 * POST /api/auth/login
 * Inicia sesión y devuelve un token JWT.
 */
authRouter.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        // 1. Buscar usuario por email
        const result = await db.execute({
            sql: "SELECT id, email, password_hash, role FROM users WHERE email = ?",
            args: [email]
        });

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const storedHash = user.password_hash as string;

        // 2. Comparar contraseña
        const isMatch = await bcrypt.compare(password, storedHash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 3. Generar JWT
        const payload: JwtPayload = {
            id: user.id as string,
            email: user.email as string,
            role: user.role as string,
        };
        
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        res.status(500).json({ error: 'Internal server error during login.' });
    }
});

export default authRouter;
