import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {rxStore} from './Reducer';
import ControlPanel from './ControlPanel';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={rxStore}><ControlPanel /></Provider>, div);
});
