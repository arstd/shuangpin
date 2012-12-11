var pg = require('pg');
var url = require('url');

var conString = process.env.HEROKU_POSTGRESQL_BRONZE_URL 
    || "postgres://postgres:postgres@localhost:5432/postgres";
var client = new pg.Client(conString);
client.connect();

exports.index = function(req, res) {
    res.render('index', {'title': 'shuangpin'}); 
};


exports.finalcount = function(req, res) {
    client.query('select * from finalcount', function(err, result) {
        res.send(result.rows); 
    });
};
