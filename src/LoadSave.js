/*
** LoadSave -- crud actions
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/
/* eslint-disable eqeqeq, default-case */

import _ from "lodash";

import ControlPanel from './controlPanel/ControlPanel';
import Engagements from './controlPanel/Engagements';
import {globalListUpdateList} from './globalList/GlobalList';
import {moPutOne, moPostOne} from './Model';
import {rxStore, initialState} from './reducer';

// return the current timestamp like "2018-09-23.01:23:45Z"
function timestampString() {
	 return (new Date()).toISOString().replace(/T/, '.')
}

// compare the EditingRecord and originalBeforechanges, return true if the same
function noChanges(controlPanel) {
	let obc = JSON.stringify(controlPanel.originalBeforeChanges);
	let cur = JSON.stringify(controlPanel.editingRecord);
	return (obc == cur);
}


export class LoadSave {
	// just before saving, clear out stuff, mostly empty fields
	// has side effects on passed in record and returns same object
	static cleanupRecord(record) {
		// clean out engagements; there's always at least one empty engagement
		let e = Engagements.cleanEngagementsList(record.engagements);
		if (e)
			record.engagements = e
		else
			delete record.engagements;

		return record;
	}

	/********************************************** Starting add/edit/dup */
	// action handlers

	// start editing a new blank record.  Called when user clicks New Rec.
	static startAddRecord(controlPanel, action) {
		// the template for a new Recruiter
		let initial = {status: 'applied', created: timestampString()};

		// most important, make a controlPanel pointing to the new prototype rec
		return {
			...controlPanel,
			originalBeforeChanges: initial,  // brand new
			editingRecord: initial,
			selectedSerial: -1,    // says this is add, not edit
		};
	}

	// sets the existing rec passed in as the selected record for the control panel.
	// called by reducer()
	static startEditRecord(controlPanel, action) {
		let record = action.record;

		// the NEW selection to be handed in to state
		return {
			...controlPanel,
			originalBeforeChanges: record,  // this is in the big record list

			// setting the editingRecord will cause the control panel to appear
			editingRecord: _.cloneDeep(record),  // this copy gets changed during editing
			selectedSerial: action.serial,
		};
	}

	// reducer: a click event on Save to save a new rec: before save
	static saveAddEditStart(controlPanel, action) {
		return {...controlPanel, saving: true,};
	}

	// reducer: done with save
	static saveAddEditDone(controlPanel, action) {
		return {...controlPanel, saving: false};
	}

	// kindof a mix of Add and Edit
	static startDupRecord(controlPanel, action) {
		let record = _.cloneDeep(action.record);
		delete record._id;  // tells mongo that it's new

		// the NEW selection to be handed in to state
		return {
			...controlPanel,
			originalBeforeChanges:  record,

			// setting the editingRecord will cause the control panel to appear
			editingRecord: _.cloneDeep(record),  // this copy gets changed during editing
			selectedSerial: -1  // makes it new
		};
	}


	/********************************************************************** add & edit */
	// initiate commands

		// call this to save the record after user is done filling in blanks.
	// selectedSerial = -1 for Add, 0...n for edit
	static saveAddEditRecord(selectedSerial) {
		let cp = rxStore.getState().controlPanel;

		// wait!  has there been any changes?  If not, don't actually save, leave it.
		if (noChanges(cp)) {
			ControlPanel.cancelControlPanel()
			return;
		}

		let startActionType =  'SAVE_EDIT_START';
		let modelFunc = moPutOne;
		let doneActionType = 'SAVE_EDIT_DONE';
		if (selectedSerial<0 ) {
			// it's Add, not Edit
			startActionType =  'SAVE_ADD_START';
			modelFunc = moPostOne;
			doneActionType = 'SAVE_ADD_DONE';
		}

		rxStore.dispatch({type: startActionType});

		var rec = LoadSave.cleanupRecord(cp.editingRecord);
		modelFunc(rec, function(errorObj) {
			if (! errorObj) {
				rxStore.dispatch({
					type: doneActionType,
					controlPanel: cp});

				// reload the screen. kindof overkill but works
				globalListUpdateList();
			}
			else
				rxStore.dispatch({type: 'ERROR_PUT_POST', errorObj});
		});
	}

	// duplicate.  If currently edited rec has unsaved changes, those go to the new rec instead of the old
	static dupCurrentRecord(selectedSerial) {
		let cp = rxStore.getState().controlPanel;

		rxStore.dispatch({type: 'START_DUP_RECORD', record: cp.editingRecord});
	}



	/********************************************************************** cancel */

	// reducer for edit and add
	static cancelEditAdd(controlPanel, action) {
		// no selection
		return {...initialState.controlPanel, saving: false};
	}
}

export default LoadSave;
