function gotAssigns() {
    var fs = require('fs');
    var assignsData = fs.readFileSync('output/assigns.txt','utf8');
    
    var assigns = {}, optimal = [], worst = [];
    var rows = assignsData.replace(/^\s+|\s+$/, '').split(/\n/);
    var header = rows[0].split(/\s+/);
    for (var k = 1; k < header.length - 1; k++) {
        assigns[header[k]] = {};
    }
    
    optimal[header.length - 1] = 9e18;
    worst[header.length - 1] = 0;
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i].split(/\s+/);
        if (optimal[header.length - 1] > row[header.length - 1]) {
            optimal = row;
        } else if (worst[header.length - 1] < row[header.length - 1]) {
            worst = row;
        }
        for (k = 1; k < header.length - 1; k++) {
            if (!assigns[header[k]][row[k]]) assigns[header[k]][row[k]] = 0;
            assigns[header[k]][row[k]] += 1;
        }
    }
    
    var txt;
    for (var fin in assigns) {
        txt = fin + ':';
        for (var pos in assigns[fin]) {
            if (assigns[fin][pos] < 2000) continue;
            txt += ' ' + pos + '(' + assigns[fin][pos] + ')';
        }
        console.log(txt);
    }

    //console.log(assigns);
    
    console.log('' + header);
    console.log('最差解：' + worst);
    console.log('最优解：' + optimal);
    
    var optimalObj = {zh: 'u', ch: 'i', sh: 'v'};
    for (var j = 1; j < header.length - 1; j++) {
        optimalObj[header[j]] = optimal[j];
    }
    
    return optimalObj;
}

var optimal = gotAssigns();

console.log(JSON.stringify(optimal));

