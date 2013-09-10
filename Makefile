PKGDIR = pkg

define USAGE
Usage instructions:
    make lint                 runs jshint on the source code
    make test                 runs the test suite using phantomjs
    make build                creates a production (minified) build
    make help                 displays this message
endef
export USAGE

default: help

help:
	@echo "$$USAGE"

pkgdir:
	@rm -rf $(PKGDIR)
	@mkdir -p $(PKGDIR)

concat: pkgdir
	@cat truncate.js > $(PKGDIR)/jquery.truncate.js
	@echo Created $(PKGDIR)/jquery.truncate.js

minify: concat
	@`npm bin`/uglifyjs $(PKGDIR)/jquery.truncate.js -mo $(PKGDIR)/jquery.truncate.min.js
	@echo Created $(PKGDIR)/jquery.truncate.min.js

test:
	@`npm bin`/mocha-phantomjs test/truncate-test.html

lint:
	@`npm bin`/jshint -c jshint.json truncate.js

build: concat minify

.PHONY: help pkgdir concat minify test lint build
