/**
 * group 35 finals to 26 keys 
 */

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
//console.log(finsArray);

function consistent(ifin, ibasket) {
    if (!consFin[finsArray[ifin]]) return false;
    
    // 是否和这个篮子里的韵母相容
    for (var k = 0; k < baskets[ibasket].length; k++) {
        // 不相容
        if (!consFin[finsArray[ifin]][baskets[ibasket][k]]) {
            return false;
        }
    }
    return true;
}

var counter = 0;
function output() {
    var txt = (++counter) + ' ' + baskets.length + ' '
        + JSON.stringify(baskets).replace(/","/g, '-').replace(/"\],\["/g, ' ').replace(/\[\["|"\]\]/g, '');
    console.log(txt);
}

// 把第ifin个韵母依次放到第0~count个篮子里，目前已经用了count个篮子
function group2(ifin, count) {
    if(count > 26) return;
    
    if (ifin >= finsArray.length) {
        output();
        return;
    }
    
    for (var ibasket = 0; ibasket < count; ibasket++) {
        /*
        baskets[ibasket] || (baskets[ibasket] = []);
        baskets[ibasket].push(finsArray[ifin]);
        output();
        baskets[ibasket].splice(baskets[ibasket].length - 1, 1);
        baskets[ibasket].length === 0 && (baskets.splice(ibasket, 1));
        */
        // 相容
        if (consistent(ifin, ibasket)) {
            baskets[ibasket].push(finsArray[ifin]);
            
            group2(ifin + 1, count);
            
            // 回溯
            baskets[ibasket].splice(baskets[ibasket].length - 1);
        }
    }
    // 放到新篮子里
    baskets[count] = [finsArray[ifin]];
    
    group2(ifin + 1, count + 1);
    
    // 回溯
    baskets.splice(count, 1)
}

// 开始计算
group2(0, 0);
