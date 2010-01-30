var path = require('path');

require.paths.unshift(path.join(path.dirname(__filename), '..', 'lib'));

var events = require('events'),
    assert = require('assert');
var vows = require('vows');

var promiser = function (val) {
    return function () {
        var promise = new(events.Promise);
        process.nextTick(function () { promise.emitSuccess(val) });
        return promise;
    }
};

vows.tell("Vows", {
    "A context": {
        setup: promiser("hello world"),

        "testing equality": function (it) {
            assert.equal(it, "hello world");
        },
        "testing match": function (it) {
            assert.match(it, /[a-z]+ [a-z]+/);
        },
        "testing inclusion": function (it) {
            assert.include(it, "world");
        },
        "with a nested context": {
            setup: function (parent) {
                return promiser(parent)();
            },
            "testing equality": function (it) {
                assert.equal(it, "hello world");
            }
        }
    },
    "Nested contexts": {
        setup: promiser(1),

        "have": {
            setup: function (a) { return promiser(2)() },

            "access": {
                setup: function (b, a) { return promiser(3)() },

                "to": {
                    setup: function (c, b, a) { return promiser([4, c, b, a])() },

                    "the parent topics": function (topics) {
                        assert.equal(topics.join(), [4, 3, 2, 1].join());
                    }
                }
            }
        }
    },
    "Non-promise return value": {
        setup: function () { return 1 },
        "should be converted to a promise": function (val) {
            assert.equal(val, 1);
        }
    }
});
