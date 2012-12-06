var $ = function (i) { return document.querySelector(i); };
var $$ = function (i) { return document.querySelectorAll(i); };

var jsClick = function (obj) {
  try { obj.click(); } catch (e) {
    var event = document.createEvent('MouseEvents'); 
    event.initEvent('click', true, true); 
    obj.dispatchEvent(event); 
  }
};

var updateMyLayout = function () {
  $('#kb_layout').value = '';
  updateLayout();
};

var updateLayout = function () {
  var l = $$('#layout .t'), s = $('#kb_layout'), m = $('#my_layout'), k, v, i;
  if (s.value !== '') {
    m.value = s.value;
  } else {
    k = m.value.toUpperCase();
    m.value = k;
  }
  k = m.value;
  for (i = 0; i < k.length; i++)
    l[i].innerHTML = k[i];
  for (; i < l.length; i++) l[i].innerHTML = '';
};

var updateExtern = function () {
  var e = $('#ex_option'), ex = e.checked, o, l, i;
  document.body.className = ex ? 'ex' : '';
  if (!ex) {
    l = $('#kb_layout');
    o = $$('#kb_layout option:not(.exn)');
    for (i = 0; i < o.length; i++) if (o[i].value === l.value) break;
    if (i === o.length) { l.value = o[0].value; updateLayout(); }
  }

};

var updateShuangpin = function () {
  var a = $$('#my_shuangpin input'), l = $$('#my_shuangpin .in .bs .spk input'),
    s = $('#shuangpin').value, i, j;
  if (s !== '') {
    for (i = 0; i < a.length; i++)
      if (a[i].defaultValue) a[i].value = a[i].defaultValue;
      else a[i].value = '';
    for (i = j = 0; i < l.length && j < s.length; j += l[i++].maxLength) {
      l[i].value = s.substring(j).substring(0, l[i].maxLength);
    }
  }
  l = $$('#my_shuangpin .in .exn .spk input');
};

var updateMyShuangpin = function () {
  var l = $$('#my_shuangpin input'), i;
  for (i = 0; i < l.length; i++) (function (p) {
    var c = function (k) {
      $('#shuangpin').value = '';
      var s = p.value;
      if (p.maxLength > 2) p.value = s.toLowerCase();
      else p.value = s.toUpperCase();
    };
    var s = function () { p.select(); }
    p.addEventListener('keyup', c);
    p.addEventListener('change', c);
    p.addEventListener('focus', s);
  }(l[i]));
};

var keyDelayCS = function () {
  var c = $('#key_delay_c');
  c.addEventListener('scroll', function () {
    var l = c.scrollLeft, t = c.scrollTop;
    var tl = c.querySelectorAll('.tl');
    var th = c.querySelectorAll('.th');
    var i;
    for (i = 0; i < tl.length; i++) tl[i].style.left = l + 'px';
    for (i = 0; i < th.length; i++) th[i].style.top  = t + 'px';
  });
};

var resetAllButton = function () {
  $('#reset_all').addEventListener('click', function () {
    jsClick($('#reset_all_0'));
    updateLayout();
    updateShuangpin();
    updateExtern();
  });
};

var verifyOutputClear = function () {
  $('#verify_output').innerHTML = '';
}
var verifyOutput = function (tp, text) {
  var d = document.createElement('div');
  d.className = tp; d.innerHTML = text;
  $('#verify_output').appendChild(d);
}

var verifyLayout = function () {
  var l = $('#my_layout').value, k = {}, i, c, err = '', w = 1;
  var n = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '1A', '1B', '1C', '1D', 
      '21', '22', '23', '24', '25', '26', '27', '28', '29', '2A', '2B', '2C',
      '31', '32', '33', '34', '35', '36', '37', '38', '39', '3A', '3B'], p = {};
  var addErrMsg = function (msg) {
    if (err.indexOf(msg) !== -1) return;
    err += '\n' + msg;
    verifyOutput('error', msg);
  }
  verifyOutput('message', '正在检查键盘布局……');
  for (i = 0; i < l.length; i++) if (l[i] !== ' ')
    if (l[i] in p) addErrMsg('字母“' + l[i] + '”重复定义。');
    else p[l[i]] = {'p': n[i], 'a': [], 'b': []};
  for (i = 65; i <= 90; i++) {
    c = String.fromCharCode(i);
    if (!(c in p)) addErrMsg('字母“' + c + '”未定义。');
  }
  if (err !== '') return null;
  if (l[12] !== ' ' || l[24] !== ' ' || l[25] !== ' ') {
    verifyOutput('warning', '使用扩展按键将无法计算按键当量。');
    w = 0;
  }
  if (!(';' in p)) {
    verifyOutput('warning', '分号未定义，部分双拼布局可能无法使用。');
    w = 0;
  }
  verifyOutput('verified', '键盘布局检查通过。');
  return p;
}

var verifyShuangpin = function (o) {
  var l, i, j, y, k, m, e = false, w = false, a, c;
  verifyOutput('message', '正在检查双拼方案……');
  a = $('#my_layout').value;
  l = $$(['#my_shuangpin .in div.exn',
    '#my_shuangpin .in div.bs',
    '#my_shuangpin .exn .in div'].join(','));
  c = $('#count').value.split('\n');
  c = c.map(function (l) {
    var s = l.split(',');
    return {'b': s[0], 'a': s[1], 'c': Number(s[2]), 'ka': null, 'kb': null, 's': false};
  })
  for (i = 0; i < l.length; i++) {
    y = l[i].querySelector('.spy input');
    if (!y) y = l[i].querySelector('.spy').innerHTML; else y = y.value;
    k = l[i].querySelector('.spk input'); m = k.maxLength; k = k.value;
    if (y === '') continue;
    if (k.length !== m) {
      verifyOutput('error',[ (m === 1 ?
          ('AOEIUÜ'.indexOf(y.toUpperCase()[0]) !== -1 ? '韵' : '声') + '母' : '音节'),
        '“', y, '”期望标注', m, '个按键，实际标注为“', k, '”。'].join(''));
      e = true;
    }
    for (j = 0; j < k.length; j++) {
      if (a.indexOf(k[j]) === -1) { verifyOutput('error',[ (m === 1 ?
          ('AOEIUÜ'.indexOf(y.toUpperCase()[0]) !== -1 ? '韵' : '声') + '母' : '音节'),
        '“', y, '”使用了键盘上不存在的字符“', k[j], '”。'].join('')); e = true; }
      else if (k[j] < 'A' || k[j] > 'Z') { verifyOutput('warning',[ (m === 1 ?
          ('AOEIUÜ'.indexOf(y.toUpperCase()[0]) !== -1 ? '韵' : '声') + '母' : '音节'),
        '“', y, '”使用了非英文字母字符“', k[j], '”。'].join('')); w = true; }
    }
    if (y.length === 1 && 'a' <= y && y <= 'z' && m === 1 && k !== y.toUpperCase()) {
      verifyOutput('warning', [('AOEIU'.indexOf(y.toUpperCase()) !== -1 ? '韵' : '声'),
        '母“', y, '”未使用“', y.toUpperCase(), '”键，而是使用“', k, '”键。'].join(''));
      w = true;
    }
    if (!e && m === 1) {
      if ('AOEIUÜ'.indexOf(y.toUpperCase()[0]) !== -1) o[k].a[o[k].a.length] = y;
      else o[k].b[o[k].b.length] = y;
    }
    if (!e) {
      c = c.map(function (n) {
        if (m === 1) {
          if (n.s) return n;
          if (y === n.a) n.ka = k; else if (y === n.b) n.kb = k;
        } else {
          if (n.b + n.a !== y) return n;
          if (n.s) {
            verifyOutput('error', ['重复定义音节', y, '。'].join(''));
            e = true;
          }
          else { n.s = true; n.kb = k[0]; n.ka = k[1]; }
        }
        return n;
      });
    }
  }
  for (i in o) if (o[i].b.length > 1) {
    verifyOutput('warning', ['声母“', o[i].b.join('”“'), '”共用按键“', i, '”。'].join(''));
    w = true;
  }
  if (!e) {
    for (i = 0; i < c.length; i++) {
      if (c[i].ka === null || c[i].kb === null) {
        verifyOutput('error', ['无法为', c[i].b, c[i].a, '找到输入方式。'].join(''));
        e = true;
      }
      for (j = i + 1; j < c.length; j++) {
        if (c[i].ka === c[j].ka && c[i].kb === c[j].kb) {
          verifyOutput('warning', ['音节', c[i].b, c[i].a, '与', c[j].b, c[j].a, '的输入均为', c[i].kb, c[i].ka, '。'].join(''));
          w = true;
        }
      }
    }
  }
  if (!e) {
    verifyOutput('verified', '双拼方案检查通过。');
    return c;
  } else return null;
};

var showInfo = function () {
  var l = $('#layout_name'), s = $('#shuangpin_name');
  var k = $('#kb_layout'), p = $('#shuangpin');
  var ko = $$('#kb_layout option'), po = $$('#shuangpin option');
  var kn = $('#layout_name'), pn = $('#shuangpin_name');
  var f = function (a, an, ao) {
    var i;
    if (a.value === '') {
      an.value = '';
      an.disabled = false;
    } else {
      an.disabled = true;
      for (i = 0; i < ao.length; i++)
        if (ao[i].value === a.value)
          an.value = ao[i].innerHTML;
    }
  };
  f(k, kn, ko); f(p, pn, po);
  $('#infos').style.display = 'block';
};

var showLayout = function () {
  var k = $$('#layout div div'), i;
  for (i = 0; i < k.length; i++) {
    if (k[i].querySelector('.t').innerHTML === ' ' && k[i].className === 'ex')
      k[i].style.opacity = 0;
  }
}

var showShuangpin = function (l, s) {
  var v = $$('#my_shuangpin .in div .spk input[maxlength="1"]');
  var w = $$('#my_shuangpin .in div .spk input[maxlength="2"]');
  var e = false, i, d, a, j, b0 = null, p, u, er = null;
  for (i in l) if (l[i].a.length + l[i].b.length > 4) {
    verifyOutput('warning', 
      ['按键“', i, '”被映射了超过4个拼音，无法显示拼音方案图。'].join(''));
    e = true;
  }
  if (e) return;
  for (i in l) {
    d = document.getElementById('K' + l[i].p);
    a = [d.querySelector('.a1'), d.querySelector('.a2'),
      d.querySelector('.a3'), d.querySelector('.b')];
    for (j = 0; j < l[i].a.length; j++) a[j].innerHTML = l[i].a[j];
    for (j = 0; j < l[i].b.length; j++) a[3 - j].innerHTML = l[i].b[j];
  };
  for (i in s) if (s[i].s === true && s[i].b === '') { 
    if (b0 === null) b0 = s[i].kb;
    else if (b0 !== s[i].kb) b0 = false;
    if (s[i].a === 'er') er = s[i].ka;
  }
  if (b0 && l[b0].b.length !== 0) b0 = false;
  if (b0) {
    verifyOutput('message', ['检查到〇声母方案，', b0, '为〇声母。'].join(''));
    document.getElementById('K' + l[b0].p).querySelector('.b').innerHTML = '\'';
    if (l[er].a.length + l[er].b.length <= 3) {
      d = document.getElementById('K' + l[er].p);
      a = [d.querySelector('.a1'), d.querySelector('.a2'),
        d.querySelector('.a3'), d.querySelector('.b')];
      a[l[er].a.length].innerHTML = 'er';
      er = null;
    }
  }
  p = $('#sp_sp'); p.innerHTML = ''; u = false;
  for (i in s) if (s[i].s === true && (s[i].b !== '' || !b0 || (er && s[i].a === 'er'))) {
    p.innerHTML += '<div><span class="spy">[Y]</span><span class="spk">[K]</span></div>'
     .replace('[Y]', s[i].b + s[i].a).replace('[K]', s[i].kb + s[i].ka);
    u = true;
  }
  if (u) $('#special').style.display = 'block';
};

var calcLS = function (l, s) {
  var f = $('#calc_freq'), k, i, o = {}, t = 0, p, r, a, max, min, b, y;
  $('#calc').style.display = 'block';
  p = function (k, c) { if (!(k in o)) o[k] = c; else o[k] += c; t += c; }
  s.map(function (d) { p(d.ka, d.c); p(d.kb, d.c); });
  f.innerHTML = $('#layout').innerHTML;
  k = f.querySelectorAll('.line div span:not(.t)');
  max = 0; min = 100; y = {'1': 0, '2': 0, '3': 0};
  for (i = 0; i < k.length; i++)
   if (k[i].className !== 'b') k[i].parentNode.removeChild(k[i]);
   else {
     b = k[i].parentNode;
     r = b.querySelector('.t').innerHTML;
     k[i].className = 'c'; k[i].innerHTML = '';
     if (!(r in o) || typeof(o[r]) !== 'number') continue;
     y[b.id[1]] += a = o[r] / t * 100;
     if (a > max) max = a; if (a < min) min = a;
     k[i].innerHTML = a.toFixed(2) + '%';
     b.style.backgroundColor
       = 'rgb(255, ' + Math.round(255 - 255 * Math.min(a, 10) / 10) + ', 0)';;
  }
  ['1', '2', '3'].map(function (l) { $('#R' + l).value = y[l].toFixed(2) + '%'; });
};

var calcLR = function (l, s) {
  var y = {'LL': 0, 'LR': 0, 'RL': 0, 'RR': 0}, t = 0;
  var lr = function(p)
  { return (((p[1] > '0') && (p[1] < '6')) || (p === '36')) ? 'L' : 'R' };
  s.map(function (v) {
    var l1 = lr(l[v.ka].p);
    var l2 = lr(l[v.kb].p);
    y[l1 + l2] += v.c;
    t += v.c
  });
  ['LL', 'LR', 'RL', 'RR'].map(function (l) {
    $('#R' + l).value = (y[l] / t * 100).toFixed(2) + '%';
  });
  $('#RLH').value = ((y['LL'] + (y['LR'] + y['RL']) / 2) / t * 100).toFixed(2) + '%';
  $('#RRH').value = ((y['RR'] + (y['LR'] + y['RL']) / 2) / t * 100).toFixed(2) + '%';
  $('#RSH').value = ((y['RR'] + y['LL']) / t * 100).toFixed(2) + '%';
  $('#RDH').value = ((y['LR'] + y['RL']) / t * 100).toFixed(2) + '%';
}

var calcLD = function (l, s) {
  var h = document.querySelectorAll('#key_delay .th:not(.tl)');
  var i = document.querySelectorAll('#key_delay input');
  var j, k, x, a = {}, p = 0, c = 0, t = 0, b, d = 0, u = 0;
  for (j = 0; j < h.length; j++) {
    a[x = h[j].innerHTML] = {};
    for (k = 0; k < h.length; k++) a[x][h[k].innerHTML] = Number(i[p++].value);
  }
  try {
    s.map(function (v) {
      c += v.c * a[l[v.kb].p][l[v.ka].p];
      t += v.c;
      verifyOutput('debug', [v.kb, v.ka, c, a[l[v.kb].p][l[v.ka].p]]);
    });
    c = Number(c / t).toFixed(2); if (isNaN(c)) c = 'N/A';
    s.map(function (v1) {
      s.map(function (v2) {
        d += v1.c * v2.c * a[l[v1.ka].p][l[v2.kb].p];
        u += v1.c * v2.c;
      });
    });
    d = Number(d / u).toFixed(2); if (isNaN(d)) d = 'N/A';
  } catch (e) { c = d = 'N/A'; }
  $('#delay_count').value = c;
  $('#delay_cnt_c').value = d;
}

var checkInit = function () {
  verifyOutputClear();
  $('#setting').style.display = 'none';
  $('#output').style.display = 'block';
};

var checkButton = function () {
  $('#check_all').addEventListener('click', function () {
    checkInit();
    var l = verifyLayout(); if (!l) return;
    var s = verifyShuangpin(l); if (!s) return;
    verifyOutput('debug', JSON.stringify(l));
    verifyOutput('debug', JSON.stringify(s));
    showInfo();
    showLayout();
    showShuangpin(l, s);
    calcLS(l, s);
    calcLR(l, s);
    calcLD(l, s);
  });
};

var retEditButton = function () {
  $('#ret_edit').addEventListener('click', function () {
    verifyOutputClear();
    $('#R1').value = $('#R2').value = $('#R3').value = ''
    $('#RLL').value = $('#RLR').value = $('#RRL').value = $('#RRR').value = ''
    $('#RLH').value = $('#RRH').value = $('#RSH').value = $('#RDH').value = ''
    var l = $$('#layout span'), i;
    for (i = 0; i < l.length; i++) l[i].innerHTML = '';
    $('#setting').style.display = 'block';
    $('#special').style.display = 'none';
    $('#calc').style.display = 'none';
    $('#infos').style.display = 'none';
    $('#output').style.display = 'none';
    l = $$('#layout div div');
    for (i = 0; i < l.length; i++) l[i].style.opacity = 1;
    updateLayout(); updateShuangpin();
  });
};

window.addEventListener('load', function () {
  $('#kb_layout').addEventListener('change', updateLayout);
  $('#ex_option').addEventListener('change', updateExtern);
  $('#my_layout').addEventListener('keyup', updateMyLayout);
  $('#my_layout').addEventListener('change', updateMyLayout);
  $('#shuangpin').addEventListener('change', updateShuangpin);
  updateMyShuangpin();
  updateLayout(); updateExtern(); updateShuangpin();
  keyDelayCS(); resetAllButton(); checkButton(); retEditButton();
});
