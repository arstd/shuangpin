var fs = require('fs');

var syllables = [], fins = {}, 
    finsFeq = [], // 韵母频率
    consFin = {}, // 相容的韵母
    together = {iong: 'ong', uo: 'o', ui: 'v'},
    initsPos = {zh: 'u', ch: 'i', sh: 'v'}, 
    finsPos = {a: 'a', o: 'o', e: 'e', i: 'i', u: 'u', v:'v'},
    poses = "sntrvmkdhfwyzklqxpcgj".split(''), basket = {};

initialFrequcncy();
initialConsistent();
initialize();

arrange(0, 0, 0);

    
function initialFrequcncy() {
    var frequencyData = fs.readFileSync('public/optimum/frequency.txt','utf8');
    //console.log(frequencyData);
    
    var rows = frequencyData.replace(/^\s+|\s+$/, '').split(/\n/);
    // 韵母字典
    for (var i = 1; i < rows.length; i++) {
        var r = rows[i].split(/\s+/);
        syllables.push(r);
        
        var init = r[2], fin = r[3];
        !fins[fin] && (fins[fin]={});
        fins[fin][init] = +r[4];
        
        !initsPos[init] && (initsPos[init] = init);
        !finsPos [fin]  && (finsPos [fin]  = (fin.length===1 ? fin : null));
    }
    //console.log(fins);
    //console.log(initsPos);
    //console.log(finsPos);
    
    // 韵母频率
    for (var fin1 in fins) {
        // 略去无需安排的
        for (var tog in together) {
            if (fin1 == tog) continue;
        }
        if (finsPos[fin1]) continue;
        var tmp = {fin: fin1, feq: 0};
        for (var init1 in fins[fin1]) {
            tmp.feq += fins[fin1][init1];
        }
        finsFeq.push(tmp);
    }                
    finsFeq.sort(function(a,b){return b.feq-a.feq});  
    
    var finsTxt = '', feqsTxt = '';
    for (var idx = 0; idx < finsFeq.length; idx++) {
        finsTxt += finsFeq[idx].fin + ' ';
        feqsTxt += finsFeq[idx].feq + ' ';
    }
    console.log(finsTxt + '\n' + feqsTxt);
}

function initialConsistent() {
    // 可相容的韵母
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
}

function initialize() {
    // 位置和篮子
    for (var p in poses) {
        basket[poses[p]] = [];
    }
    for (var fin in finsPos) {
        if (finsPos[fin]) {
            basket[finsPos[fin]] = [fin];
        }
    }
    //console.log('>>> basket ' + JSON.stringify(basket))
    //console.log(basket);
}

function finalize() {
    for (var tog in together) {
        finsPos[tog] = finsPos[together[tog]];
        basket[finsPos[tog]].push(tog);
    }
    //console.log(JSON.stringify(finsPos));
}

function arrange(ifin, ipos, times) {
    ipos = ipos % poses.length;
    
    // 这个韵母所有位置都试过了
    if (times >= poses.length) {
        return;
    }
    // 所有韵母都安排了位置
    if (ifin >= finsFeq.length) {
        finalize();
        display(ifin, '');
        return;
    }
    
    var fin = finsFeq[ifin].fin, pos = poses[ipos];
    
    // 如果可以放在这里
    if (canPut(fin, pos)) {
        
        if (ifin >= finsFeq.length - 5) {
            display(ifin, pos);
        }
        
        // 如果当量已经大于之前最优当量，那么不可以放这里；反之可以
        finsPos[fin] = pos;  // 放这个韵母
        basket[pos].push(fin);
        
        arrange(ifin + 1, ipos + 1, 0); // 接下来放下一个韵母
        
        // 回溯
        finsPos[fin] = null; // 撤回，不放这里，试着放到下一个位置
        basket[pos].splice(basket[pos].length - 1, 1);
    }
    
    arrange(ifin, ipos + 1, times + 1);
}

function canPut(fin, pos) {
    // 判断是否可以放在这里
    for (var i = 0; i < basket[pos].length; i++) {
        if (consFin[fin] && consFin[fin][basket[pos][i]])  continue;
        // 当前要安排的韵母和篮子里的韵母不相容
        return false;
    }
    return true;
}

function display(ifin, pos) {
    var ideaTxt = '';
    for (var i = 0; i < ifin; i++) {
        ideaTxt += finsPos[finsFeq[i].fin] + " ";
    }
    console.log(ideaTxt + pos);
}