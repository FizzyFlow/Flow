const expect = require('unexpected');
const rfr = require('rfr');

const TimestampVector = rfr('lib/network/vectors/types/TimestampVector.js');
const BinaryVector = rfr('lib/network/vectors/BinaryVector.js');

beforeEach(async function() {
});

describe('TimestampVector', function() {

    it('is ready to be initialized', async function() {
        let vector = BinaryVector.factory('TimestampVector');

        expect(vector, 'to be a', 'object');

        let currentTimestamp = Date.now();

        expect(vector.toValue(), 'to be within', currentTimestamp - 100, currentTimestamp);

        let asBinary = vector.toBinary();

        expect(asBinary, 'to be a', 'Buffer');

        let restoredFromBinary = BinaryVector.fromBinary(asBinary); 
        expect(restoredFromBinary, 'to be a', 'object');
        expect(restoredFromBinary, 'to be a', 'object');
        expect(restoredFromBinary instanceof TimestampVector, 'to be true');

        expect(restoredFromBinary.toValue(), 'to be within', currentTimestamp - 100, currentTimestamp);
        expect(restoredFromBinary.toValue(), 'to equal', vector.toValue());
    });

});