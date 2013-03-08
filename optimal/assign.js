var fs = require('fs');
var printf = require('printf');
var hungary = require('./hungary.js')

function gotAssEquivs() {
    var assEquivs = {};
    var assEquivsData = fs.readFileSync('output/assequivs.txt','utf8');
    
    var arows = assEquivsData.replace(/^\s+|\s+$/, '').split(/\n/);
    
    var poses = arows[0].toLowerCase().split(/\s+/);
    for (var i = 1; i < arows.length; i++) {
        var row = arows[i].split(/\s+/);
        var fin = row[0];
        assEquivs[fin] = {};
        for (var j = 1; j < row.length; j++) {
            assEquivs[fin][poses[j]] = +row[j] || 9e18;
        }
    }
    return assEquivs;
}

function gotCombins() {
    var combins = [];
    var combinData = fs.readFileSync('output/groups.txt','utf8');
    
    var crows = combinData.replace(/^\s+|\s+$/, '').split(/\n/);
    for (var i = 1; i < crows.length; i++) {
        var r = crows[i].split(/\s+/);
        combins.push(r);
    }
    return combins;
}

function gotMatrix(assEquivs, combin, poses) {
    var X = 9e18;
    var matrix = [];
    for (var i = 0; i < combin.length; i++) {
        matrix[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // 可能有多个韵母
        var gfins = combin[i].split('-');
        for (var m = 0; m < gfins.length; m++) {
            var fin = gfins[m];
            // 分别把韵母安排到每个位置
            for (var k = 0; k < poses.length; k++) {
                var pos = poses.charAt(k);
                matrix[i][k] += assEquivs[fin][pos];
            }
        }
    }
    return matrix;
}


function go() {
        
    var assEquivs = gotAssEquivs();
    // console.log(assEquivs);
    var combins = gotCombins();
    // console.log(combins[0]);
    
    var poses = 'bcdfghjklmnpqrstwxyz';
    
    var header = [], i, j, fins;
    for (i = 2; i < combins[0].length; i++) {
        fins = combins[0][i].split('-');
        for (j = 0; j < fins.length; j++) {
            header.push(fins[j]);
        }
    }
    header.sort();
    var txt = 'index';
    for (i = 0; i < header.length; i++) {
        txt += ' ' + header[i];
    }
    txt += ' equivalent';
    console.log(txt);
    
    var initEqiuv = 0;
    for (var fin in assEquivs) {
        if (fin.length > 1) continue;
        initEqiuv += assEquivs[fin][fin];
    }
    
    for (var icombin = 0; icombin < combins.length; icombin++) {
        var combin = combins[icombin], mcombin = [], solut = [], totalEquiv = initEqiuv;
        for (i = 2; i < combin.length; i++) {
            var matched = combin[i].match(/^[a-z]$|^[a-z]-|-[a-z]-|-[a-z]$/);
            if (matched) {
                var sfin = matched[0].replace(/-/g, '');
                fins = combin[i].split('-');
                for (j = 0; j < fins.length; j++) {
                    solut.push([fins[j], sfin]);
                    if (fins[j].length === 1) continue;
                    totalEquiv += assEquivs[fins[j]][sfin];
                }
            } else {
                mcombin.push(combin[i]);
            }
        }
        var matrix = gotMatrix(assEquivs, mcombin, poses);
        //console.log(mcombin);
        //console.log(poses);
        //console.log(matrix[14]);
        
        var solutions = hungary.hungary(matrix);
        // console.log(solutions);
        
        for (var s = 0; s < solutions.length; s++) {
            for (i = 0; i < solutions[s].length; i++) {
                totalEquiv += matrix[i][solutions[s][i]];
                fins = mcombin[i].split('-');
                var pos = poses.charAt(solutions[s][i]);
                for (j = 0; j < fins.length; j++) {
                    solut.push([fins[j], pos]);
                }
            }
        }
        solut.sort();
        txt = printf('%-5d', combin[0]);
        for (i = 0; i < solut.length; i++) {
            txt += printf(' %' + header[i].length + 's', solut[i][1]);
        }
        txt += ' ' + totalEquiv.toFixed(1);
        console.log(txt);
    }
}

// 开始计算
go();

