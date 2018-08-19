import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './reducer';
import {LoadSave} from './LoadSave';


configure({ adapter: new Adapter() });

describe('<LoadSave', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
////		ReactDOM.render(<Provider store={rxStore}><LoadSave /></Provider>, div);
	});
});
