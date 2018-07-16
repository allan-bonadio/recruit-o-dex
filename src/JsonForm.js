/*json-entry pane */

import React, { Component } from 'react';
import $ from "jquery";
import {connect} from 'react-redux';

////import {userChangedRecord} from './ControlPanel';
//import {theRecForm} from './RecForm';
import {rxStore} from './Reducer';


// format this object as json, but instead of total tightness, try to indent it nicely
export function stringifyJson(obj) {
	let jsonText = JSON.stringify(obj, null, '\t');
	return jsonText;
}

export var theJsonForm;

// raw JSON, editable
class JsonForm extends Component {
	constructor(props) {
		super(props);
		
		// the state is the whole record, plus the field jsonText.
		// In states where the user's text doesn't parse, set jsonText to the text.
		// that signals unparsable json and um something happens after...
		////this.state = {jsonText: null, jsonErrors: '', record: {}};
		this.typeInJson = this.typeInJson.bind(this);
		theJsonForm = this;
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
		let goodJson, goodTree;
		
		// if the JSON is good, echo this over to the edit box
		try {
			//let goodJson = $('textarea.json-edit').val();
			goodJson = ev.currentTarget.value;
			
			// try parsing, and turn off the error message if it's good
			goodTree = JSON.parse(goodJson);
			$('div.json-errors').text('');
			////theControlPanel.setCPRecord(goodJson);
			
			// now change the whole value of the record tree
			rxStore.dispatch({type: 'CHANGE_TO_RECORD', 
					fieldName: 'tree', newValue: goodTree});
		} catch (ex) {
			// don't update anything if a syntax error in the json (expected as the user types)
			// so the text is transitional but becomes part of the state anyway
			var message = ex.message || ex;
			console.warn("parse error parsing json: "+ message);
			
			// figure out how to do this thru react someday
			$('div.json-errors').text(message);
			////this.setBadState(goodJson, message);
			
			// some special treatment, save the malformed text instead of the tree
			rxStore.dispatch({type: 'CHANGE_TO_RECORD', 
					fieldName: 'json', newValue: goodJson, 
					errorMessage: message});
			// no changes to theRecForm
		}
////		userChangedRecord();
	}

	render() {
		////console.log("render JsonForm");
		
		// if jsonText is there, it's the true text, otherwise use whatever record we have
		let text = rxStore.getState().jsonText || stringifyJson(rxStore.getState().record);
		////console.log(`Text is '${text}', cuz `+ (this.state.jsonText ? 'uncompiled test' : 'compiled object'));
		return <section className='edit-col' >
			<textarea className="json-edit" onChange={this.typeInJson} 
						value={text}>
			</textarea>
			<div className='json-errors'></div>
		</section>;
	}
}

function mapStateToProps(state) {
	return {record: state.selection.selectedRecord};
}

export default connect(mapStateToProps)(JsonForm);
