const express = require('express');
const app = module.exports = express();

const swaggerUi = require('swagger-ui-express');

const YAML = require('yamljs');
const swaggerDocument = YAML.load('./routes/api-docs/apiswagger.yaml');

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
