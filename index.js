const express = require('express');
const app = express();

const bodyParser = require('body-parser');

app.use('/', require('./src/middleware/accessControl').main);
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use('/', require('./src/routes'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));
