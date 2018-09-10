import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './reducer';
import {GlobalList} from './GlobalList';

configure({ adapter: new Adapter() });

let mockProps = {
	searchQuery: 'find me',
	globalListErrorObj: null,
	recs: [],
	selectedSerial: -1,
};

describe('<GlobalList', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Provider store={rxStore}>
			<GlobalList {...mockProps} />
		</Provider>, div);
	});

	it('can render zero recs', () => {
		const w = shallow(<GlobalList recs={[]} />);
		expect(w.find('section.summary.title-cell').length).toEqual(1);
		expect(w.find('section.summary').length).toEqual(1);
	});
	
	it('can render two recs', () => {
		const w = mount(<GlobalList recs={[{}, {}]} />);
		expect(w.find('section.summary.title-cell').length).toEqual(1);
		////expect(w.find('section.summary').length).toEqual(1);
		expect(w.find('section.summary').length).toEqual(3);
		expect(w.find('div.summary-field').length).toEqual(14);
		expect(w.find('div.summary-field.recruiter_name').length).toEqual(2);
		expect(w.find('div.summary-field.recruiter_phone').length).toEqual(2);
	});
});
