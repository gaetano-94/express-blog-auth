const jwt = require('jsonwebtoken');
require('dotenv').config();
const users = require('../db/users.json');

const generateToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1m' });

const authenticateWithJWT = (req, res, next) => {
  //verifico che l'utente abbia inviato un token
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send('Hai bisogno di autenticarti.');
  }

  //raccolgo il token
  const token = authorization.split(' ')[1];

  //verifico l'autenticita del token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      //se token è scaduto, oppure se token è invalido, rispondo 403
      return res.status(403).send(err);
    }
    req.user = user;
    //se tutto va bene, next()
    next();
  });
};

const isAdmin = (req, res, next) => {
  const { username, password } = req.user;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user || !user.admin) {
    return res.status(403).send('Non sei autorizzato, devi essere admin');
  }
  next();
};

module.exports = {
  generateToken,
  authenticateWithJWT,
  isAdmin,
};
