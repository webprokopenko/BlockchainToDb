module.exports = (app) => {
  app.use('/api', require('./api'));
  app.get('/', (req, res) => {
      res.status(404).send('API is available on /api')
  });
};