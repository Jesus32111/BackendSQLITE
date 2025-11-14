import { Client } from '@libsql/client';
import { db } from '../database/db';

/**
 * Genera un código aleatorio de 6 caracteres: 3 letras mayúsculas seguidas de 3 dígitos. (Ej: ABC123)
 */
function generateCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = '';

    // 3 letras
    for (let i = 0; i < 3; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    // 3 números
    for (let i = 0; i < 3; i++) {
        code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return code;
}

/**
 * Genera un código de referido único, verificando que no exista en la base de datos.
 * @param db Cliente de la base de datos.
 * @returns El código de referido único.
 */
export async function generateUniqueReferralCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (!isUnique && attempts < MAX_ATTEMPTS) {
        code = generateCode();
        
        const result = await db.execute({
            sql: "SELECT 1 FROM users WHERE referral_code = ?",
            args: [code]
        });

        if (result.rows.length === 0) {
            isUnique = true;
            return code;
        }
        attempts++;
    }
    throw new Error("Failed to generate a unique referral code after multiple attempts.");
}
