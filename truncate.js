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

  function indexNotInRange(rangesExcluded, index) {
    var i, length, range, lower, upper, skip;
    for (i = 0, length = rangesExcluded.length; i < length; i++) {
      range = rangesExcluded[i];
      lower = range[0];
      upper = range[1];
      skip = range[2];
      if (range.length >= 2 && lower <= index && index <= upper) {
        if (skip) {
          // Skip over a comment node
          return upper;
        } else {
          // Snap to nearest acceptable point
          return ((index - lower) < (upper - index)) ? lower - 1 : upper + 1;
        }
      }
    }
    return index;
  }

  function findElementNodeRanges(nodeList) {
    var index,
        length,
        startIndex,
        endIndex = -1,
        node,
        ranges = [];

    for (index = 0, length = nodeList.length; index < length; index++) {
      node = nodeList[index];
      startIndex = endIndex + 1;

      var nodeType = node.nodeType;
      if (nodeType === window.Node.TEXT_NODE) {
        endIndex = startIndex + node.nodeValue.length - 1;
      } else if (nodeType === window.Node.COMMENT_NODE) {
        // length + 7 for HTML comment opening/closing tags
        // e.g.) <!--MY_COMMENT--> 10+7=17
        endIndex = startIndex + node.nodeValue.length + 7 - 1;
        ranges.push([startIndex, endIndex, true]);
      } else if (nodeType === window.Node.ELEMENT_NODE) {
        endIndex = startIndex + node.outerHTML.length - 1;
        ranges.push([startIndex, endIndex, false]);
      }
    }

    return ranges;
  }

  function truncateElement(element, excludeRanges, options) {
    var originalHTML = element.innerHTML,
        mid,
        low = 0,
        high = originalHTML.length,
        maxChunk = '',
        chunk,
        chunkLength,
        prevChunkLength = 0;

    // Binary Search
    while (low <= high) {
      mid = low + ((high - low) >> 1); // Integer division
      chunkLength = indexNotInRange(excludeRanges, mid);

      var clipped = chunkLength !== mid;

      if (prevChunkLength === chunkLength) {
        break; // Prevent infinite loop
      }
      prevChunkLength = chunkLength;

      chunk = trim(originalHTML.substr(0, chunkLength + 1)) + options.showMore;
      element.innerHTML = chunk;

      if (height(element) > options.maxHeight) {
        high = chunkLength - 1;
      } else {
        low = chunkLength + 1;

        maxChunk = maxChunk.length > chunk.length ? maxChunk : chunk;
      }
    }

    return maxChunk;
  }

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

    if (height(this.element) <= this.maxHeight) {
      this.element.style.visibility = 'visible';
      return;
    }

    var el = this.element;
    var excludeRanges = findElementNodeRanges(el.childNodes);

    this.cached = truncateElement(el, excludeRanges, this.options);
    el.innerHTML = this.cached;

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
