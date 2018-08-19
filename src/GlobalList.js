/*
** GlobalList -- the main display showing all records 
*/
import React, {Component} from 'react';
import {connect} from 'react-redux';

////import {startAddRecord} from './ControlPanel'
import SummaryRec from './SummaryRec';
//import {store, getStateSelection} from './reducer';
////import LoadSave from './LoadSave';
import {getAll} from './Model';

//export let theGlobalList;

// this is not the right way to pass this variable but I don't kno w what else to do
////export var thisSerial;

// having trouble getting GlobalList to exist at startup
export function globalListUpdateList() {
	GlobalList.me.updateList();
}

// list of all recruiters, for click selecting
export class GlobalList extends Component {
	constructor(props) {
		super(props);
		////this.state = {recs: []};
		//theGlobalList = this;
		GlobalList.me = this;
		
		this.clickNewRec = this.clickNewRec.bind(this);
		this.changeSearchQuery = this.changeSearchQuery.bind(this);
	}
	
	// header cell with image and New button
	renderTitleCell() {
		let p = this.props;
		return <section className='summary title-cell' key='title-cell'>
			<h1>Recruit-O-Dex</h1>
			<button type='button' onClick={this.clickNewRec} >New Rec</button>
			&nbsp; &nbsp;
			<input className='search-box' placeholder='search (not yet impl)'
				onChange={this.changeSearchQuery} defaultValue={p.searchQuery} />
			&nbsp;
			<big><span aria-label='search' role='img'>🔍</span></big>
		</section>;
	}
	
	// the list of recs, or just a big message
	renderBodyCells() {
		let p = this.props;
		if (p.globalListErrorObj) {
			// no cells, just an error message
			return [<section className='error' key='err' >
				{p.globalListErrorObj.message}
			</section>];
		}
		else {
			// all the other cells with records in them
			return p.recs.map(function(rec, ix) {
				////thisSerial = ix;
				return <SummaryRec key={ix.toString()} serial={ix} 
					record={rec} selected={p.selectedSerial == ix} ></SummaryRec>;
			});
		}
	}
	
	render() {
////		console.log('render GlobalList this.props', this.props);////
		let p = this.props;
		
		let titleCell = this.renderTitleCell();
		let list = this.renderBodyCells();
		
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
				this.update(newRecs)
		});
	}
	
	// put an error message up instead of the list of recs
	// called in reducer from ERROR_GET_ALL
	// glitch when rodexServer isn't running; reducer includes this code directly.  ???
////	errorGetAll(state, action) {
////		// data in GlobalList not modified cuz no data came back.  Just error obj.
////		return {
////			...state,
////			globalListErrorObj: action.errorObj,
////		};
////	}
	
	// a click on the New Rec button to raise the control panel with a prospective rec
	clickNewRec(ev) {
		this.props.dispatch({type: 'START_ADD_RECORD'})
	}

	// any input in the search box
	changeSearchQuery(ev) {
		this.props.dispatch({type: 'CHANGE_TO_SEARCH_QUERY', newQuery: ev.target.value});
	}
	
	static changeToSearchQuery(state, action) {
		return {
			...state,
			searchQuery: action.newQuery,
		};
	}
}

function mapStateToProps(state) {
////	console.log("|| GlobalList#mapStateToProps: state=", state);
	if (state) {
		return {
			recs: state.recs, 
			selectedSerial: state.selection.selectedSerial,
			globalListErrorObj: state.globalListErrorObj,
			searchQuery: state.searchQuery, 
		};
	}
	else {
		return {recs: [], selectedSerial: -1, globalListErrorObj: null, searchQuery: ''};
	}
}

export default connect(mapStateToProps)(GlobalList);

