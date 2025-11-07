/**
 * Error Response Standardization Tests
 * Verifies that all API errors follow the standardized format
 */

const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('Error Response Standardization', () => {
  
  describe('Error Response Format', () => {
    
    it('should return standardized error format for 404 Not Found', async () => {
      const res = await request(app)
        .get('/api/v1/nonexistent-endpoint')
        .expect(404);
      
      // Verify error structure
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error).to.have.property('code');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('requestId');
      
      // Verify values
      expect(res.body.error.statusCode).to.equal(404);
      expect(res.body.error.code).to.equal('NOT_FOUND');
    });

    it('should return standardized error for validation errors', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          username: 'ab', // Too short
          password: '123', // Too short
          email: 'invalid-email' // Invalid format
        })
        .expect(400);
      
      expect(res.body).to.have.property('error');
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
      expect(res.body.error.statusCode).to.equal(400);
      expect(res.body.error).to.have.property('details');
      expect(res.body.error.details).to.be.an('array');
    });

    it('should return standardized error for authentication failures', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(res.body).to.have.property('error');
      expect(res.body.error.code).to.equal('INVALID_CREDENTIALS');
      expect(res.body.error.statusCode).to.equal(401);
      expect(res.body.error).to.have.property('message');
      expect(res.body.error).to.have.property('requestId');
    });

    it('should return standardized error for missing authentication token', async () => {
      const res = await request(app)
        .get('/api/v1/activities')
        .expect(401);
      
      expect(res.body).to.have.property('error');
      expect(res.body.error.code).to.equal('NO_TOKEN');
      expect(res.body.error.statusCode).to.equal(401);
    });

    it('should return standardized error for invalid authentication token', async () => {
      const res = await request(app)
        .get('/api/v1/activities')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);
      
      expect(res.body).to.have.property('error');
      expect(res.body.error.code).to.equal('INVALID_TOKEN');
      expect(res.body.error.statusCode).to.equal(401);
    });
  });

  describe('Error Code Consistency', () => {
    
    it('should use consistent error codes across endpoints', async () => {
      // Test 404 on different endpoints
      const endpoints = [
        '/api/v1/activities/123456789012345678901234', // Invalid ObjectId format will be caught
        '/api/v1/health-metrics/123456789012345678901234',
        '/api/v1/nonexistent'
      ];

      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);
        expect(res.body).to.have.property('error');
        expect(res.body.error).to.have.property('code');
        expect(res.body.error).to.have.property('statusCode');
        expect(res.body.error).to.have.property('requestId');
      }
    });
  });

  describe('Request ID Tracking', () => {
    
    it('should include unique requestId in all error responses', async () => {
      const res1 = await request(app).get('/api/v1/nonexistent1');
      const res2 = await request(app).get('/api/v1/nonexistent2');
      
      expect(res1.body.error).to.have.property('requestId');
      expect(res2.body.error).to.have.property('requestId');
      
      // Request IDs should be unique
      expect(res1.body.error.requestId).to.not.equal(res2.body.error.requestId);
    });
  });

  describe('Error Details Field', () => {
    
    it('should include details array for validation errors', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          username: 'a',
          password: '1',
          email: 'bad'
        })
        .expect(400);
      
      expect(res.body.error).to.have.property('details');
      expect(res.body.error.details).to.be.an('array');
      expect(res.body.error.details.length).to.be.greaterThan(0);
      
      // Each detail should have field and message
      res.body.error.details.forEach(detail => {
        expect(detail).to.have.property('field');
        expect(detail).to.have.property('message');
      });
    });

    it('should not include details for non-validation errors', async () => {
      const res = await request(app)
        .get('/api/v1/activities')
        .expect(401);
      
      // Details may be null or undefined for non-validation errors
      if (res.body.error.details) {
        expect(res.body.error.details).to.be.null;
      }
    });
  });

  describe('Development vs Production Mode', () => {
    
    it('should include stack trace in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);
      
      if (process.env.NODE_ENV === 'development') {
        expect(res.body.error).to.have.property('stack');
      }
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);
      
      expect(res.body.error).to.not.have.property('stack');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('HTTP Status Code Consistency', () => {
    
    it('should match statusCode in error object with HTTP status', async () => {
      const testCases = [
        { endpoint: '/api/v1/nonexistent', expectedStatus: 404 },
        { endpoint: '/api/v1/activities', method: 'get', expectedStatus: 401 }
      ];

      for (const testCase of testCases) {
        const method = testCase.method || 'get';
        const res = await request(app)[method](testCase.endpoint);
        
        expect(res.status).to.equal(testCase.expectedStatus);
        expect(res.body.error.statusCode).to.equal(testCase.expectedStatus);
      }
    });
  });
});
