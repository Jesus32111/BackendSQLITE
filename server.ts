import 'dotenv/config'; // CRÍTICO: Carga las variables de entorno del .env primero
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { db } from './database/db'; // db.ts ahora puede acceder a process.env
import authRouter from './routes/auth'; // FIX: Importa authRouter desde auth.ts
import { authenticateToken } from './middleware/authMiddleware';
// Eliminamos la importación de AuthenticatedRequest para evitar TS2769

// --- Configuration ---
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const app = express();

// --- Middleware ---
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// --- Routes ---

// Public Auth Routes
app.use('/api/auth', authRouter); // FIX: Usa authRouter

/**
 * Ruta de Perfil Protegida
 * Usamos Request estándar y aserción de no-nulo (!) ya que authenticateToken garantiza req.user.
 */
app.get('/api/profile', authenticateToken, (req: Request, res: Response) => {
  // Usamos la aserción de no-nulo (!) para garantizar que 'user' existe después del middleware.
  const user = req.user!; 
  res.json({ 
    message: `Bienvenido, ${user.email}!`,
    user_id: user.id,
    role: user.role,
    // Datos placeholder requeridos para la siguiente fase
    balance: '$0.00',
    account_status: 'Activo',
    referral_code: user.referral_code
  });
});

// Health Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Melu Backend Service Running.');
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`[SERVER] 🚀 Servidor Express corriendo en http://localhost:${PORT}`);
  console.log(`[CORS] Origen permitido: ${CORS_ORIGIN}`);
});
