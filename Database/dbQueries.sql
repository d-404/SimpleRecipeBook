CREATE DATABASE "RecipeBook" WITH OWNER = postgres ENCODING = 'UTF8' CONNECTION LIMIT = -1 IS_TEMPLATE = False;

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    ingredients TEXT [] NOT NULL,
    steps TEXT [] NOT NULL,
    image_url VARCHAR(255)
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id),
    user_id INT NOT NULL,
    rating INT NOT NULL
);