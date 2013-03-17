//var pg = require('pg');
//var url = require('url');
//
//var conString = process.env.HEROKU_POSTGRESQL_BRONZE_URL 
//    || "postgres://postgres:postgres@localhost:5432/postgres";
//var client = new pg.Client(conString);
//client.connect();

exports.index = function(req, res) {
    res.render('index', {'title': 'shuangpin'}); 
};

//
//exports.finalcount = function(req, res) {
//    client.query('select * from finalcount', function(err, result) {
//        res.send(result.rows); 
//    });
//};
var fs = require('fs');
var path = require('path');
var file = 'output/collect.json';

exports.collectCommit = function(req, res) {

    var collect = req.body, data;
    path.exists(file, function(exists) {
        if (exists) {
            var dataString = fs.readFileSync(file, 'utf8');
            data = JSON.parse(dataString);
            for (var key1st in collect) {
                if (data[key1st] === undefined) {
                    data[key1st] = {};
                }
                for (var key2nd in collect[key1st]) {
                    if (data[key1st][key2nd] === undefined) {
                        data[key1st][key2nd] = collect[key1st][key2nd];
                    } else {
                        data[key1st][key2nd] = data[key1st][key2nd].concat(collect[key1st][key2nd]);
                    }
                }
            }
            //console.log(data);
        } else {
            data = collect;
        }
        var txt = JSON.stringify(data).replace(/"/g,'')//
            .replace(/([a-z ;,.\/]):\[/g, '\n\t\t"$1": [')//
            .replace(/([a-z ;,.\/]):\{/g, '\n\t"$1": {')
            .replace(/\]\}/g, ']\n\t}')
            .replace(/\}\}/, '}\n}');
            
        fs.writeFile(file, txt, function(err) {
            if (err) throw err;
            console.log('It\'s saved!');
        });
    });
    
    res.send(1);
}