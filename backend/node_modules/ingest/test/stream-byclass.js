var h = require('virtual-hyperscript');
var fs = require('fs');
var test = require('tape');
var fragment;

test('create fragment', function(t) {
  t.plan(1);
  fragment = require('..')(fs.createReadStream(__dirname + '/samples/minimal.html'));
  t.equal(typeof fragment, 'function');
});

test('replace content', function(t) {
  t.plan(2);
  fragment({ '.content': 'foo' }, function(err, output) {
    t.ifError(err);
    t.equal(output, '<html>\n<body>\n<div class="content">foo</div>\n</body>\n</html>\n');
  });
});

test('replace content (with h generated content)', function(t) {
  t.plan(2);
  fragment({ '.content': h('span', 'foo') }, function(err, output) {
    t.ifError(err);
    t.equal(output, '<html>\n<body>\n<div class="content"><span>foo</span></div>\n</body>\n</html>\n');
  });
});
