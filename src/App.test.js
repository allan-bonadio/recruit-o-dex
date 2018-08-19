import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './reducer';
import {App} from './App';

configure({ adapter: new Adapter() });

describe('<App', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<App />, div);
	});

	it('should have a App ', () => {
		const wrapper = shallow(<App />);
////		console.log(wrapper.debug());
		expect(wrapper.find('div.App').length).toEqual(1);
	});

	it('should have a crud-curtain ', () => {
		const wrapper = mount(<App />);
////		console.log(wrapper.debug());
		expect(wrapper.find('CrudCurtain').length).toEqual(1);
		wrapper.unmount();
	});

	it('should have little dialog', () => {
		const wrapper = mount(<App />);
		////console.log(wrapper.debug());
		expect(wrapper.find('div.little-dialog').length).toEqual(1);
		wrapper.unmount();
	});

	it('should have a control-panel', () => {
		const wrapper = mount(<App />);
		////console.log(wrapper.debug());
		expect(wrapper.find('ControlPanel').length).toEqual(1);
		wrapper.unmount();
	});

	it('should have a GlobalList etc', () => {
		const wrapper = mount(<App />);
		////console.log(wrapper.debug());
		expect(wrapper.find('GlobalList').length).toEqual(1);
		wrapper.unmount();
	});

});
