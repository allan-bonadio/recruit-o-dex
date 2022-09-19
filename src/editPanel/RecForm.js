/*
** RecForm -- Recruiter form, misc fields
**
** Copyright (C) 2017-2022 Allan Bonadio   All Rights Reserved
*/
/* eslint-disable eqeqeq, default-case */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

////import {userChangedRecord} from './EditPanel';
import RecField from './RecField';
import {Engagements} from './Engagements';
import {rxStore} from '../reducer';

//
// // a function-based component: just renders a text field and its label
// function RecField(props) {
// 	//console.info('executing RecField');
// 	let fieldName = props.fieldName;
// 	let dval = props.rec[fieldName] || '';
// 	let placeholder = props.placeholder;
// 	//console.log(":: field %s depicted with value %s", fieldName, dval);
//
// 	// form the <input or <textarea.  Keystroke handler in RecForm, not here.
// 	let entryElement;
// 	if (props.element != 'textarea')  // eslint-disable-line
// 		entryElement = <input value={dval} name={fieldName} onChange={() => {}} placeholder={placeholder} />;
// 	else
// 		entryElement = <textarea value={dval} name={fieldName} onChange={() => {}} placeholder={placeholder}  />;
//
// 	return <div key={fieldName}>
// 		<label className="edit-label">{props.label}</label>
// 		<div className={'edit-blank '+ fieldName}>
// 			{entryElement}
// 		</div>
// 		<br clear='left' />
// 	</div>;
// }


// a small table of recruiter info, fixed field names
export class RecForm extends Component {
	static propTypes = {
		rec: PropTypes.object,
	};

	static defaultProps = {
	};

	constructor(props) {
		super(props);
// 		this.state = {record: {recruiter_name:'',  recruiter_email:'',  recruiter_phone:'',
// 					agency:'',  company_name:'',  job_desc_url: '', status: 'active',  notes:''},
// 					display: 'none'};
		//this.typeInBlank = this.typeInBlank.bind(this);
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
		let p = this.props;
		let rec = p.rec;
		if (! rec)
			return [];

		return <section className='edit-col edit-form' onChange={this.typeInBlank} onBlur={this.deFocusBlank}>

			<RecField rec={rec} label='Recruiter:' fieldName='recruiter_name' placeholder='Ashish' />
			<RecField rec={rec} label='email:' fieldName='recruiter_email' placeholder='t@t.tt' />
			<RecField rec={rec} label='phone:' fieldName='recruiter_phone' placeholder='111-111-1111' />
			<RecField rec={rec} label='agency:' fieldName='agency'  />
			<div style={{height: '10px'}} />
			<RecField rec={rec} label='company:' fieldName='company_name'  />
			<RecField rec={rec} label='status:' fieldName='status' />

		</section>);
	}

	componentDidCatch(error, info) {
		console.error("componentDidCatch(%o, %o)", error, info);
	}

		// take apart an email with name of the form ` "My Name" <myname@wherever.what>`
		// If such a string is pasted into recruiter name or email, parse and fill in both
		// optional quote, grouped name chars, optional quote, <, grouped email, >
	gobbleNameEmail(tValue) {
		// matches 'Joe M. de Blow <joe-blow@wher.e-ver.what>' or
		// ' "Joe M. de Blow" <joe-blow@wher.e-ver.what>'
		let m = /"?([-\w ,.()]+)"? <([-\w+@.]+)>/i.exec(tValue);
		if (m) {
			let name = m[1];
			if (name.indexOf(',')) {
				name = name.replace(/^([-\w .()]+), ?([-\w .()]+)$/, '$2 $1');
			}
			let email = m[2];
			rxStore.dispatch({type: 'CHANGE_TO_RECORD', fieldName: 'recruiter_name',
				newValue: name});
			rxStore.dispatch({type: 'CHANGE_TO_RECORD', fieldName: 'recruiter_email',
				newValue: email});
			return true;
		}
		return false;
	}

	// see if user pasted in text with a phone number in it, if so, chop out everything
	// else and register the change
	gobblePhone(tValue) {
		// area code ... first three ... last 4 ... optional extension
		let ma = /\b(\d\d\d)\D{0,2}(\d\d\d)\D?(\d\d\d\d)(\D+(\d*))?/i.exec(tValue);
		if (ma) {
			console.info(`you got ma match length ${ma.length}: ‹${ma[1]}•${ma[2]}•${ma[3]}›‹${ma[4]}›‹${ma[5]}›‹${ma[6]}›`);
			let newVal = `${ma[1]}.${ma[2]}.${ma[3]}`;
			if (ma[5])
				newVal += ` x ${ma[5]}`;  // optional extension, any numbers of digits
			rxStore.dispatch({type: 'CHANGE_TO_RECORD', fieldName: 'recruiter_phone',
				newValue: newVal});
			return true;
		}
		else
			console.log(`no phone ext in  '${tValue}'`)
		return false;
	}

	// blur handler - for all the text boxes in the form.  trim off leading and trailing whitespace.
	deFocusBlank =
	(ev) => {
		var targ = ev.target;
		rxStore.dispatch({type: 'CHANGE_TO_RECORD',
			fieldName: targ.name, newValue: targ.value.trim()});
	}

	// keystroke handler - for all the text boxes in the form.  Also gets paste, etc
	typeInBlank =
	(ev) => {
		var targ = ev.target;
		let tValue = targ.value;

		switch(targ.name) {
		case 'recruiter_name':
		case 'recruiter_email':
			if (this.gobbleNameEmail(tValue))
				return;
			break;

		case 'recruiter_phone':
			if (this.gobblePhone(tValue))
				return;
			break;

		}

		// normal change to some record
		rxStore.dispatch({type: 'CHANGE_TO_RECORD',
				fieldName: targ.name, newValue: targ.value});
	}

	static changeToRecord(editPanel, action) {
		// action.fieldName and .newValue tells you what changed,
		editPanel = {...editPanel,
			editingRecord: {...editPanel.editingRecord,
				[action.fieldName]: action.newValue}};
		return editPanel;
	}
}

function mapStateToProps(state) {
	//console.info("MS2P rec form");
	return state.editPanel;
}

export default connect(mapStateToProps)(RecForm);
