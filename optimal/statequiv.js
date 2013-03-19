var fs = require('fs');
var printf = require('printf');

var collect = 'public/collect/collect.json';
var statequiv = 'output/statequiv.txt';

var statData = fs.readFileSync(collect);

var stat = JSON.parse(statData);

var chars = '-abcdefghijklmnopqrstuvwxyz'.split('');
var table = [chars];
for (var i = 1; i < chars.length; i++) {
    var row = [chars[i]];
    for (var j = 1; j < chars.length; j++) {
        var equivs = stat[chars[i]][chars[j]];
        if (!equivs || equivs.length < 1) {
            row.push(NaN);
            continue;
        }
        if (equivs.length === 1) {
            row.push(equivs[0]);
            continue;
        }
        if (equivs.length % 2 === 0) {
            row.push(Math.round((equivs[equivs.length / 2] + equivs[equivs.length / 2 + 1] ) /2));
        } else {
            row.push(Math.round(equivs[(equivs.length + 1) / 2]));
        }
    }
    table.push(row);
}

var txt = '';
for (var j = 0; j < chars.length; j++) {
    if (j === 0) {
        txt += table[0][j];
    } else {
        txt += printf("\t%-3s", table[0][j]);
    }
}
txt += '\n';
for (var i = 1; i < table.length; i++) {
    for (var j = 0; j < chars.length; j++) {
        if (j === 0) {
            txt += table[i][j];
        } else {
            txt += printf("\t%-3s", table[i][j]);
        }
    }
    txt += '\n';
}

fs.writeFile(statequiv, txt, function(err) {
    if (err) throw err;
    console.log("Saved! \t" + txt.length);
});