import { SupabaseStorageService } from './SupabaseStorageService';
import { IStorageService } from './types';

export * from './types';
export * from './SupabaseStorageService';

// Singleton service instance following Dependency Inversion Principle
export const storageService: IStorageService = new SupabaseStorageService();
