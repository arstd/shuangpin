
var typ = {
	stat: {
		charCount: $('#charCount'),
		currentCount: $('#currentCount'),
		rightCount: $('#rightCount'),
		errorCount: $('#errorCount'),
		backspaceCount: $('#backspaceCount'),			
		usedTime: $('#usedTime'),
		speed: $('#speed')
	}	
};

$(function(){
    $('#commit').on({
	'click': function(){
	        $('#typing').html($('#text').val()
		.replace(/[^\x00-\xff]+\n?/g, '')
		.replace(/[^\n]/g, function(m){
	            return '<span>' + m + '</span>';
	        }).replace(/ *\n*$/,'').replace(/\n\n+/g, '<br><br>').replace(/\n/g, '<br>')
		.replace(/span/, 'span class="current"'));
		$('#handler')[0].focus();
		typ.charCount = $('#typing span, #typing br').length;
		typ.current = null;
		clearInterval(typ.timing);
	}
    });
    $('#typing').on({
	'click': function() {
		$('#handler')[0].focus();
	}
    });

    $('#handler').on({
	'keypress': function(event) {
	        event.preventDefault();
		switch (event.keyCode) {
		case 16 : return;
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
			case 16 : event.preventDefault();return;
			case 8: event.preventDefault();backspace(); return;
			default:  return;
		}
	}
    });
});

function backspace() {
	if (typ.currentCount) {
		typ.current.removeClass('current right error');
		typ.current = typ.current.prev().addClass('current');

		typ.backspaceCount++;
		typ.currentCount--;
	}
}

function typing(keyCode){
	if (typ.current == null) {
		startTyping();
	}	
	typ.currentCount++;

	typ.current.removeClass('current right error');


	var char = String.fromCharCode(keyCode);
	if(!event.shiftKey) char = char.toLowerCase();
	var requreChar = (typ.current[0].tagName == 'BR' ? ' ' : typ.current.text());

	if (char == requreChar) {
		typ.current.addClass('right');
		typ.rightCount++;
	} else {
		typ.current.addClass('error');
		typ.errorCount++;
	}
	
	typ.current = typ.current.next().addClass('current');
	if (!typ.current.length) {
		finishTyping();
	}
}

function startTyping() {
	typ = {
		charCount: typ.charCount,
		stat: typ.stat,
		stime: new Date(),
		rightCount: 0,
		errorCount: 0,
		backspaceCount: 0,
		currentCount: 0,
		current: $('#typing .current')
	}
	typ.timing = setInterval(fillTime, 500);
}
function fillTime() {
	typ.stat.charCount.text(typ.charCount),
	typ.stat.usedTime.text((new Date() - typ.stime)/1000),
	typ.stat.rightCount.text(typ.rightCount),
	typ.stat.errorCount.text(typ.errorCount),
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
	$('#handler').blur();
	alert('Congratulations: ' + Math.round(typ.currentCount / (new Date() - typ.stime) * 60000)  + 'kms');
}
