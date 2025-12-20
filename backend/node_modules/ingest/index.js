var DomUtils = require('domutils');
var htmlparser = require('htmlparser2');
var select = require('css-select');
var extend = require('cog/extend');

/**
  # ingest

  Using CSS3 selectors, replace the existing content of a HTML document with
  alternative string content or
  [virtual-hyperscript](https://github.com/Raynos/virtual-hyperscript) subtrees.

  ## Example Usage

  To be completed, in the meantime checkout the tests.

**/

module.exports = function(input, opts) {
  var dom;
  var backlog = [];
  var handler = new htmlparser.DomHandler(function(err, parsed) {
    dom = err || parsed;

    // run the backlog if we have one
    if (backlog.length > 0) {
      backlog.splice(0).forEach(function(args) {
        replace.apply(null, args);
      });
    }
  });
  var parser = new htmlparser.Parser(handler, { decodeEntities: true });

  function clone(node) {
    var copy = extend({}, node);

    if (copy.children) {
      copy.children = [].concat(copy.children).map(clone);
    }

    if (copy.attribs) {
      copy.attribs = extend({}, copy.attribs);
    }

    return copy;
  }

  function fromVnode(node) {
    if (node.tagName) {
      return {
        type: 'tag',
        name: node.tagName,
        children: (node.children || []).map(fromVnode),
        attribs: node.properties
      };
    }
    else if (node.text) {
      return {
        type: 'text',
        data: node.text
      };
    }
  }

  function replace(data, callback) {
    var dominst;

    if (! dom) {
      return backlog.push([data, callback]);
    }
    else if (dom instanceof Error) {
      return callback(elems);
    }

    // create a mutable copy of the dom
    dominst = dom.map(clone);

    // iterate through the selectors in the data and make the replacements
    Object.keys(data).forEach(function(selector) {
      var replace = data[selector];

      select(selector, dominst).forEach(function(match) {
        if (typeof replace == 'string' || (replace instanceof String)) {
          match.children = [ { type: 'text', data: replace } ];
        }
        else {
          match.children = [].concat(replace).map(fromVnode);
        }
      });
    });

    callback(null, dominst.map(DomUtils.getOuterHTML).join(''));
  }

  if (typeof input == 'string' || (input instanceof String)) {
    parser.write(input);
    parser.done();
  }
  else if (input && typeof input.pipe == 'function') {
    input.pipe(parser);
  }

  return replace;
};
