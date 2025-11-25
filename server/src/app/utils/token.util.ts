import jwt, { JwtPayload, SignOptions, Secret } from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET: Secret = process.env.JWT_SECRET;

export interface TokenPayload extends JwtPayload {
    userId: string;
    email: string;
    role: 'admin' | 'manager' | 'member';
}

// issue a jwt token

export function issueToken(payload: TokenPayload, expiresIn: string | number = '1h'): string {
    const options: SignOptions = { expiresIn: expiresIn as unknown as SignOptions['expiresIn'] };
    return jwt.sign(payload as JwtPayload, JWT_SECRET, options);
}

// verifying the access token
export function verifyToken(token: string): TokenPayload{

    try{

        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;

    }
    catch(err){
        console.log('Token verification error:', err);
        throw new Error('Invalid or expired token');
    }

}

// extracting the access token from authorization header
export function extractToken(authHeader: string | undefined) : string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];

}