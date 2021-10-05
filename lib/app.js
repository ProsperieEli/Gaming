const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/games_owned', async(req, res) => {
  try {
    const data = await client.query(`SELECT 
    games_owned.id,
    games_owned.name,
    games_owned.owner_id,
    categories.genre
    from games_owned
    JOIN categories
    ON games_owned.genre_id = categories.id
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/games_owned/:id', async(req, res) => {
  try {
    const data = await client.query(`SELECT 
    games_owned.id,
    games_owned.name,
    games_owned.owner_id,
    categories.genre
    FROM games_owned
    JOIN categories
    ON games_owned.genre_id = categories.id
     WHERE games_owned.id = $1`, 
    [req.params.id]);
      
    res.json(data.rows[0]);
  } catch(e) {
      
    res.status(500).json({ error: e.message });
  }
});
//creating a new intry.
app.post('/games_owned', async(req, res) => {
  try{
    const data = await client.query(`
    INSERT into games_owned (name, owner_id, genre_id)
    VALUES ($1, $2, $3) RETURNING *`, [req.body.name, 1, req.body.genre_id]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/categories', async(req, res) => {
  try{
    const data = await client.query(`
    INSERT into categories (genre)
    VALUES ($1) RETURNING *`, [req.body.genre]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
//updating, setting
app.put('/games_owned/:id', async (req, res) => {
  try{ const data = await client.query(`
    UPDATE games_owned 
    SET name = $2, owner_id = $3
    WHERE id = $1
    RETURNING* `, [req.params.id, req.body.name, 1]);

  res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }

});

//no * in query
app.delete('/games_owned/:id', async(req, res) => {
  try{
    const data = await client.query(`DELETE from games_owned 
      WHERE id=$1 RETURNING*`, [req.params.id]);
    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});



//done

app.use(require('./middleware/error'));

module.exports = app;
