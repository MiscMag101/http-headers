const fs = require('fs');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const os = require('os');
const hostname = os.hostname();
const app = express();


const helmet = require('helmet')
app.use(helmet.xssFilter());

app.use(bodyParser.json());
app.get('/', function (req, res, next) {
   res.cookie('SESSIONID', 'U2VuZCBtZSB5b3VyIGZlZWRiYWNrIQo=', { maxAge: 900000, httpOnly: true });
   next();
})

app.post('/', (req, res) => {
        const value = req.body.data;
        console.log("Received " + req.body);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ text: value }));
        res.end();
});


app.get('/', (req, res) => {
	const weak_param = req.query.weak_param || "no param";
        const template = `
<html>
	<head>
		<script src="http://${hostname}/test.js">
		</script>
		<script>console.log(document.cookie)</script>
		<script>
function submit() {

	let mytext = document.getElementById('mytext')
	var http = new XMLHttpRequest();
        var url = 'http://localhost:8000/';
	var params = JSON.stringify({data: mytext.value});;
        http.open('POST', url, true);

        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/json');

http.onreadystatechange = function() {//Call a function when the state changes.
    if(http.readyState == 4 && http.status == 200) {
	var response = JSON.parse(http.responseText)
        document.body.innerHTML += response.text;
    }
}
http.send(params);

}
		</script>
	</head>
	<body>
		Hello World!
		${weak_param}
	<input type="text" id="mytext"/>
		<button onclick="javascript:submit()" >CLICK ME</button>
	</body>
</html>`;
	res.send(template);
	res.end()

});

var httpServer = http.createServer(app);
httpServer.listen(8000);
