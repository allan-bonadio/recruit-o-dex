import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from '../reducer';
import {EditPanel} from './EditPanel';

configure({ adapter: new Adapter() });

xdescribe('<EditPanel', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		console.info('rxStore:', rxStore, 'div~', div);
		ReactDOM.render(<Provider store={rxStore}><EditPanel /></Provider>, div);
		let pcp = <Provider store={rxStore}><EditPanel /></Provider>;
		ReactDOM.render(pcp, div);
	});

	it('should be a div', () => {
		let cp = <EditPanel />;
		const wrapper = shallow(cp);
		expect(wrapper.is('div#control-panel')).toBeTruthy();
	});

	it('should have some buttons', () => {
		const wrapper = shallow(<EditPanel />);

		console.log('wrap.find button: ', wrapper.find('button.save-button'));
		expect(wrapper.find('button.save-button').length).toBe(1);
		expect(wrapper.find('button.add-button').length).toBe(1);
		expect(wrapper.find('button.cancel-button').length).toBe(1);

	});
});
