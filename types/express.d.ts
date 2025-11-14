import { Request } from 'express';

/**
 * Define la estructura del objeto de usuario inyectado por el middleware JWT.
 * Asumimos que el middleware consulta la DB y adjunta estos campos.
 */
export interface UserPayload {
    id: string;
    email: string;
    role: string;
    referral_code: string;
}

// 1. Declaración de Módulos: Extiende la interfaz Request global de Express
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload; // El usuario puede ser opcional antes de la autenticación
        }
    }
}

/**
 * Tipo de Solicitud Autenticada: Garantiza que req.user está presente.
 * Se usa en rutas que pasan por authenticateToken.
 */
export interface AuthenticatedRequest extends Request {
    user: UserPayload;
}
