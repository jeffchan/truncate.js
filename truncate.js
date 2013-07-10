(function (module, undefined) {

  function getStyle(element, property) {
    return window.getComputedStyle(element)[property];
  }

  function height(element) {
    return element.clientHeight - parseFloat(getStyle(element, 'paddingTop')) - parseFloat(getStyle(element, 'paddingBottom'));
  }

  function cloneNode(node) {
    return node.cloneNode(false);
  }

  function replaceNode(newNode, oldNode) {
    oldNode.parentNode.replaceChild(newNode, oldNode);
    return newNode;
  }

  function Truncate(element, options) {
    this.options = options || {};
    options.showMore = typeof options.showMore !== 'undefined' ? options.showMore : '…';
    options.showLess = typeof options.showLess !== 'undefined' ? options.showLess : '';

    this.element = element;
    this.elementCloned = element.cloneNode(false);

    var oldRange = document.createRange();
    oldRange.selectNodeContents(this.element);
    this.originalFragment = oldRange.cloneContents();

    this.cachedFragment = null;
    this.maxHeight = options.lines * options.lineHeight;

    this.update();
  }

  Truncate.prototype.update = function (newHTML) {
    if (newHTML) {
      this.element.innerHTML = newHTML;
    }

    // this.element.style.visibility = 'hidden';

    if (height(this.element) <= this.maxHeight) {
      this.element.style.visibility = 'visible';
      return;
    }

    var range = document.createRange();
    range.setStart(this.element, 0);

    this.recurse(range, this.element);

    this.cachedFragment = range.cloneContents();

    this.collapse();

    // console.log(this.originalFragment, this.cachedFragment);

    this.element.style.visibility = 'visible';
  };

  Truncate.prototype.recurse = function (range, element) {
    console.warn('parent', element.childNodes);
    var rect,
        childNodes = element.childNodes,
        length = childNodes.length;
    if (element.hasChildNodes()) {
      if (length === 1 && childNodes[0].nodeType === window.Node.TEXT_NODE) {
        return this.recurse(range, childNodes[0]);
      }
      // Iterate backwards on the childNodes until we find the tipping node
      // recurse on that node

      var index, node;
      var skip = 0;

      for (index = length - 1; index >= 0; index--) {
        node = childNodes[index];
        if (node.nodeType === window.Node.COMMENT_NODE) {
          skip++;
          continue;
        }

        range.setEnd(element, index);
        rect = range.getBoundingClientRect();
        console.log(index, range.toString(), rect.height, this.maxHeight);

        // this.sub(range);
        // if (height(this.element) > this.maxHeight) {
        if (rect.height - 2 <= this.maxHeight) {
          index = Math.min(length - 1, index + skip);
          console.log('recurse on', index, childNodes[index]);
          return this.recurse(range, childNodes[index]);
        }
      }

      return this.recurse(range, childNodes[0]);

    } else {
      console.log('binary search');
      // Text node here... Binary search to find the correct fit
      var mid,
          low = 0,
          high = element.nodeValue.length,
          max = 0;

      // Binary Search
      while (low <= high) {
        mid = low + ((high - low) >> 1); // Integer division
        range.setEnd(element, mid);
        rect = range.getBoundingClientRect();

        console.warn('----------------------------------------');
        console.log(low, high, mid);
        console.log(range);
        console.log(rect.height, this.maxHeight, range.toString());
        if (rect.height - 2 > this.maxHeight) {
        // this.sub(range);
        // console.log(height(this.element), this.maxHeight);
        // if (height(this.element) > this.maxHeight) {
          high = mid - 1;
        } else {
          low = mid + 1;
          max = max > mid ? max : mid;
        }
      }

      range.setEnd(element, max);
      return range;
    }
  };

  Truncate.prototype.sub = function (range) {
    // TODO: add "show more" text
    var newNode = cloneNode(this.element);
    newNode.appendChild(range.cloneContents());
    this.element = replaceNode(newNode, this.element);
  };

  Truncate.prototype.expand = function () {
    // TODO: add "show less" text
    var newNode = cloneNode(this.element);
    newNode.appendChild(this.originalFragment.cloneNode(true));
    this.element = replaceNode(newNode, this.element);
  };

  Truncate.prototype.collapse = function () {
    var newNode = cloneNode(this.element);
    newNode.appendChild(this.cachedFragment.cloneNode(true));
    this.element = replaceNode(newNode, this.element);
  };

  module.Truncate = Truncate;

})(this);
