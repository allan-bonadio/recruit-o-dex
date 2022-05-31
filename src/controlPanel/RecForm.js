/*
** RecForm -- Recruiter form, misc fields
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/
/* eslint-disable eqeqeq, default-case */

import React, {Component} from 'react';
import {connect} from 'react-redux';

////import {userChangedRecord} from './ControlPanel';
import {Engagements} from './Engagements';
import {rxStore} from '../reducer';


// a function-based component: just renders a text field and its label
function RecField(props) {
	//console.info('executing RecField');
	let fieldName = props.fieldName;
	let dval = props.rec[fieldName] || '';
	let placeholder = props.placeholder;
	//console.log(":: field %s depicted with value %s", fieldName, dval);

	// form the <input or <textarea.  Keystroke handler in RecForm, not here.
	let entryElement;
	if (props.element != 'textarea')  // eslint-disable-line
		entryElement = <input value={dval} name={fieldName} onChange={() => {}} placeholder={placeholder} />;
	else
		entryElement = <textarea value={dval} name={fieldName} onChange={() => {}} placeholder={placeholder}  />;

	return <div key={fieldName}>
		<label className="edit-label">{props.label}</label>
		<div className={'edit-blank '+ fieldName}>
			{entryElement}
		</div>
		<br clear='left' />
	</div>;
}


// a small table of recruiter info, fixed field names
export class RecForm extends Component {
	constructor(props) {
		super(props);
// 		this.state = {record: {recruiter_name:'',  recruiter_email:'',  recruiter_phone:'',
// 					agency:'',  company_name:'',  job_desc_url: '', status: 'active',  notes:''},
// 					display: 'none'};
		this.typeInBlank = this.typeInBlank.bind(this);
//		this.changeEngagements = this.changeEngagements.bind(this);
		window.recForm = this;
		RecForm.me = this;  // for singleton objects only
console.info('constructed RecForm');
	}

	// render the form with all the blanks and data populated in them
	render() {
		//console.info('rendering RecForm');
		////redux let rec = this.state.record;
		////console.log('this.props', this.props);////
		let s = this.props;
		let rec = s.editingRecord;
		if (! rec)
			return [];

		return <section className='edit-col edit-form' onChange={this.typeInBlank}>

			<RecField rec={rec} label='Recruiter:' fieldName='recruiter_name' placeholder='Ashish' />
			<RecField rec={rec} label='email:' fieldName='recruiter_email' placeholder='t@t.tt' />
			<RecField rec={rec} label='phone:' fieldName='recruiter_phone' placeholder='111-111-1111' />
			<RecField rec={rec} label='agency:' fieldName='agency'  />
			<div style={{height: '10px'}} />
			<RecField rec={rec} label='company:' fieldName='company_name'  />
			<RecField rec={rec} label='status:' fieldName='status' />
			<RecField rec={rec} label='JD:' fieldName='job_desc_url' element='textarea' placeholder='whole job description' />
			<RecField rec={rec} label='notes:' fieldName='notes' element='textarea' placeholder='where, and what they do' />

			<Engagements engagements={rec.engagements || rec.events}
						dispatch={this.props.dispatch}
						rec={rec}
						 />
		</section>;
	}

	componentDidCatch(error, info) {
		console.error("componentDidCatch(%o, %o)", error, info);
	}

	// keystroke handler - for all the text boxes in the form.  Also gets paste, etc
	typeInBlank(ev) {
		var targ = ev.target;

		// special: take apart an email with name of the form ` "My Name" <myname@wherever.what>`
		// If such a string is pasted into recruiter name/email, parse and fill in both
		// optional quote, grouped name chars, optional quote, <, grouped email, >
		let m = /"?([-\w ,.()]+)"? <([-\w+@.]+)>/i.exec(targ.value);
		if ((targ.name == 'recruiter_name' || targ.name == 'recruiter_email') && m) {
			rxStore.dispatch({type: 'CHANGE_TO_RECORD', fieldName: 'recruiter_name', newValue: m[1]});
			rxStore.dispatch({type: 'CHANGE_TO_RECORD', fieldName: 'recruiter_email', newValue: m[2]});
			return;
		}

		// normal change to some record
		rxStore.dispatch({type: 'CHANGE_TO_RECORD',
				fieldName: targ.name, newValue: targ.value});
	}

	static changeToRecord(controlPanel, action) {
		// action.fieldName and .newValue tells you what changed,
		controlPanel = {...controlPanel,
			editingRecord: {...controlPanel.editingRecord,
				[action.fieldName]: action.newValue}};
		return controlPanel;
	}
}

function mapStateToProps(state) {
	//console.info("MS2P rec form");
	return state.controlPanel;
}

export default connect(mapStateToProps)(RecForm);
