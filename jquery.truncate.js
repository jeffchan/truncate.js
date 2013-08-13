(function ($, undefined) {

  var BLOCK_TAGS = ['table', 'thead', 'tbody', 'tfoot', 'tr', 'col', 'colgroup', 'object', 'embed', 'param', 'ol', 'ul', 'dl', 'blockquote', 'select', 'optgroup', 'option', 'textarea', 'script', 'style'];

  function setText(element, text) {
    if (element.innerText) {
      element.innerText = text;
    } else if (element.nodeValue) {
      element.nodeValue = text;
    } else if (element.textContent) {
      element.textContent = text;
    } else {
      return false;
    }
  }

  function truncateTextContent($element, $rootNode, $after, options) {
    var element = $element[0];
    var original = $element.text();

    var maxChunk = '';
    var mid, chunk;
    var low = 0;
    var high = original.length;

    // Binary Search
    while (low <= high) {
      mid = low + ((high - low) >> 1); // Integer division

      chunk = $.trim(original.substr(0, mid + 1)) + options.ellipsis;
      setText(element, chunk);

      if ($rootNode.height() > options.maxHeight) {
        high = mid - 1;
      } else {
        low = mid + 1;
        maxChunk = maxChunk.length > chunk.length ? maxChunk : chunk;
      }
    }

    if (maxChunk.length > 0) {
      setText(element, maxChunk);
      return true;
    } else {

      // Backtrack
      var $parent = $element.parent();
      $element.remove();

      var afterLength = $after ? $after.length : 0;

      if ($parent.contents().length > afterLength) {

        var $n = $parent.contents().eq(-1 - afterLength);
        return truncateTextContent($n, $rootNode, $after, options);

      } else {

        var $prev = $parent.prev();
        var $e = $prev.contents().eq(-1);
        var e = $e[0];

        if (e) {
          setText(e, $e.text() + options.ellipsis);
          $parent.remove();

          if ($after.length) {
            $prev.append($after);
          }
          return true;
        }
      }
      return false;
    }
  }

  function truncateNestedNode($element, $rootNode, $after, options) {
    var element = $element[0];

    var $children = $element.contents();
    var $child, child;

    var index = 0;
    var length = $children.length;
    var truncated = false;

    $element.empty();

    for (; index < length && !truncated; index++) {

      $child = $children.eq(index);
      child = $child[0];

      if (child.nodeType === 8) { // comment node
        continue;
      }

      element.appendChild(child);

      if ($after.length) {
        if ($.inArray(element.tagName.toLowerCase(), BLOCK_TAGS) >= 0) {
          $element.after($after);
        } else {
          $element.append($after);
        }
      }

      if ($rootNode.height() > options.maxHeight) {
        if (child.nodeType === 3) { // text node
          truncated = truncateTextContent($child, $rootNode, $after, options);
        } else {
          truncated = truncateNestedNode($child, $rootNode, $after, options);
        }
      }

      if (!truncated && $after.length) { $after.remove(); }

    }

    return truncated;
  }

  function Truncate(element, options) {
    this.element = element;
    this.$element = $(element);

    this._name = 'truncate';
    this._defaults = {
      lines: 1,
      ellipsis: '… ',
      showMore: '<a href="#">More</a>',
      showLess: '<a href="#">Less</a>'
    };

    this.options = $.extend({}, this._defaults, options);
    this.options.maxHeight = parseInt(this.options.lines, 10) * parseInt(this.options.lineHeight, 10);

    this.$after = $(this.options.showMore, this.$element);

    this.original = element.innerHTML;
    this.cached = null;

    this.update();
  }

  Truncate.prototype = {

    update: function (html) {
      // Update HTML if provided, otherwise default to current inner HTML.
      if (html) {
        this.original = this.element.innerHTML = html;
      }

      var $wrap = this.$element.wrapInner('<div/>').children();
      $wrap.css({
        height : 'auto',
        width  : 'auto',
        border : 'none',
        padding: 0,
        margin : 0
      });

      // Check if already meets height requirement
      if ($wrap.height() > this.options.maxHeight) {
        truncateNestedNode($wrap, $wrap, this.$after, this.options);
        this.cachedHTML = this.element.innerHTML;
      }

      $wrap.replaceWith($wrap.contents());
    },

    expand: function () {
      this.element.innerHTML = this.originalHTML + this.options.showLess;
    },

    collapse: function () {
      this.element.innerHTML = this.cachedHTML;
    }

  };

  // Lightweight plugin wrapper preventing multiple instantiations
  $.fn.truncate = function (options) {
    return this.each(function () {
      if (!$.data(this, 'jquery-truncate')) {
        $.data(this, 'jquery-truncate', new Truncate(this, options));
      }
    });
  };

})(jQuery);
