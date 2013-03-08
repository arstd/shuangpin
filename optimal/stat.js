function gotAssigns() {
    var fs = require('fs');
    var assignsData = fs.readFileSync('output/assigns.txt','utf8');
    
    var assigns = {};
    var rows = assignsData.replace(/^\s+|\s+$/, '').split(/\n/);
    var header = rows[0].split(/\s+/);
    for (var k = 1; k < header.length - 1; k++) {
        assigns[header[k]] = {};
    }
    // 韵母字典
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i].split(/\s+/);
        
        for (k = 1; k < header.length - 1; k++) {
            if (!assigns[header[k]][row[k]]) assigns[header[k]][row[k]] = 0;
            assigns[header[k]][row[k]] += 1;
        }
    }
    return assigns;
}

var assigns = gotAssigns();

console.log(assigns);