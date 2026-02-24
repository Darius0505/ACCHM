/**
 * Auth Service Unit Tests
 */

import { authService } from '@/services/auth.service';

describe('authService', () => {
    describe('hashPassword', () => {
        it('should hash a password', async () => {
            const password = 'testPassword123';
            const hash = await authService.hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(10);
        });

        it('should create different hashes for same password', async () => {
            const password = 'testPassword123';
            const hash1 = await authService.hashPassword(password);
            const hash2 = await authService.hashPassword(password);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('verifyPassword', () => {
        it('should verify correct password', async () => {
            const password = 'testPassword123';
            const hash = await authService.hashPassword(password);
            const isValid = await authService.verifyPassword(password, hash);

            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const password = 'testPassword123';
            const hash = await authService.hashPassword(password);
            const isValid = await authService.verifyPassword('wrongPassword', hash);

            expect(isValid).toBe(false);
        });
    });
});
