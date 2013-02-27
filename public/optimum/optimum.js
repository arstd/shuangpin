$(function(){
    var syllables = [], fins = {}, 
        finsFeq = [], // 韵母频率
        consFin = {}, // 相容的韵母
        together = {iong: 'ong'},
        initsPos = {zh: 'u', ch: 'i', sh: 'v'}, 
        finsPos = {a: 'a', o: 'o', e: 'e', i: 'i', u: 'u', v:'v'},
        keysEquiv = {},
        poses = "sentrioavmkdhufwyzklqxpcgj".split(''), basket = {},
        bestEquiv = 0, initialEquiv = 0;
      
    $.get('optimum/frequency.txt', gotFequency, 'text');            
    function gotFequency(data, textStatus, jqXHR) {
        //console.log(data);
        var rows = data.replace(/^\s+|\s+$/, '').split(/\n/);
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
        console.log(fins);
        console.log(initsPos);
        console.log(finsPos);
        
        // 韵母频率
        for (var fin1 in fins) {
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
        console.log(finsFeq);
        
         // 可相容的韵母
        for (var k = 0; k < finsFeq.length; k++) {
            var one = finsFeq[k].fin;
            anotherLabel:
            for (var m = 0; m < finsFeq.length; m++) {
                if (m === k) continue;
                var another = finsFeq[m].fin;
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
        console.log(consFin);
        
        $.get('optimum/equivalent.txt', gotEquivalent, 'text'); 
    }
    
    
    function gotEquivalent(data, textStatus, jqXHR) {
        var rows = data.replace(/^\s+|\s+$/, '').split(/\n/);
        //console.log(rows);
        
        // 击键当量
        var keys2nd = rows[0].toLowerCase().split(/\s+/);
        for (var i = 1; i < rows.length; i++) {
            var cols = rows[i].split(/\s+/);
            var key1st = cols[0].toLowerCase();
            keysEquiv[key1st] = {};
            for (var j = 1; j < cols.length; j++) {
                keysEquiv[key1st][keys2nd[j]] = +cols[j];
            }
        }
        console.log(keysEquiv);
        
        initialize();
        
        // arrange(0, 0);
        $('#start').on('click', function(){
            arrange(0, 0, 0, initialEquiv);
        });
    }
    
    function initialize() {
        // 位置和篮子
        for (var p in poses) {
            basket[poses[p]] = [];
        }
        basket['a'].push('a');
        basket['o'].push('o');
        basket['e'].push('e');
        basket['i'].push('i');
        basket['u'].push('u');
        basket['v'].push('v');
        
        for (var fin in finsPos) {
            if (!finsPos[fin]) continue;
            for (var init in fins[fin]) {
                initialEquiv += fins[fin][init] * keysEquiv[finsPos[fin]][initsPos[init]];
            }
        }
        console.log("initialEquiv = " + initialEquiv);

        bestEquiv = initialEquiv;
        
        
        var idea3rd =  {
            iu  :"q",	ui  :"w",	ve  :"w",	ei  :"f",	un  :"p",	ie  :"g",
            ua  :"g",	iang:"j",	uang:"j",	uan :"l",
            ang :"y",               eng :"r",	ai  :"s",	ing :"t",	ian :"d",
            ao  :"h",	an  :"n",
            uo  :"o",	ia  :"z",	in  :"x",	ou  :"c",		
            uai :"v",	iao :"b",	en  :"k",	ong :"m",	iong:"m"
        };
        
        for (var fin2 in idea3rd) {
            for (var init2 in fins[fin2]) {
                bestEquiv += fins[fin2][init2] * keysEquiv[idea3rd[fin2]][initsPos[init2]];
            }
        }
        console.log("bestEquiv = " + bestEquiv);
    }
    
    function finalize(equiv) {
        for (var tog in together) {
            finsPos[tog] = finsPos[together[tog]];
            basket[finsPos[tog]].push(tog);
             for (var init2 in fins[tog]) {
                equiv += fins[tog][init2] * keysEquiv[finsPos[tog]][initsPos[init2]];
            }
        }
        if (equiv < bestEquiv) bestEquiv = equiv;
        console.log(JSON.stringify(finsPos) + "\t" + equiv);
    }

    function arrange(ifin, ipos, times, equiv) {
        ipos = ipos % poses.length;
        
        // 这个韵母所有位置都试过了
        if (times >= poses.length) {
            return;
        }
        // 所有韵母都安排了位置
        if (ifin >= finsFeq.length) {
            finalize(equiv);            
            return;
        }
        
        
        var fin = finsFeq[ifin].fin, pos = poses[ipos];
        // 如果可以放在这里
        if (canPut(fin, pos)) {
            // 如果当量已经大于之前最优当量，那么不可以放这里；反之可以
            var finEquiv = gotFinEquiv(fin, pos);
            var totalEquiv = finEquiv + equiv;
            
        if (ifin >= finsFeq.length - 5) {
            display(ifin, fin,  pos, totalEquiv);
        }
        
            if (totalEquiv <= bestEquiv) {
                finsPos[fin] = pos;  // 放这个韵母
                basket[pos].push(fin);
                
                arrange(ifin + 1, ipos + 1, 0, totalEquiv); // 接下来放下一个韵母
                
                // 回溯
                finsPos[fin] = null; // 撤回，不放这里，试着放到下一个位置
                basket[pos].splice(basket[pos].length - 1, 1);
            }
        }
        
        arrange(ifin, ipos + 1, times + 1, equiv);
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
    
    function gotFinEquiv(fin, pos) {
        var equiv = 0;
        for (var init in fins[fin]) {
            equiv += fins[fin][init] * keysEquiv[pos][initsPos[init]];
        }        
        return equiv;
    }
    
    function display(ifin, fin, pos, equiv) {
        var ideaTxt = '';
        for (var i = 0; i < ifin; i++) {
            ideaTxt += finsFeq[i].fin + '=' + finsPos[finsFeq[i].fin] + ",";
        }
        console.log(ideaTxt + fin + '=' + pos + '\t' + equiv);
    }

    function display2() {
      var idea =  {
          iu  :"q",    ui  :"w",	ve  :"w",	ei  :"f",	un  :"p",	ie  :"g",
          ua  :"g",	iang:"j",	uang:"j",	uan :"l",	zh  :"u",	u   :"u",
          ang :"y",	a   :"a",	eng :"r",	ai  :"s",	ing :"t",	ian :"d",
          ao  :"h",	an  :"n",	e   :"e",	ch  :"i",	i   :"i",	o   :"o",
          uo  :"o",	ia  :"z",	in  :"x",	ou  :"c",	sh  :"v",	v   :"v",
          uai :"v",	iao :"b",	en  :"k",	ong :"m",	iong:"m"
      };
      var ideaTxt = 'var idea =  {\n\t', i = 1;
      for (var d in idea) {
          var pos = finsPos[d] || initsPos[d];
          if (!pos) continue;
          ideaTxt += d + '    '.substring(0, 4-d.length) + ':"' + pos + '",';
          if ( i++ % 6 === 0 )  {
              ideaTxt += '\n\t';
          }
          else {
              ideaTxt += '\t';
          }
      }
      ideaTxt = ideaTxt.replace(/,\n?\t$/g, '\n};');

      $('#display').html(ideaTxt + "<br>");
      //alert(ideaTxt);
    }
});