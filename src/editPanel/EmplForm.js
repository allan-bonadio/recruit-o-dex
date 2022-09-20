/*
** EmplForm -- Employer form, misc fields
**
** Copyright (C) 2017-2022 Allan Bonadio   All Rights Reserved
*/
/* eslint-disable eqeqeq, default-case */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import RecField from './RecField';

// a small table of recruiter info, fixed field names
export class EmplForm extends Component {
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
//		this.changeEngagements = this.changeEngagements.bind(this);
		window.recForm = this;
		EmplForm.me = this;  // for singleton objects only
		console.info('constructed EmplForm');
	}

	// render the form with all the blanks and data populated in them
	render() {
		//console.info('rendering EmplForm');
		////redux let rec = this.state.record;
		////console.log('this.props', this.props);////
		let p = this.props;
		let rec = p.rec;
		if (! rec)
			return [];

		return (<section className='edit-col edit-form' onChange={RecField.typeInBlank} onBlur={RecField.deFocusBlank}>
			<RecField rec={rec} label='company:' fieldName='company_name'  placeholder='unsure' />
			<RecField rec={rec} label='status:' fieldName='status' />

			<RecField rec={rec} label='notes:' fieldName='notes'
				element='textarea' placeholder='where, and what they do' />);

		</section>);
	}

	componentDidCatch(error, info) {
		console.error("componentDidCatch(%o, %o)", error, info);
	}


	// static changeToRecord(editPanel, action) {
	// 	// action.fieldName and .newValue tells you what changed,
	// 	editPanel = {...editPanel,
	// 		editingRecord: {...editPanel.editingRecord,
	// 			[action.fieldName]: action.newValue}};
	// 	return editPanel;
	// }
}

function mapStateToProps(state) {
	//console.info("MS2P rec form");
	return state.editPanel;
}

export default connect(mapStateToProps)(EmplForm);
