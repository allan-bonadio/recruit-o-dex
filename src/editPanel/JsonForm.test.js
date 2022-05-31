import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from '../reducer';
import {JsonForm} from './JsonForm';


configure({ adapter: new Adapter() });

let mockEditPanel = {
	jsonText: "token words",
	editingRecord: {recruiter_name: 'samantha'},
};

describe('<JsonForm', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Provider store={rxStore}>
			<JsonForm editPanel={mockSelection} editPanel={mockEditPanel} />
		</Provider>, div);
	});

	it('should have a textarea', () => {
		const wrapper = shallow(<JsonForm editPanel={mockSelection} editPanel={mockEditPanel} />);
		expect(wrapper.find('textarea').length).toEqual(1);
	});

	it('should show jsonText if there', () => {
		const wrapper = shallow(<JsonForm editPanel={{}} editPanel={mockEditPanel} />);

		// must verify value.  Only way I know how is with the .debug() dumper
		let ta = wrapper.find('textarea').debug();
		expect(ta).toMatch(/ value="token words"/);
	});

	it('should show editingRecord if no jsonText', () => {
		const wrapper = shallow(<JsonForm editPanel={mockEditPanel}} />);
		let ta = wrapper.find('textarea').debug();
		expect(ta).toMatch(/ value="\{\\n\\t"recruiter_name": "samantha"\\n\}"/);
	});
});
