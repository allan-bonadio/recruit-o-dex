/*
** JsonForm -- json-entry pane
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
//import $ from "jquery";
import {connect} from 'react-redux';

import {rxStore} from '../reducer';


// format this object as json, but instead of total tightness, try to indent it nicely
export function stringifyJson(obj) {
	let jsonText = JSON.stringify(obj, null, '\t');
	return jsonText;
}

const IN_JSON_RE = /in JSON at position (\d+)/;

// raw JSON, editable
export class JsonForm extends Component {
	constructor(props) {
		super(props);
		////console.log('JsonForm cons this.props', props);////

		// the state is the whole record, plus the field jsonText.
		// In states where the user's text doesn't parse, set jsonText to the text.
		// that signals unparsable json and um something happens after...
		////this.state = {jsonText: null, jsonErrors: '', record: {}};

		this.typeInJson = this.typeInJson.bind(this);
		JsonForm.me = this;
console.info('constructed JsonForm');
	}

	// a change event (keystroke/cut/paste/etc) in the Json box
	typeInJson(ev) {
		////console.log("json key stroke detected");
		let goodJson, goodTree;

		// if the JSON is good, echo this over to the edit box
		try {
			//let goodJson = $('textarea.json-edit').val();
			goodJson = ev.currentTarget.value;

			// try parsing, and turn off the error message if it's good
			goodTree = JSON.parse(goodJson);
			//$('div.json-errors').text('');
			////theControlPanel.setCPRecord(goodJson);

			// now change the whole value of the record tree
			rxStore.dispatch({type: 'CHANGE_TO_JSON', newRecord: goodTree});
		} catch (ex) {
			// don't update anything if a syntax error in the json (expected as the user types)
			// so the text is transitional but becomes part of the state anyway
			var message = ex.message || ex;
			console.warn("parse error parsing json: "+ message);

			// wait make a nice context that shows where the error is
			let m = message.match(IN_JSON_RE);
			if (m) {
				let pos = +m[1];

				let beforePos = pos - 10;
				let before = goodJson.substring(beforePos, pos);
				if (beforePos > 0)
					before = '...'+ before;

				let afterPos = pos + 10;
				let after = goodJson.substring(pos, afterPos);
				if (afterPos < goodJson.length)
					after += '...';

				message = message.replace(IN_JSON_RE, before +'▼'+ after);
			}

			// figure out how to do this thru react someday
			//$('div.json-errors').text(message);
			////this.setBadState(goodJson, message);

			// some special treatment, save the malformed text instead of the tree
			rxStore.dispatch({type: 'CHANGE_TO_JSON', newJson: goodJson, errorMessage: message});
		}
	}

	// action handler for a keystroke in the json box
	static changeToJson(controlPanel, action) {
		////state = _.cloneDeep(state);
		if (action.newRecord) {
			// good json parsed to tree, replace record
			return {
				...controlPanel,
				editingRecord: action.newRecord,
				jsonText: null,
				errorMessage: null,
			};
		}
		else {
			// json that flunked the parser.   Don't touch the record, just these others.
				// leave the selection as-is, record doesn't change
			return {
				...controlPanel,
				jsonText: action.newJson,
				errorMessage: action.errorMessage,
			};
		}
	}

	render() {
		//console.info('rendering JsonForm');
		// if jsonText is there, it's the true text, otherwise use whatever record we have
		////console.log('jf render this.props', this.props);////
		let text = this.props.controlPanel.jsonText || stringifyJson(this.props.controlPanel.editingRecord);

		////rxStore.getState().jsonText || rxStore.getState().record);
		////console.log(`Text is '${text}', cuz `+ (this.state.jsonText ? 'uncompiled test' : 'compiled object'));
		return <section className='edit-col' >
			<textarea className="json-edit" onChange={this.typeInJson}
						value={text}>
			</textarea>
			<div className='json-errors'>{this.props.controlPanel.errorMessage}</div>
		</section>;
	}
}

function mapStateToProps(state) {
	//console.info("MS2P json form");
	return {controlPanel: state.controlPanel, };
}

export default connect(mapStateToProps)(JsonForm);
