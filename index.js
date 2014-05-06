'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var fs = require('fs');
var Try = require('try');
var path = require('path');
var email = require("emailjs");

var app = express();
app.use(bodyParser());
app.use(methodOverride());

var anyForm = module.exports = {
  app: app,
  email: 'email@address.com',
  smtp: {
    user: '',
    password: '',
    host: '',
    ssl: false
  },
  formsDir: '',
  start: function () {
    this.server = app.listen(3000, function () {
      console.log('Listening on port %d', this.server.address().port);
    }.bind(this));
  }
};

function sendEmail(bodyString) {
  var emailServer;

  return Try(function () {
    emailServer = email.server.connect(anyForm.smtp);
    emailServer.send({
      text: bodyString,
      from: 'anyform@finalclass.net',
      to: anyForm.email,
      subject: 'any-form'
    }, Try.pause());
  })
  (function (err, message) {
    if (err) {
      throw err;
    }
    console.log('email sent', message);
  });
}

app.post('/', function (req, res) {
  var dir = anyForm.formsDir;

  if (req.body['form-type']) {
    dir = path.join(dir, path.basename(req.body['form-type']));
  }

  var filePath = path.join(dir, new Date().toISOString() + '.json');
  var bodyString = JSON.stringify(req.body, null, 2);

  Try(function () {
    fs.exists(dir, Try.pause());
  })
  (function (doesExists) {
    if (!doesExists) {
      fs.mkdir(dir, Try.pause());
    }
  })
  (function () {
    fs.writeFile(filePath, bodyString, Try.pause());
  })
  (function () {
    if (anyForm.smtp.user && anyForm.smtp.password && anyForm.smtp.host) {
      return sendEmail(bodyString);
    }
  })
  (function () {
    console.log('done');
    res.send('ok');
  })
    .catch(function (err) {
      console.log('error', err, err ? err.stack : '');
      res.send(500, 'internal_server_error');
    })
    .finally(function () {
      res.end();
    });

});

