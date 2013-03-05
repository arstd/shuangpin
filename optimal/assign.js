var fs = require('fs');
var printf = require('printf');

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

function gotMatrix(fins, equivs, combin, initsPos, poses) {
    var X = 1e10;
    var matrix = [poses];
    for (var i = 0; i < combin.length; i++) {
        matrix[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
                matrix[i][k + 1] += equiv;
            }
        }
    }
    if (combin.length === 20) {
        matrix.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    return matrix;
}


function hungaryAlgorithm(matrix) {
    print(matrix);
    var optimal = {};
    
    transform(matrix);
    print(matrix);
    
    var brackets = {row: {}, col: {}}, stars = {row: {}, col: {}};
    for (var i = 0; i < matrix.length; i++) {
        brackets.row[i] = {};
        brackets.col[i] = {};
        stars.row[i] = {};
        stars.col[i] = {};
    }
    mark(matrix, brackets, stars);
    
    return optimal;
}

function mark(matrix, brackets, stars) {
    var marked = false, r, c, t, n, mrow, mcol;
    for (r = 0; r < matrix.length; r++) {
        for (c = 0, n = 0; c < matrix[r].length; c++) {
            if (brackets.col[c][r] === 1) continue;
            if (stars.col[c][r] === 1) continue;
            if (matrix[r][c] === 0) {
                n++, mcol = c;
            }
        }
        if (n !== 1) continue;
        marked = true;
        brackets.row[r][mcol] = 1;
        brackets.col[mcol][r] = 1;
        for (t = 0; t < matrix.length; t++) {
            if (t === r) continue;
            if (matrix[t][mcol] === 0) {
                stars.row[t][mcol] = 1;
                stars.col[mcol][t] = 1;
            }
        }
    }
    print(matrix, brackets.row, stars.row);
    
    for (c = 0; c < matrix[0].length; c++) {
        n = 0;
        for (r = 0, n = 0; r < matrix.length; r++) {
            if (brackets.col[c][r] === 1) continue;
            if (stars.col[c][r] === 1) continue;
            if (matrix[r][c] === 0) {
                n++, mrow = r;
            }
        }
        if (n !== 1) continue;
        marked = true;
        brackets.row[mrow][c] = 1;
        brackets.col[c][mrow] = 1;
        for (t = 0; t < matrix[0].length; t++) {
            if (t === c) continue;
            if (matrix[mrow][t] === 0) {
                stars.row[mrow][t] = 1;
                stars.col[t][mrow] = 1;
            }
        }
    }
}

function transform(matrix) {
    var min, r, c;
    for (r = 0 ; r < matrix.length; r++) {
        min = matrix[r][0];
        for (c = 1; c < matrix[r].length; c++) {
            if (min > matrix[r][c]) {
                min = matrix[r][c];
            }
        }
        for (c = 0; c < matrix[r].length; c++) {
            matrix[r][c] -= min;
        }
    }
    
    // printMatrix(matrix);

    for (c = 0 ; c < matrix[0].length; c++) {
        min = matrix[0][c];
        for (r = 1; r < matrix.length; r++) {
            if (min > matrix[r][c]) {
                min = matrix[r][c];
            }
        }
        for (r = 0; r < matrix.length; r++) {
            matrix[r][c] -= min;
        }
    }
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
    console.log(txt + ' equivalent');
    
    var initsPos = { zh: 'u', ch: 'i', sh: 'v'};
    var poses = 'bcdfghjklmnpqrstwxyz'.split('');

    var initialEquiv = 0;
    for (var sfin in fins) {
        if (!sfin.match(/^[a-z]$/)) continue;
        for (var init in fins[sfin]) {
            var key1st = initsPos[init] || init;
            initialEquiv += equivs[key1st][sfin] * fins[sfin][init];
        }
    }
    
    for (var i = 0; i < 1 && combins.length; i++) {
        var combin = combins[i];
        var icombin = combin[0], ngroup = combin[1];
        combin.splice(0, 2);
        var assigned = [], equiv = initialEquiv;
        for (var j = 0; j < combin.length; j++) {
            // 如果是aoeiuv不安排
            var matched = combin[j].match(/^[a-z]$|^[a-z]-|-[a-z]-|-[a-z]$/);
            if (matched) {
                // console.log(matched);
                assigned.push({group: [combin[j]], pos: matched[0].replace(/-/g, '')});
                var gfins = combin[j].replace(matched[0]).split(/-/g);
                combin.splice(j);
                if (!gfins) continue;
                for (var gfin in gfins) {
                    for (var ginit in fins[gfin]) {
                        var gkey1st = initsPos[ginit] || ginit;
                        equiv += equivs[gkey1st][sfin] * fins[sfin][ginit];
                    }
                }
            }
        }
        
        // console.log(combins[i]);
        var matrix = gotMatrix(fins, equivs, combin, initsPos, poses);
        

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
        
        var optimal = hungaryAlgorithm(matrix);
       
        // console.log(assigned);
        for (var row in optimal) {
            assigned.push({group: combin[row], pos: poses[optimal[row]]});
            equiv += matrix[row][optimal[row]];
        }
        assigned.sort(outputOrder);
        console.log(icombin
            + JSON.stringify(assigned).replace(/"/g, '').replace(/[{,}]/g, ' ').replace(/:/g,'=') 
            + equiv.toFixed(1));
    }
    function outputOrder(a, b) { return a.group < b.group;}
}

// 开始计算
//go();

testAssign();

function testAssign() {
    /*
    var matrix = [
        [ 2, 15, 13,  4],
        [10,  4, 14, 15],
        [ 9, 14, 16, 13],
        [ 7,  8, 11,  9]
    ];
    var matrix = [
        [12,  7,  9,  7,  9],
        [ 8,  9,  6,  6,  6],
        [ 7, 17, 12, 14,  9],
        [15, 14,  6,  6, 10],
        [ 4, 10,  7, 10,  9]
    ];
    */
    var matrix = [
        [10, 9, 7, 8],
        [ 5, 8, 7, 7],
        [ 5, 4, 6, 5],
        [ 2, 3, 4, 5]
    ];
    /*
    var matrix = [
        [15, 18, 21, 24],
        [19, 23, 22, 18],
        [26, 17, 16, 19],
        [19, 21, 23, 17]
    ];
    var matrix = [
        [ 2, 10,  9,  7],
        [15,  4, 14,  8],
        [13, 14, 16, 11],
        [ 4, 15, 13,  9]
    ];
    */
    var optimal = hungaryAlgorithm(matrix);
    
}
    
function print(matrix, brackets, stars) {
    console.log('-------------------------');
    for (var n = 0; n < matrix.length; n++) {
        var txt = '';
        for (var p = 0; p < matrix[n].length; p++) {
            if (brackets && brackets[n][p] === 1) {
                txt += printf("%4s)", '(' + matrix[n][p]);
            }
            else if (stars && stars[n][p] === 1) {
                txt += printf("%4s*", matrix[n][p]);
            }
            else {
                txt += printf("%4d ", matrix[n][p]);
            }
        }
        console.log(txt);
    }
    console.log('-------------------------');

}