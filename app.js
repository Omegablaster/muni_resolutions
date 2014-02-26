
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

mongoose.connect('mongodb://localhost/muni');

var models_path = __dirname + '/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

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
app.use('/images', express.static(__dirname + '/images'))
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
app.get('/api/countries', api.countries);
app.get('/api/phrases', api.phrases);

app.post('/api/save', express.bodyParser(), function(req, response){
  resolution = req.body.resolution;
  if(resolution.code === null){
    console.log('No Code');
  }
  console.log(req.body.resolution);
  var new_res = new Resolution();
  new_res.Resolution = req.body.resolution;
  new_res.save(function(err) {
        if (err) {
            console.log(err)
        } else {
            console.log("Saved");
        }
    });
});

app.post('/api/pdf', express.bodyParser(), function(req, response){
  //Check for Uploads directory
  mkdirp(__dirname + '/uploads', function (err) {
    if (err) console.error(err)
    else console.log('Uploads directory created');
  });

	var url = '/uploads/resolution-' + process.pid + '.pdf';
	var html = '<html><body><div style="width:100%; height: 10px; background-color: rgb(244, 127, 36);">&nbsp;</div><div style="width:100%; height: 10px; background-color: rgb(0, 60, 125); margin-bottom: 10px;">&nbsp</div><img src="' + __dirname + '/images/MUNI-Logo.png" style="width: 250px; float: right;"/>' + req.body.html + '</body></html>';
	console.log(html);
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