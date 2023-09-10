const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', 'views');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'RecipeBook',
    password: 'root',
    port: 5432,
});


// Route to display all recipes on the homepage
app.get('/recipes', (req, res) => {
  const query = 'SELECT id, title, ingredients, steps, image_url FROM recipes';

  pool.query(query, (error, result) => {
    if (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const recipes = result.rows;
      res.render('recipes', { recipes });
    }
  });
});


// Route to view a single recipe's details
app.get('/recipe/:id', (req, res) => {
    // Fetch and display the details of a specific recipe based on :id
    // You'll need to implement this query
});

// Route to add a rating for a recipe
app.post('/recipe/:id/rate', (req, res) => {
    // Add a new rating for the specified recipe and update its average rating
    // You'll need to implement this functionality
});

// Route to update recipe details
app.post('/recipe/:id/update', (req, res) => {
    // Update the details of a specific recipe based on :id
    // You'll need to implement this functionality
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
