process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app; // will require after memory server started
let User, Token;

// Utility to clear collections
async function clearAuthCollections() {
  if (User) await User.deleteMany({});
  if (Token) await Token.deleteMany({});
}

describe('Auth Flow', function() {
  this.timeout(20000);
  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.DATABASE_URL = uri; // used by database.js on import
    // Now require app & models
    app = require('../app');
    ({ User, Token } = require('../config/database'));
    // Wait until mongoose connected to memory server
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        mongoose.connection.once('open', resolve);
        mongoose.connection.once('error', reject);
      });
    }
  });

  beforeEach(async () => {
    await clearAuthCollections();
  });

  after(async () => {
    await clearAuthCollections();
    if (mongoose.connection.readyState === 1) await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  it('should sign up a user and issue tokens', async () => {
    const res = await request(app)
      .post('/signup')
      .send({ username: 'alice', password: 'Password123!', email: 'alice@example.com' })
      .expect(201);
    res.body.should.have.property('accessToken');
    res.body.should.have.property('refreshToken');
    res.body.should.have.property('emailVerificationToken');
  });

  it('should login a user and rotate refresh token', async () => {
    await request(app).post('/signup').send({ username: 'bob', password: 'Password123!', email: 'bob@example.com' });
    const login = await request(app).post('/login').send({ username: 'bob', password: 'Password123!' }).expect(200);
    login.body.should.have.property('accessToken');
    login.body.should.have.property('refreshToken');
  });

  it('should refresh access token', async () => {
    const signup = await request(app).post('/signup').send({ username: 'carol', password: 'Password123!', email: 'carol@example.com' });
    const refresh = await request(app).post('/token/refresh').send({ refreshToken: signup.body.refreshToken }).expect(200);
    refresh.body.should.have.property('accessToken');
    refresh.body.should.have.property('refreshToken');
  });

  it('should request password recovery and reset password', async () => {
    const signup = await request(app).post('/signup').send({ username: 'dave', password: 'Password123!', email: 'dave@example.com' });
    await request(app).post('/password-recovery').send({ email: 'dave@example.com' }).expect(200);
    const tokenDoc = await Token.findOne({ purpose: 'password_reset' });
    if (!tokenDoc) throw new Error('No password reset token generated');
    // We stored only hash; need to simulate by generating new raw matching hash (not possible). Instead adjust flow: get raw from response.
    // For test simplicity, create a fresh one we control:
    const crypto = require('crypto');
    const raw = crypto.randomBytes(32).toString('hex');
    tokenDoc.tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    tokenDoc.expiresAt = new Date(Date.now()+1000*60*5); await tokenDoc.save();
    await request(app).post('/password-reset').send({ token: raw, password: 'NewPassword123!' }).expect(200);
    // login with new password
    await request(app).post('/login').send({ username: 'dave', password: 'NewPassword123!' }).expect(200);
  });

  it('should verify email using token', async () => {
    const signup = await request(app).post('/signup').send({ username: 'eve', password: 'Password123!', email: 'eve@example.com' });
    await request(app).post('/verify-email').send({ token: signup.body.emailVerificationToken }).expect(200);
    const user = await User.findOne({ username: 'eve' });
    if (!user.emailVerified) throw new Error('Email not verified');
  });
});
