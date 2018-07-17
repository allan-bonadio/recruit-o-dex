import React, { Component } from 'react';
import {connect} from 'react-redux';
import $ from "jquery";
import _ from "lodash";

//import {theControlPanel} from './ControlPanel';
//import {theRecForm} from './RecForm';
////import {store} from './App';

/********************************************************************** Scraping */
// Scan the scrape pit for specific patterns

// scan the text for the regex.  If found, call the handler with the 
// regex match object for EACH match.  Regex should have g flag if you want multiple hits.
function tryOneTidbit(regex, text, handler) {
	regex.lastIndex = 0;
	var m;
	while (m = regex.exec(text)) {  // eslint-disable-line
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
		theScrapeDrawer = this;
		this.scrapeHandler = this.scrapeHandler.bind(this);
	}
	
	render() {
		////console.log("render ScrapeDrawer");
		return <section className='scrape-drawer' 
					style={{display: this.props.selectedSerial < 0 ? 'display' : 'none'}}>
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
		
		// for each field being changed, modify the rec for it and dispatch the cmd
debugger;////
		var rec = _.cloneDeep(this.props.selectedRecord);
		for (let f in fields) {
			var val = fields[f];
			
			// don't bother to do an official change unless it's really different
			if (rec[f] !== val) {
				rec[f] = val;
				this.props.dispatch({type: 'CHANGE_TO_RECORD', fieldName: f, newValue: val});
			}
		}

// 
// 		// now try to jam it into the rest of the panes, keeping previous data
// 		fields = Object.assign({}, theRecForm.state.record, fields)
// 		theControlPanel.setCPRecord(fields);
	}
	
// 	a click event on Save, to save newly created rec
// 	confirmHandler(ev) {
// 		//console.log("saveHandler starting...");
// 		
// 		update
// 		var rec = theRecForm.state.record;
// 		postOne(rec, function(result, statusCode) {
// 			//console.log("...saveHandler done");
// 			if (result == 'success') {  // eslint-disable-line
// 				cleanChanges(state);
// 				
// 				keep the array object in place
// 				copy fields over remembering to remove fields that are absent
// 				let sel = store.getState().selection;
// 				Object.assign(sel.originalBeforeChanges, rec);
// 				for (var j in sel.originalBeforeChanges) {
// 					if (! rec[j])
// 						delete sel.originalBeforeChanges[j]
// 				}
// 				
// 				allSummaryRecs[sel.selectedSerial].setState({record: sel.originalBeforeChanges});
// 				
// 				editRecord(originalBeforeChanges);
// 			}
// 		});
// 	}

}

function mapStateToProps(state) {
	return state.selection;  // i don't think i really use these props
}

export default connect(mapStateToProps)(ScrapeDrawer);

