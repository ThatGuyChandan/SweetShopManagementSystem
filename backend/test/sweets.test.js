const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const sweetsRouter = require('../routes/sweets');
const { auth, admin } = require('../middleware/auth');

// Mock the auth and admin middleware
jest.mock('../middleware/auth', () => ({
  auth: (req, res, next) => {
    req.user = { id: 'userId', role: 'customer' };
    next();
  },
  admin: (req, res, next) => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ msg: 'Access denied' });
    }
  },
}));

const app = express();
app.use(express.json());
app.use('/api/sweets', sweetsRouter);

describe('Sweets API', () => {
  beforeAll(async () => {
    const url = 'mongodb://127.0.0.1/test-db';
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should not allow a customer to delete a sweet', async () => {
    const res = await request(app).delete('/api/sweets/some-id');
    expect(res.statusCode).toEqual(403);
  });
});
