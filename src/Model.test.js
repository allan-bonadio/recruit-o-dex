import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

////import React from 'react';
////import ReactDOM from 'react-dom';
////import {Provider} from 'react-redux';

import {rxStore} from './reducer';
import {Model, getAll, putOne, postOne, getBySerial} from './Model';

describe('Model ', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
////		ReactDOM.render(<Provider store={rxStore}><Model /></Provider>, div);
	});

	it('can getAll()', (done) => {
		const all = getAll((errors, recs) => {
			// lskdjf
			expect(errors).toBeFalsy();
			expect(recs.constructor).toBe(Array);
			done();
		});
	});
});
