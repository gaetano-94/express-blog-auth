const express = require('express');
const app = express();
const users = require('./db/users.json');
let posts = require('./db/posts.json');
const auth = require('./controllers/auth.js');
const fs = require('fs');
const path = require('path');
const port = 3000;

const postsRouter = require('./routers/posts');

app.use(express.static('./public'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(404).send('Credenziali errate.');
  }
  const token = auth.generateToken(user);
  res.send(token);
});

app.use(auth.authenticateWithJWT);

app.get('/', (req, res) => {
  res.send('<h1>Benvenuto nelle mie ricette</h1>');
});

app.use('/posts', postsRouter);

// Middleware globale per gestire gli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Errore interno del server');
});

app.post('/posts', auth.isAdmin, (req, res) => {
  const newPosts = [...posts, req.body.title];
  fs.writeFileSync(
    path.join(process.cwd(), './db/posts.json'),
    JSON.stringify(newPosts)
  );
  pizze = newPosts;
  res.json(newPosts);
});

app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
