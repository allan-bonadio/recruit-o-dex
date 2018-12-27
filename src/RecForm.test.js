import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './reducer';
import {RecForm} from './RecForm';

configure({ adapter: new Adapter() });

let mockSelection = {
	editingRecord: {recruiter_name: 'samantha'},
};

describe('<RecForm', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Provider store={rxStore}><RecForm controlPanel={mockSelection} /></Provider>, div);
	});

	it('has the right fields and pieces', () => {
		// count up what I get for a deep render
		const w = mount(<RecForm controlPanel={{editingRecord: {}}} />);
		////console.log("w dot debug: ", w.debug());////
		
		expect(w.find('section.edit-col.edit-form').length).toEqual(1);
		expect(w.find('input').length).toEqual(9);
		expect(w.find('textarea').length).toEqual(2);
		expect(w.find('label.edit-label').length).toEqual(8);
		expect(w.find('datalist#engagement-whats option').length).toEqual(5);

		// specific ones
		expect(w.find('input[name="company_name"]').length).toEqual(1);
		expect(w.find('textarea[name="notes"]').length).toEqual(2);  // one for main notes, one for engagement
		expect(w.find('input[list="engagement-whats"]').length).toEqual(1);
	});
	
});

