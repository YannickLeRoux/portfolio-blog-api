const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, check } = require('express-validator');
const { pool } = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5 // 5 requests,
});

app.use(limiter);

// const postLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 1,
// })

// for prod
// const isProduction = process.env.NODE_ENV === 'production'
// const origin = {
//   origin: isProduction ? 'https://www.example.com' : '*',
// }

// app.use(cors(origin))

const getPosts = (request, response) => {
  pool.query('SELECT * FROM posts ORDER BY created_at ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getPost = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM posts WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const addPost = (request, response) => {
  const { title, tags, subtitle, content } = request.body;
  const created_at = Date(Date.now());
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-');

  pool.query(
    'INSERT INTO posts (title, slug, tags, subtitle, content, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [title, slug, tags, subtitle, content, created_at],
    error => {
      if (error) {
        throw error;
      }
      response.status(201).json({ status: 'success', message: response.body });
    }
  );
};

const deletePost = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query('DELETE FROM posts WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Post deleted with ID: ${id}`);
  });
};

const updatePost = (request, response) => {
  const id = parseInt(request.params.id);
  const { title, tags, subtitle, content } = request.body;

  if ((!title || !tags || !subtitle, !content)) {
    response.send('Sorry, no partial updates allowed for now!');
  } else {
    const updated_at = Date(Date.now());
    pool.query(
      'UPDATE posts SET title = $1, tags = $2, subtitle = $3, content = $4, updated_at = $5 WHERE id = $6',
      [title, tags, subtitle, content, updated_at, id],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(200).send(`Post modified with ID: ${id}`);
      }
    );
  }
};

app
  .route('/posts')
  // GET endpoint
  .get(getPosts)
  // POST endpoint
  .post(addPost);

app
  .route('/posts/:id')
  .get(getPost)
  .put(updatePost)
  .delete(deletePost);

app.get('/', (request, response) => {
  response.send('Looks like its running');
});

// Start server
const port = process.env.PORT || 3002;
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening on port ${port}...`);
});
