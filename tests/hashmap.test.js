const expect = require('unexpected');
const rfr = require('rfr');
const HashMap = rfr('lib/utils/HashMap.js');

beforeEach(async function() {
});

describe('HashMap class', function() {

	it('is ready to be initialized', async function() {
		expect(HashMap, 'to be a', 'function');
		var hashMap = new HashMap();
		expect(hashMap, 'to be a', 'object');

		expect(hashMap.length, 'to be', 0);
		expect(hashMap.contains('key'), 'to be', false);

		hashMap.put('key', 'value');

		expect(hashMap.length, 'to be', 1);
		expect(hashMap.contains('key'), 'to be', true);
		expect(hashMap.get('key'), 'to be', 'value');

		hashMap.put('key', 'value');

		expect(hashMap.length, 'to be', 1);
		expect(hashMap.contains('key'), 'to be', true);

		hashMap.remove('key');
		
		expect(hashMap.length, 'to be', 0);
		expect(hashMap.contains('key'), 'to be', false);

		hashMap.delete('key'); /// alias for remove

		expect(hashMap.length, 'to be', 0);
		expect(hashMap.contains('key'), 'to be', false);

		var date = new Date();

		hashMap.put(date, 'valuuue');            //// feel free to use anything as key
		expect(hashMap.length, 'to be', 1);
		expect(hashMap.contains(date), 'to be', true);
		expect(hashMap.get(date), 'to be', 'valuuue');

		hashMap.put([1,2,3], 'valuuue');
		expect(hashMap.length, 'to be', 2);
		expect(hashMap.contains([1,2,3]), 'to be', true);
		expect(hashMap.get([1,2,3]), 'to be', 'valuuue');

		var obj = {something: 'awesome'};

		hashMap.put(obj, 'valuuue');
		expect(hashMap.length, 'to be', 3);
		expect(hashMap.contains(obj), 'to be', true);
		expect(hashMap.get(obj), 'to be', 'valuuue');

		hashMap.put(obj, 'valuuue');  //// same object instance
		expect(hashMap.length, 'to be', 3);
		expect(hashMap.contains(obj), 'to be', true);
		expect(hashMap.get(obj), 'to be', 'valuuue');

		hashMap.clear();
		expect(hashMap.length, 'to be', 0);
	});

});