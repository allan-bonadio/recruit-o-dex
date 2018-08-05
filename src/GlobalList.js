/*
** GlobalList -- the main display showing all records 
*/
import React, {Component} from 'react';
import {connect} from 'react-redux';

////import {startAddRecord} from './ControlPanel'
import SummaryRec from './SummaryRec';
//import {store, getStateSelection} from './Reducer';
////import LoadSave from './LoadSave';
import {getAll} from './Model';

export let theGlobalList;

// this is not the right way to pass this variable but I don't kno w what else to do
////export var thisSerial;



// list of all recruiters, for click selecting
class GlobalList extends Component {
	constructor(props) {
		super(props);
		////this.state = {recs: []};
		theGlobalList = this;
		
		this.clickNewRec = this.clickNewRec.bind(this);
	}
	
	render() {
		////console.log("render GlobalList");
		let p = this.props;
		let list;
		
		// header cell with image and New button
		let titleCell = <section className='summary title-cell' key='title-cell'>
			<h1>
				Recruit-O-Dex
				&nbsp; &nbsp; &nbsp;
				<button type='button' onClick={this.clickNewRec} >New<br/>Rec</button>
			</h1>
		</section>;

		if (p.globalListErrorObj) {
			// all the other cells with records in them
			//let list = store.getState().recs.map(function(rec, ix) {
			list = [<section className='error' key='err' >
				{p.globalListErrorObj.message}
			</section>];
		}
		else {
			// all the other cells with records in them
			//let list = store.getState().recs.map(function(rec, ix) {
			list = p.recs.map(function(rec, ix) {
				////thisSerial = ix;
				return <SummaryRec key={ix.toString()} serial={ix} 
					record={rec} selected={p.selectedSerial == ix} ></SummaryRec>;
			});
		}
		
		// stick in the header cell in the upper left with the photo
		list.unshift(titleCell);
		
		return list;
	}
	
	// Call this when you retrieve all the data, as when the app starts.
	// triggers a repaint, using this list of raw data from mongo
	update(newList) {
		this.props.dispatch({type: 'SET_WHOLE_LIST', recs: newList})
		////this.setState({recs: newList});
	}

	// called at various times to re-read the jobs table and display it again
	updateList() {
		let p = this.props;
		getAll((err, newRecs) => {
			if (err) {
				p.dispatch({type: 'ERROR_GET_ALL', errorObj: err})
				
			}
			else
				theGlobalList.update(newRecs)
		});
	}
	
	// put an error message up instead of the list of recs
	// called in reducer from ERROR_GET_ALL
	errorGetAll(state, action) {
		// data in GlobalList not modified cuz no data came back.  Just error obj.
		return {
			...state,
			globalListErrorObj: action.errorObj,
		};
	}
	
	// a click on the New Rec button to raise the control panel with a prospective rec
	clickNewRec(ev) {
		this.props.dispatch({type: 'START_ADD_RECORD'})
	}
}

// export function setGlobalData(recs) {
// 	theGlobalList.update(recs);
// }

function mapStateToProps(state) {
	console.log("|| GlobalList#mapStateToProps: state=", state);
	return {
		recs: (state ? state.recs : []), 
		selectedSerial: state ? state.selection.selectedSerial : -1,
		globalListErrorObj: state ? state.globalListErrorObj : null,
	};
}

export default connect(mapStateToProps)(GlobalList);

