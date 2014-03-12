
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

app.get('/api/allres', function(req, response){
  var Resolution = mongoose.model('Resolution');
  Resolution.find(function (err, resolutions) {
  if (err) return console.error(err);
  var res = {
        message: resolutions,
        code: 200
      }
      response.statusCode = 200;
      response.json(res);
  })
});

app.post('/api/load', express.bodyParser(), function(req, response){
  var code = req.body.code;
  var Resolution = mongoose.model('Resolution');

  Resolution.find({ _id: code }, function(err, resolution){
    if (err) return console.error(err);
    if (resolution == []){

    }else{
      var res = {
        message: resolution,
        code: 200
      }
      response.statusCode = 200;
      response.json(res);
    }
  })
});

app.post('/api/save', express.bodyParser(), function(req, response){
  var Resolution = mongoose.model('Resolution');

  var new_res = new Resolution();

  var res_code = req.body.resolution.code
  delete req.body.resolution.code;

  new_res.resolution = req.body.resolution;

  console.log(new_res);

  if(res_code){
    console.log("Updating")
    var new_res_data = new_res.toObject();
    delete new_res_data._id;
    Resolution.update({_id: res_code}, new_res_data, {upsert: true}, function(err){
      if (err) {
            console.log(err)
        } else {
            console.log(new_res);
            var res = {
              message: new_res,
              code: 200
            }
            res.message._id = res_code;
            response.statusCode = 200;
            response.json(res);
            console.log("Saved");
        }
    });
  }else{
    console.log("Creating new")
    new_res.save(function(err) {
        if (err) {
            console.log(err)
        } else {
            var res = {
              message: new_res,
              code: 200
            }
            response.statusCode = 200;
            response.json(res);
            console.log("Saved");
        }
    });
  }
});

app.post('/api/pdf', express.bodyParser(), function(req, response){

  var resolution = req.body.resolution;

  var countryString = function(countryList){
    if(countryList.length > 1){
      var last = countryList.pop();
      var rest = countryList.join(", ");
      return rest + " and " + last;
    }else if (countryList.length == 0)
      return "None :(";
    else
      return countryList[0];    
  }

  var outputBuffer = '<html><body><div style="width:100%; height: 10px; background-color: rgb(244, 127, 36);">&nbsp;</div><div style="width:100%; height: 10px; background-color: rgb(0, 60, 125); margin-bottom: 10px;">&nbsp</div><img src="' + __dirname + '/images/MUNI-Logo.png" style="width: 250px; float: right;"/><p style="margin: 0px; margin-bottom:5px"><b>' + resolution.committee.name + '</b></p>';
  
  var getName = function(elem){return elem.name};
  resolution.sponsors.unshift(resolution.country);
  var sponsorsString = "Sponsors: ";
  var signatoriesString = "Signatories: ";

  if(resolution.sponsors.length > 0)
    sponsorsString = sponsorsString + countryString(resolution.sponsors.map(getName));

  if(resolution.signatories.length > 0)
    signatoriesString = signatoriesString + countryString(resolution.signatories.map(getName));

  outputBuffer = outputBuffer + "<p style='margin: 0px'>" + sponsorsString + "</p><p style='margin: 0px'>" + signatoriesString + "</p><p> Topic: \"" + resolution.topic.name + "\"</p>";

  //Preambulatory
  var preambToHTML = function(clause){return "<li><span style='text-decoration:underline;'>" + clause.phrase + "</span> " + clause.text + ",</li>"}
  outputBuffer = outputBuffer + "<ul style='list-style:none'>" + resolution.preambs.map(preambToHTML).join("") + "</ul>";

  //Operative
  var opToHTML = function(clause, index){
    var isLast = (index == (resolution.ops.length - 1));    
    var body = "<span style='text-decoration:underline;'>" + clause.phrase + "</span> " + clause.text;
    if(clause.subclauses.length > 0){
      var subclauses = "";
      var lastSubclause = clause.subclauses.pop();
      for(var i = 0; i < clause.subclauses.length; i++){
        subclauses = subclauses + "<li>" + clause.subclauses[i] + ";</li>";
      }
      subclauses = subclauses + "<li>" + lastSubclause + ((isLast) ? "." : ";") + "</li>"

      return "<li>" + body + ";<ol type='i'>" + subclauses + "</ol>";
    }else
      return "<li>" + body + ((isLast) ? "." : ";") + "</li>";  
  }

  outputBuffer = outputBuffer + "<ol>" + resolution.ops.map(opToHTML).join(""); + "</ol>";

  outputBuffer = outputBuffer + '</body></html>';


  //Check for Uploads directory
  mkdirp(__dirname + '/uploads', function (err) {
    if (err) console.error(err)
    else console.log('Uploads directory created');
  });

	var url = '/uploads/resolution-' + resolution.code + '.pdf';

  wkhtmltopdf(outputBuffer, { pageSize: 'letter' }, function(code, signal){
		var res = {
            message: url,
            code : 200
        };
        response.statusCode = 200;
        response.json(res);

        console.log("POST response sent.");
	}).pipe(fs.createWriteStream(__dirname + url));
});

var auth = express.basicAuth(function(user, pass) {
 return user === 'MUNIStaff' && pass === 'MUNIAdmin';
});

app.get('/admin', auth, routes.index);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

/**
* Start Server
*/

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});