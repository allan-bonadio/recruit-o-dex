import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import _ from "lodash";

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './reducer';
import {LoadSave} from './LoadSave';


configure({ adapter: new Adapter() });

describe('LoadSave module ', () => {
	it('cleanupRecord() eliminates empty fields', () => {
		let rec = {aa: '', bb: null, cc: undefined, dd: 'David Dennison', ee:{one: 1}, ff: [11,22,33]};
		rec = LoadSave.cleanupRecord(rec);
		expect(rec).toEqual({dd: 'David Dennison', ee:{one: 1}, ff: [11,22,33]});
	});

	it('cleanupRecord() eliminates engagements or not depending', () => {
		let rec;
		rec = {dd: 'David Dennison', engagements: [], };
		rec = LoadSave.cleanupRecord(rec);
		expect(rec).toEqual({dd: 'David Dennison'});

		rec = {dd: 'David Dennison', engagements: [ {} ], };
		rec = LoadSave.cleanupRecord(rec);
		expect(rec).toEqual({dd: 'David Dennison'});

		rec = {dd: 'David Dennison', engagements: [{what: 't', when: 'n', notes: 's'}]};
		let saved = _.cloneDeep(rec);
		rec = LoadSave.cleanupRecord(rec);
		expect(rec).toEqual(saved);
	});
	
	
	
});
