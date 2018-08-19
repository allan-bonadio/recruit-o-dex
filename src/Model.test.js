import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './reducer';
import {Model} from './Model';


configure({ adapter: new Adapter() });

describe('<Model', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
////		ReactDOM.render(<Provider store={rxStore}><Model /></Provider>, div);
	});
});
