const http = require('http');
var url = require('url');
var psql = require('pg-promise')();
var express = require('express');
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added

app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const dbConfig = process.env.DATABASE_URL;
var db = psql(dbConfig);
var data;
var query = "select * from roam;";
var firebase = require('firebase');
require('firebase/auth');
require('firebase/database');
// Initialize Firebase for the application
db.any(query).then(function (rows) {
  data = rows;
});

db.any(query).then(function (rows) {
  data = rows;
});
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {
  res.render('pages/login', {
    my_title: "Roam. login"
  });
});

app.get('/login', function (req, res) {
  res.render('pages/login', {
    my_title: "Login Page"
  });
});

app.get('/home/', function (req, res) {
  var sliders;
  var modal;
  if (Object.keys(req.query).length) {
    sliders = [req.query.s0, req.query.s1, req.query.s2, req.query.s3, req.query.s4];
    min = Number.MAX_SAFE_INTEGER;
    for (i = 0; i < Object.keys(data).length; i++) {
      var num = (s=Math.abs(sliders[0] / 20 - data[i].touristy))*s;
      num += (s=Math.abs(sliders[1] / 20 - data[i].luxury))*s;
      num += (s=Math.abs(sliders[2] / 20 - data[i].expense))*s;
      num += (s=Math.abs(sliders[3] / 20 - data[i].popage))*s;
      num += (s=Math.abs(sliders[4] / 20 - data[i].faraway))*s;
      if (min > num) {
        min = num;
        modal = data[i].location;
      }
    }
    //console.log(modal);
  } else {
    sliders = ["50", "50", "50", "50", "50"];
  }
  res.render('pages/home', { slides: sliders, modal: modal, my_title: "Roam. home" });
});

app.get('/learn', function(req, res) {
  db.any('select id, country from countries;')
  .then(function (rows) {
    res.render('pages/learn',{
      my_title: "Learn",
      data: rows,
      details: ''
    })
  })
});

app.get('/learn/post', function(req, res) {
  var cntrs = 'select ID, Country from countries;';
  var cntr = 'select * from countries where ID = ' + req.query.country_choice + ';';
  db.task('get-info', task => {
    return task.batch([
      task.any(cntrs),
      task.any(cntr)
    ]);
  })
  .then(info => {
    res.render('pages/learn',{
      my_title: "Learn",
      data: info[0],
      details: info[1][0]
    })
  })
});

app.post('/pages/home/', function (req, res) {
});
app.listen(process.env.PORT, function (req, res) {
  console.log('Listening on port %d', process.env.PORT);
});