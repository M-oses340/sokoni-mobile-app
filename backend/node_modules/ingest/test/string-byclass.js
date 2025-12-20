var h = require('virtual-hyperscript');
var test = require('tape');
var fragment;

test('create fragment', function(t) {
  t.plan(1);
  fragment = require('..')('<html><body><div class="content">hello</div></body></html>');
  t.equal(typeof fragment, 'function');
});

test('replace content', function(t) {
  t.plan(2);
  fragment({ '.content': 'foo' }, function(err, output) {
    t.ifError(err);
    t.equal(output, '<html><body><div class="content">foo</div></body></html>');
  });
});

test('replace content (with h generated content)', function(t) {
  t.plan(2);
  fragment({ '.content': h('span', 'foo') }, function(err, output) {
    t.ifError(err);
    t.equal(output, '<html><body><div class="content"><span>foo</span></div></body></html>');
  });
});
