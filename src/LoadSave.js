/*
** LoadSave -- code to mediate between Redux state and the Model and ultimately the DB
**
** Copyright (C) 2017-2018 Tactile Interactive
*/

import _ from "lodash";
import $ from "jquery";

import {putOne, postOne} from './Model';
import {rxStore} from './Reducer';
import {getAll} from './Model';
import {theGlobalList} from './GlobalList';

// the prototype object for a selection, so I don't forget some fields
let bareSelection = {
	selectedRecord: null, 
	selectedSerial: -1, 
	didChange: false, 
	saving: false,
	selectedEngagement: {what: '', when: '', notes: '',},
};
Object.freeze(bareSelection);

class LoadSave {

	/********************************************** Edit Existing */

	// sets the existing rec passed in as the state record for the control panel.
	// rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
	// called by reducer()
	static startEditRecord(state, action) {
		if (state.selection.didChange)
			throw "Cannot set new selection while old one has changes";  // eslint-disable-line

		$('div.App section.summary').removeClass('selected');
		$(action.node).addClass('selected');

		// the NEW selection to be handed in to state
		let selection = {
			...bareSelection,
			originalBeforeChanges: action.record,  // this is in the big record list

			// setting the selectedRecord will cause the control panel to appear
			selectedRecord: _.cloneDeep(action.record),  // this copy gets changed during editing
			selectedSerial: action.serial,
			didChange: false,
		};
		window.selectedRecord = selection.selectedRecord;  // so i can get at it in the debugger

		// this should set the state of both components and show the info
		////theControlPanel.setEdit(selection.selectedRecord);
	
	
	
	
	// 			theButtonArea.saveButton$.show();
	// 		theButtonArea.addButton$.hide();
			$('#control-panel').removeClass('adding');


			state = {...state,
				selection,
			};


		//theControlPanel.setIdle(selectedRecord);
	
		return state;
	}
	
	
	// a click event on Save, post dispatch
	static saveEditReq(state, action) {
		////console.log("saveEditClick starting...");
		
		// update
		let sel = state.selection;
		var rec = sel.selectedRecord;
		putOne(rec, function(statusText, statusNumber) {
			////console.log("...saveEditClick done");
			if (statusText == 'success') {  // eslint-disable-line
				rxStore.dispatch({
					type: 'SAVE_EDIT_DONE',
					statusText: statusText,
					statusNumber: statusNumber,
				});
			}
		});
		
		state = {...state};
		state.selection.saving = true;
		return state;
	}

	static saveEditDone(state, action) {
		state = {...state};
		
// 		replace the newly edited thing
// 		state.recs[sel.selectedSerial] = {...sel.selectedRecord};

		// reload the screen. kindof overkill but works
		getAll((newRecs) => {
			theGlobalList.update(newRecs)
		});

		// replace the whole selection
		state.selection = {...bareSelection};
		
		return state;
	}
	

	/********************************************** Add New */
	// start editing a new blank record.  Called when user clicks New Rec.
	static startAddRecord(state, action) {
		////let state = rxStore.getState();
		////cleanChanges(state);
	
		//theControlPanel.setAdd();
	
		// the template for a new Recruiter
		let initial = {status: 'applied', created: (new Date()).toISOString().replace(/T/, '.')};
		// now what?!?!?
	
		////theCrudCurtain.show();
	// 		theButtonArea.saveButton$.hide();
	// 		theButtonArea.addButton$.show();
	// 		theControlPanel.adding = true;
	// 		theControlPanel.editing = false;
		$('#control-panel').addClass('adding');
		//theControlPanel.setCPRecord(initial).show();
	
		// most important, make a selection pointing to the new prototype rec
		state = {
			...state,
			selection: {
				...state.selection,
				selectedRecord: initial,
				saving: true,
			},
		};
		return state;
	}

	// a click event on Add to save a new rec: actually start save
	static saveAddReq(state, action) {
		// create
		var rec = state.selection.selectedRecord;
		postOne(rec, function(statusText, statusNumber) {
			////console.log("...saveEditClick done");
			if (statusText == 'success') {  // eslint-disable-line
				rxStore.dispatch({
					type: 'SAVE_ADD_DONE',
					statusText: statusText,
					statusNumber: statusNumber,
				});
			}
		});
		
		state = {...state};
		state.selection.saving = true;
		return state;
	}

	static saveAddDone(state, action) {
		////cleanChanges(state);
	
		////theControlPanel.setIdle();
	
		// reload the screen. kindof overkill but works
		getAll((newRecs) => {
			theGlobalList.update(newRecs)
		});

		state = {...state};
		state.selection = {...bareSelection};
		return state;


	// 	state = {...state};
// 		state.selection.saving = false;
// 		return state;
// 		return {...state.selection, 
// 				selectedRecord: null, selectedSerial: -1, didChange: false, 
// 				saving: false,};
	}
	
	/********************************************************************** other */
	static cancelEditAdd(state, action) {

		// reload the screen. kindof overkill but works
		getAll((newRecs) => {
			theGlobalList.update(newRecs)
		});

		state = {...state, selection: {...bareSelection}};
		return state;
	}
}

export default LoadSave;
