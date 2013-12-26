module.exports = function (req, res) {
  return function () {
    if (!req.session.messages) return '';
    var buf = []
        , messages = req.session.messages
        , types = Object.keys(messages)
        , len = types.length;
    if (!len) return '';
    buf.push('<div id="messages">');
    for (var i = 0; i < len; ++i) {
      var type = types[i];
      var msgs = messages[type];
      if (msgs) {
        buf.push('  <div class="fade in alert alert-block alert-' + type + '">');
        buf.push('  <a class="close" data-dismiss="alert" href="javascript:void(0)">×</a>');
        if (type == 'error') {
          buf.push('  <p><strong>错误!</strong></p>');
          buf.push('    <ul>');
        }
        for (var j = 0, l = msgs.length; j < l; ++j) {
          var msg = msgs[j];
          if (type == 'error')
            buf.push('      <li>' + msg + '</li>');
          else
            buf.push(msg);
        }
        if (type == 'error') buf.push('    </ul>');
        buf.push('  </div>');
      }
    }
    buf.push('</div>');
    req.session.messages = {};
    return buf.join('\n');
  }
};
