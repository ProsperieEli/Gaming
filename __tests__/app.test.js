require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns games_owned', async() => {

      const expectation = [
        {
          'id': 1,
          'name': 'Marvel\'s Avengers',
          'owner_id': 1,
          'genre': 'Action'
        },
        {
          'id': 2,
          'name': 'Red Dead Redemption 2',
          'owner_id': 1,
          'genre': 'Open-World'
        },
        {
          'id': 3,
          'name': 'League of Legends',
          'owner_id': 1,
          'genre': 'Action'
        },
        {
          'id': 4,
          'name': 'Spider-Man: Miles Morales',
          'owner_id': 1,
          'genre': 'Open-World'
        },
        {
          'id': 5,
          'name': 'Ghost of Tsushima',
          'owner_id': 1,
          'genre': 'Open-World'
        },
        {
          'id': 6,
          'name': 'Spider-Man',
          'owner_id': 1,
          'genre': 'Open-World'
        }
      ];
      const data = await fakeRequest(app)
        .get('/games_owned')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

    });

    test('returns one games owned', async() => {

      const expectation = 
            {
              'id': 3,
              'name': 'League of Legends',
              'owner_id': 1,
              'genre': 'Action'
            }
          ;

      const data = await fakeRequest(app)
        .get('/games_owned/3')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    

    test('post games owned', async() => {

      const expectation = 
          {
            'id': expect.any(Number),
            'name': 'Sonic',
            'owner_id': 1,
            'genre_id': 2
          };
      const data = await fakeRequest(app)
        .post('/games_owned')
        .send({  name: 'Sonic', genre_id:2 })
        .expect('Content-Type', /json/)
        .expect(200);
    
      expect(data.body).toEqual(expectation);
    });
    
    test('update all games_owned', async() => {
      const expectation = 
          {
            id: expect.any(Number),
            name: 'Sonic',
            owner_id: 1,
            genre_id: 2
          };
      const data = await fakeRequest(app)
        .put('/games_owned/7')
        .send({ name: 'Sonic', genre_id: 2 })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('delete a test', async() => {
      const expectation = 
          {
            id: expect.any(Number),
            name: 'Sonic',
            owner_id: 1,
            genre_id:2
          };
      const data = await fakeRequest(app)
        .delete('/games_owned/7')
        .send({ name: 'Sonic', genre_id: 2 })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});



