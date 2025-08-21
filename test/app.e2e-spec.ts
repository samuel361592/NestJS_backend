import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let testUser = {
    name: 'e2euser',
    email: 'e2euser@example.com',
    password: 'test1234',
    age: 20,
  };
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('註冊新用戶 /auth/register', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    expect(res.body).toHaveProperty('message', '註冊成功');
    expect(res.body).toHaveProperty('token');
  });

  it('重複註冊 /auth/register', async () => {
    await request(server)
      .post('/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('登入 /auth/login', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('登入失敗 /auth/login', async () => {
    await request(server)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('取得 profile (未登入) /auth/profile', async () => {
    await request(server)
      .get('/auth/profile')
      .expect(401);
  });

  it('取得 profile (登入) /auth/profile', async () => {
    const res = await request(server)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testUser.email);
  });
});
