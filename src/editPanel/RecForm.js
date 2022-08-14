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
import {rxStore} from '../reducer';

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
		let p = this.props;
		let rec = p.rec;
		if (! rec)
			return [];

		return (<section className='edit-col edit-form' onChange={this.typeInBlank}>

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
