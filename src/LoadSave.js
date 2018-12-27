/*
** LoadSave -- crud actions
**
** Copyright (C) 2017-2018 Tactile Interactive
*/

import $ from "jquery";
import _ from "lodash";

import {moPutOne, moPostOne} from './Model';
import {rxStore, initialState} from './reducer';
import {globalListUpdateList} from './GlobalList';
import Engagements from './Engagements';

// use initialState.controlPanel instead
////// the prototype object for a selection, so I don't forget some fields
////export let bareSelection = {
////	editingRecord: null, 
////	selectedSerial: -1, 
////	didChange: false, 
////	saving: false,
////	editingEngagement: {what: '', when: '', notes: '',},
////};
////Object.freeze(bareSelection);

// return the current timestamp like "2018-09-23.01:23:45Z"
function timestampString() {
	 return (new Date()).toISOString().replace(/T/, '.')
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
	
////	static selectNothing(state) {
////		return {...state, controlPanel: {...bareSelection}};
////	}
	
	/********************************************** Edit Existing */

	// sets the existing rec passed in as the selected record for the control panel.
	// called by reducer()
	static startEditRecord(controlPanel, action) {
		if (controlPanel.didChange)
			throw "Cannot set new controlPanel while old one has changes";  // eslint-disable-line

		$('div.App section.summary').removeClass('selected');
		let node$ = $('section[serial='+ action.serial +']');
		node$.addClass('selected');
		
		let record = rxStore.getState().recs[action.serial];

		// unmanaged, the scrape pit is just a textarea.  Clear it out when CP opens again.
////		$('.scrape-pit').val('');


		$('#control-panel').removeClass('adding');

		// the NEW selection to be handed in to state
		return {
			...initialState.controlPanel,
			originalBeforeChanges: record,  // this is in the big record list

			// setting the editingRecord will cause the control panel to appear
			editingRecord: _.cloneDeep(record),  // this copy gets changed during editing
			selectedSerial: action.serial,
			didChange: false,
			
////			scrapeDrawerOpen: false,
		};
		//window.editingRecord = controlPanel.editingRecord;  // so i can get at it in the debugger
	}
	
	
	// a click event on Save, or just on the background.  Does the request and dispatches actions.
	static saveEditRecord() {
		let cp = rxStore.getState().controlPanel;
		// wait!  has there been any changes?  If not, don't actually save, leave it.
		// I don't have a lot of faith in this but it seems to work well.
		let obc = JSON.stringify(cp.originalBeforeChanges);
		let cur = JSON.stringify(cp.editingRecord);
		//console.log(obc, cur);
		if (obc == cur) {
			return;   // don't store it again
////			// cannot dispatch from a reducer function.
////			rxStore.dispatch({type: 'SAVE_EDIT_DONE'}));
		}
		
		rxStore.dispatch({
			type: 'SAVE_EDIT_REQ',
		});

		moPutOne(cur, function(errorObj) {
			// these are done later so no problem running from within a reducer
			if (errorObj)  // eslint-disable-line
				rxStore.dispatch({type: 'ERROR_PUT_POST', errorObj});
			else
				rxStore.dispatch({type: 'SAVE_EDIT_DONE'});
		});

	}
	
	
	// resolver for initial PUT request
	static saveEditReq(controlPanel, action) {
		// update
		var rec = LoadSave.cleanupRecord(controlPanel.editingRecord);
		rec.updated = timestampString();
		
		controlPanel = {...controlPanel};
		controlPanel.saving = true;  // is this ever turned off?
		return controlPanel;
	}

	static saveEditDone(controlPanel, action) {
		
// 		replace the newly edited thing
// 		state.recs[sel.selectedSerial] = {...sel.editingRecord};

		// reload the screen. kindof overkill but works
		// ?? this shouldn't be done in a resolver!??!
		globalListUpdateList();

		$('div.App section.summary').removeClass('selected');

		// replace the whole controlPanel
		return {...initialState.controlPanel};
////		return LoadSave.selectNothing(state);
	}
	

	/********************************************** Add New */
	// start editing a new blank record.  Called when user clicks New Rec.
	static startAddRecord(controlPanel, action) {
		// the template for a new Recruiter
		let initial = {status: 'applied', created: timestampString()};

		$('#control-panel').addClass('adding');
		//theControlPanel.setCPRecord(initial).show();
		
		
		// unmanaged, the scrape pit is just a textarea.  Clear it out when CP opens again.
		$('.scrape-pit').val('');
	
		// most important, make a controlPanel pointing to the new prototype rec
		return {
			...controlPanel,
			editingRecord: initial,
			saving: true,
////			scrapeDrawerOpen: true,
		};
	}

	static saveAddRecord() {
		let controlPanel = rxStore.getState().controlPanel;
		var rec = LoadSave.cleanupRecord(controlPanel.editingRecord);

		rxStore.dispatch({
			type: 'SAVE_ADD_REQ',
		});

		moPostOne(rec, function(errorObj) {
			if (! errorObj) {
				rxStore.dispatch({
					type: 'SAVE_ADD_DONE',
					controlPanel: controlPanel,
				});
			}
			else {
				// error dialog
				rxStore.dispatch({
					type: 'ERROR_PUT_POST',
					errorObj,
				});
				
			}
		});
		
		return {...controlPanel, saving: true,};
	}

	// a click event on Add to save a new rec: actually start save
	static saveAddReq(controlPanel, action) {
		// create
		let sel = controlPanel;
		var rec = LoadSave.cleanupRecord(sel.editingRecord);
		moPostOne(rec, function(errorObj) {
			if (! errorObj) {
				rxStore.dispatch({
					type: 'SAVE_ADD_DONE',
					controlPanel,
				});
			}
			else {
				// error dialog
				rxStore.dispatch({
					type: 'ERROR_PUT_POST',
					errorObj,
				});
				
			}
		});
		
		return {...controlPanel, saving: true,};
	}

	static saveAddDone(controlPanel, action) {
		// reload the screen. kindof overkill but works
		globalListUpdateList();

		$('div.App section.summary').removeClass('selected');

		return {...initialState.controlPanel};
	}
	
	/********************************************************************** other */
	static cancelEditAdd(controlPanel, action) {

		// reload the screen. kindof overkill but works
		globalListUpdateList();

		return {...initialState.controlPanel};
	}
}

export default LoadSave;
