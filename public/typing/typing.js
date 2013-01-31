var typ = {
	rightSounds: (function() {
		var sounds = [];
		for (var i = 0; i < 25; i++) {
			var audio = new Audio("/sound/type.wav");
			audio.volume = 0.5;
			sounds.push(audio);
		}
		return sounds;
	})(),	
	wrongSounds: (function() {
		var sounds = [];
		for (var i = 0; i < 25; i++) {
			var audio = new Audio("/sound/error.wav");
			audio.volume = 0.5;
			sounds.push(audio);
		}
		return sounds;
		return sounds;
	})(),
	play: function(sound) {
		var index = Math.floor(new Date().getMilliseconds()%250/10);
		switch(sound) {
		case 'wrong-sound':
			this.wrongSounds[index].play(); 
			break;
		case 'right-sound':
			this.rightSounds[index].play();
			break;
		default:
			break;
		}
	},
	stat: {
		charCount: $('#charCount'),
		currentCount: $('#currentCount'),
		rightCount: $('#rightCount'),
		wrongCount: $('#wrongCount'),
		backspaceCount: $('#backspaceCount'),			
		usedTime: $('#usedTime'),
		speed: $('#speed')
	}	
};

$(function(){
    $('#commit').on({
	'click': function(){
        $('#typing').html($('#text').val()
			.replace(/[^\x00-\xff]+/g, '')
			.replace(/\n$/,'')
			.replace(/  +/g,' ')
			.replace(/[^\n]/g, function(m){
			    return '<span>' + m + '</span>';
			}).replace(/\n\n\n+/g, '<br><br>')
			.replace(/\n\n?/g, '<br>')
			.replace(/span/, 'span class="current"'));
		$('#handler')[0].focus();
		typ.charCount = $('#typing span').length;
		typ.current = null;
		clearInterval(typ.timing);
	}
    });

    $('#random').on({
        'click': function(){
		var chars = "qwfpgarstdzxcvbjluy;hneiokm,./".split('');
		var text = '';
		
		for (var i = Math.floor(500 / 4); i > 0; i--) {
			text += chars[Math.floor(chars.length / 2 * Math.random())];
			text += chars[Math.floor(chars.length / 2 * Math.random()) + chars.length / 2];
			//text += chars[Math.floor(chars.length / 2 * Math.random())];
			//text += chars[Math.floor(chars.length / 2 * Math.random()) + chars.length / 2];
			text += ' ';
			text += chars[Math.floor(chars.length / 2 * Math.random()) + chars.length / 2];
			text += chars[Math.floor(chars.length / 2 * Math.random())];
			//text += chars[Math.floor(chars.length / 2 * Math.random()) + chars.length / 2];
			//text += chars[Math.floor(chars.length / 2 * Math.random())];
			text += ' ';
		}
        /*
		var cnt = 500, len;
		while (cnt > 0) {
			len = Math.ceil(4 * Math.random());
			while (len-- && cnt--) {
				text += chars[Math.floor(chars.length * Math.random())];
			}
			text += ' ';
		}
        */
		
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
	if (typ.current == null) {
		startTyping();
	}	
	typ.currentCount++;

	typ.current.removeClass('current right wrong');


	var char = String.fromCharCode(keyCode);
	if(!event.shiftKey) char = char.toLowerCase();
	

	var requreChar = (typ.current[0].tagName == 'BR' ? ' ' : typ.current.text());

	if (char == requreChar) {
		typ.current.addClass('right');
		typ.play('right-sound');
		typ.rightCount++;
	} else {
		typ.current.addClass('wrong');
		typ.play('wrong-sound');
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
