/* Recruiter form pane */
import React, {Component} from 'react';
import _ from "lodash";
import {connect} from 'react-redux';

////import {userChangedRecord} from './ControlPanel';
import {Engagements} from './Engagements';
import {rxStore} from './Reducer';

export var theRecForm;

// a function-based component: just renders a text field and its label
function RecField(props) {
	let fieldName = props.fieldName;
	let dval = props.rec[fieldName] || '';
	//console.log(":: field %s depicted with value %s", fieldName, dval);
	
	// form the <input or <textarea.  Keystroke handler in RecForm, not here.
	let entryElement;
	if (props.element != 'textarea')  // eslint-disable-line
		entryElement = <input value={dval} name={fieldName} onChange={() => {}} />;
	else
		entryElement = <textarea value={dval} name={fieldName} onChange={() => {}} />;

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
		theRecForm = this;
	}
	
// 	called by the Engagements Table when there's a change.  Completely replaces all events(engagements)
// 	changeEngagements(newEvents) {
// 		var rec = {...this.state.record};
// 		rec.events = newEvents;
// 		theControlPanel.setCPRecord(rec)
// 		userChangedRecord(rxStore.getState());
// 		rxStore.dispatch({type: 'CHANGE_TO_RECORD', 
// 				fieldName: 'badEventz', newValue: 'badEventzValue'});
// 	}

// 	set this to have the tree passed in as state
// 	setRecordState(tree) {
// 		this.setState({record: tree});
// 	}
	
	// render the form with all the blanks and data populated in them
	render() {
		////redux let rec = this.state.record;
		let s = this.props.selection;
		let rec = s.editingRecord;
		if (! rec)
			return [];

		return <section className='edit-col edit-form' onChange={this.typeInBlank}>

			<RecField rec={rec} label='Recruiter:' fieldName='recruiter_name' />
			<RecField rec={rec} label='email:' fieldName='recruiter_email' />
			<RecField rec={rec} label='phone:' fieldName='recruiter_phone' />
			<RecField rec={rec} label='agency:' fieldName='agency' />
			<div style={{height: '10px'}} />
			<RecField rec={rec} label='company:' fieldName='company_name' />
			<RecField rec={rec} label='jd url:' fieldName='job_desc_url' />
			<RecField rec={rec} label='status:' fieldName='status' />
			
			<RecField rec={rec} label='notes:' fieldName='notes' element='textarea' />
			
			<Engagements engagements={rec.engagements || rec.events} 
						editingEngagement={s.editingEngagement} dispatch={this.props.dispatch}
						 />
		</section>;
	}
	
	componentDidCatch(error, info) {
		console.error("componentDidCatch(%o, %o)", error, info);
	}

	// keystroke handler - for all the text boxes in the form
	typeInBlank(ev) {
		var targ = ev.target;
		////let sel = getStateSelection();
		
		// appends or replaces one field only
		////var rec = _.clone(sel.editingRecord);
		//rec[targ.name] = targ.value;
// 		theControlPanel.setCPRecord(rec)
// 		userChangedRecord(rxStore.getState());
		rxStore.dispatch({type: 'CHANGE_TO_RECORD', fieldName: targ.name, newValue: targ.value});
	}

	static changeToRecord(state, action) {
		// action.fieldName and .newValue tells you what changed, .fieldPrefix is for subfields like selection
		state = _.cloneDeep(state);////state = {...state}
		let q = state.selection.editingRecord;
		
// 		fieldPath not used anymore ... kill it?
// 		if (action.fieldPath) {
// 			a few levels deep
// 			action.fieldPath.forEach((name, ix) => {
// 				if (!q[name])
// 					q[name] = {};  // sometimes changed to an array elsewhere
// 				q = q[name];
// 			});
// 		}

		q[action.fieldName] = action.newValue;
		return state;
	}
}

function mapStateToProps(state) {
	return {selection: state.selection};
}

export default connect(mapStateToProps)(RecForm);
