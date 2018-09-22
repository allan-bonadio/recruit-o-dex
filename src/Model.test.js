import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

////import React from 'react';
////import ReactDOM from 'react-dom';
////import {Provider} from 'react-redux';

import {rxStore} from './reducer';
import {Model, moGetAll, moPutOne, moPostOne, moDeleteOne, getBySerial} from './Model';

describe('Model ', () => {
	it('can moGetAll()', (done) => {
		const all = moGetAll((errors, recs) => {
			// lskdjf
			expect(errors).toBeFalsy();
			expect(recs.constructor).toBe(Array);
			done();
		});
	});
});
