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

  function truncateNearestSibling($element, $rootNode, $after, options) {
    var $parent = $element.parent();
    var $prevSibling;

    $element.remove();

    // Take into account length of $after element previous inserted.
    var afterLength = $after ? $after.length : 0;

    if ($parent.contents().length > afterLength) {
      // Valid previous sibling element (sharing same parent node) exists,
      // so attempt to truncate it.

      $prevSibling = $parent.contents().eq(-1 - afterLength);
      return truncateTextContent($prevSibling, $rootNode, $after, options);

    } else {

      // No previous sibling element (sharing same parent node) exists.
      // Therefore, search parent's sibling.

      var $parentSibling = $parent.prev();
      $prevSibling = $parentSibling.contents().eq(-1);

      if ($prevSibling.length) {
        // Because traversal is in-order so the algorithm already checked that
        // this point meets the height requirement. As such, it's safe to truncate here.

        setText($prevSibling[0], $prevSibling.text() + options.ellipsis);
        $parent.remove();

        if ($after.length) {
          $parentSibling.append($after);
        }
        return true;
      }
    }

    return false;
  }

  /* Truncates the text content of a node using binary search.
   *
   * textNode - The node to truncate.
   * rootNode - The root node (ancestor of the textNode) to measure the truncated height.
   * options  - An object containing:
   *            ellipsis  - The ellipsis string to append at the end of the truncation.
   *            maxHeight - The maximum height for the root node.
   *
   * Returns nothing.
   */
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
      return truncateNearestSibling($element, $rootNode, $after, options);
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

  /* Public: Creates an instance of Truncate.
   *
   * element - A DOM element to be truncated.
   * options - An Object literal containing setup options.
   *
   * Examples:
   *
   *   var element = document.createElement('span');
   *   element.innerHTML = 'This is<br>odd.';
   *   var truncated = new Truncate(element, {
   *     lines: 1,
   *     lineHeight: 16,
   *     showMore: '<a class="show-more">Show More</a>',
   *     showLess: '<a class="show-less">Show Less</a>'
   *   });
   *
   *   // Update HTML
   *   truncated.update('This is not very odd.');
   *
   *   // Undo truncation
   *   truncated.expand();
   *
   *   // Redo truncation
   *   truncated.collapse();
   */
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

    /* Public: Updates the inner HTML of the element and re-truncates.
     *
     * newHTML - The new HTML.
     *
     * Returns nothing.
     */
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

    /* Public: Expands the element to show content in full.
     *
     * Returns nothing.
     */
    expand: function () {
      this.element.innerHTML = this.originalHTML + this.options.showLess;
    },

    /* Public: Collapses the element to the truncated state.
     * Uses the cached HTML from .update().
     *
     * Returns nothing.
     */
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
