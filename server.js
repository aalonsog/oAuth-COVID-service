const express = require('express');
const OAuth2 = require('./oauth2').OAuth2;
const config = require('./config');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const path = require('path');
const port = 81;
const sass = require('node-sass-middleware');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');

//const dfff = require('dialogflow-fulfillment');

//Global variables
global.PCR = false;
global.RT = false;
global.masks = false;
global.citeDate = getTomorrow();

function getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`;
}

//i18n config
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      // eslint-disable-next-line no-path-concat
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
        order: ['querystring', 'cookie'],
        caches: ['cookie']
      },
    fallbackLng: 'es',
    preload: ['en', 'es'],
    saveMissing: true
  })



// Express configuration
const app = express();
app.use(logger('dev'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: "skjghskdjfhbqigohqdiouk",
    resave: false,
    saveUninitialized: true
}));

//sass
app.use(
    sass({
        src: path.join(__dirname, '/sass'),    // Input SASS files
        dest: path.join(__dirname, '/public'), // Output CSS
        debug: true,
        outputStyle: 'compressed',
        indentedSyntax: true              
    }),
    express.static('public')
);

//i18n
app.use(i18nextMiddleware.handle(i18next))

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');



// Config data from config.js file
// eslint-disable-next-line camelcase
const client_id = config.client_id;
// eslint-disable-next-line camelcase
const client_secret = config.client_secret;
const idmURL = config.idmURL;
// eslint-disable-next-line camelcase
const response_type = config.response_type;
const callbackURL = config.callbackURL;

// Creates oauth library object with the config data
const oa = new OAuth2(client_id,
                    client_secret,
                    idmURL,
                    '/oauth2/authorize',
                    '/oauth2/token',
                    callbackURL);


// Handles requests to the main page
app.get('/', function(req, res){
        
    if(!req.session.access_token) {        
        res.render('response0', {lng : req.lng} );            
    } else {
        
        const url = config.idmURL + '/user';

        // Using the access token asks the IDM for the user info
        oa.get(url, req.session.access_token)
        .then (response => {

            const user = JSON.parse(response);
            console.log(user);
            
            // Render conditional views 

            // VISION
            if(user.eidas_profile.Vision !== 0){                
                if(user.eidas_profile.Vision < 100){
                    // LOW VISION (high contrast)
                    res.render('response1', 
                    { 
                        lng : req.lng, 
                        name: user.username, 
                        email: user.email, 
                        high_contrast: true 
                    });
                }else{
                    // BLIND
                    res.render('response4', 
                    { 
                        lng : req.lng, 
                        name: user.username, 
                        email: user.email,
                        high_contrast: false 
                    });
                }                
            }           
            // COGNITION
            else if(user.eidas_profile.Cognition !== 0){
                res.render('response2', 
                { 
                    lng : req.lng, 
                    name: user.username, 
                    email: user.email 
                });
            }
            // COGNITION
            else if(user.eidas_profile.Hearing !== 0){
                res.render('response5', 
                { 
                    lng : req.lng, 
                    name: user.username, 
                    email: user.email 
                });
            }
            // OTHER ATTRIBUTES....
            // We can design and develop as many interfaces as needed

            // DEFAULT
            else{
                res.render('response1', 
                { 
                    lng : req.lng, 
                    name: user.username, 
                    email: user.email, 
                    high_contrast: false 
                });
            }
            
        });
    }
});

// Handles requests from IDM with the access code
app.get('/login', function(req, res){
   
    // Using the access code goes again to the IDM to obtain the access_token
    oa.getOAuthAccessToken(req.query.code)
    .then (results => {

        // Stores the access_token in a session cookie
        req.session.access_token = results.access_token;

        res.redirect('/');

    });
});

// Redirection to IDM authentication portal
app.get('/auth', function(req, res){
    const path2 = oa.getAuthorizeUrl(response_type);
    res.redirect(path2);
});

// Handles logout requests to remove access_token from the session cookie
app.get('/logout', function(req, res){

    req.session.access_token = undefined;
    res.redirect('/');
});

// Redirection to Response1 with high contrast
app.get('/response1low', (req, res) => {
    const url = config.idmURL + '/user';
    
    oa.get(url, req.session.access_token)
    .then (response => {
        const user = JSON.parse(response);
        res.render('response1', 
        { 
            lng : req.lng, 
            name: user.username, 
            email: user.email, 
            high_contrast: true 
        });    
    });
    
});

// Redirection to Response1
app.get('/response1', (req, res) => {
    const url = config.idmURL + '/user';

    // Using the access token asks the IDM for the user info
    oa.get(url, req.session.access_token)
    .then (response => {
        const user = JSON.parse(response);
        res.render('response1', 
        { 
            lng : req.lng,
            name: user.username, 
            email: user.email, 
            high_contrast: false 
        });    
    });
    
});

// Redirection to Response2
app.get('/response2', (req, res) => {
    const url = config.idmURL + '/user';

    // Using the access token asks the IDM for the user info
    oa.get(url, req.session.access_token)
    .then (response => {
        const user = JSON.parse(response);
        res.render('response2', 
        { 
            lng : req.lng,
            name: user.username, 
            email: user.email, 
            high_contrast: false  
        });    
    });
    
});


// Redirection to Response3
app.get('/response3', (req, res) => {
    const url = config.idmURL + '/user';
    // Using the access token asks the IDM for the user info
    oa.get(url, req.session.access_token)
    .then (response => {
        const user = JSON.parse(response);
        res.render('response3', 
        { 
            lng : req.lng,
            name: user.username, 
            email: user.email, 
            high_contrast: false  
        });    
    });    
});


// Redirection to Response4
app.get('/response4', (req, res) => {
    const url = config.idmURL + '/user';

    // Using the access token asks the IDM for the user info
    oa.get(url, req.session.access_token)
    .then (response => {
        const user = JSON.parse(response);
        res.render('response4', 
        { 
            lng : req.lng,
            name: user.username, 
            email: user.email, 
            high_contrast: false  
        });    
    });
    
});

// Redirection to Response5
app.get('/response5', (req, res) => {
    const url = config.idmURL + '/user';

    // Using the access token asks the IDM for the user info
    oa.get(url, req.session.access_token)
    .then (response => {
        const user = JSON.parse(response);
        res.render('response5', 
        { 
            lng : req.lng,
            name: user.username, 
            email: user.email, 
            high_contrast: false  
        });    
    });
    
});



// Redirection to Privacy policy
app.get('/privacy_policy', function(req, res){
    if(!req.session.access_token) {
        res.render('privacy_policy', {name: null, high_contrast: false }); 
    }else{
        const url = config.idmURL + '/user';
        oa.get(url, req.session.access_token)
        .then (response => {
            const user = JSON.parse(response);
            res.render('privacy_policy', 
            { 
                lng : req.lng,
                name: user.username, 
                email: user.email, 
                high_contrast: (user.eidas_profile.Vision > 85 && user.eidas_profile.Vision !== 0)
            });    
        });  
    }        
});

// Redirection to Confirmation
app.get('/confirmation', (req, res) => {
    const url = config.idmURL + '/user';
    oa.get(url, req.session.access_token)
    .then (response => {
        const user = JSON.parse(response);        
        res.render('confirmation', 
        { 
            lng: req.lng,
            name: user.username, 
            email: user.email, 
            //high_contrast: (user.eidas_profile.Vision > 85 && user.eidas_profile.Vision !== 0),
            high_contrast: false,
            order: req.query.order
        });    
    });    
});
// Redirection to Confirmation
app.get('/cite_request', (req, res) => {
    const url = config.idmURL + '/user';
    oa.get(url, req.session.access_token)
    .then (response => {
        const user = JSON.parse(response);        
        res.render('cite_request', 
        { 
            lng: req.lng,
            name: user.username, 
            email: user.email, 
            //high_contrast: (user.eidas_profile.Vision > 85 && user.eidas_profile.Vision !== 0),
            high_contrast: false,
            order: req.query.order
        });    
    });    
});


app.set('port', port);


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListeningServer() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

/**
 * Create HTTP server for app
 */

const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListeningServer);
