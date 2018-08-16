/*
** App -- the main code for the RecruitMan page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import React from 'react';
import {Provider} from 'react-redux';


////import $ from "jquery";

import GlobalList from './GlobalList';
import './App.css';
import {rxStore} from './Reducer';

import ControlPanel from './ControlPanel';
import CrudCurtain from './CrudCurtain';
////import {getBySerial} from './Model';

import LittleDialog from './LittleDialog';

// the app itself, pretty simple
export function App() {
	return (
		<Provider store={rxStore}>
			<div className="App">
				<div>
					<ControlPanel />
					<GlobalList />
				</div>
				<CrudCurtain />
				<LittleDialog />
			</div>
		</Provider>
	);
}

export default App;
