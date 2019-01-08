import React, { Component } from 'react';
import {connect} from 'react-redux';
import $ from "jquery";
import _ from "lodash";

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

var matchesPhoneNumber = /\s*\(?\d\d\d[-) ._]{1,2}\d\d\d[- ._]\d\d\d\d([ Eext.]+\d+)?/;
var matchesEmail = /^[-.\w]+@[-.\w]+$/;

export function scanOneInput(text) {
	////console.log();
	let recruiterBuild = {};  // collects the answers
	
	// various phone nums with prefix
	tryOneTidbit(/(Office|P|Phone|T)[: ] ?([-\d() .]+)/ig, text, function(m) {
		if (matchesPhoneNumber.test(m[2]))
			recruiterBuild.recruiter_phone = m[2];
	});
	tryOneTidbit(/(M|cell|mobile)[: ] ?([-\d() .]+)/ig, text, function(m) {
		if (matchesPhoneNumber.test(m[2])) {
			if (recruiterBuild.recruiter_phone)
				recruiterBuild.recruiter_cell = m[2];  // only if there's already a phone
			else
				recruiterBuild.recruiter_phone = m[2];
		}
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
	
	// if we don't yet have a phone number, try harder to just recognize a phone with a looser RE
	if (! recruiterBuild.recruiter_phone) {
		// look for pattern 3digits 3digits 4digits, with anything in between, maybe with an extension
		tryOneTidbit(/(\d\d\d).{1,3}(\d\d\d).(\d\d\d\d)\s*([ Eext.]+\d+)/ig, text, function(m) {
			recruiterBuild.recruiter_phone = `(${m[1]}) ${m[2]} ${m[3]} ${m[4]}`;
		});
	}

	// take apart an email address of the form ` "My Name" (myname@wherever)`
	tryOneTidbit(/"?([-\w ,.()]+)"? <([-\w+@.]+)>/gi, text, function(m) {
		if (matchesEmail.test(m[2])) {
			recruiterBuild.recruiter_name = m[1];
			recruiterBuild.recruiter_email = m[2];
		}
	});
	
	return recruiterBuild;  // always an object but might be empty
}


/********************************************************************** ScrapeDrawer */
// paste in stuff to set fields

export class ScrapeDrawer extends Component {
	constructor(props) {
		super(props);
		ScrapeDrawer.me = this;
		this.scrapeHandler = this.scrapeHandler.bind(this);
	}
	
	// set to true to make it act open in unit tests (if props.controlPanel true)
	static mockOpen(op) {
		ScrapeDrawer.forceOpen = op;
	}
	
	render() {
		let sdo = this.props.controlPanel
			? this.props.controlPanel.scrapeDrawerOpen
			: ScrapeDrawer.forceOpen;  // during unit tests
		
		////console.log("render ScrapeDrawer");
		return <section className='scrape-drawer' >
			<span onClick={ScrapeDrawer.clickToggleOpen} >
				{sdo ? '▾' : '▸'} <b>Scrape Pit</b>  paste clues here
			</span> 
			<br/>
			<textarea className='scrape-pit' cols='50' rows='10' onChange={this.scrapeHandler}
					style={{display: sdo ? 'block' : 'none'}}>
			</textarea>
		</section>;
	}
	
	// action handler to actually do the toggle upon click
	static setScrapeDrawerOpen(controlPanel, action) {
		controlPanel = {...controlPanel,
			scrapeDrawerOpen: action.open,
		};
		return controlPanel;
	}
	
	static clickToggleOpen(ev) {
		ScrapeDrawer.me.props.dispatch({
			type: 'SET_SCRAPE_DRAWER_OPEN', 
			open: !ScrapeDrawer.me.props.scrapeDrawerOpen,
		});
	}
	
	// called upon every change to the scrape pit.  Scrapes and squirts it into the control panel.  
	// Not that useful after recruiter is entered.
	scrapeHandler(ev) {
		////console.log("saveHandler starting...");
		// the text area is 'uncontrolled'
		let clueText = $('section.scrape-drawer textarea.scrape-pit').val();
		let fields = scanOneInput(clueText);
		////console.log("scraping results:");
		////console.log(JSON.stringify(fields, undefined, '\t'));
		
		// for each field being changed, modify the rec for it and dispatch the cmd   debugger;////
		var rec = _.cloneDeep(this.props.editingRecord);
		for (let f in fields) {
			var val = fields[f];
			
			// don't bother to do an official change unless it's really different
			if (rec[f] !== val) {
				rec[f] = val;
				this.props.dispatch({type: 'CHANGE_TO_RECORD', fieldName: f, newValue: val});
			}
		}
	}
	

}

function mapStateToProps(state) {
	console.info("MS2P crud curtain");
	////console.info('mstp SD state: ', state);
	return {
		editingRecord: state.controlPanel.editingRecord,
		controlPanel: state.controlPanel,  // includes scrapeDrawerOpen
	};
}

export default connect(mapStateToProps)(ScrapeDrawer);

