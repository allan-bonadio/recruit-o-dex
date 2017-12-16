/*
** index -- top level for the RecruitMan page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {getAll} from './Model';
////import registerServiceWorker from './registerServiceWorker';

function repaint() {
	ReactDOM.render(<App />, document.getElementById('root'));
}

getAll(function(records) {
	repaint();
});
//registerServiceWorker();


