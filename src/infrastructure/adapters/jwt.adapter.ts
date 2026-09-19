import jwt from 'jsonwebtoken';
import { envs } from '../../config/envs';

export class JwtAdapter {
  static generate(
    payload: Record<string, unknown>,
    duration: string = envs.JWT_EXPIRES_IN,
  ): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        envs.JWT_SEED,
        { expiresIn: duration } as jwt.SignOptions,
        (error, token) => {
          if (error || !token) return resolve(null);
          resolve(token);
        },
      );
    });
  }

  static verify<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, envs.JWT_SEED, (error, decoded) => {
        if (error || !decoded) return resolve(null);
        resolve(decoded as T);
      });
    });
  }
}
