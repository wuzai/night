MOCHA_OPTS=
REPORTER = spec

test: test-unit

test-unit:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha test \
        --reporter $(REPORTER) \
        $(MOCHA_OPTS)

.PHONY: test test-unit