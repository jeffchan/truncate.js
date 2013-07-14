(function (module, undefined) {

  function getStyle(element, property) {
    return window.getComputedStyle(element)[property];
  }

  function height(element) {
    return element.clientHeight - parseFloat(getStyle(element, 'paddingTop')) - parseFloat(getStyle(element, 'paddingBottom'));
  }

  function trim(str) {
    return (str || '').replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, ''); // from jQuery
  }

  function getHTMLInRange(node, startIndex, endIndex) {
    var index, childNode;
    var childNodes = node.childNodes,
        length = childNodes.length,
        html = '';

    for (index = startIndex; index <= endIndex && index < length; index++) {
      childNode = childNodes[index];
      if (childNode.nodeType === childNode.COMMENT_NODE) {
        html += '<!--' + childNode.nodeValue + '-->';
      } else {
        html += childNode.outerHTML || childNode.nodeValue;
      }
    }
    return html;
  }

  // Truncate text node using binary search
  function truncateTextNode(textNode, rootNode, options) {
    var originalHTML = textNode.nodeValue,
        mid,
        low = 0,
        high = originalHTML.length,
        chunk,
        maxChunk = '';

    // Binary Search
    while (low <= high) {
      mid = low + ((high - low) >> 1); // Integer division

      chunk = trim(originalHTML.substr(0, mid + 1)) + options.showMore;
      textNode.nodeValue = chunk;

      if (height(rootNode) > options.maxHeight) {
        high = mid - 1;
      } else {
        low = mid + 1;
        maxChunk = maxChunk.length > chunk.length ? maxChunk : chunk;
      }
    }

    textNode.nodeValue = maxChunk;
  }

  function truncateNestedNode(element, rootNode, options) {

    var childNodes = element.childNodes,
        length = childNodes.length;

    if (length === 0) {

      // Base case: single element remaining

      if (element.nodeType === element.TEXT_NODE) {
        // Truncate the text node
        truncateTextNode(element, rootNode, options);
      } else {
        // Remove the node itself
        element.parentNode.removeChild(element);
      }

      return;

    } else {

      // Recursive case: iterate backwards on children nodes until tipping node is found

      var index, node, chunk;
      var originalHTML = element.innerHTML;

      for (index = length - 1; index >= 0; index--) {
        node = childNodes[index];

        chunk = getHTMLInRange(element, 0, index);
        element.innerHTML = chunk;

        if (height(rootNode) <= options.maxHeight) {

          // Check if element is not the last child
          if (index + 1 <= length - 1) {
            // Reset HTML so original childNodes tree is available
            element.innerHTML = originalHTML;

            chunk += getHTMLInRange(element, index + 1, index + 1);
            element.innerHTML = chunk;

            index += 1;
          }

          return truncateNestedNode(childNodes[index], rootNode, options);
        }
      }

      return truncateNestedNode(childNodes[0], rootNode, options);

    }
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
   *     showLess: '<a class="show-more">Show Less</a>'
   *   });
   *
   *   // Undo truncation
   *   truncated.expand();
   *
   *   // Redo truncation
   *   truncated.collapse();
   */
  function Truncate(element, options) {
    this.options = options || {};
    options.showMore = typeof options.showMore !== 'undefined' ? options.showMore : '…';
    options.showLess = typeof options.showLess !== 'undefined' ? options.showLess : '';

    this.options.maxHeight = options.lines * options.lineHeight;

    this.element = element;
    this.originalHTML = element.innerHTML;
    this.cached = '';

    this.update();
  }

  Truncate.prototype.update = function (newHTML) {
    if (newHTML) {
      this.element.innerHTML = newHTML;
    }

    this.element.style.visibility = 'hidden';
    this.originalHTML = this.element.innerHTML;

    if (height(this.element) <= this.options.maxHeight) {
      this.element.style.visibility = 'visible';
      return;
    }

    truncateNestedNode(this.element, this.element, this.options);
    this.cached = this.element.innerHTML;

    this.element.style.visibility = 'visible';
  };

  Truncate.prototype.expand = function () {
    this.element.innerHTML = this.originalHTML + this.options.showLess;
  };

  Truncate.prototype.collapse = function () {
    this.element.innerHTML = this.cached;
  };

  module.Truncate = Truncate;

})(this);
