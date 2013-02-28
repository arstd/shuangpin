var fs = require('fs');

var frequencyData = fs.readFileSync('public/optimum/frequency.txt','utf8');
//console.log(frequencyData);

var fins = {};
var rows = frequencyData.replace(/^\s+|\s+$/, '').split(/\n/);
// 韵母字典
for (var i = 1; i < rows.length; i++) {
    var r = rows[i].split(/\s+/);
    
    var init = r[2], fin = r[3];
    
    //console.log(init + fin + ','+("a,o,e,',-".indexOf(init)));
    // 如果是单韵母，略过
    if ("a,o,e,',-".indexOf(init) > -1) continue;    
    
    !fins[fin] && (fins[fin]={});
    fins[fin][init] = +r[4];
}
//console.log(fins);

var consFin = {};// 可相容的韵母
for (var one in fins) {
    anotherLabel:
    for (var another in fins) {
        for (var initInOne in fins[one]) {
            for (var initInAnother in fins[another]) {
                // 如果可以和相同的声母组合，就是不相容的
                // 跳过这个another韵母，取下一个
                if(initInOne == initInAnother)  continue anotherLabel;
            }
        }
        // another里的声母和one里的都不相同，可相容
        consFin[one] || (consFin[one] = {});
        consFin[one][another] = true;
    }
}
//console.log('>>> consFin ' + JSON.stringify(consFin));
//console.log(consFin);

var baskets = [];
var finsArray = [];
for (var fin in fins) {
    finsArray.push(fin);
}
console.log(finsArray);


group(0, 0, 0);

// 把第ifin个韵母放到第ibasket个几经有韵母的篮子里，目前已经用了count个篮子
function group(ifin, ibasket, count) {
    if(count >= 26) return;
    
    if (ifin >= finsArray.length) {
        output();
        return;
    }
    
    // 放到新篮子里
    if (ibasket >= count) {
        baskets[ibasket] = [finsArray[ifin]];
        group(ifin + 1, 0, count + 1);
        return;
    }
    
    // 相容
    if (consistent(ifin, ibasket)) {
        baskets[ibasket].push(finsArray[ifin]);
        
        group(ifin + 1, 0, count)
        
        // 回溯
        baskets[ibasket].splice(baskets[ibasket].length - 1);
    }
    
    group(ifin, ibasket + 1, count)
}


function consistent(ifin, ibasket) {
    if (!consFin[finsArray[ifin]]) return false;
    
    // 是否和这个篮子里的韵母相容
    for (var k = 0; k < baskets[ibasket].length; k++) {
        // 不相容
        if (!consFin[fin][baskets[ibasket][k]]) {
            return false;
        }
    }
    return true;
}

function output() {
    console.log(JSON.stringify(baskets).replace(/","/g, '-').replace(/"\],\["/g, ' ').replace(/\[\["|"]]/g, ''));
}

/*
var idx = 1;
nextFinLabel:
for (var fin in fins) {
    nextBasketLabel:
    //是否可以和其他韵母相容
    for (var j = 1; j < idx; j++) {
        console.log(fin + ' ' + j + ' ' + baskets[j]);
        // 是否和这个篮子里的韵母相容
        for (var k = 0; k < baskets[j].length; k++) {
            console.log(k + ' ' + baskets[j][k]);
            // 不相容
            if (!consFin[fin] || !consFin[fin][baskets[j][k]]) {
                continue nextBasketLabel;
            }
        }
        // 相容
        baskets[j].push(fin);
        continue nextFinLabel;
    }
    baskets[idx++] =[fin];
}

console.log(baskets);
*/
