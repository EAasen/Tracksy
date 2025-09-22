const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');
let app;

const sampleGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Test">
  <trk><name>Test Track</name><trkseg>
    <trkpt lat="40.0000" lon="-105.0000"><ele>1600</ele><time>2025-09-21T10:00:00Z</time></trkpt>
    <trkpt lat="40.0005" lon="-105.0005"><ele>1605</ele><time>2025-09-21T10:05:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`;

describe('GPX Upload & Analytics', function() {
  this.timeout(20000);
  let mongo;
  let token;

  before(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.DATABASE_URL = mongo.getUri();
    process.env.JWT_SECRET = 'testsecret';
    delete require.cache[require.resolve('../app')];
    app = require('../app');
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  it('signs up a user', async () => {
    const res = await request(app).post('/signup').send({ username: 'u1', password: 'Password123', email: 'u1@example.com' });
    res.status.should.equal(201);
    res.body.should.have.property('accessToken');
    token = res.body.accessToken;
  });

  it('uploads a GPX file creating route and activity', async () => {
    const res = await request(app)
      .post('/gpx/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(sampleGpx, 'utf8'), 'test.gpx');
    res.status.should.equal(201);
    res.body.should.have.property('routeId');
    res.body.should.have.property('activityId');
  });

  it('returns analytics summary', async () => {
    const res = await request(app)
      .get('/analytics/summary')
      .set('Authorization', `Bearer ${token}`);
    res.status.should.equal(200);
    res.body.should.have.property('totalCount');
  });

  it('returns dashboard metrics', async () => {
    const res = await request(app)
      .get('/dashboard/metrics')
      .set('Authorization', `Bearer ${token}`);
    res.status.should.equal(200);
    res.body.should.have.property('activityCount');
  });
});
