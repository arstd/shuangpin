/**
 * group 35 finals to 26 keys 
 */

var togethers = { 
    iong: 'ong' // 固定 iong 和 ong 在一起
}; 

function gotFins() {
    var fs = require('fs');
    var frequencyData = fs.readFileSync('optimal/frequency.txt','utf8');
    //console.log(frequencyData);
    
    var fins = {};
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

function gotFinsArray() {
    var finsArray = [];
    for (var fin in fins) {
        
        // 如果是单韵母，略过
        if ("m,n,g,r".indexOf(fin) > -1) continue;  
        
        if (togethers[fin]) continue;
        
        finsArray.push(fin);
    }
    finsArray.sort();
    return finsArray;
}

function gotConsFin() {
    var consFin = {};// 可相容的韵母
    var inits = 'b,p,m,f,d,t,n,l,g,k,h,j,q,x,z,c,s,r,zh,ch,sh,y,w'.split(/,/);
    for (var i = 0; i < finsArray.length; i++) {
        var one = finsArray[i];
        anotherLabel:
        for (var j = 0; j < i; j++) {
            var another = finsArray[j];
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


function consistent(fin, ibasket) {
    if (!consFin[fin]) return false;
    
    // 是否和这个篮子里的韵母相容
    for (var k = 0; k < baskets[ibasket].length; k++) {
        // 不相容
        if (!consFin[fin][baskets[ibasket][k]]) {
            return false;
        }
    }
    return true;
}


// 把第ifin个韵母依次放到第0~count个篮子里，目前已经用了count个篮子(也是第一个空篮子的索引)
function group2(ifin, count) {
    if(count > 26) return;
    
    if (ifin >= finsArray.length) {
        output();
        return;
    }
    
    var fin = finsArray[ifin];
    for (var cfin in consFin[fin]) {
        var ibasket = finsBas[cfin];
        
        /*
        baskets[ibasket] || (baskets[ibasket] = []);
        baskets[ibasket].push(finsArray[ifin]);
        output();
        baskets[ibasket].splice(baskets[ibasket].length - 1, 1);
        baskets[ibasket].length === 0 && (baskets.splice(ibasket, 1));
        */
        // 相容
        if (consistent(fin, ibasket)) {
            var ilen = baskets[ibasket].push(fin);
            finsBas[fin] = ibasket;
            
            group2(ifin + 1, count);
            
            // 回溯
            baskets[ibasket].splice(ilen - 1);
            delete finsBas[fin];
        }
    }
    // 放到新篮子里
    baskets[count] = [fin];
    finsBas[fin] = count;
    
    group2(ifin + 1, count + 1);
    
    // 回溯
    baskets.splice(count, 1);
    delete finsBas[fin];
}

function output() {
    for (var toge in togethers) {
        baskets[finsBas[togethers[toge]]].push(toge);
    }
    var txt = (++counter) + ' ' + baskets.length + ' '
        + JSON.stringify(baskets).replace(/","/g, '-').replace(/"\],\["/g, ' ').replace(/\[\["|"\]\]/g, '');
    console.log(txt);
    for (var tog in togethers) {
        baskets[finsBas[togethers[tog]]].splice(baskets[finsBas[togethers[tog]]].length - 1);
    }
}

function go() {
    var txt = 'index gnum'
    for (var i = 0; i < 26; i++) {
        txt += ' ' + i;
    }
    console.log(txt);
    
    group2(0, 0);
}

var fins = gotFins();
//console.log(fins);
var finsArray = gotFinsArray();
console.log(JSON.stringify(finsArray).replace(/"/g, ''));
var consFin = gotConsFin();
//console.log('>>> consFin ' + JSON.stringify(consFin).replace(/"|:true/g, ''));
//console.log(consFin);

var baskets = [];
var finsBas = {};

var counter = 0;

// 开始计算
go();
