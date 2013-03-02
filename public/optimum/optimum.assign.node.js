var fs = require('fs');

function gotFins() {
    var fins = {};
    var frequencyData = fs.readFileSync('public/optimum/frequency.txt','utf8');
    //console.log(frequencyData);
    var rows = frequencyData.replace(/^\s+|\s+$/, '').split(/\n/);
    // 韵母字典
    for (var i = 1; i < rows.length; i++) {
        var r = rows[i].split(/\s+/);
        
        var init = r[2], fin = r[3];
        
        !fins[fin] && (fins[fin]={});
        fins[fin][init] = +r[4];
    }
    return fins;
}

function gotCombins() {
    var combins = [];
    var combinData = fs.readFileSync('output/group2.txt','utf8');
    //console.log(groupData);
    var crows = combinData.replace(/^\s+|\s+$/, '').split(/\n/);
    for (var i = 1; i < crows.length; i++) {
        var r = crows[i].split(/\s+/);
        combins.push(r);
    }
    return combins;
}

function gotEquivs() {
    var equivs = {};
    var equivalentData = fs.readFileSync('public/optimum/equivalent.txt','utf8');
    //console.log(equivalentData);
    var erows = equivalentData.replace(/^\s+|\s+$/, '').split(/\n/);
    // 击键当量
    var keys2nd = erows[0].toLowerCase().split(/\s+/);
    for (var i = 1; i < erows.length; i++) {
        var cols = erows[i].split(/\s+/);
        var key1st = cols[0].toLowerCase();
        equivs[key1st] = {};
        for (var j = 1; j < cols.length; j++) {
            equivs[key1st][keys2nd[j]] = +cols[j];
        }
    }
    return equivs;
}

function gotMatrix(fins, combin, equivs) {
    var X = 1e10;
    var poses = 'bcdfghjklmnpqrstwxyz';
    var matrix = [[combin[0], 'b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','w','x','y','z']];
    var initsPos = { zh: 'u', ch: 'i', sh: 'v'};
    for (var i = 2, idx = 1; i < combin.length; i++) {
        // 如果是aoeiuv不安排
        if (combin[i].match(/[aoeiuv]-/) || combin[i].match(/-[aoeiuv]/)) {
            continue;
        }
        matrix[idx] = [combin[i], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // 可能有多个韵母
        var gfins = combin[i].split('-');
        for (var m = 0; m < gfins.length; m++) {
            var fin = gfins[m];
            // 分别把韵母安排到每个位置
            for (var k = 0; k < poses.length; k++) {
                var key2nd = poses.charAt(k);
                // 计算安排到这个位置后所有声母的当量和
                var equiv = 0;
                for (var init in fins[fin]) {
                    var key1st = initsPos[init] || init;
                    equiv += equivs[key1st][key2nd] * fins[fin][init];
                }
                matrix[idx][k + 1] += equiv;
            }
        }
        idx++;
    }
    if (combin.length === 27) {
        matrix.push(['-', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    return matrix;
}

function go() {
    for (var i = 0; i < combins.length && i < 1; i++) {
        var matrix = gotMatrix(fins, combins[i], equivs);
        // console.log(matrix);
        for (var n = 0; n < matrix.length; n++) {
            var txt = matrix[n][0];
            for (var p = 1; p < matrix[n].length; p++) {
                txt += ' ' + (!n ? matrix[n][p] : matrix[n][p].toFixed(1));
            }
            console.log(txt);
        }
        
    }
}

var fins = gotFins();
//console.log(fins);
var combins = gotCombins();
//console.log(groups[0]);
var equivs = gotEquivs();
//console.log(equivs);


function assign(matrix) {
    var rows = {}, cols = {};
    for (var n = 1; n < matrix.length; n++) {
        var maxOfMins = 0, row = 0, col = 0;
        for (var c = 1; c < matrix[1].length; c++) {
            if (cols[c]) continue;
            var min = 1e10;
            var row2 = 0;
            for (var r = 1; r < matrix.length; r++) {
                if (rows[r]) continue;
                if (matrix[r][c] < min) {
                    min = matrix[r][c];
                    row2 = r;
                }
            }
            if (min > maxOfMins) {
                maxOfMins = min;
                row = row2;
                col = c;
            }
        }
        rows[row] = col;
        cols[col] = row;
        console.log(row + ' ' + col + ' ' + maxOfMins);
    }
    var max = 0, mrow = 0, mcol = 0;
    for (var row in rows) {
        if (matrix[row][rows[row]] > max) {
            max = matrix[row][rows[row]];
            mrow = row, mcol = rows[row];
        }
    }
    validate(matrix, rows, mrow, mcol, max);
    
    return rows;
}

function validate(matrix, rows, mrow, mcol, max) {
    for (var row in rows) {
        if (row === mrow) continue;
        var col = rows[row];
        if(matrix[row][mcol] >= matrix[mrow][col]) {
            if (max > matrix[row][mcol]) {
                max = matrix[row][mcol];
                
                rows[row] = mcol;
                rows[mrow] = col;
                
                mrow = row;
                
                validate(matrix, rows, mrow, mcol, max);
            }
        }
        else {
            if (max > matrix[mrow][col]) {
                max = matrix[mrow][col];
                                
                rows[row] = mcol;
                rows[mrow] = col;
                
                mcol = col;

                validate(matrix, rows, mrow, mcol, max);
            }
        }
    }
}
/*
var matrix = [
    [0,  0,  0,  0,  0],
    [0,  2, 15, 13,  4],
    [0, 10,  4, 14, 15],
    [0,  9, 14, 16, 13],
    [0,  7,  8, 11,  9]
];
var matrix = [
    [0, 0, 0, 0, 0, 0],
    [0, 12, 7, 9, 7, 9],
    [0, 8, 9, 6, 6, 6],
    [0, 7, 17, 12, 14, 9],
    [0, 15, 14, 6, 6, 10],
    [0, 4, 10, 7, 10, 9]
];
var matrix = [
    [0,  0,  0,  0,  0],
    [0, 15, 18, 21, 24],
    [0, 19, 23, 22, 18],
    [0, 26, 17, 16, 19],
    [0, 19, 21, 23, 17]
];
*/
var matrix = [
    [0,  0,  0,  0,  0],
    [0,  2, 10,  9,  7],
    [0, 15,  4, 14,  8],
    [0, 13, 14, 16, 11],
    [0,  4, 15, 13,  9]
];


var rows = assign(matrix);
for (var row in rows) {
    matrix[row][rows[row]] = -matrix[row][rows[row]];
}
console.log(matrix);
























