/*
** Control Panel -- the floating blue box on the page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
import {putOne, postOne} from './Model';
import {allSummaries, theGlobalList} from './App';
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
			this.state.cPanelX = 100;
			this.state.cPanelY = 200;  // for doing through react
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
				<JsonRec></JsonRec>
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
		theJsonRec.setRecordState(rec);
		return this;
	}
	
	// set mode to idle so user can select an existing record
	setIdle() {
		theCrudCurtain.hide();
		theControlPanel.setCPRecord({}).hide();
		return this;
	}
	
	// set mode to View so user can examine an existing record
	// sets the rec passed in as the "this" record for the control panel.
	// This funciton sets internal vars and populates text blanks. 
	setView(rec) {
		// rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
		theCrudCurtain.hide();
		theControlPanel.setCPRecord(rec).show();
		return this;
	}
	
	// set mode to Edit so user can select an existing record
	// sets the rec passed in as the "this" record for the control panel.
	// This funciton sets internal vars and populates text blanks. 
	setEdit(rec) {
		// rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
		theControlPanel.setCPRecord(rec).show();
		theCrudCurtain.show();
		return this;
	}
	
	// set mode to Add so user can start a new reccord
	setAdd() {
		theControlPanel.setCPRecord({}).show();
		theCrudCurtain.show();
		return this;
	}
	
	
	/****************************************************** drag around cpanel */

	// click down on the control panel - so user can drag it around
	mouseDown(ev) {
		// a click on the panel, not in its text blanks
		let nn = ev.target.nodeName;
		if (nn != 'INPUT' && nn != 'TEXTAREA') {
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


/********************************************************************** event fields */

// one row of the events table
function EventRow(props) {
	let event = props.event;
	return <tr key={event.key}>
		<td>{event.what}</td>
		<td>{event.when}</td>
		<td>{event.notes}</td>
	</tr>;
}

// the single bar, last row in the Events table, that lets users enter new events
class EventAddBar extends Component {
	constructor(props) {
		super(props);
		
		// Set defaults.  date for date input control
		function twoDigit(n) { return String(n + 100).substr(1) }
		let today = new Date();
		this.state = {
			what: '', 
			when: today.getFullYear() +'-'+ twoDigit(today.getMonth()+1) +'-'+ twoDigit(today.getDate()),
			notes: '',
			// key added at creation time
		}
		
		this.addClick = this.addClick.bind(this);
		this.uponChange = this.uponChange.bind(this);
		this.addNewEvent = props.addNewEvent;
	}
	
	// a keystroke or other change to that new event
	uponChange(ev) {
		var chobj = {};
		chobj[ev.target.name] = ev.target.value;
		this.setState(chobj);
		ev.stopPropagation();
	}
	
	// add this event to the list of events
	addClick(ev) {
		this.addNewEvent(this.state.what, this.state.when, this.state.notes);
	}
	
	render() {
		return <tr>
			<td><input name='what' list='event-whats' size='12' value={this.what} placeholder='choose' onChange={this.uponChange} />
				<datalist id='event-whats'>
					<option value='hr phint' />Phone Interview, HR
					<option value='tech phint' />Phone Interview, technical
					<option value='onsite' />On-Site Interview
				</datalist>
			</td>
			<td><input type='date' name='when' value={this.state.when} min='2017-01-01' max='2030-01-01' onChange={this.uponChange} /></td>
			<td><textarea name='notes' value={this.state.notes} placeholder='enter notes' onChange={this.uponChange} /></td>
			<td><button type='button' onClick={this.addClick} >Add</button></td>
		</tr>
	}
}

class EventTable extends Component {
	constructor(props) {
		super(props);
		this.addNewEvent = this.addNewEvent.bind(this);
	}
	
	// called by the Add bar to add it.  We do not hold the events list, we just display it.  Pass it up to really change
	addNewEvent(what, when, notes) {
		// events is a new feature; failover
		let newEvents = [];
		if (this.props.events)
			newEvents = _.clone(this.props.events);
		
		when = (new Date(when)).toLocaleDateString();
		newEvents.push({what: what, when: when, notes: notes, key: newEvents.length+1});
		this.props.changeEvents(newEvents);
	}
	
	render() {
		// generate the rows
		let rows =  this.props.events ? this.props.events.map(event => <EventRow key={event.key} event={event} />) : [];
	
		// assemble final table, with Add row at end
		return <div>
			<table>
				<tbody>
					{rows}
					<EventAddBar addNewEvent={this.addNewEvent} />
				</tbody>
			</table>
		</div>;
	}
}

/********************************************************************** Recruiter form pane */
export var theRecForm;

// a function-based component: just renders a text field and its label
function RecField(props) {
	let fieldname = props.fieldname;
	let dval = props.rec[fieldname] || '';
	//console.log(":: field %s depicted with value %s", fieldname, dval);
	
	// form the <input or <textarea
	let entryElement;
	if (props.element != 'textarea')
		entryElement = <input value={dval} name={fieldname} onChange={() => {}} />;
	else
		entryElement = <textarea value={dval} name={fieldname} />;

	return <div>
		<label className="edit-label">{props.label}</label>
		<div className={'edit-blank '+ fieldname}>
			{entryElement}
		</div>
	</div>;
}


// a small table of recruiter info, fixed field names
export class RecForm extends Component {
	constructor(props) {
		super(props);
		this.state = {record: {recruiter_name:'',  recruiter_email:'',  recruiter_phone:'',  
					agency:'',  company_name:'',  status:'active',  notes:''}, display: 'none'};
		this.typeInBlank = this.typeInBlank.bind(this);
		this.changeEvents = this.changeEvents.bind(this);
		window.recForm = this;
		theRecForm = this;
	}
	
	// keystroke handler - for all the text boxes in the form
	typeInBlank(ev) {
		var targ = ev.target;
		
		// appends or replaces one field only
		var rec = _.clone(this.state.record);
		rec[targ.name] = targ.value;
		theControlPanel.setCPRecord(rec)
		userChangedRecord();
	}

	// called by the Event Table when there's a change
	changeEvents(newEvents) {
		var rec = _.clone(this.state.record);
		rec.events = newEvents;
		theControlPanel.setCPRecord(rec)
		userChangedRecord();
	}

	// set this to have the tree passed in as state
	setRecordState(tree) {
		this.setState({record: tree});
	}
	
	// render the form with all the blanks and data populated in them
	render() {
		let rec = this.state.record;

		return <section className='edit-col edit-form' onChange={this.typeInBlank}>

			<RecField rec={rec} label='Recruiter:' fieldname='recruiter_name' />
			<RecField rec={rec} label='email:' fieldname='recruiter_email' />
			<RecField rec={rec} label='phone:' fieldname='recruiter_phone' />
			<RecField rec={rec} label='agency:' fieldname='agency' />
			<RecField rec={rec} label='company:' fieldname='company_name' />
			<RecField rec={rec} label='status:' fieldname='status' />
			
			<RecField rec={rec} label='notes:' fieldname='notes' element='textarea' />
			
			<EventTable events={rec.events} changeEvents={this.changeEvents} />
		</section>;
	}
	
	componentDidCatch(error, info) {
		console.error("componentDidCatch(%o, %o)", error, info);
	}

	
}


/********************************************************************** json pane */

// format this object as json, but instead of total tightness, try to indent it nicely
export function stringifyJson(obj) {
	let jsonText = JSON.stringify(obj, null, '\t');
	return jsonText;
}

export var theJsonRec;

// raw JSON, editable
export class JsonRec extends Component {
	constructor(props) {
		super(props);
		
		// the state is the whole record, plus the field jsonText.
		// In states where the user's text doesn't parse, set jsonText to the text.
		// that signals unparsable json and um something happens after...
		this.state = {jsonText: null, jsonErrors: '', record: {}};
		this.typeInJson = this.typeInJson.bind(this);
		theJsonRec = this;
	}
	
	// set this to have the tree passed in as state
	setRecordState(tree) {
		this.setState({jsonText: null, jsonErrors: '', record: tree});
	}
	
	// set this to have the problematic json text as the state
	setBadState(text, message) {
		this.setState({jsonText: text, jsonErrors: '', record: null});
	}
	
	// a change event (keystroke/cut/paste/) in the Json box
	typeInJson(ev) {
		////console.log("json key stroke detected");
		
		// if the JSON is good, echo this over to the edit box
		try {
			//let goodJson = $('textarea.json-edit').val();
			var goodJson = ev.currentTarget.value;
			goodJson = JSON.parse(goodJson);
			$('div.json-errors').text('');
			theControlPanel.setCPRecord(goodJson);
		} catch (ex) {
			// don't update anything if a syntax error in the json (expected as the user types)
			var message = ex.message || ex;
			////console.warn("parse error parsing json: "+ message);
			$('div.json-errors').text(message);
			this.setBadState(goodJson, message);
			// no changes to theRecForm
		}
		userChangedRecord();
	}

	render() {
		////console.log("render JsonRec");
		
		// if jsonText is there, it's the true text, otherwise use whatever record we have
		let text = this.state.jsonText || stringifyJson(this.state.record);
		////console.log(`Text is '${text}', cuz `+ (this.state.jsonText ? 'uncompiled test' : 'compiled object'));
		return <section className='edit-col' >
			<textarea className="json-edit" onChange={this.typeInJson} 
						value={text}>
			</textarea>
			<div className='json-errors'></div>
		</section>;
	}
}

/********************************************************************** button-area */
// Save and reset buttons and some others i guess

//export var theButtonArea;

export class ButtonArea extends Component {
	constructor(props) {
		super(props);
		this.state = {changed: false, };
		this.saveHandler = this.saveHandler.bind(this);
		this.resetHandler = this.resetHandler.bind(this);
		//theButtonArea = this;
	}
	
	render() {
		////console.log("render ButtonArea");
		return <section className='button-area' >
			<div style={{height: '2em'}}> </div>
			<button type='button' className='save-button' onClick={this.saveHandler}>
				Save
			</button>
			<div style={{height: '2em'}}> </div>
			<button type='button' className='reset-button' onClick={this.resetHandler}>
				Reset
			</button>
			<div style={{height: '2em'}}> </div>
			<button type='button' className='plus-button' onClick={this.plusHandler}>
				+
			</button>
			<div style={{height: '2em'}}> </div>
			<button type='button' className='add-button' onClick={this.addHandler}>
				Add
			</button>
		</section>;
	}
	
	// a click event on Save, save existing rec
	saveHandler(ev) {
		////console.log("saveHandler starting...");
		
		// update
		var rec = theRecForm.state.record;
		var buttonArea = this;
		putOne(rec, function(result, statusCode) {
			////console.log("...saveHandler done");
			if (result == 'success') {
				cleanChanges();
				
				// keep the array object in place
				// copy fields over remembering to remove fields that are absent
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

	// a click event on Reset
	resetHandler(ev) {
		////console.log("resetHandler starting...");
		
		// all we have to do is return the two edit widgets to the original
		cleanChanges();
		//setSelectedRecord(originalBeforeChanges);
	}

	// a click event on + button to create a new rec
	plusHandler(ev) {
		////console.log("plusHandler starting...");
		
		// empty blanks
		cleanChanges();
		
		theControlPanel.setAdd();
		//setSelectedRecord(-1, {});
		
		theScrapeDrawer.setState({display: 'block'});
	}

	// a click event on Add to save a new rec
	addHandler(ev) {
		////console.log("addHandler starting...");
		
		// create
		var rec = theRecForm.state.record;
		var buttonArea = this;
		postOne(rec, function(result, statusCode) {
			////console.log("...saveHandler done");
			if (result == 'success') {
				cleanChanges();
				
				allSummaries.push(rec);
				////theGlobal
				
				//setSelectedRecord(originalBeforeChanges);
				theScrapeDrawer.setState({display: 'none'});
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
export var originalBeforeChanges = null;  // save this for Reset

// sets the existing rec passed in as the state record for the control panel.
// rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
// Use SummaryRec.select() to select and hilite it with full UI stuff
export function setSelectedRecord(serial, rec) {
	if (didChange)
		throw "Cannot set new selection while old one has changes";

	// someone new
	originalBeforeChanges = rec;  // this is in the big record list

	selectedRecord = _.clone(rec);  // this gets changed during editing
	selectedSerial = serial;
	window.selectedRecord = selectedRecord;  // so i can get at it in the debugger

	// this should set the state of both components and show the info
	theControlPanel.setView(selectedRecord);
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

/********************************************************************** Scraping */


// scan the text for the regex.  If found, call the handler with the 
// regex match object for EACH match.  Regex should have g flag if you want multiple hits.
function tryOneTidbit(regex, text, handler) {
	regex.lastIndex = 0;
	var m;
	while (m = regex.exec(text)) {
		handler(m);
		//console.log("match object:", m);
	}
}

var matchesPhoneNumber = /\s*\(?\d\d\d[-) ._]{1,2}\d\d\d[- ._]\d\d\d\d/;
var matchesEmail = /^[-.\w]+@[-.\w]+$/;

function scanOneInput(text) {
	////console.log();
	let recruiterBuild = {};  // collects the answers
	
	tryOneTidbit(/(Office|P|Phone|T)[: ] ?([-\d() .]+)/ig, text, function(m) {
		if (matchesPhoneNumber.test(m[2]))
			recruiterBuild.recruiter_phone = m[2];
	});
	tryOneTidbit(/(M|cell|mobile)[: ] ?([-\d() .]+)/ig, text, function(m) {
		if (matchesPhoneNumber.test(m[2]))
			recruiterBuild.recruiter_cell = m[2];
	});
	tryOneTidbit(/(F|fax)[: ] ?([-\d() .]+)/ig, text, function(m) {
		if (matchesPhoneNumber.test(m[2]))
			recruiterBuild.recruiter_fax = m[2];
	});
	
	tryOneTidbit(/Phone \| ([-\d() .]+)/ig, text, function(m) {
		if (matchesPhoneNumber.test(m[1]))
			recruiterBuild.recruiter_phone = m[1];
	});
	tryOneTidbit(/Fax \| ([-\d() .]+)/ig, text, function(m) {
		if (matchesPhoneNumber.test(m[1]))
			recruiterBuild.recruiter_fax = m[1];
	});
	
	tryOneTidbit(/([-\w ,.]+) <([-\w@.]+)>/ig, text, function(m) {
		if (matchesEmail.test(m[2])) {
			recruiterBuild.recruiter_name = m[1];
			recruiterBuild.recruiter_email = m[2];
		}
	});
	
	return recruiterBuild;  // always an object but might be empty
}


/********************************************************************** ScrapeDrawer */
// paste in stuff to set fields

export var theScrapeDrawer;

export class ScrapeDrawer extends Component {
	constructor(props) {
		super(props);
		this.state = {display: 'none'};
		theScrapeDrawer = this;
	}
	
	render() {
		////console.log("render ScrapeDrawer");
		return <section className='scrape-drawer' style={{display: this.state.display}}>
			scrape pit.  paste clues here.<br/>
			<textarea className='scrape-pit' cols='50' rows='10' onChange={this.scrapeHandler}>
			</textarea>
		</section>;
	}
	
	// called upon every change to the scrape pit.  Scrapes and squirts it into the control panel.  Not that useful after recruiter is entered.
	scrapeHandler() {
		////console.log("saveHandler starting...");
		// the text area is 'uncontrolled'
		let clueText = $('section.scrape-drawer textarea.scrape-pit').val();
		let fields = scanOneInput(clueText);
		////console.log("scraping results:");
		////console.log(JSON.stringify(fields, undefined, '\t'));
		
		// now try to jam it into the rest of the panes
		theControlPanel.setCPRecord(fields);
	}
	
	// a click event on Save, to save newly created rec
	confirmHandler(ev) {
		////console.log("saveHandler starting...");
		
		// update
		var rec = theRecForm.state.record;
		var buttonArea = this;
		postOne(rec, function(result, statusCode) {
			////console.log("...saveHandler done");
			if (result == 'success') {
				cleanChanges();
				
				// keep the array object in place
				// copy fields over remembering to remove fields that are absent
				Object.assign(originalBeforeChanges, rec);
				for (var j in originalBeforeChanges) {
					if (! rec[j])
						delete originalBeforeChanges[j]
				}
				
				allSummaries[selectedSerial].setState({record: originalBeforeChanges});
				
				//setSelectedRecord(originalBeforeChanges);
			}
		});
	}

}

// start editing a new blank record.  Called when user clicks New Rec.
export function startNewRec() {
	cleanChanges();
	
	theControlPanel.setAdd();
	//setSelectedRecord(-1, {});
	
	theScrapeDrawer.setState({display: 'block'});
}

