const bcrypt = require('bcryptjs');
const client = require('../lib/client');
// import our seed data:
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const { gamesOwned } = require('./data.js');
const { categories } = require('./genre.js');
run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        const hash = bcrypt.hashSync(user.password, 8);
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, hash]);
      })
    );
      
    const user = users[0].rows[0];
    await Promise.all(
      categories.map(category => {
        return client.query(`
                    INSERT INTO categories (genre)
                    VALUES ($1);
                `,
        [category.genre]);
      })
    );
    

    await Promise.all(
      gamesOwned.map(game => {
        return client.query(`
                    INSERT INTO games_owned (name, owner_id, genre_id)
                    VALUES ($1, $2, $3);
                `,
        [game.name, user.id, game.genre_id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}

