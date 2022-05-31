/*
** CrudCurtain -- foggy background for control panel
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
import {connect} from 'react-redux';
import {rxStore} from '../reducer';

import LoadSave from '../LoadSave';

// the white translucent sheet behind the control panel; signifies you're changing a record
export class CrudCurtain extends Component {
	constructor(props) {
		super(props);
		CrudCurtain.me = this;
		this.curtainClick = this.curtainClick.bind(this);
		//console.info('constructed CrudCurtain');
	}

	// clicking on the CrudCurtain does a Save
	curtainClick(ev) {
		let state = rxStore.getState();

		LoadSave.saveAddEditRecord(state.editPanel.selectedSerial);
	}

	render() {
		//console.info('rendering CrudCurtain');
		let sel = this.props;
		if (!sel) return [];

		return <div className='crud-curtain'
			onClick={this.curtainClick}
			style={{display: sel.editingRecord ? 'block' : 'none'}}>
		</div>;
	}
}

function mapStateToProps(state) {
	//console.info("MS2P crud curtain");
	return state ? state.editPanel : {};
}

export default connect(mapStateToProps)(CrudCurtain);

