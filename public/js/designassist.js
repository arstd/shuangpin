$(function() {
    // generate keyboard 
    var $keyboard = $('#keyboard');
    for (var i = 0; i < 5; i++) {
        var row = $('<div class="keyrow" />').attr('id', 'row' + i);
        var start = 1, num = 13;
        if (i == 0) {
            start = 0;
        }
        if (i == 1) {
            row.append('<div id="keytab" class="key keycontrol">Tab</div>');
        }
        else if (i == 2) {
            row.append('<div id="keycapslock" class="key keycontrol">Caps Lock</div>');
            num = 12;
        }
        else if (i == 3) {
            row.append('<div id="keyshiftl" class="key keycontrol">Shift L</div>');
            num = 11;
        }
        else if (i == 4) {
            row.append('<div id="keyctrll" class="key keycontrol">Ctrl L</div>');
            row.append('<div id="keywinl" class="key keycontrol">Win L</div>');
            row.append('<div id="keyaltl" class="key keycontrol">Alt L</div>');
            row.append('<div id="keyblank" class="key keycontrol"></div>');
            row.append('<div id="keyaltr" class="key keycontrol">Alt R</div>');
            row.append('<div id="keywinr" class="key keycontrol">Win R</div>');
            row.append('<div id="keymenu" class="key keycontrol">Menu</div>');
            row.append('<div id="keyctrlr" class="key keycontrol">Ctrl R</div>');
            i = 13;
        }
        for (var j = (!!i); j < 14 - i - (!i); j++) {
            var key = $('<div class="key" />').attr('id', 'key' + (i * 100 + j));
            for (var k = 1; k <= 4; k++) {
                key.append($('<div class="corner" />').addClass('corner' + k));
            }
            row.append(key);
        }
        if (i == 0) {
            row.append('<div id="keybackspace" class="key keycontrol">Backspace</div>');
        }
        else if (i == 1) {
            row.append('<div id="keyslash" class="key keycontrol">\\</div>');
        }
        else if (i == 2) {
            row.append('<div id="keyenter" class="key keycontrol">Enter</div>');
        }
        else if (i == 3) {
            row.append('<div id="keyshiftr" class="key keycontrol">Shift R</div>');
        }
        $keyboard.append(row);
    }

    // fill keyboard use dvorak layout
    var dvorak = keyboard.dvorak;
    for (var i = 0; i < dvorak.length; i++) {
        for (var j = 0; j < dvorak[i].length; j++) {
            if (dvorak[i][j] instanceof Array) {
                if (dvorak[i][j][0]) { 
                    $('#key' + (i * 100 + j) + ' .corner:eq(0)').text(dvorak[i][j][0]);
                }
                if (dvorak[i][j][1]) { 
                    $('#key' + (i * 100 + j) + ' .corner:eq(2)').text(dvorak[i][j][1]);
                }
                if (dvorak[i][j][2]) { 
                    $('#key' + (i * 100 + j) + ' .corner:eq(1)').text(dvorak[i][j][2]);
                }                   
                if (dvorak[i][j][3]) { 
                    $('#key' + (i * 100 + j) + ' .corner:eq(3)').text(dvorak[i][j][3]);
                }
            }
            else {
                $('#key' + (i * 100 + j)).text(dvorak[i][j]);
            }
        }
    }

    $.ajax({  
         //url: 'http://127.0.0.1:3000/',   //请求的是3000端口，应该属于跨域调用，因此dataType用jsonp  
         url: 'finalcount',
         dataType: "json",  
         //dateType: "jsonp",
         //jsonpCallback: "_test",       //可以自定义‘处理’函数，默认是callback  
         cache: false,  
         //jsonp:'callback',               //默认的传递处理函数是callback  
         timeout: 5000,  
         success: function(data) {  
             drawFinals(data);  
         },  
         error: function(jqXHR, textStatus, errorThrown) {  
             alert('error ' + textStatus + " " + errorThrown);  
         }  
    });

    $('#keyblank').on({
        'dragenter': function(e) {
            $(this).css('background', 'blue');
            return false;
        }
    });
});

function drawFinals(data) {
    //var data = $.parseJSON(data);
    var $finals = $('#final');
    for (var i = 0; i < data.length; i++) {
        var $fin = $('<div class="afinal" />')
            .append($('<span class="final" />').text(data[i]['final']))
            .append($('<span class="count" />').text(data[i]['count']));
        $finals.append($fin);
    }

    $('#final>.afinal').attr('draggable', 'true').css('cursor', 'move').on('dragstart', function(e) {
        e.originalEvent.dataTransfer.effectAllowed = 'copy'; // only dropEffect='copy' will be dropable
        e.originalEvent.dataTransfer.setData('text', this.innerHTML);        
    });
}
