/*  Truncate.js - v0.1.0
 *  Copyright 2013, Jeff Chan
 *  Released under the MIT license
 *  More Information: http://github.com/jeffchan/truncate.js
 */
(function (module, $, undefined) {

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

  /* Truncate the nearest sibling node.
   * If no valid immediate sibling is found, traverse one level up to a cousin node.
   *
   * $element  - The jQuery node to truncate.
   * $rootNode - The jQuery root node to measure the truncated height.
   * $clipNode - The jQuery node to insert right after the truncation point.
   * options   - An object containing:
   *             ellipsis  - The ellipsis string to append at the end of the truncation.
   *             maxHeight - The maximum height for the root node.
   *
   * Returns true if truncation happened, false otherwise.
   */
  function truncateNearestSibling($element, $rootNode, $clipNode, options) {
    var $parent = $element.parent();
    var $prevSibling;

    $element.remove();

    // Take into account length of $clipNode element previous inserted.
    var clipLength = $clipNode ? $clipNode.length : 0;

    if ($parent.contents().length > clipLength) {

      // Valid previous sibling element (sharing same parent node) exists,
      // so attempt to truncate it.
      $prevSibling = $parent.contents().eq(-1 - clipLength);
      return truncateTextContent($prevSibling, $rootNode, $clipNode, options);

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

        if ($clipNode.length) {
          $parentSibling.append($clipNode);
        }
        return true;
      }
    }

    return false;
  }

  /* Truncates the text content of a node using binary search.
   * If no valid truncation point is found, attempt to truncate its nearest sibling.
   *
   * $textNode - The jQuery node to truncate.
   * $rootNode - The jQuery root node to measure the truncated height.
   * $clipNode - The jQuery node to insert right after the truncation point.
   * options   - An object containing:
   *             ellipsis  - The ellipsis string to append at the end of the truncation.
   *             maxHeight - The maximum height for the root node.
   *
   * Returns true if truncation happened, false otherwise.
   */
  function truncateTextContent($element, $rootNode, $clipNode, options) {
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
      return truncateNearestSibling($element, $rootNode, $clipNode, options);
    }
  }

  /* Recursively truncates a nested node. Traverses the children node tree in-rder.
   *
   * $element  - The jQuery nested node to truncate.
   * $rootNode - The jQuery root node to measure the truncated height.
   * $clipNode - The jQuery node to insert right after the truncation point.
   * options   - An object containing:
   *             ellipsis  - The ellipsis string to append at the end of the truncation.
   *             maxHeight - The maximum height for the root node.
   *
   * Returns true if truncation happened, false otherwise.
   */
  function truncateNestedNode($element, $rootNode, $clipNode, options) {
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

      if ($clipNode.length) {
        if ($.inArray(element.tagName.toLowerCase(), BLOCK_TAGS) >= 0) {
          // Certain elements like <li> should not be appended to.
          $element.after($clipNode);
        } else {
          $element.append($clipNode);
        }
      }

      if ($rootNode.height() > options.maxHeight) {
        if (child.nodeType === 3) { // text node
          truncated = truncateTextContent($child, $rootNode, $clipNode, options);
        } else {
          truncated = truncateNestedNode($child, $rootNode, $clipNode, options);
        }
      }

      if (!truncated && $clipNode.length) { $clipNode.remove(); }

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
   *     ellipsis: '… ',
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
      ellipsis: '…',
      showMore: '',
      showLess: ''
    };

    this.options = $.extend({}, this._defaults, options);

    if (this.options.maxHeight === undefined) {
      this.options.maxHeight = parseInt(this.options.lines, 10) * parseInt(this.options.lineHeight, 10);
    }

    this.$clipNode = $($.parseHTML(this.options.showMore), this.$element);

    this.original = this.cached = element.innerHTML;

    this.isTruncated = false; // True if the original content overflows the container.
    this.isCollapsed = true;  // True if the container is currently collapsed.

    this.update();
  }

  Truncate.prototype = {

    /* Public: Updates the inner HTML of the element and re-truncates. Will not
     * perform an updade if the container is currently expanded, instead it
     * will wait until the next time .collapse() is called.
     *
     * html - The new HTML.
     *
     * Returns nothing.
     */
    update: function (html) {
      var wasExpanded = !this.isCollapsed;

      // Update HTML if provided, otherwise use the current html and restore
      // the truncated content to the original if it's currently present.
      if (html) {
        this.original = this.element.innerHTML = html;
      } else if (this.isCollapsed && this.element.innerHTML === this.cached) {
        this.element.innerHTML = this.original;
      }

      // Wrap the contents in order to ignore container's margin/padding.
      var $wrap = this.$element.wrapInner('<div/>').children();
      $wrap.css({
        border : 'none',
        margin : 0,
        padding: 0,
        width  : 'auto',
        height : 'auto'
      });

      this.isTruncated = false;
      // Check if already meets height requirement
      if ($wrap.height() > this.options.maxHeight) {
        this.isTruncated = truncateNestedNode($wrap, $wrap, this.$clipNode, this.options);
      } else {
        this.isCollapsed = false;
      }

      // Restore the wrapped contents
      $wrap.replaceWith($wrap.contents());

      // Cache the truncated content
      this.cached = this.element.innerHTML;

      // If the container was expanded when .update() was called then restore
      // it to it's previous state.
      if (wasExpanded) {
        this.element.innerHTML = this.original;
      }
    },

    /* Public: Expands the element to show content in full.
     *
     * Returns nothing.
     */
    expand: function () {
      if (!this.isCollapsed) { return; }

      this.isCollapsed = false;
      this.element.innerHTML = this.isTruncated ? this.original + this.options.showLess : this.original;
    },

    /* Public: Collapses the element to the truncated state.
     * Uses the cached HTML from .update() by default.
     *
     * retruncate - True to retruncate original HTML, otherwise use cached HTML.
     *
     * Returns nothing.
     */
    collapse: function (retruncate) {
      if (this.isCollapsed) { return; }

      this.isCollapsed = true;

      retruncate = retruncate || false;
      if (retruncate) {
        this.update();
      } else {
        this.element.innerHTML = this.cached;
      }
    }
  };

  // Lightweight plugin wrapper preventing multiple instantiations
  $.fn.truncate = function (options) {
    var args = $.makeArray(arguments).slice(1);
    return this.each(function () {
      var truncate = $.data(this, 'jquery-truncate');
      if (!truncate) {
        $.data(this, 'jquery-truncate', new Truncate(this, options));
      } else if (typeof truncate[options] === 'function') {
        truncate[options].apply(truncate, args);
      }
    });
  };

  module.Truncate = Truncate;

})(this, jQuery);
