// 扩展javascript对象Array，添加多维数组深拷贝的方法
Array.prototype.clone = function(){
    var cloned = this.concat();
    for (var i = 0; i < this.length; i++) {
        if (cloned[i] instanceof Array) {
            cloned[i] = cloned[i].clone();
        }
    }
    return cloned;
};

var fs = require('fs');
var printf = require('printf');
var sleep = require('sleep');
var hungary = require('./hungary.js')

var initsPos = { zh: 'u', ch: 'i', sh: 'v'};

function gotFins() {
    var fins = {};
    var finsData = fs.readFileSync('optimal/frequency.txt','utf8');
    //console.log(frequencyData);
    var rows = finsData.replace(/^\s+|\s+$/, '').split(/\n/);
    // 韵母字典
    for (var i = 1; i < rows.length; i++) {
        var r = rows[i].split(/\s+/);

        var init = r[2], fin = r[3];

        !fins[fin] && (fins[fin]={});
        fins[fin][init] = +r[4];
    }
    return fins;
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
            equivs[key1st][keys2nd[j]] = (+cols[j]);
        }
    }
    return equivs;
}

function gotMatrix(fins, equivs) {
    var assEquiv = [];
    var finals = 'an,ong,ai,en,ian,ing,ao,ang,ou,eng,ei,in,uan,iang,iao,ie,un,ia,iu,ue,v'.split(',');
    var poses = 'bcdfghjklmnpqrstvwxyz;';

    for (var i = 0; i < finals.length; i++) {
        var fin = finals[i], ass = [];
        ass.push(fin);
        for (var j = 0; j < poses.length; j++) {
            var pos = poses[j], equiv = 0;
            for (init in fins[fin]) {
                var initPos = initsPos[init] || init;
                equiv += Math.pow(fins[fin][init], 1/2) * Math.pow(equivs[initPos][pos], 1/2);
// console.log(init + '_' + fin + ':' +  fins[fin][init] + ' - ' + Math.sqrt(equivs[initPos][pos]));
            }
            ass.push(Math.round(equiv/1e2));
//console.log(fin + ' - ' + pos + '-----------------' + equiv);
        }
        assEquiv.push(ass);
//sleep.sleep(1);
    }

    assEquiv.sort();
    assEquiv.unshift(('-' + poses).split(''));
    return assEquiv;
}

function print(assEquiv) {
    for (var i = 0; i < assEquiv.length; i++) {
        var txt = printf('[%-4s', assEquiv[i][0]);
        for (var j = 1; j < assEquiv[0].length; j++) {
            txt += printf(',%4s', assEquiv[i][j]);
        }
        console.log(txt + '],');
    }
}

function gotCloneMatrix(assEquiv) {
    var cmatrix = assEquiv.clone();
    cmatrix.shift();
    for (var i = 0; i < cmatrix.length; i++) {
        cmatrix[i].shift();
    }
//console.log(cmatrix);
    return cmatrix;
}

// 输出最优解
function printOptimal(matrix, solutions) {
    console.log('最优解：');
    var n, r, c, txt = '', ttxt, total,
        idea = {zh: 'u', ch: 'i', sh: 'v', a: 'a', o: 'o', e: 'e', i: 'i', u: 'u', uo: 'o'};

    for (n = 0; n < solutions.length; n++) {
        ttxt = 'Summary: ', total = 0, txt = "";
        console.log('-----------------------------------');
        for (c = 0; c < matrix[0].length; c++) {
            txt += printf('%6s ', matrix[0][c]);
        }
        console.log(txt);
        for  (r = 1; r < matrix.length; r++) {
            txt = printf('%6s ', matrix[r][0]);
            for (c = 1; c < matrix[0].length; c++) {
                if (solutions[n][r - 1] === c - 1) {
                    idea[matrix[r][0]] = matrix[0][c];
                    total += matrix[r][c];
                    ttxt += printf('%d(%d:%d) + ', matrix[r][c], r, c);
                    txt += printf('%6s)', '(' + matrix[r][c]);
                } else {
                    txt += printf('%6s ', matrix[r][c]);
                }
            }
            console.log(txt);
        }
        console.log('\n' + ttxt.substring(0, ttxt.length - 3) + ' = ' + total);
        console.log('\nIdea: ' + JSON.stringify(idea));
        console.log('-----------------------------------');
    }
}

function go() {

    var fins = gotFins();
    //console.log(fins);
    var equivs = gotEquivs();
    //console.log(equivs);

    var matrix = gotMatrix(fins, equivs);
    //print(matrix);

    var soluts = hungary.hungary(gotCloneMatrix(matrix));
//console.log(gotCloneMatrix(matrix));
    printOptimal(matrix, soluts);

}

go();
