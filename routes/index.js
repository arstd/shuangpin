
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'shuangpin' })
};

exports.shuangpin = function(req, res){
  res.render('shuangpin', {})
};
