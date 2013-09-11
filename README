Truncate.js
====

Fast, intelligent Javascript text truncation

Usage
-----------
Truncate.js currently depends on jQuery. There are two ways to use Truncate.js:

1) as a jQuery plugin

    # Initialize and truncate.
    $('#truncate_me').truncate({
      lines: 2,
      lineHeight: 20
    });

    # Update the HTML and truncate.
    $('#truncate_me').truncate('update', 'new html to truncate');

    # Undo the truncation.
    $('#truncate_me').truncate('expand');

    # Redo the truncation (uses cached HTML).
    $('#truncate_me').truncate('collapse');

2) as a vanilla Javascript object

    # Initialize and truncate.
    var truncated = new Truncate(document.getElementById('#truncate_me'), {
      lines: 2,
      lineHeight: 20
    });

    # Update the HTML and truncate.
    truncated.update('new html to truncate');

    # Undo the truncation.
    truncated.expand();

    # Redo the truncation (uses cached HTML).
    truncated.collapse();

    # Check if content is truncated. (not supported as a jQuery plugin)
    var isTruncated = truncated.isTruncated;

    # Check if content is collapsed. (not supported as a jQuery plugin)
    var isCollapsed = truncated.isCollapsed

Options
-----------

  lineHeight  - Required. The text line height.
  lines       - Defaults to 1
  ellipsis    - Text content to add at the truncation point. Defaults to …
  showMore    - HTML to insert at the truncation point. Useful for a "Show More" button.
                Defaults to empty string.
  showLess    - HTML to insert when .expand() is called. Useful for a "Show Less" button.
                Defaults to empty string.

Caveats
-----------
Truncate.js does it's best to intelligently truncate through HTML. However,
there are a few cases where it fails, mostly because the text height cannot
be easily calculated.

- truncating a node with floating element
- truncating a node with descendant elements that have padding
- truncating a node with text of varying line heights

See `demo/demo.html` for examples of what works and what doesn't.

Development
-----------

It's very simple, hack on the code, ensure the lint and tests pass and submit
a pull request. Rinse and repeat.

There is a Makefile containing useful development tools. The available commands
can be listed by running:

    $ make

To install the developer packages you'll need node and npm installed on your
machine. Then run:

    $ npm install

To run the linter:

    $ make lint

Testing
-------

To run the test suite:

    $ make test


### Libraries

- [Mocha](http://visionmedia.github.com/mocha/) - Test runner, we use the `bdd` style.
- [Chai](http://chaijs.com/api/assert/) - Assertion library, we use `assert` style.


License
-------

Available under the MIT license. See LICENSE file for details.

