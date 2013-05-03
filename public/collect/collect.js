Array.prototype.contains = function(element) {
    for(var i in this) {
        if (element === this[i]) {
            return true;
        }
    }
    return false;
};

function gotPlayFunction() {
    var sounds = {right: [], wrong: [], 'right-prev': 0, 'wrong-prev': 0};
    var raudio = new Audio("/sound/type.wav"), waudio = new Audio("/sound/error.wav");
	raudio.volume = 0.5,  waudio.volume = 0.5;
    raudio.play(), waudio.play();
	sounds.right.push(raudio), sounds.wrong.push(waudio);
    return function(sound) {
        sounds[sound + '-prev'] = (sounds[sound + '-prev'] + 1) % sounds[sound].length;
        if (sounds[sound][sounds[sound + '-prev']].ended) {
            sounds[sound][sounds[sound + '-prev']].play();
        } else {
            var audio = new Audio(sound === 'right' ? "/sound/type.wav" : "/sound/error.wav");
            audio.volume = 0.5;
            audio.play();
            var sound2 = sounds[sound].slice(0, sounds[sound + '-prev']);
            sound2.push(audio);
            sounds[sound] = sound2.concat(sounds[sound].slice(sounds[sound + '-prev'], sounds[sound].length));
        }
    };
}

var typ = {
	play: gotPlayFunction(),
	stat: {
		charCount: $('#charCount'),
		currentCount: $('#currentCount'),
		rightCount: $('#rightCount'),
		wrongCount: $('#wrongCount'),
		backspaceCount: $('#backspaceCount'),
		usedTime: $('#usedTime'),
		speed: $('#speed')
	},
    collect: {},
    prevKeyCode: null,
    prevChar: '~',
    prevTime: null
};

var chars = "abcdefghijklmnopqrstuvwxyz;;;".split('');
function initCollect() {
    for (var i = 0; i < chars.length; i++) {
        typ.collect[chars[i]] = {};
        for (var j = 0; j < chars.length; j++) {
            typ.collect[chars[i]][chars[j]] = [];
        }
    }
}
initCollect();

$(function(){

    $('#random').on({
        'click': function(){
		var text = '';
		for (var i = 676; i > 0; i--) {
			text += chars[Math.floor(chars.length * Math.random())];
			text += chars[Math.floor(chars.length * Math.random())];
			text += ' ';
		}

		$('#typing').html(text.replace(/\s*\n*$/,'')
		.replace(/./g, function(m){
            return '<span>' + m + '</span>';
		}).replace(/span/, 'span class="current"'));
            $('#handler')[0].focus();
            typ.charCount = $('#typing span').length;
            typ.current = null;
            clearInterval(typ.timing);
        }
    });

    $('#collect').on({
       'click': function() {
            var txt = '';
            for (var key1 in typ.collect) {
                for (var key2 in typ.collect[key1]) {
                    var ts = typ.collect[key1][key2];
                    if (ts.length === 0) continue;
                    txt += "'" + key1 + key2 + "'" + ': ';
                    for (var i = 0; i < ts.length; i++) {
                        txt += ts[i] + ' ';
                    }
                    txt += '\n';
                }
            }

           $('#text').val(txt);
       }
    });
    $('#commit').on({
       'click': function() {
            $.ajax({
                url: 'collectCommit',
                data: typ.collect,
                type: 'post',
                dataType: 'json',
                success: function(data) {
                    $('#text').val('');
                    alert(data);
                },
                error: function(jqXHR, textStatus, errorThrown){
                    alert('error ' + textStatus + " " + errorThrown);
                }
            });

            initCollect();
       }
    });

    $('#handler').on({
        'blur': function() {
           cannotTyping();
        },
        'focus': function() {
            canTyping();
        }
    });

    $('#typing-area').on({
        'click': function() {
            $('#handler')[0].focus();
        }
    });

    $('#handler').on({
	'keypress': function(event) {
        // ---------collect ------------
        var char = String.fromCharCode(event.keyCode);

        var curTime = new Date();
        if (chars.contains(typ.prevChar) && chars.contains(char)) {
            var delta = curTime - typ.prevTime;
            if (50 < delta && delta < 400) {
                typ.collect[typ.prevChar][char].push(delta);
                // console.log(typ.prevChar + '-' + char + '\t' + delta);
            }
        }
        typ.prevChar = char;
        typ.prevTime = curTime;
        // -----------------------------
        event.preventDefault();
		switch (event.keyCode) {
		case 16: return;
		case 8: return;
		default:
			this.value = '';
			typing(event.keyCode);
			return;
		}
	},
	'keydown':  function(event) {
		this.value = '';
		switch (event.keyCode) {
		case 9:
		case 16: event.preventDefault();return;
		case 8: event.preventDefault();backspace(); return;
		default:  return;
		}
    }
    });
});

function canTyping() {
	if ($('#typing .current').length) {
		$('#typing').removeClass('typing-blur').addClass('typing-focus');
	}
}

function cannotTyping() {
	$('#typing').removeClass('typing-focus').addClass('typing-blur');
}


function backspace() {
	if (typ.currentCount) {
		typ.current.removeClass('current right wrong');

		typ.current = typ.current.prev();

		typ.current.addClass('current');

		typ.backspaceCount++;
		typ.currentCount--;
	}
}

function typing(keyCode){
	if (typ.current === null) {
		startTyping();
	}
	typ.currentCount++;

	typ.current.removeClass('current right wrong');

	var char = String.fromCharCode(keyCode);
	if(!event.shiftKey) char = char.toLowerCase();

    var requreChar = (typ.current[0].tagName == 'BR' ? ' ' : typ.current.text());

	if (char == requreChar) {
		typ.current.addClass('right');
		typ.play('right');
		typ.rightCount++;
	} else {
		typ.current.addClass('wrong');
		typ.play('wrong');
		typ.wrongCount++;
	}

	typ.current = typ.current.next();

	if (!typ.current.length) {
		finishTyping();
	} else {
		typ.current.addClass('current');
	}
}

function startTyping() {
	$.extend(typ, {
		stime: new Date(),
		rightCount: 0,
		wrongCount: 0,
		backspaceCount: 0,
		currentCount: 0,
		current: $('#typing .current')
	});
	typ.timing = setInterval(fillTime, 500);
}

function fillTime() {
	typ.stat.charCount.text(typ.charCount),
	typ.stat.usedTime.text((new Date() - typ.stime)/1000),
	typ.stat.rightCount.text(typ.rightCount),
	typ.stat.wrongCount.text(typ.wrongCount),
	typ.stat.backspaceCount.text(typ.backspaceCount),
	typ.stat.currentCount.text(typ.currentCount);
	typ.stat.speed.text(Math.round(typ.currentCount/(new Date() - typ.stime)*60000));
	if (typ.current.length && typ.current.offset().top - $(document).scrollTop() > $(window).height() * 0.8) {
		$(document).scrollTop(window.innerHeight * 0.7 + $(document).scrollTop());
	}
}

function finishTyping() {
	clearInterval(typ.timing);
	fillTime();
	$('#handler')[0].blur();
	alert('Congratulations: ' + Math.round(typ.currentCount / (new Date() - typ.stime) * 60000)  + 'kms');
}
