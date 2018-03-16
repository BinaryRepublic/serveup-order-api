const express = require('express');
const app = express();
const promBundle = require('express-prom-bundle');
const metricsMiddleware = promBundle({
    includeStatusCode: true,
    includeMethod: true,
    includePath: true
});

const bodyParser = require('body-parser');

app.use(metricsMiddleware);
app.use('/', require('./src/middleware/accessControl').main);
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// authentication
// app.use('/', require('./src/authRoutes'));
// app.use(require('./src/middleware/authentication'));

// application routes
app.use('/', require('./src/routes'));

module.exports = app.listen(3000, () => console.log('Example app listening on port 3000!'));
