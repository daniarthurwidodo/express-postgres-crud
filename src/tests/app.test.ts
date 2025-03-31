import request from 'supertest';
import app from '../app';

describe('Express App Tests', () => {
    describe('GET /', () => {
        it('should return a 200 status code', async () => {
            const response = await request(app).get('/');
            expect(response.status).toBe(200);
        });

        it('should return the correct welcome message', async () => {
            const response = await request(app).get('/');
            expect(response.text).toBe('Express + TypeScript Server');
        });
    });

    describe('API Routes', () => {
        it('should have the products endpoint available', async () => {
            const response = await request(app).get('/api/products');
            // Even if empty, the endpoint should respond (not 404)
            expect(response.status).not.toBe(404);
        });
    });

    // Mock tests for basic error handling
    describe('Error Handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app).get('/non-existent-route');
            expect(response.status).toBe(404);
        });
    });
});