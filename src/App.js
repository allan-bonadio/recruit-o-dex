import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Model from './Model';
import $ from "jquery";
import _ from "lodash";




// let curRecruiter = {
// 	// just for testing
// 	"_id" : "59c1410e23f647bb25a33d6d",	  // ObjectId("59c1410e23f647bb25a33d6d"),
// 	"recruiter_name" : "David Sibrian",
// 	"recruiter_email" : "dsibrian@jivaroinc.com",
// 	"recruiter_phone" : "(408) 733-5082",
// 	"recruiter_cell" : "",
// 	"agency" : "Jivaro",
// 	"company_name" : "SixUp",
// 	"first_contact" : "9/18/17",
// 	"status" : "active",
// 	"notes" : " don't know co name."
// };
// 
// 

class App extends Component {
	render() {
		return (
			<div className="App">
				<header className="App-header" style={{display: 'none'}}>
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<Main></Main>
				<CrudCurtain></CrudCurtain>
			</div>
		);
	}
}
export default App;


let MainInstance;

class Main extends Component {
	constructor() {
		super();
		MainInstance = this;
		this.mouseDown = this.mouseDown.bind(this);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		this.cPanelX = 100;
		this.cPanelY = 200;
	}
	
	render() {
		return <div>
			<div id="control-panel" onMouseDown={this.mouseDown} >
				<RecForm></RecForm>
				<JsonRec></JsonRec>
				<ButtonArea></ButtonArea>
			</div>
			<GlobalList></GlobalList>
		</div>;
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
	
	mouseMove(ev) {
		this.cPanelX += ev.clientX - this.lastX;
		this.cPanelY += ev.clientY - this.lastY;

		$('#control-panel').css({left: this.cPanelX + 'px', top: this.cPanelY + 'px'})

		// ready for next nudge
		this.lastX = ev.clientX;
		this.lastY = ev.clientY;
	}
	
	mouseUp(ev) {
		this.mouseMove(ev);
		
		// turn off event handlers and that'll disable dragging.  That's all, no cleanup needed.
		$(document.body).off('mousemove', this.mouseMove).off('mouseup mouseleave', this.mouseUp);
	}

}


/********************************************************************** Recruiter form pane */

var theRecForm;

// a small table of recruiter info, fixed field names
class RecForm extends Component {
	constructor(props) {
		super(props);
		this.state = {record: {recruiter_name:'',  recruiter_email:'',  recruiter_phone:'',  
					agency:'',  company_name:'',  status:'',  notes:''}};
		this.typeInBlank = this.typeInBlank.bind(this);
		window.theRecForm = this;
		theRecForm = this;
	}
	
	// keystroke handler - for all the text boxes in the form
	typeInBlank(ev) {
		console.log("form key stroke detected");
		
		// appends or replaces one field only
		var rec = Object.assign({}, this.state.record, {[ev.target.name]: ev.target.value});
		this.setRecordState(rec);
		
		theJsonRec.setRecordState(rec);
		userChangedRecord();
	}

	// set this to have the tree passed in as state
	setRecordState(tree) {
		this.setState({record: tree}, function() {
			console.log("Statae now is ", theRecForm.state);
		});
	}
	
	render() {
		console.log("render RecForm");
		var rec = this.state.record;
		return <section className='edit-col edit-form' >
			<label className="edit-label">Recruiter:</label>
			<div className="edit-blank recruiter_name">
				<input value={rec.recruiter_name || ''} name="recruiter_name" onChange={this.typeInBlank} />
			</div>
			
			<label className="edit-label">email:</label>
			<div className="edit-blank recruiter_email">
				<input value={rec.recruiter_email || ''} name="recruiter_email" onChange={this.typeInBlank} />
			</div>
			
			<label className="edit-label">phone:</label>
			<div className="edit-blank recruiter_phone">
				<input value={rec.recruiter_phone || ''} name="recruiter_phone" onChange={this.typeInBlank} />
			</div>
			
			<label className="edit-label">agency:</label>
			<div className="edit-blank agency">
				<input value={rec.agency || ''} name="agency" onChange={this.typeInBlank} />
			</div>

			<label className="edit-label">company:</label>
			<div className="edit-blank company_name">
				<input value={rec.company_name || ''} name="company_name" onChange={this.typeInBlank} />
			</div>
			
			<label className="edit-label">status:</label>
			<div className="edit-blank status">
				<input value={rec.status || ''} name="status" onChange={this.typeInBlank} />
			</div>
			
			<label className="edit-label">notes:</label>
			<div className="edit-blank notes">
				<textarea value={rec.notes || ''} name="notes" onChange={this.typeInBlank} ></textarea>
			</div>
		</section>;
	}
	
	componentDidCatch(error, info) {
		console.error("componentDidCatch(%o, %o)", error, info);
	}

	
}



/********************************************************************** json pane */

var theJsonRec;


// format this object as json, but instead of total tightness, try to indent it nicely
function stringifyJson(obj) {
	let jsonText = JSON.stringify(obj)
		.replace(/,"/g, ',\n\t"')
		.replace(/\{"/g, '{\n\t"')
		.replace(/\}$/, '\n}');
	return jsonText;
}


// raw JSON, editable
class JsonRec extends Component {
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
		console.log("json key stroke detected");
		
		// if the JSON is good, echo this over to the edit box
		try {
			//let goodJson = $('textarea.json-edit').val();
			var goodJson = ev.currentTarget.value;
			goodJson = JSON.parse(goodJson);
			$('div.json-errors').text('');
			this.setRecordState(goodJson);
			theRecForm.setState(goodJson);
		} catch (ex) {
			// don't update anything if a syntax error in the json (expected as the user types)
			var message = ex.message || ex;
			console.warn("parse error parsing json: "+ message);
			$('div.json-errors').text(message);
			this.setBadState(goodJson, message);
			// no changes to theRecForm
		}
		userChangedRecord();
	}

	render() {
		console.log("render JsonRec");
		
		// if jsonText is there, it's the true text, otherwise use whatever record we have
		let text = this.state.jsonText || stringifyJson(this.state.record);
		console.log(`Text is '${text}', cuz `+ (this.state.jsonText ? 'uncompiled test' : 'compiled object'));
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

var theButtonArea;

class ButtonArea extends Component {
	constructor(props) {
		super(props);
		this.state = {changed: false, };
		this.saveHandler = this.saveHandler.bind(this);
		this.resetHandler = this.resetHandler.bind(this);
		theButtonArea = this;
	}
	
	render() {
		console.log("render ButtonArea");
		return <section className='button-area' >
			<div style={{height: '3em'}}> </div>
			<button type='button' className='save-button' onClick={this.saveHandler}>
				Save
			</button>
			<div style={{height: '3em'}}> </div>
			<button type='button' className='reset-button' onClick={this.resetHandler}>
				Reset
			</button>
		</section>;
	}
	
	// a click event on Save
	saveHandler(ev) {
		console.log("saveHandler starting...");
		
		// are you sure these two are equal?
		for (var k in theRecForm.state.record) {
			if (theRecForm.state.record[k] != theJsonRec.state.record[k])
				console.error("%s was different", k);
		}

		
		Model.putOne(theRecForm.state.record, function() {
			console.log("...saveHandler done");
			debugger;
		});
	}

	// a click event on Reset
	resetHandler(ev) {
		console.log("resetHandler starting...");
		
		// all we have to do is return the two edit widgets to the original
		crudCurtain.hide();
		didChange = false;
		setSelectedRecord(originalBeforeChanges);
	}
}


/********************************************************************** crud & curtain */

let crudCurtain = null;

class CrudCurtain extends Component {
	constructor() {
		super();
		this.state = {display: 'none'};
		crudCurtain = this;
	}
	
	render() {
		return <div className='crudCurtain' style={this.state}></div>;
	}
	
	show() { this.setState({display: 'block'}) }
	hide() { this.setState({display: 'none'}) }
}




var selectedRecord = null;  // null if no selection
let didChange = false;  // and should be saved
let originalBeforeChanges = null;  // save this for Reset

// sets the rec passed in as the "this" record for the control panel.
// rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
// This funciton sets internal vars and populates text blanks. 
// Use SummaryRec.select() to select and hilite it with full UI stuff
function setSelectedRecord(rec) {
	if (didChange)
		throw "Cannot set new selection while old one has changes";
	if (selectedRecord === rec)
		return;  // huh?  selectedRecord is always a clone

	// someone new
	originalBeforeChanges = rec;  // this is in the big record list

	selectedRecord = _.clone(rec);  // this gets changed during editing
	window.selectedRecord = selectedRecord;  // so i can get at it in the debugger

	// this should set the state of both components and show the info
	theRecForm.setRecordState(selectedRecord);
	theJsonRec.setRecordState(selectedRecord);
}

// call when the user has made a change, probably typing or backspacing.
// ok to call every time.
// make sure user doesn't forget about it
function userChangedRecord() {
	if (didChange) return;
	
	crudCurtain.show();
	didChange = true;
}


/********************************************************************** Global List */

// each recruiter/job in the Global List
class SummaryRec extends Component {
	constructor(props) {
		super(props);
		this.state = {serial: props.serial, record: props.record};
// 		eslint-disable-next-line
// 		this.state.serial = props.serial;
// 		eslint-disable-next-line
// 		this.state.record = props.record;
	}
	
	
	render() {
		console.log("render SummaryRec");

		if (! this.state) {
			// state not set yet
			return "Please wait...";
		}
		
		var summary = this;
		function clickHandler(ev) {
			var node = ev.currentTarget;
			var serial = node.getAttribute('serial');
			let record = Model.getBySerial(serial);
			summary.select(node, record);
		}
		
		// for each field, make a <div with the current value in it
		// note crashes if no state
		let sr = this;
		let Field = (props) => <div className={'summary-field '+ props.name}>{sr.state.record[props.name]}</div>;

		return <section className='summary' onClick={clickHandler} serial={this.state.serial}>
			<Field name='company_name' />
			<Field name='recruiter_name' />
			<br clear="left" />
			
			<Field name='recruiter_email' />
			<Field name='recruiter_phone' />
			<Field name='agency' />

			<Field name='status' />
			<Field name='notes' />
		</section>;
	}
	
	// select this record and populate the edit and json boxes
	select(node, record) {
		$('div.App section.summary').removeClass('selected');
		$(node).addClass('selected');
		setSelectedRecord(record);
	}
}

// list of all recruiters, for click selecting
class GlobalList extends Component {
	render() {
		console.log("render GlobalList");
		return  Model.allRecruiters.map(function(rec, ix) {
			return <SummaryRec key={ix.toString()} serial={ix} record={rec}></SummaryRec>;
		});
	}
}




