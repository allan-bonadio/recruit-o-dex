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
//import {Engagements} from './Engagements';


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
		//RecField.typeInBlank = RecField.typeInBlank.bind(this);
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

		return (<section className='edit-col edit-form' onChange={RecField.typeInBlank} onBlur={RecField.deFocusBlank}>

			<RecField rec={rec} label='Recruiter:' fieldName='recruiter_name' placeholder='Ashish' />
			<RecField rec={rec} label='email:' fieldName='recruiter_email' placeholder='ashish@microawsome.io' />
			<RecField rec={rec} label='phone:' fieldName='recruiter_phone' placeholder='111.111.1111 x11' />
			<RecField rec={rec} label='agency:' fieldName='agency'  placeholder='Micro Awsome'  />
			<div style={{height: '10px'}} />

		</section>);
	}

	componentDidCatch(error, info) {
		console.error("componentDidCatch(%o, %o)", error, info);
	}

	// this does stuff for RecForm and also EmplForm
	static changeToRecord(editPanel, action) {
		// action.fieldName and .newValue tells you what changed,
		editPanel = {...editPanel,
			editingRecord: {...editPanel.editingRecord,
				[action.fieldName]: action.newValue}};
		return editPanel;
	}

}

function mapStateToProps(state) {
	return state.editPanel;
}

export default connect(mapStateToProps)(RecForm);
