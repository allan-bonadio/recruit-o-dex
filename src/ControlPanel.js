/*
** Control Panel -- the floating blue box on the page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
import {putOne, postOne} from './Model';
import {allSummaries} from './App';
import {ScrapeDrawer, theScrapeDrawer} from './ScrapeDrawer';
//import {EventTable} from './EventTable';
import {RecForm, theRecForm} from './RecForm';
import {JsonForm, theJsonForm} from './JsonForm';
import $ from "jquery";
import _ from "lodash";


/********************************************************************** Control Panel root */
export let theControlPanel;

// dragging around the control panel, does it work...
const throughReact = false;

export class ControlPanel extends Component {
	constructor() {
		super();
		theControlPanel = this;
		
		this.mouseDown = this.mouseDown.bind(this);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		
		this.state = {display: 'none'};
		if (throughReact) {
			// for doing through react
			this.state.cPanelX = 100;// eslint-disable-line
			this.state.cPanelY = 200;// eslint-disable-line
		}
		else {
			this.cPanelX = 100;
			this.cPanelY = 200;  // for doing it quickly
		}
	}

	show() { this.setState({display: 'block'}) }
	hide() { this.setState({display: 'none'}) }
	
	render() {
		// append this to the control panel to do it through react.  but it's slower.
		// return <div id="control-panel" onMouseDown={this.mouseDown} style={{left: this.state.cPanelX +'px', top: this.state.cPanelY +'px'}}>
		return <div id="control-panel" onMouseDown={this.mouseDown}  style={{display: this.state.display}} >
				<RecForm></RecForm>
				<JsonForm></JsonForm>
				<ButtonArea></ButtonArea>
				<ScrapeDrawer></ScrapeDrawer>
			</div>
	}
	
	// sets the rec passed in as the "this" record for the control panel.
	// rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
	// This funciton sets internal vars and populates text blanks. 
	setCPRecord(rec) {
		// this should set the state of both components and show the info
		theRecForm.setRecordState(rec);
		theJsonForm.setRecordState(rec);
		return this;
	}
	
	// set mode to Idle where the control panel is hidden.
	setIdle() {
		theCrudCurtain.hide();
		theControlPanel.hide();
		theButtonArea.startIdling();
		return this;
	}
	
	// set mode to Edit so user can select an existing record
	// sets the rec passed in as the "this" record for the control panel.
	// This funciton sets internal vars and populates text blanks. 
	setEdit(rec) {
		// rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
		theControlPanel.setCPRecord(rec).show();
		theCrudCurtain.show();
		theButtonArea.startEditing();
		return this;
	}
	
	// set mode to Add so user can start a new reccord
	setAdd() {
		// the template for a new Recruiter
		let initial = {status: 'applied', created: (new Date()).toISOString().replace(/T/, '.')};
		
		theControlPanel.setCPRecord(initial).show();
		theCrudCurtain.show();
		theButtonArea.startAdding();
		return this;
	}
	
	
	/****************************************************** drag around cpanel */

	// click down on the control panel - so user can drag it around
	mouseDown(ev) {
		// a click on the panel, not in its text blanks
		let nn = ev.target.nodeName;
		if (nn != 'INPUT' && nn != 'TEXTAREA') {  // eslint-disable-line
			this.lastX = ev.clientX;
			this.lastY = ev.clientY;
		
			$(document.body).on('mousemove', this.mouseMove).on('mouseup mouseleave', this.mouseUp);

			//ev.preventDefault();
			//ev.stopPropagation();
		}
	}
	
	// every yank of the sleeve comes through here
	mouseMove(ev) {
		if (throughReact) {
			// through react
			let o = this.state;
			this.setState({
				cPanelX: o.cPanelX + ev.clientX - this.lastX, 
				cPanelY: o.cPanelY + ev.clientY - this.lastY,
			});
		}
		else {
			// through normal fast means
			this.cPanelX += ev.clientX - this.lastX;
			this.cPanelY += ev.clientY - this.lastY;
			$('#control-panel').css({left: this.cPanelX + 'px', top: this.cPanelY + 'px'})
		}

		// ready for next nudge
		this.lastX = ev.clientX;
		this.lastY = ev.clientY;
		
		ev.stopPropagation();
	}
	
	// called when it's the end and we're done, either by mouse up or mouse out of the page, or any other reason
	mouseUp(ev) {
		this.mouseMove(ev);
		
		// turn off event handlers and that'll disable dragging.  That's all, no cleanup needed; side effects all done.
		$(document.body).off('mousemove', this.mouseMove).off('mouseup mouseleave', this.mouseUp);
	}
}



/********************************************************************** button-area */
// Save and cancel buttons and some others i guess

export let theButtonArea;

export class ButtonArea extends Component {
	constructor(props) {
		super(props);
		theButtonArea = this;
		
		// show either the edit buttons (save cancel) or the adding buttons (add) use for css display
		this.state = {editing: 'none', adding: 'none'};
		
		this.saveHandler = this.saveHandler.bind(this);
		this.cancelHandler = this.cancelHandler.bind(this);
		this.addHandler = this.addHandler.bind(this);
	}
	
	render() {
		return <section className='button-area' >
			<div style={{display: this.state.editing}}>
				<button type='button' className='save-button main-button' onClick={this.saveHandler}>
					Save
				</button>
			</div>
			<div style={{display: this.state.adding}}>
				<button type='button' className='add-button main-button' onClick={this.addHandler}>
					Add
				</button>
			</div>
			<div style={{display: 'block'}}>
				<button type='button' className='cancel-button main-button' onClick={this.cancelHandler}>
					Cancel
				</button>
			</div>
		</section>;
	}
	
	startEditing() { this.setState({editing: 'block', adding: 'none'}) }
	startAdding() { this.setState({editing: 'none', adding: 'block'}) }
	startIdling() { this.setState({editing: 'none', adding: 'none'}) }
	
	// a click event on Save, save existing rec
	saveHandler(ev) {
		////console.log("saveHandler starting...");
		
		// update
		var rec = theRecForm.state.record;
		putOne(rec, function(result, statusCode) {
			////console.log("...saveHandler done");
			if (result == 'success') {  // eslint-disable-line
				cleanChanges();
				
				// keep the array object in place
				// copy fields over remembering to remove fields that are absent
				// ?? doesn't that mean just copy rec over?!?
				Object.assign(originalBeforeChanges, rec);
				for (var j in originalBeforeChanges) {
					if (! rec[j])
						delete originalBeforeChanges[j]
				}
				
				allSummaries[selectedSerial].setState({record: originalBeforeChanges});
				theControlPanel.setIdle();
				//setSelectedRecord(originalBeforeChanges);
			}
		});
	}

	// a click event on Cancel
	cancelHandler(ev) {
		////console.log("cancelHandler starting...");
		
		// all we have to do is return the two edit widgets to the original
		cleanChanges();
		//setSelectedRecord(originalBeforeChanges);
		theControlPanel.setIdle();
	}

	// a click event on Add to save a new rec
	addHandler(ev) {
		////console.log("addHandler starting...");
		
		// create
		var rec = theRecForm.state.record;
		postOne(rec, function(result, statusCode) {
			////console.log("...saveHandler done");
			if (result == 'success') {  // eslint-disable-line
				cleanChanges();
				
				allSummaries.push(rec);
				////theGlobal
				
				//setSelectedRecord(originalBeforeChanges);
				theScrapeDrawer.setState({display: 'none'});

				theControlPanel.setIdle();

			}
		});
	}
}

/********************************************************************** selection & curtain */

export let theCrudCurtain = null;

// the white translucent sheet behind the control panel; signifies you're changing a record
export class CrudCurtain extends Component {
	constructor(props) {
		super(props);
		this.state = {display: 'none'};
		theCrudCurtain = this;
	}
	
	render() {
		return <div className='crud-curtain' style={{display: this.state.display}}></div>;
	}
	
	show() { this.setState({display: 'block'}) }
	hide() { this.setState({display: 'none'}) }
}


export var selectedRecord = null;  // null if no selection
export var selectedSerial = -1;  // Model.allRecruiters[selectedSerial] == selectedRecord was cloned from it
export var didChange = false;  // and should be saved
export var originalBeforeChanges = null;  // save this for Cancel

// sets the existing rec passed in as the state record for the control panel.
// rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
// Use SummaryRec.select() to select and hilite it with full UI stuff
export function setSelectedRecord(serial, rec) {
	if (didChange)
		throw "Cannot set new selection while old one has changes";  // eslint-disable-line

	// someone new
	originalBeforeChanges = rec;  // this is in the big record list

	selectedRecord = _.clone(rec);  // this gets changed during editing
	selectedSerial = serial;
	window.selectedRecord = selectedRecord;  // so i can get at it in the debugger

	// this should set the state of both components and show the info
	theControlPanel.setEdit(selectedRecord);
	//theControlPanel.setIdle(selectedRecord);
}

// call when the user has made a change, probably typing or backspacing.
// ok to call every time.
// make sure user doesn't forget about it
export function userChangedRecord() {
	if (didChange) return;
	
	theCrudCurtain.show();
	didChange = true;
}

// set the flag back to Clean - there are no changes need saving/backing out
export function cleanChanges() {
	if (! didChange) return;
	
	theCrudCurtain.hide();
	didChange = false;
}



// start editing a new blank record.  Called when user clicks New Rec.
export function startNewRec() {
	cleanChanges();
	
	theControlPanel.setAdd();
	//setSelectedRecord(-1, {});
	
	theScrapeDrawer.setState({display: 'block'});
}

