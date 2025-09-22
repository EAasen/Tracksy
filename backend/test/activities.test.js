process.env.NODE_ENV='test';
process.env.JWT_SECRET='testsecret';
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app; let User, Route, Activity;

async function signup(username,email){
  const res = await request(app).post('/signup').send({username, password:'Password123!', email});
  return res.body.accessToken;
}

describe('Activity API', function(){
  this.timeout(20000);
  let mongo; let tokenA; let tokenB; let routeId; let activityId;
  before(async ()=>{
    mongo = await MongoMemoryServer.create();
    process.env.DATABASE_URL = mongo.getUri();
    app = require('../app');
    ({ User, Route, Activity } = require('../config/database'));
    if (mongoose.connection.readyState !== 1) {
      await new Promise((res,rej)=>{mongoose.connection.once('open',res); mongoose.connection.once('error',rej);});
    }
    tokenA = await signup('actuser','actuser@example.com');
    tokenB = await signup('other','other@example.com');
    // create a route for association
    const r = await request(app).post('/routes').set('Authorization','Bearer '+tokenA).send({
      name:'Assoc Route', geojson:{type:'LineString',coordinates:[[0,0],[0.01,0.01]]}
    });
    routeId = r.body.id;
  });

  after(async ()=>{
    if (mongoose.connection.readyState === 1) await mongoose.connection.close();
    if (mongo) await mongo.stop();
  });

  it('creates activity with route fallback distance', async ()=>{
    const start = new Date().toISOString();
    const end = new Date(Date.now()+ 30*60000).toISOString();
    const res = await request(app).post('/activities').set('Authorization','Bearer '+tokenA).send({
      type:'run', routeId, startTime:start, endTime:end, notes:'Morning run'
    }).expect(201);
    res.body.should.have.property('id');
    activityId = res.body.id;
  });

  it('denies other user fetching private activity', async ()=>{
    await request(app).get('/activities/'+activityId).set('Authorization','Bearer '+tokenB).expect(403);
  });

  it('lists own activities', async ()=>{
    const res = await request(app).get('/activities').set('Authorization','Bearer '+tokenA).expect(200);
    res.body.items.length.should.be.greaterThan(0);
  });

  it('updates activity distance & metrics', async ()=>{
    await request(app).put('/activities/'+activityId).set('Authorization','Bearer '+tokenA).send({distanceMeters: 5000, metrics:{avgPace:300}}).expect(200);
  });

  it('soft deletes activity and hides it', async ()=>{
    await request(app).delete('/activities/'+activityId).set('Authorization','Bearer '+tokenA).expect(200);
    await request(app).get('/activities/'+activityId).set('Authorization','Bearer '+tokenA).expect(404);
  });

  it('rejects invalid time range', async ()=>{
    const end = new Date().toISOString();
    const start = new Date(Date.now()+ 60*60000).toISOString();
    await request(app).post('/activities').set('Authorization','Bearer '+tokenA).send({
      type:'run', startTime:start, endTime:end
    }).expect(400);
  });
});
