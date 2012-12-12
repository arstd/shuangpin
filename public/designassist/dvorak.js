if (typeof(keyboard) == 'undefined') {
    keyboard = {};
}

keyboard.dvorak = (function() {
    var keys = '~$\t%&\t7[\t5{\t3}\t1(\t9=\t0*\t2)\t4+\t6]\t8!\t`#\tBackspace\n'
      + 'Tab\t:;\t<,\t>,\tP\tY\tF\tG\tC\tR\tL\t?/\t^@\t|\\\n'
      + 'Caps Lock\tA\tO\tE\tU\tI\tD\tH\tT\tN\tS\t_-\tEnter\n'
      + 'Shift L\t"\'\tQ\tJ\tK\tX\tB\tM\tW\tV\tZ\tShift R\n'
      + 'Ctrl L\tWin Key L\tAlt L\t\tAlt R\tWin Key R\tMenu\tCtrl R'
      .split('\n');

    var ctrlkeys = 'Backspace|Tab|Caps Lock|Enter|Shift L|Shift R|Ctrl L|Win Key L|Alt L||Alt R|Win Key R|Menu|Ctrl R';

    var dvorak = new Array();
    $.each(keys.split('\n'), function(ind, val) {
        var row = new Array();
        $.each(val.split('\t'), function(ind, val) {
            if ($.inArray(val, ctrlkeys.split('|')) >= 0) {
                row.push(val);
                return;
            }
            var key = new Array();
            $.each(val.split(''), function(ind, val) {
                key.push(val);
            });
            row[ind] = key;
        });
        dvorak.push(row);
    });
    return dvorak;
})();

