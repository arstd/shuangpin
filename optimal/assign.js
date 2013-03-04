var fs = require('fs');

function gotFins() {
    var fins = {};
    var frequencyData = fs.readFileSync('optimal/frequency.txt','utf8');
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
    var equivalentData = fs.readFileSync('optimal/equivalent.txt','utf8');
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

function gotMatrix(fins, combin, equivs, assigned) {
    var X = 1e10;
    var poses = 'bcdfghjklmnpqrstwxyz';
    var matrix = [[combin[0], 'b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','w','x','y','z']];
    var initsPos = { zh: 'u', ch: 'i', sh: 'v'};
    for (var i = 2, idx = 1; i < combin.length; i++) {
        // 如果是aoeiuv不安排
        var matched = combin[i].match(/^[aoeiuv]$|^[aoeiuv]-|-[aoeiuv]-|-[aoeiuv]$/)
        if (matched) {
            // console.log(matched);
            assigned[combin[i]] = matched[0].replace(/-/g, '');
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


function assign(matrix) {
    var optimal = {}, linedCols = {};
    for (var n = 1; n < matrix.length; n++) {
        var maxOfMins = -1, row1 = 0, col1 = 0;
        for (var r = 1; r < matrix.length; r++) {
            if (optimal[r]) continue;
            var min = 1e10, col2 = 0;
            for (var c = 1; c < matrix[r].length; c++) {
                if (linedCols[c]) continue;
                if (matrix[r][c] < min) {
                    min = matrix[r][c], col2 = c;
                }
            }
            // console.log(r + '-' + c + ':' + r + '-' + col2 + ' ' + min);
            if (min > maxOfMins) {
                maxOfMins = min, row1 = r, col1 = col2;
            }
        }
        optimal[row1] = col1, linedCols[col1] = true;
        // console.log(n + ': ' + row1 + ' ' + col1 + ' ' + maxOfMins);
    }
    
    var max = 0, mrow = 0, mcol = 0;
    for (var row3 in optimal) {
        if (matrix[row3][optimal[row3]] > max) {
            max = matrix[row3][optimal[row3]];
            mrow = row3, mcol = optimal[row3];
        }
    }
    
    validateLabel:
    while(true) {
        for (var row in optimal) {
            if (row === mrow) continue;
            var col = optimal[row];
            
            if (max > matrix[row][mcol] && max > matrix[mrow][col]) {
                optimal[row] = mcol;
                optimal[mrow] = col;
                
                if (matrix[row][mcol] >= matrix[mrow][col]) {
                    max = matrix[row][mcol];
                    mrow = row;
                } else {
                    max = matrix[mrow][col];
                    mcol = col;
                }
                continue validateLabel;
            }
        }
        break validateLabel;
    }
    
    return optimal;
}


function go() {
        
    var fins = gotFins();
    //console.log(fins);
    var combins = gotCombins();
    //console.log(groups[0]);
    var equivs = gotEquivs();
    //console.log(equivs);
    
    var txt = 'index';
    for (var k = 1; k <= 26; k++) {
        txt += ' ' + k;
    }
    console.log(txt + 'equivalent');
    
    for (var i = 0; i < combins.length; i++) {
        // console.log(combins[i]);
        var assigned = {};
        var matrix = gotMatrix(fins, combins[i], equivs, assigned);
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
/*
var matrix = [
    [0,  0,  0,  0,  0],
    [0,  2, 10,  9,  7],
    [0, 15,  4, 14,  8],
    [0, 13, 14, 16, 11],
    [0,  4, 15, 13,  9]
];
*/
        
        // console.log(matrix);
        /*
        for (var n = 0; n < matrix.length; n++) {
            var txt = matrix[n][0];
            for (var p = 1; p < matrix[n].length; p++) {
                txt += ' ' + (!n ? matrix[n][p] : Math.round(matrix[n][p]));
            }
            console.log(txt);
        }
        */
        
        var optimal = assign(matrix);
        /*  
        console.log(optimal);
        
        console.log(JSON.stringify(matrix[0]).replace(/\["|"\]/g, '').replace(/","/g, ' '));
        for (var n = 1; n < matrix.length; n++) {
            var txt = matrix[n][0];
            for (var p = 1; p < matrix[n].length; p++) {
                txt +=  (optimal[n] === p) ? ' -' : ' ';
                txt += Math.round(matrix[n][p]);
            }
            console.log(txt);
        }
        */
        // console.log(assigned);
        var equiv = 0;
        for (var row in optimal) {
            assigned[matrix[row][0]] = matrix[0][optimal[row]];
            equiv += matrix[row][optimal[row]];
        }
        console.log(matrix[0][0] 
            + JSON.stringify(assigned).replace(/"/g, '').replace(/[{,}]/g, ' ').replace(/:/g,'=') 
            + equiv.toFixed(1));
    }
}

// 开始计算
go();




















