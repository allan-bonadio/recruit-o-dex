import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './reducer';
import {JsonForm} from './JsonForm';


configure({ adapter: new Adapter() });

let mockSelection = {
	editingRecord: {recruiter_name: 'samantha'},
};

let mockControlPanel = {
	jsonText: "token words",
};

describe('<JsonForm', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Provider store={rxStore}>
			<JsonForm selection={mockSelection} controlPanel={mockControlPanel} />
		</Provider>, div);
	});

	it('should have a textarea', () => {
		const wrapper = shallow(<JsonForm selection={mockSelection} controlPanel={mockControlPanel} />);
		expect(wrapper.find('textarea').length).toEqual(1);
	});

	it('should show jsonText if there', () => {
		const wrapper = shallow(<JsonForm selection={{}} controlPanel={mockControlPanel} />);
		
		// must verify value.  Only way I know how is with the .debug() dumper
		let ta = wrapper.find('textarea').debug();
		expect(ta).toMatch(/ value="token words"/);
	});

	it('should show editingRecord if no jsonText', () => {
		const wrapper = shallow(<JsonForm selection={mockSelection} controlPanel={{}} />);
		let ta = wrapper.find('textarea').debug();
		expect(ta).toMatch(/ value="\{\\n\\t"recruiter_name": "samantha"\\n\}"/);
	});
});
