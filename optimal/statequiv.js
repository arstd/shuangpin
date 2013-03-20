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
        equivs.sort(function(a, b) {return (+a) - (+b)});
        if (equivs.length === 1) {
            row.push(equivs[0]);
            continue;
        } else if (equivs.length === 2) {
            row.push(Math.round((equivs[0] + equivs[1]) / 2));
            continue;
        } else if (equivs.length === 3) {
            if (equivs[2] - equivs[1] > 2 * (equivs[1] - equivs[0])) {
                row.push(Math.round((equivs[0] + equivs[1]) / 2));
            } else if (equivs[1] - equivs[0] > 2 * (equivs[2] - equivs[1])) {
                row.push(Math.round((equivs[2] + equivs[1]) / 2));
            } else {
                row.push(equivs[1]);
            }
            continue;
        }
        
        
        var lowwer, median, upper, lowhalf, uphalf, lowlimit, uplimit, p = 0, ilowlimit, sum = 0;
        if (equivs.length % 2 === 0) {
            median = (equivs[equivs.length / 2 - 1] + equivs[equivs.length / 2]) / 2;
            if (equivs.length / 2 % 2 === 0) {
                lowwer = (equivs[equivs.length / 4 - 1] + equivs[equivs.length / 4]) / 2;
                upper =  (equivs[equivs.length / 4 * 3 - 1] + equivs[equivs.length / 4 * 3]) / 2;
            } else {
                lowwer = equivs[(equivs.length + 2) / 4 - 1];
                upper =  equivs[equivs.length / 2 + (equivs.length + 2) / 4 - 1];
            }
        } else {
            median = equivs[(equivs.length - 1) / 2];
            if ((equivs.length - 1) / 2 % 2 === 0) {
                lowwer = (equivs[(equivs.length - 1) / 4 - 1] + equivs[(equivs.length - 1) / 4]) / 2;
                upper =  (equivs[(equivs.length - 1) / 4 * 3] + equivs[(equivs.length - 1) / 4 * 3 + 1]) / 2;
            } else {
                lowwer = equivs[((equivs.length - 1) / 2 - 1) / 2];
                upper =  equivs[(equivs.length - 1) / 2 + 1 + ((equivs.length - 1) / 2 - 1) / 2];
            }
        }
        lowhalf = median - lowwer, uphalf = upper - median;
        if (lowhalf < uphalf) {
            lowlimit = median - 3 * lowhalf, uplimit = median + 3 * lowhalf;
        } else {
            lowlimit = median - 3 * uphalf, uplimit = median + 3 * uphalf;
        }
        
        while((equivs[p++] < lowlimit));
        ilowlimit = p;
        while(equivs[p] <= uplimit) {
            sum += equivs[p++];
        }
        row.push(Math.round(sum / (p - ilowlimit)));
    }
    table.push(row);
}

var txt = '';
for (var j = 0; j < chars.length; j++) {
    if (j === 0) {
        txt += table[0][j];
    } else {
        txt += printf("\t%2s ", table[0][j]);
    }
}
txt += '\n';
for (var i = 1; i < table.length; i++) {
    for (var j = 0; j < chars.length; j++) {
        if (j === 0) {
            txt += table[i][j];
        } else {
            txt += printf("\t%3s", table[i][j]);
        }
    }
    txt += '\n';
}

fs.writeFile(statequiv, txt, function(err) {
    if (err) throw err;
    console.log("Saved! \t" + txt.length);
});