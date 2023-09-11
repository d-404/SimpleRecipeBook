const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());

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
    const query = `
    SELECT recipes.id, recipes.title, recipes.ingredients, recipes.steps, recipes.image_url,
    CASE
        WHEN COUNT(ratings.rating) > 0 THEN ROUND(AVG(ratings.rating), 2)
        ELSE 0
    END AS average_rating
    FROM recipes
    LEFT JOIN ratings ON recipes.id = ratings.recipe_id
    GROUP BY recipes.id, recipes.title, recipes.ingredients, recipes.steps, recipes.image_url
    ORDER BY average_rating DESC;
    `;

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
app.get('/recipe/:id', async (req, res) => {
    const recipeId = req.params.id;

    const query = 'SELECT title, ingredients, steps, image_url FROM recipes WHERE id = $1';
    try {
        const recipeResult = await pool.query(query, [recipeId]);

        if (recipeResult.rows.length === 0) {
            res.status(404).json({ error: 'Recipe not found' });
            return;
        }

        const recipe = recipeResult.rows[0];
        res.render('recipeDetails', { recipe });
        // res.render('recipeDetails', { recipe: result.rows[0] });

    } catch (error) {
        console.error('Error fetching recipe details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/add', async (req, res) => {
    console.log('Add is working');
    try {
        const { title, ingredients, steps, image_url } = req.body;

        const query = 'INSERT INTO recipes (title, ingredients, steps, image_url) VALUES ($1, $2, $3, $4) RETURNING id';
        const values = [title, ingredients, steps, image_url];

        const result = await pool.query(query, values);
        const newRecipeId = result.rows[0].id;

        res.status(201).json({ message: 'Recipe added successfully', newRecipeId });
    } catch (error) {
        console.error('Error adding recipe:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to add a rating for a recipe
app.post('/recipe/:id/rate', (req, res) => {
    console.log('Recipe Id:' + recipeId);
    const recipeId = req.params.id;
    const { rating } = req.body;

    const query = 'INSERT INTO ratings (recipe_id, rating) VALUES ($1, $2);';
    const values = [recipeId, rating];

    pool.query(query, values, (error, result) => {
        if (error) {
            console.error('Error updating recipe rating:', error);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.redirect(`/recipe/${recipeId}`);
        }
    });
});


// Route to update recipe details
app.get('/recipe/update/:id', (req, res) => {
    const recipeId = req.params.id;
    const query = 'SELECT id, title, ingredients, steps, image_url FROM recipes WHERE id = $1';
    
    pool.query(query, [recipeId], (error, result) => {
        if (error) {
            console.error('Error fetching recipe details:', error);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Recipe not found' });
            } else {
                const recipe = result.rows[0];
                res.render('updateRecipe', { recipe });
            }
        }
    });
});

app.post('/recipe/updateDetails/:id', (req, res) => {
    const recipeId = req.params.id;
    const { title, ingredients, steps, image_url } = req.body;

    const updateQuery = 'UPDATE recipes SET title = $1, ingredients = $2, steps = $3, image_url = $4 WHERE id = $5';
    pool.query(updateQuery, [title, ingredients, steps, image_url, recipeId], (error, result) => {
        if (error) {
            console.error('Error updating recipe:', error);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.redirect(`/recipe/${recipeId}`);
        }
    });

    res.redirect(`/recipe/${recipeId}`);
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
