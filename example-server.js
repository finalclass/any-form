var anyForm = require('./index');

anyForm.email = 's@finalclass.net';
anyForm.formsDir = __dirname + '/forms/';
anyForm.smtp = {
  user: '...',
  password: '...',
  host: 'smtp.gmail.com',
  ssl: true
};
anyForm.start();