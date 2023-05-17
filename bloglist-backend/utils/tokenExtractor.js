const getTokenFrom = require('./getTokenFrom');

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('Authorization');

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = getTokenFrom(authorization);
    request.token = token;
  }

  next();
};

module.exports = tokenExtractor;
