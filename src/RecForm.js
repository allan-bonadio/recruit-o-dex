/* Recruiter form pane */
import React, { Component } from 'react';
import _ from "lodash";
import {theControlPanel, userChangedRecord} from './ControlPanel';
import {EventTable} from './EventTable';

export var theRecForm;

// a function-based component: just renders a text field and its label
function RecField(props) {
	let fieldname = props.fieldname;
	let dval = props.rec[fieldname] || '';
	//console.log(":: field %s depicted with value %s", fieldname, dval);
	
	// form the <input or <textarea
	let entryElement;
	if (props.element != 'textarea')  // eslint-disable-line
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
					agency:'',  company_name:'',  job_desc_url: '', status: 'active',  notes:''}, display: 'none'};
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
	// (not DOM events but job interview events)
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
			<RecField rec={rec} label='jd url:' fieldname='job_desc_url' />
			<RecField rec={rec} label='status:' fieldname='status' />
			
			<RecField rec={rec} label='notes:' fieldname='notes' element='textarea' />
			
			<EventTable events={rec.events} changeEvents={this.changeEvents} />
		</section>;
	}
	
	componentDidCatch(error, info) {
		console.error("componentDidCatch(%o, %o)", error, info);
	}

	
}

