import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// CRÍTICO: Eliminamos la declaración global redundante aquí. 
// Ahora confiamos únicamente en backend/types/express.d.ts para la tipificación de req.user.

/**
 * Middleware para autenticar tokens JWT.
 * Inyecta el payload del usuario en req.user si el token es válido.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    // Formato esperado: Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Token expirado o inválido
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        
        // Adjuntar el usuario decodificado a la solicitud
        // El tipo es inferido correctamente por la Aumentación de Módulos en express.d.ts
        req.user = user as Express.Request['user'];
        next();
    });
};
