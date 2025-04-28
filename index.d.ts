import { ILogger } from '@/utils/logger';

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      log: ILogger;
    }
  }
}

export {};
