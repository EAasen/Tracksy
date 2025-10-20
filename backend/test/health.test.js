const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('GET /healthz', () => {
  it('should return 200 and health status', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status');
    expect(res.body).to.have.property('uptime');
    expect(res.body).to.have.property('timestamp');
    expect(res.body).to.have.property('database');
    expect(res.body).to.have.property('version');
    expect(['ok', 'degraded']).to.include(res.body.status);
  });

  it('should complete in under 100ms', async () => {
    const start = Date.now();
    await request(app).get('/healthz');
    const duration = Date.now() - start;
    expect(duration).to.be.lessThan(100);
  });
});
