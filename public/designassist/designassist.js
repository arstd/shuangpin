var initFinalCnt = {}, finalInitCnt = {};
$(function(){
    var sum = 0;
    for (var i in initfinalcount) {
        var fields = initfinalcount[i];
        var init = fields[0], final = fields[1], cnt = Number(fields[2]);
        initFinalCnt[init] || (initFinalCnt[init] = {});
        initFinalCnt[init][final] = cnt;
        finalInitCnt[final] || (finalInitCnt[final] = {});
        finalInitCnt[final][init] = cnt;
        sum += cnt;
    }
    finalInitCnt['*'] = sum;
    initFinalCnt['*'] = sum;
    
    for (var final in finalInitCnt) {
        var finalSum = 0;
        for (var init in finalInitCnt[final]) {
            finalSum += finalInitCnt[final][init];
        }
        finalInitCnt[final]['*'] = finalSum;
        finalInitCnt[final]['@'] = charPosition[final];
    }
    for (var init in initFinalCnt) {
        if (init == '-' || init == '@' || init == '*') {
            continue;
        }
        var initSum = 0;
        for (var final in initFinalCnt[init]) {
            initSum += initFinalCnt[init][final];
        }
        initFinalCnt[init]['*'] = initSum;
        initFinalCnt[init]['@'] = charPosition[init];
        keyPercent[initFinalCnt[init]['@']] = initFinalCnt[init]['*'];
        $('#' + initFinalCnt[init]['@'] + ' span:eq(3)')//
        /*_*/
        .text(percent(keyPercent[initFinalCnt[init]['@']], initFinalCnt['*']));
    }
    
    
    var sorted = new Array();
    for (var final in finalInitCnt) {
        if ('*,-,@,a,o,e,u,i,v,er'.indexOf(final) >= 0) 
            continue;
        sorted.push({
            'final': final,
            '*': finalInitCnt[final]['*']
        });
    }
    sorted.sort(function(a, b){
        return b['*'] - a['*'];
    });
    var ths = $('#final_count table th');
    var tds = $('#final_count table td');
    for (var i = 0; i < sorted.length; i++) {
        $(ths[i]).text(sorted[i].final).attr('id', 'final' + sorted[i].final)//
        /*_*/
        .attr('draggable', true).addClass('draggable');
        $(tds[i]).text(percent(sorted[i]['*'], finalInitCnt['*']));
    }
    $(ths[tds.length - 3]).text('zh').attr('id', 'initzh');
    $(tds[tds.length - 3]).text(percent(initFinalCnt['zh']['*'], finalInitCnt['*']));
    $(ths[tds.length - 2]).text('ch').attr('id', 'initch');
    $(tds[tds.length - 2]).text(percent(initFinalCnt['ch']['*'], finalInitCnt['*']));
    $(ths[tds.length - 1]).text('sh').attr('id', 'initsh');
    $(tds[tds.length - 1]).text(percent(initFinalCnt['sh']['*'], finalInitCnt['*']));
    
    (function(){
        for (var final in finalInitCnt) {
            if ($.inArray(final, ['*', '@', '-']) >= 0) {
                continue;
            }
            var is = new Array();
            for (var init in finalInitCnt[final]) {
                if ($.inArray(init, ['*', '@', '-']) >= 0) {
                    continue;
                }
                is.push(init);
            }
            var toge = []
            label1: for (var f in finalInitCnt) {
                if ($.inArray(f, ['*', '@', '-']) >= 0) {
                    continue;
                }
                for (var i in finalInitCnt[f]) {
                    if ($.inArray(i, ['*', '@', '-']) >= 0) {
                        continue;
                    }
                    if ($.inArray(i, is) >= 0) 
                        continue label1;
                }
                toge.push(f);
            }
            if (toge.length <= 0) {
                toge = '\t\t';
            }
            $('#final' + final).next('td').attr('title', String(toge).replace(/,/g, ',  '));
        }
    })();
});
function percent(x, y){
    var x = Math.round(x * 10000 / y);
    if (String(x).length == 1) 
        return '0.0' + x;
    else if (String(x).length == 2) 
        return '0.' + x;
    return String(x).replace(/\d\d$/, function(m){
        return '.' + m;
    });
}

var effect = 'copy';
$(function(){
    var associate = {
        'mouseenter': function(){
            var final = this.innerHTML.toLowerCase();
            if (!finalInitCnt[final]) 
                return;
            var exchange = {
                'false': 0,
                'true': 0
            };
            for (var init in finalInitCnt[final]) {
                if (init == '*' || init == '@' || init == '-') {
                    continue;
                }
                var perc = percent(initFinalCnt[init][final] * 10, initFinalCnt['*']);
                $('#' + initFinalCnt[init]['@'] + ' span:eq(2)').text(perc);
                var l = (Number(initFinalCnt[init]['@'].substring(3)) % 100 <= 5);
                exchange[l] += Number(perc);
            }
            exchange['true'] = percent(exchange['true'], 100);
            exchange['false'] = percent(exchange['false'], 100);
            var alloc = !!finalInitCnt[final]['@'];
            if (alloc) {
                var left = (Number(finalInitCnt[final]['@'].substring(3)) % 100 <= 5);
                exchange['contrib'] = percent(exchange[!left] - exchange[left], 100);
                var text = 'contrib:\t' + (exchange['contrib']) + '\nleft:\t\t' + exchange['true'] + '\nright:\t\t' + exchange['false']
            }
            else {
                var text = 'contrib:\t' + ('') + '\nleft:\t\t' + exchange['true'] + '\nright:\t\t' + exchange['false']
            }
            $(this).addClass('mouseenter').attr('title', text);
        },
        'mouseleave': function(){
            $(this).removeClass('mouseenter');
            var final = this.innerHTML.toLowerCase();
            if (!finalInitCnt[final]) 
                return;
            for (var init in finalInitCnt[final]) {
                if (init == '*' || init == '@' || init == '-') {
                    continue;
                }
                $('#' + initFinalCnt[init]['@'] + ' span:eq(2)').text('');
            }
        }
    };
    $('#final_count th').bind(associate);
    $('#keyboard .keymain').each(function(index, elment){
        $(elment).find('span:lt(2)').bind({
            'mouseenter': function(){
                var init = this.innerHTML.toLowerCase();
                if (!initFinalCnt[init]) {
                    return;
                }
                $(this).addClass('mouseenter');
                for (var final in initFinalCnt[init]) {
                    if (final == '*' || final == '@' || final == '-') {
                        continue;
                    }
                    $('#' + finalInitCnt[final]['@'] + ' span:eq(2)')//
                    /*_*/
                    .text(percent(finalInitCnt[final][init] * 10, finalInitCnt['*']));
                }
            },
            'mouseleave': function(){
                $(this).removeClass('mouseenter');
                var init = this.innerHTML.toLowerCase();
                if (!initFinalCnt[init]) 
                    return;
                for (var final in initFinalCnt[init]) {
                    if (final == '*' || final == '@' || final == '-') {
                        continue;
                    }
                    $('#' + finalInitCnt[final]['@'] + ' span:eq(2)').text('');
                }
            }
        });
        $(elment).find('span:gt(1)').bind(associate);
    });
    $('#final_count table th, #keyboard .keymain span:gt(0)').bind({
        'dragstart': function(ev){
            ev.stopPropagation();
            var dt = ev.originalEvent.dataTransfer;
            dt.setData('text', $(this).text());
            if (this.tagName === 'TH') {
                dt.effectAllowed = 'copy';
                effect = 'copy';
                $(this).addClass('dragging').next('td').addClass('dragging');
            }
            else {
                dt.effectAllowed = 'move';
                effect = 'move';
                $(this).addClass('dragging');
            }
            return true;
        },
        'dragend': function(ev){
            var dt = ev.originalEvent.dataTransfer;
            if (dt.dropEffect != 'copy' && dt.dropEffect != 'move') {
                $(this).removeClass('dragging').next('td').removeClass('dragging');
                return false;
            }
            if (dt.dropEffect == 'copy') {
                $(this).attr('draggable', false).removeClass('draggable') //
                /*_*/
                .addClass('dragged').next('td').addClass('dragged');
            }
            else if (dt.dropEffect == 'move') {
                if ('zh,ch,sh'.indexOf($(this).text()) >= 0) {
                    calMoveWeightFrom($(this).text(), $(this).parent()[0].id);
                }
                else {
                    calMoveWeight1($(this).text(), $(this).parent()[0].id);
                }
                $(this).text('').removeClass('dragging');
            }
            return false;
        }
    });
    $('#keyboard .keymain').bind({
        'dragenter': function(ev){
            ev.stopPropagation();
            ev.preventDefault();
            var dt = ev.originalEvent.dataTransfer;
            dt.dropEffect = dt.effectAllowed;
            $(this).addClass('dragover');
            return false;
        },
        'dragover': function(ev){
            ev.stopPropagation();
            ev.preventDefault();
            $(this).addClass('dragover');
            return false;
        },
        'dragleave': function(ev){
            ev.preventDefault();
            $(this).removeClass('dragover');
            return false;
        },
        'drop': function(ev){
            ev.preventDefault();
            $(this).removeClass('dragover');
            var dt = ev.originalEvent.dataTransfer;
            var final = dt.getData('text');
            
            if ('zh,ch,sh'.indexOf(final) >= 0) {
                initFinalCnt[final]['@'] = this.id;
                $(this).find('span:eq(1)').text(final)//
                /*_*/
                .attr('draggable', true).addClass('draggable');
                calMoveWeightTo(final, this.id);
            }
            else {
                if (conflict(final, this)) {
                    return false;
                }
                finalInitCnt[final]['@'] = this.id;
                if (!$(this).find('span:eq(5)').text()) {
                    $(this).find('span:eq(5)').text(final)//
                    /*_*/
                    .attr('draggable', true).addClass('draggable');
                }
                else if (!$(this).find('span:eq(4)').text()) {
                    $(this).find('span:eq(4)').text(final)//
                    /*_*/
                    .attr('draggable', true).addClass('draggable');
                }
                else {
                    $(this).find('span:eq(2)').text(final)//
                    /*_*/
                    .attr('draggable', true).addClass('draggable');
                }
                calMoveWeight2(final, this.id);
            }
            return false;
        }
    });
    
    initialize(idea);
    
    $('#keyCtrlL').attr('title', 'Click here, try?').toggle(function(){
        var idea = {};
        $('#keyboard .keymain').each(function(index, element){
            if ($(element).find('span:eq(0)').text().match(/[A-Z]/)) {
                var init = $(element).find("span:eq(1)").text();
                if (init) {
                    idea[init] = $(element).find('span:eq(0)').text().toLowerCase();
                }
                var init = $(element).find("span:eq(5)").text();
                if (init) {
                    idea[init] = $(element).find('span:eq(0)').text().toLowerCase();
                }
                var init = $(element).find("span:eq(4)").text();
                if (init) {
                    idea[init] = $(element).find('span:eq(0)').text().toLowerCase();
                }
            }
        });
        
        var ideaTxt = 'var idea =  {\n\t', i = 1;
        for (var initFinal in idea) {
            ideaTxt += initFinal + '    '.substring(0, 4-initFinal.length) + ':"' + idea[initFinal] + '",'; 
            if ( i++ % 6 == 0 )  {
                ideaTxt += '\n\t';
            } 
            else {
                ideaTxt += '\t';
            }
        }
        ideaTxt = ideaTxt.replace(/,\n?\t$/g, '\n};'); 

        $('#idea').val(ideaTxt).show();
        $(this).attr('title', 'Click here, try again?')
    }, function(){
        $('#idea').val('').hide();
        $(this).attr('title', 'Click here, try?')
    });
})

function calMoveWeightFrom(init, key){
    keyPercent[key] -= initFinalCnt[init]['*'];
    var perc = keyPercent[key] ? percent(keyPercent[key], initFinalCnt['*']) : '';
    $('#' + key + ' span:eq(3)').text(perc);
}

function calMoveWeightTo(init, key){
    keyPercent[key] += initFinalCnt[init]['*'];
    $('#' + key + ' span:eq(3)')//
    /*_*/
    .text(percent(keyPercent[key], initFinalCnt['*']));
}

function calMoveWeight1(final, key){
    keyPercent[key] -= finalInitCnt[final]['*'];
    var perc = keyPercent[key] ? percent(keyPercent[key], finalInitCnt['*']) : '';
    $('#' + key + ' span:eq(3)').text(perc);
}

function calMoveWeight2(final, key){
    keyPercent[key] += finalInitCnt[final]['*'];
    $('#' + key + ' span:eq(3)')//
    /*_*/
    .text(percent(keyPercent[key], finalInitCnt['*']));
}

function initialize(design){
    for (var final in design) {
        if ('zh,ch,sh,y,w,z,l'.indexOf(final) >= 0) {
            initFinalCnt[final]['@'] = charPosition[design[final]];
            $('#' + initFinalCnt[final]['@'] + ' span:eq(1)').text(final)//
            /*_*/
            .attr('draggable', true).addClass('draggable');
            keyPercent[initFinalCnt[final]['@']] += initFinalCnt[final]['*'];
            $('#' + initFinalCnt[final]['@'] + ' span:eq(3)')//
            /*_*/
            .text(percent(keyPercent[initFinalCnt[final]['@']], initFinalCnt['*']));
            
            $('#init' + final).addClass('dragged').next('td').addClass('dragged');
            continue;
        }
        
        finalInitCnt[final]['@'] = charPosition[design[final]];
        calMoveWeight2(final, finalInitCnt[final]['@']);
        
        var $key = $('#' + finalInitCnt[final]['@']);
        $key.find('span:eq(3)') //
        if (!$key.find('span:eq(5)').text()) {
            $key.find('span:eq(5)').text(final) //
            /*_*/
            .attr('draggable', true).addClass('draggable');
        }
        else if (!$key.find('span:eq(4)').text()) {
            $key.find('span:eq(4)').text(final)//
            /*_*/
            .attr('draggable', true).addClass('draggable');
        }
        else {
            $key.find('span:eq(2)').text(final) //
            /*_*/
            .attr('draggable', true).addClass('draggable');
        }
        $('#final' + final).addClass('dragged').next('td').addClass('dragged');
        
    }
}

function conflict(final, key){
    var assInits = new Array();
    for (var init in finalInitCnt[final]) {
        if (init == '-') {
            continue;
        }
        assInits.push(init);
    }
    for (var p in [5, 4, 2]) {
        var has = $(key).find('span:eq(' + [5, 4, 2][p] + ')').text();
        if (has) {
            for (var init in finalInitCnt[has]) {
                if (init == '*' || init == '@' || init == '-') {
                    continue;
                }
                if ($.inArray(init, assInits) >= 0) {
                    alert('conflict : ' + init + final + ' <-> ' + init + has);
                    $('#final_count #final' + final).removeClass('dragging')//
                    /*_*/
                    .removeClass('dragged').addClass('draggable').next('td').removeClass('dragged')//
                    /*_*/
                    .removeClass('dragging').end().attr('draggable', true);
                    return true;
                }
            }
        }
    }
    return false;
}
