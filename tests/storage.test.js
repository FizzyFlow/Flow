const expect = require('unexpected');
const rfr = require('rfr');
const Storage = rfr('lib/utils/Storage.js');

beforeEach(async function() {
});

describe('Storage class', function() {

	it('is ready to be initialized', async function() {
		expect(Storage, 'to be a', 'function');
		var storage = new Storage();
		expect(storage, 'to be a', 'object');

		expect(storage.length, 'to be', 0);
		expect(storage.contains('key'), 'to be', false);

		storage.put('value');

		expect(storage.length, 'to be', 1);
		expect(storage.contains('value'), 'to be', true);
		expect(storage.get('value'), 'to be', 'value');

		storage.put('value');

		expect(storage.length, 'to be', 1);
		expect(storage.contains('value'), 'to be', true);

		storage.remove('value');
		
		expect(storage.length, 'to be', 0);
		expect(storage.contains('value'), 'to be', false);

		storage.delete('value'); /// alias for remove

		expect(storage.length, 'to be', 0);
		expect(storage.contains('value'), 'to be', false);

		var date = new Date();

		storage.put(date);            //// feel free to use anything as key
		expect(storage.length, 'to be', 1);
		expect(storage.contains(date), 'to be', true);

		storage.clear();
		expect(storage.length, 'to be', 0);
	});

});