import 'raf/polyfill';  // says to
import 'core-js/es6/map';
import 'core-js/es6/set';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {configure, shallow, mount, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {rxStore, reducer, initialState} from './reducer';

// for all the functions i gotta test
import LoadSave from './LoadSave';
import Engagements from './controlPanel/Engagements';
import ControlPanel from './controlPanel/ControlPanel';
import RecForm from './controlPanel/RecForm';
import JsonForm from './controlPanel/JsonForm';
import GlobalList from './globalList/GlobalList';
import LittleDialog from './LittleDialog';

// initial state, what it should be
const iState = {
	selection: {},
	controlPanel: {editingRecord: null, selectedSerial: -1,  originalBeforeChanges: null,
				jsonText: null, jsonError: null,},
	littleDialog: {modal: false},
	recs: [],
};

describe('reducer ', () => {
	it('should propertly initialize the state ', () => {
		let initState = reducer(undefined, {type: '@@redux.INIT'});
		expect(initState).toEqual(iState);
	});

	// this does a whole test for an action type, if that case is just a call to a function with the same name.
	// call it like this:   testReducerAction(LoadSave, 'START_ADD_RECORD'));
	// it makes sure that action calls LoadSave.startAddRecord()
	function testReducerAction(obj, actionName) {
		let methodName = actionName.split('_').map((word, ix) => {
			if (ix == 0) return word.toLowerCase(); // first one isn't caplitalzied
			return word[0] + word.substr(1).toLowerCase();
		}).join('');

		let rv = Math.floor(Math.random() * 1000);
		////console.info("rv, objClass, actionName, methodName:", rv,
////			obj.constructor.name, actionName, methodName);////
		spyOn(obj, methodName).and.returnValue(rv);

		let beforeState = {zork: 'vork nork'};
		let ac = {type: actionName, pink: 'link mink'};

		let afterState = reducer(beforeState, ac);

		expect(obj[methodName]).toHaveBeenCalledWith(beforeState, ac);
		expect(afterState).toEqual(rv);
	}

	it('should do Edit and Add actions', () => {

		testReducerAction(LoadSave, 'START_EDIT_RECORD');
		testReducerAction(LoadSave, 'SAVE_EDIT_START');
		testReducerAction(LoadSave, 'SAVE_EDIT_DONE');
		testReducerAction(LoadSave, 'START_ADD_RECORD');
		testReducerAction(LoadSave, 'SAVE_ADD_START');
		testReducerAction(LoadSave, 'SAVE_ADD_DONE');
	});

	it('should try Misc actions', () => {
		testReducerAction(LoadSave, 'CANCEL_EDIT_ADD');
		testReducerAction(RecForm, 'CHANGE_TO_RECORD');
		testReducerAction(Engagements, 'CHANGE_TO_ENGAGEMENT');
		testReducerAction(JsonForm, 'CHANGE_TO_JSON');

		testReducerAction(Engagements, 'PASTE_TO_ENGAGEMENT');

		testReducerAction(GlobalList, 'CHANGE_SEARCH_QUERY');
		testReducerAction(GlobalList, 'CHANGE_SORT_CRITERION');
		testReducerAction(GlobalList, 'CHANGE_COLLECTION_NAME');

		testReducerAction(LittleDialog, 'OPEN_LITTLE_DIALOG');
		testReducerAction(LittleDialog, 'CLOSE_LITTLE_DIALOG');
	});

	it('should try ERROR_PUT_POST ', () => {
		spyOn(console, 'error');
		testReducerAction(ControlPanel, 'ERROR_PUT_POST');
    	expect(console.error).toHaveBeenCalled();
    	expect(console.error).toHaveBeenCalledWith(
    			"ERROR_PUT_POST",
    			{type: "ERROR_PUT_POST", pink: 'link mink'}
    	);

	});

	it('should create a good rxStore ', () => {
		expect(rxStore.dispatch).toBeTruthy();
		expect(rxStore.getState).toBeTruthy();
		expect(rxStore.replaceReducer).toBeTruthy();
		expect(rxStore.subscribe).toBeTruthy();
	});
});

