# Truncate.js

Fast, intelligent Javascript text truncation

## Usage

Truncate.js currently depends on jQuery. There are two ways to use Truncate.js:

### As a jQuery plugin
```js
// Initialize and truncate.
$('#truncate_me').truncate({
  lines: 2
});

// Update the HTML and truncate.
$('#truncate_me').truncate('update', 'new html to truncate');

// Undo the truncation.
$('#truncate_me').truncate('expand');

// Redo the truncation (uses cached HTML).
$('#truncate_me').truncate('collapse');

// Update options.
$('#truncate_me').truncate('config', { lines : 3 });
```

### As a vanilla Javascript object
```js
// Initialize and truncate.
var truncated = new Truncate(document.getElementById('#truncate_me'), {
  lines: 2
});

// Update the HTML and truncate.
truncated.update('new html to truncate');

// Undo the truncation.
truncated.expand();

// Redo the truncation (uses cached HTML).
truncated.collapse();

// Update options.
truncated.config({ lines : 3 });

// Check if content is truncated. (not supported as a jQuery plugin)
var isTruncated = truncated.isTruncated;

// Check if content is collapsed. (not supported as a jQuery plugin)
var isCollapsed = truncated.isCollapsed
```

## Options

- `lineHeight`: The text line height (in px). _default: "auto"_
- `lines`: The number of line maximum. _default: 1_
- `ellipsis`: Text content to add at the truncation point. _default: …_
- `showMore`: HTML to insert at the truncation point. Useful for a "Show More" button. _default: ""_
- `showLess`: HTML to insert when .expand() is called. Useful for a "Show Less" button. _default: ""_
- `position`: Position of the truncation. Possible values: `start`, `middle`, `end`. _default: "end"_
- `maxHeight`: Truncate the content to fit in the specified height (in px).

----

## Caveats

Truncate.js does it's best to intelligently truncate through HTML. However,
there are a few cases where it fails, mostly because the text height cannot
be easily calculated.

- truncating a node with floating element
- truncating a node with descendant elements that have padding
- truncating a node with text of varying line heights

The truncate position is also very difficult when set to `middle` and with nested elements.

See `demo/demo.html` for examples of what works and what doesn't.

---

## Build

You need gulp to build the library:

    $ npm install
    $ npm run build

The output is in the **dist** folder

## Development

It's very simple, hack on the code, ensure the lint and tests pass and submit
a pull request. Rinse and repeat.

To install the developer packages you'll need node and npm installed on your
machine. Then run:

    $ npm install
    $ npm run build

Or you can use Gulp directly:

    $ npm install --global gulp-cli
    $ npm install
    $ gulp build

To run the linter:

    $ npm run lint

## Testing

To run the test suite:

    $ npm run test


## Libraries

- [Mocha](http://visionmedia.github.com/mocha/) - Test runner, we use the `bdd` style.
- [Chai](http://chaijs.com/api/assert/) - Assertion library, we use `assert` style.
- [Gulp](http://gulpjs.com/) - Builder

## License

Available under the MIT license. See [LICENSE](LICENSE) file for details.

