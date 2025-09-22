process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;
let User, Route;

async function authUser(username='tester', email='tester@example.com') {
  const res = await request(app).post('/signup').send({ username, password: 'Password123!', email });
  return res.body.accessToken;
}

describe('Route API', function() {
  this.timeout(20000);
  let mongoServer;
  let userTokenA, userTokenB;
  let routeId;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.DATABASE_URL = mongoServer.getUri();
    app = require('../app');
    ({ User, Route } = require('../config/database'));
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        mongoose.connection.once('open', resolve);
        mongoose.connection.once('error', reject);
      });
    }
    userTokenA = await authUser('alice','alice@example.com');
    userTokenB = await authUser('bob','bob@example.com');
  });

  after(async () => {
    if (mongoose.connection.readyState === 1) await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  it('creates a route', async () => {
    const res = await request(app)
      .post('/routes')
      .set('Authorization', 'Bearer ' + userTokenA)
      .send({
        name: 'Lakeside Loop',
        description: 'Test route',
        visibility: 'private',
        tags: ['Lake','Loop'],
        geojson: { type: 'LineString', coordinates: [[10,59],[10.001,59.001],[10.002,59.002]] }
      })
      .expect(201);
    res.body.should.have.property('id');
    res.body.should.have.property('distanceMeters');
    routeId = res.body.id;
  });

  it('fetches own private route', async () => {
    const res = await request(app)
      .get(`/routes/${routeId}`)
      .set('Authorization', 'Bearer ' + userTokenA)
      .expect(200);
    res.body.name.should.equal('Lakeside Loop');
  });

  it('denies other user access to private route', async () => {
    await request(app)
      .get(`/routes/${routeId}`)
      .set('Authorization', 'Bearer ' + userTokenB)
      .expect(403);
  });

  it('lists routes (owner sees private)', async () => {
    const res = await request(app)
      .get('/routes')
      .set('Authorization', 'Bearer ' + userTokenA)
      .expect(200);
    res.body.items.length.should.be.greaterThan(0);
  });

  it('updates route geometry & tags', async () => {
    await request(app)
      .put(`/routes/${routeId}`)
      .set('Authorization', 'Bearer ' + userTokenA)
      .send({ tags: ['lake','loop','updated'], geojson: { type: 'LineString', coordinates: [[10,59],[10.01,59.01]] } })
      .expect(200);
  });

  it('soft deletes route', async () => {
    await request(app)
      .delete(`/routes/${routeId}`)
      .set('Authorization', 'Bearer ' + userTokenA)
      .expect(200);
    await request(app)
      .get(`/routes/${routeId}`)
      .set('Authorization', 'Bearer ' + userTokenA)
      .expect(404);
  });

  it('rejects too short route', async () => {
    await request(app)
      .post('/routes')
      .set('Authorization', 'Bearer ' + userTokenA)
      .send({ name: 'Short', geojson: { type: 'LineString', coordinates: [[0,0],[0,0]] } })
      .expect(400);
  });
});
