/*
** index -- top level for the RecruitMan page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import {App} from './App';
import {theGlobalList} from './GlobalList';
import {getAll} from './Model';
////import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

theGlobalList.updateList();
// getAll(function(err, records) {
// 	// when the data is loaded for the first time, start the app.
// 	setGlobalData(records);
// });
//registerServiceWorker();


