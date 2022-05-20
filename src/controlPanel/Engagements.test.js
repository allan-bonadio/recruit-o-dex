import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from '../reducer';
import {Engagements} from './Engagements';


configure({ adapter: new Adapter() });

describe('<Engagements', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Provider store={rxStore}><Engagements /></Provider>, div);
	});

	it('has the right pieces', () => {
		const w = shallow(<Engagements recs={[]} />);
		////console.log(w.debug());////
		expect(w.find('datalist#engagement-whats').length).toEqual(1);
		expect(w.find('option[value="tech phint"]').length).toEqual(1);
		expect(w.find('button.add-engagement').length).toEqual(1);
		expect(w.find('table').length).toEqual(1);
	});


	it('list has the right pieces', () => {
		const w = mount(<Engagements engagements={[{what: 'pico', date: 'fermi', notes: 'nano'}]} />);
		////console.log(w.debug());////
		expect(w.find('input[name="what"]').length).toEqual(2);
		expect(w.find('input[name="when"]').length).toEqual(2);
		expect(w.find('textarea[name="notes"]').length).toEqual(2);

		expect(w.find('input[name="what"]').debug().indexOf('pico')).toBeGreaterThan(-1);
		////expect(w.find('input[name="when"]').debug().indexOf('fermi')).toBeGreaterThan(-1);
		expect(w.find('textarea[name="notes"]').debug().indexOf('nano')).toBeGreaterThan(-1);
	});

});
