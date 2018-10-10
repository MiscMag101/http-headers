const fs = require('fs');
const express = require('express');
const http = require('http');
var cors = require('cors')

var https = require('https');
var privateKey  = fs.readFileSync('certs/key.pem', 'utf8');
var certificate = fs.readFileSync('certs/certificate.pem', 'utf8');
const app = express()
const httpApp = express();
const os = require('os');
const hostname = os.hostname();

var express_enforces_ssl = require('express-enforces-ssl');
httpApp.use(express_enforces_ssl());

const helmet = require('helmet')
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
// app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.frameguard({
  action: 'allow-from',
  domain: '*'
}))
var sixtyDaysInSeconds = 5184000
app.use(helmet.hsts({
	  maxAge: sixtyDaysInSeconds
}));
var csp = require('helmet-csp')
/*
app.use(csp({
  // Specify directives as normal.
  directives: {
	  defaultSrc: ["'self'", 'default.com', 'https://192.168.43.139:443', 'data:'],
    scriptSrc: ["'self'", "https://192.168.43.139:443"],
    styleSrc: ['style.com'],
//    fontSrc: ["'self'", '*'],
    imgSrc: ["'self'", 'img.com', 'data:'],
    sandbox: ['allow-forms', 'allow-scripts'],
    reportUri: '/report-violation',
    objectSrc: ["'none'"],
    upgradeInsecureRequests: true,
    workerSrc: false  // This is not set.
  },

  // This module will detect common mistakes in your directives and throw errors
  // if it finds any. To disable this, enable "loose mode".
  loose: false,

  // Set to true if you only want browsers to report errors, not block them.
  // You may also set this to a function(req, res) in order to decide dynamically
  // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
  reportOnly: false,

  // Set to true if you want to blindly set all headers: Content-Security-Policy,
  // X-WebKit-CSP, and X-Content-Security-Policy.
  setAllHeaders: false,

  // Set to true if you want to disable CSP on Android where it can be buggy.
  disableAndroid: false,

  // Set to false if you want to completely disable any user-agent sniffing.
  // This may make the headers less compatible but it will be much faster.
  // This defaults to `true`.
  browserSniff: true
}))
*/
const session = require('cookie-session')
var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.use(session({
	  name: 'toto',
	  keys: ['key1', 'key2'],
	  cookie: {
		      secure: false,
		      httpOnly: false,
//		      domain: 'localhost',
		      path: 'foo/bar',
		      expires: expiryDate
		    }
}));

app.use(express.static('public'))

var corsOptions = {
	origin: "https://yvan-XPS-13-9360"
//	origin: true
};
app.use(cors(corsOptions));
app.options('*', cors()) // include before other routes

//app.use((req, res, next) => {
//	  res.header("Access-Control-Allow-Origin", "https://localhost");
//	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//	  next();
//});



app.get('/', function (req, res, next) {
   req.session.views = (req.session.views || 0) + 1
   next();
})

const reponse = (req, res) => {
//	res.cookie('cookieName', 'cookieValue');
	const weak_param = req.query.weak_param || "no param";
	console.log(weak_param);
        const template = `
<html>
	<head>
		<script src="https://${hostname}/test.js">
		</script>
	</head>
	<body>
		Hello World!
		${weak_param}
	        <form method="post" action="https://localhost/">
                  <input type="submit" value="Submit"/>
		</form>
	</body>
</html>`;
	res.send(template);
	res.end(req.session.views + ' views')

};

app.get('/', reponse);

app.post('/', reponse);

//app.listen(3000, () => console.log('Example app listening on port 3000!'))
var httpServer = http.createServer(httpApp);
httpServer.listen(80);
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);
