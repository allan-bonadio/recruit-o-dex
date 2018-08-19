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
	globalListErrorObj: 'my favorite error',
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
});
