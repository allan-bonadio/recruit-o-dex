/*
** LoadSave -- crud actions
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import _ from "lodash";

import ControlPanel from './ControlPanel';
import Engagements from './Engagements';
import {globalListUpdateList} from './GlobalList';
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
	
	/********************************************** Edit Existing */

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
	
	
	// a click event on Save, or just on the background.  Does the request and dispatches actions.
	static saveEditRecord() {
		let cp = rxStore.getState().controlPanel;
		
		// wait!  has there been any changes?  If not, don't actually save, leave it.
		if (noChanges(cp)) {
			ControlPanel.cancelControlPanel()
			return;
		}
		
		rxStore.dispatch({type: 'SAVE_EDIT_START'});

		// update, will happen soon.  Don't update the recs till the save is successful!
		var rec = LoadSave.cleanupRecord(cp.editingRecord);
		rec.updated = timestampString();
		
		moPutOne(rec, function(errorObj) {
			if (! errorObj) {
				rxStore.dispatch({type: 'SAVE_EDIT_DONE'});

				// reload the screen. kindof overkill but works
				globalListUpdateList();
			}
			else
				rxStore.dispatch({type: 'ERROR_PUT_POST', errorObj});
		});

	}
	
	
	// resolver for initial PUT request - before doing the req
	static saveEditStart(controlPanel, action) {
		return {...controlPanel, saving: true};
	}

	static saveEditDone(controlPanel, action) {
		return {...controlPanel, saving: false}; 
	}
	

	/********************************************** Add New */
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

	// call this to save the record after user is done filling in blanks
	static saveAddRecord() {
		let cp = rxStore.getState().controlPanel;
		if (noChanges(cp)) {
			ControlPanel.cancelControlPanel();  // don't save empty record
			return;
		}

		rxStore.dispatch({type: 'SAVE_ADD_START'});

		var rec = LoadSave.cleanupRecord(cp.editingRecord);
		moPostOne(rec, function(errorObj) {
			if (! errorObj) {
				rxStore.dispatch({type: 'SAVE_ADD_DONE', controlPanel: cp});

				// reload the screen. kindof overkill but works
				globalListUpdateList();
			}
			else
				rxStore.dispatch({type: 'ERROR_PUT_POST', errorObj});
		});
	}

	// reducer: a click event on Save to save a new rec: before save
	static saveAddStart(controlPanel, action) {
		return {...controlPanel, saving: true,};
	}

	// reducer: done with save
	static saveAddDone(controlPanel, action) {
		return {...controlPanel};
	}
	
	/********************************************************************** cancel */
	
	// reducer for edit and add
	static cancelEditAdd(controlPanel, action) {
		// no selection
		return {...initialState.controlPanel, saving: false};
	}
}

export default LoadSave;
