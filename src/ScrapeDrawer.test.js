import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './Reducer';
import {ScrapeDrawer, scanOneInput} from './ScrapeDrawer';


configure({ adapter: new Adapter() });
////const wrapperSH = shallow(<ScrapeDrawer />);
////const wrapperF = mount(<ScrapeDrawer />);
////const wrapperST = render(<ScrapeDrawer />);

describe('<ScrapeDrawer', () => {
	it('renders without crashing', () => {
	  const div = document.createElement('div');
	  ReactDOM.render(<Provider store={rxStore}><ScrapeDrawer /></Provider>, div);
	});

	it('should have a textarea', () => {
		const wrapper = shallow(<ScrapeDrawer />);
		expect(wrapper.find('textarea').length).toEqual(1);
	});

	it('should have an arrow that points the right way', () => {
		// so the state is undef going in here i guess
		//let state = rxStore.getState() || {controlPanel: {} };
////		console.log('rxStore then state:', rxStore, state);

		// simulate scrapeDrawerOpen = false by leaving it undefined
		let wrapper = shallow(<ScrapeDrawer />);
		expect(wrapper.find('textarea').length).toEqual(1);
		expect(/▾/.test(wrapper.text())).toBeFalsy();
		expect(/▸/.test(wrapper.text())).toBeTruthy();

		// now try it with it on
		ScrapeDrawer.mockOpen(true);
		wrapper = shallow(<ScrapeDrawer />);
		expect(wrapper.find('textarea').length).toEqual(1);
		expect(/▾/.test(wrapper.text())).toBeTruthy();
		expect(/▸/.test(wrapper.text())).toBeFalsy();
	});

	it('should scrape an email address', () => {
		let res;
		
		res = scanOneInput('Morgan Frey <Morgan@ursusinc.com>');
		expect(res).toEqual({recruiter_name: 'Morgan Frey', recruiter_email: 'Morgan@ursusinc.com'});

		res = scanOneInput('Bartholemew Morgan Frey <Morgan@ursusinc.com>');
		expect(res).toEqual({recruiter_name: 'Bartholemew Morgan Frey', recruiter_email: 'Morgan@ursusinc.com'});

		// with quotes.  grrr
		res = scanOneInput('"Morgan Frey" <Morgan@ursusinc.com>');
		expect(res).toEqual({recruiter_name: 'Morgan Frey', recruiter_email: 'Morgan@ursusinc.com'});
	});

	it('should scrape for phone numbers', () => {
		let res;
		
		let inp = `Ursus, Inc. | Recruiter
M: 205.746.2079
O:  877. 66. URSUS`;

		res = scanOneInput(inp);
		expect(res).toEqual({recruiter_phone: '205.746.2079'});
	});
});
