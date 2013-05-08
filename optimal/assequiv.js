var fs = require('fs');
var printf = require('printf');

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

function gotConsFin(fins) {
    var consFin = {};// 可相容的韵母
    var inits = 'b,p,m,f,d,t,n,l,g,k,h,j,q,x,z,c,s,r,zh,ch,sh,y,w'.split(/,/);
    for (var one in fins) {
        anotherLabel:
        for (var another in fins) {
            for (var k = 0; k < inits.length; k++) {
                var init = inits[k];
                // 如果可以和相同的声母组合，就是不相容的
                // 跳过这个another韵母，取下一个
                if (fins[one][init] && fins[another][init]) {
                    continue anotherLabel;
                }
            }
            consFin[one] || (consFin[one] = {});
            consFin[one][another] = true;
        }
    }
    return consFin;
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

function gotAssEquiv(fins, consFin, equivs) {
    var assEquiv = [], fin, ikey, key, i, cur, init, key0, equiv;
    var keys = 'abcdefghijklmnopqrstuvwxyz;';
    for (fin in fins) {
    // if (fin !== 'ia' && fin !== 'uang' && fin !== 've' && fin !== 'ie') continue;
        cur = [];
        if (fin.match(/^[a-z]$/)) {
            ikey = keys.indexOf(fin);
            for (i = 0; i < keys.length; i++) {
                if (i !== ikey) {
                    cur[i] = NaN;
                } else {
                    equiv = 0;
                    for (init in fins[fin]) {
                        key0 = initsPos[init] || init;
                        equiv += fins[fin][init] * equivs[key0][fin];
                    }
                    cur[i] = +equiv.toFixed(1);
                }
            }
        } else {
            for (i = 0; i < keys.length; i++) {
                key = keys.charAt(i);
                if (key.match(/^[aeiouv]$/) && (!consFin[key] || !consFin[key][fin])) {
                    cur[i] = NaN;
                } else {
                    equiv = 0;
                    for (init in fins[fin]) {
                        key0 = initsPos[init] || init;
                        equiv += fins[fin][init] * equivs[key0][key];
                    }
                    cur[i] = +equiv.toFixed(1);
                }
            }
        }
        cur.unshift(fin);
        assEquiv.push(cur);
    }
    assEquiv.sort();
    return assEquiv;
}

function print(assEquiv) {
    var txt, i, j;
    assEquiv.unshift('-abcdefghijklmnopqrstuvwxyz;'.split(''));
    for (i = 0; i < assEquiv.length; i++) {
        txt = printf('%-4s', assEquiv[i][0]);
        for (j = 1; j <= 26; j++) {
            txt += printf(' %11s', assEquiv[i][j]);
        }
        console.log(txt);
    }
}

function go() {

    var fins = gotFins();
    //console.log(fins);
    var consFin = gotConsFin(fins);
    // console.log(fins);
    var equivs = gotEquivs();
    //console.log(equivs);

    var assEquiv = gotAssEquiv(fins, consFin, equivs);
    print(assEquiv);

}

go();
