PKGDIR = pkg

default: build

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

.PHONY: build test lint
