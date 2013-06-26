var should = require('should');
var supervizer = require('../lib/main');

describe('supervizer', function() {
    describe('with no arguments', function() {
        it('returns an empty array', function() {
            var result = supervizer();
            result.should.eql([]);
        });
    });
});
