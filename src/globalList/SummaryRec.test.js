import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from '../reducer';
import {SummaryRec} from './SummaryRec';

configure({ adapter: new Adapter() });

describe('<SummaryRec', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<SummaryRec />, div);
	});

	it('should have a SummaryRec ', () => {
		const wrapper = shallow(<SummaryRec />);
		////console.log(wrapper.debug());
		expect(wrapper.find('section.summary').length).toEqual(1);
	});

	it('should have several Fields ', () => {
		const wrapper = mount(<SummaryRec />);
////		console.log(wrapper.debug());
		expect(wrapper.find('Field[name]').length).toBeGreaterThan(4);
		expect(wrapper.find('Field[name] div.summary-field').length).toBeGreaterThan(4);

		expect(wrapper.find('Field[name="recruiter_name"]').length).toEqual(1);
		expect(wrapper.find('Field[name="recruiter_email"]').length).toEqual(1);
		expect(wrapper.find('Field[name="agency"]').length).toEqual(1);
		expect(wrapper.find('Field[name="notes"]').length).toEqual(1);
		wrapper.unmount();
	});


});
