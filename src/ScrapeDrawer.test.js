import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

////import { configure } from 'enzyme';
////import Adapter from 'enzyme-adapter-react-16';

import {rxStore} from './Reducer';
import {ScrapeDrawer} from './ScrapeDrawer';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={rxStore}><ScrapeDrawer /></Provider>, div);
});

////configure({ adapter: new Adapter() });
// test file
////import { shallow, mount, render } from 'enzyme';
////
////const wrapper = shallow(<ScrapeDrawer />);

