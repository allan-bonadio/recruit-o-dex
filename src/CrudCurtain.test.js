import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './reducer';
import {CrudCurtain} from './CrudCurtain';


configure({ adapter: new Adapter() });

describe('<CrudCurtain', () => {
	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Provider store={rxStore}><CrudCurtain /></Provider>, div);
	});

	it('saves when you click it', () => {
		let curt = CrudCurtain.me,
			wasCalledWith,
			oldProps = curt.props;
		
		// i would have used a spy but the function isn't even there.  So rig this up.
		curt.props = {dispatch: (argz) => {
			expect(argz).toBeTruthy();
			wasCalledWith = argz;
		}};

		curt.props.selectedSerial = 5;  // simulated edit
		wasCalledWith = null;
		curt.curtainClick({});
		expect(wasCalledWith).toEqual({type: 'SAVE_EDIT_START'});

		curt.props.selectedSerial = -1;  // simulated add
		wasCalledWith = null;
		curt.curtainClick({});
		expect(wasCalledWith).toEqual({type: 'SAVE_ADD_START'});
		
		curt.props = oldProps;
	});
});

