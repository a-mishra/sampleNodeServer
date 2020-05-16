import express from 'express';
import bodyParser from 'body-parser';
import contactRoutes from './src/routes/contactRoutes';


var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

const config = require('./src/config/config.js');

const app = express();
const HTTP_PORT = global.gConfig.node_port;
const HTTPS_PORT = global.gConfig.secure_node_port;
const bodySizeLimit = global.gConfig.bodySizeLimit;


var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

//---------- To fix the CORS Issue -----------------------------------------------

    var cors = require('cors')
    app.use(cors())

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

//-------------------------------------------------------------------------------


// --------- To fix the Vulnerability Issues ------------------------------------

    var helmet = require('helmet')
    app.use(helmet())

//-------------------------------------------------------------------------------


// bodyparser setup
app.use(bodyParser.urlencoded({ extended: true, limit:bodySizeLimit }));
app.use(bodyParser.json({ limit:bodySizeLimit }));

contactRoutes(app);


// serving static files
app.use(express.static('public'));

app.get('/', (req, res) =>
    res.send(`Node and express server is running on port ${HTTP_PORT} in HTTP and ${HTTPS_PORT} in HTTPS`)
);


httpServer.listen(HTTP_PORT, () =>
    console.log(`your server is running on port ${HTTP_PORT} with HTTP and with settings ${JSON.stringify(global.gConfig)}`)
);

httpsServer.listen(HTTPS_PORT, () =>
    console.log(`your server is running on port ${HTTPS_PORT} with HTTPS and with settings ${JSON.stringify(global.gConfig)}`)
);

//--------------openAPI Documentation -------------------------------------------

const swaggerJsdoc = require('swagger-jsdoc');
const options = {
    swaggerDefinition: {
        // Like the one described here: https://swagger.io/specification/#infoObject
        info: {
            title: 'Khan Bank API\'s',
            version: '1.0.0',
            description: 'Khan Bank API\'s for Staic / Functional Module  ',
        },
    },
    // List of files to be processes. You can also set globs './routes/*.js'
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

const swaggerUi = require('swagger-ui-express');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

