import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './reducer';
import {LittleDialog} from './LittleDialog';


configure({ adapter: new Adapter() });

describe('<LittleDialog', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Provider store={rxStore}><LittleDialog /></Provider>, div);
	});

	xit('has the right stuff', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Provider store={rxStore}><LittleDialog /></Provider>, div);
	});

	xit('should have a crud-curtain ', () => {
		const wrapper = mount(<App />);
		console.log(wrapper.debug());
		expect(wrapper.find('CrudCurtain').length).toEqual(1);
		wrapper.unmount();
	});

	it('should have the right stuff ', () => {
		const wrapper = shallow(<LittleDialog />);
		////console.log(wrapper.debug());////
		expect(wrapper.exists('Modal[isOpen]')).toBeTruthy();
		expect(wrapper.exists('ModalHeader[tag]')).toBeTruthy();
		expect(wrapper.exists('ModalBody[tag]')).toBeTruthy();
		expect(wrapper.exists('ModalFooter[tag]')).toBeTruthy();
		expect(wrapper.find('Button[color]').length).toEqual(2);
	});
});
