
/**
 * Module dependencies
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
  wkhtmltopdf = require('wkhtmltopdf'),
  mongoose = require('mongoose'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  path = require('path');


var app = module.exports = express();

/**
* Configuration
*/

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
   app.use(express.errorHandler());
};

// production only
if (app.get('env') === 'production') {
  // TODO
}; 



// Routes
app.get('/', routes.index);
app.get('/partial/:name', routes.partial);

// JSON API
app.get('/api/name', api.name);
app.get('/api/countries', api.countries);

app.post('/api/pdf', express.bodyParser(), function(req, response){
  //Check for Uploads directory
  mkdirp(__dirname + '/uploads', function (err) {
    if (err) console.error(err)
    else console.log('Uploads directory created');
  });

	var url = '/uploads/resolution-' + process.pid + '.pdf';
	var html = '<html><body>' + req.body.html + '</body></html>';
	wkhtmltopdf(html, { pageSize: 'letter' }, function(code, signal){
		var res = {
            message: url,
            code : 200
        };
        response.statusCode = 200;
        response.json(res);

        console.log("POST response sent.");
	}).pipe(fs.createWriteStream(__dirname + url));
});

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

/**
* Start Server
*/

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});