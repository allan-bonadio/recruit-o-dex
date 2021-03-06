/*
** CrudCurtain -- foggy background for control panel
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
import {connect} from 'react-redux';

import LoadSave from './LoadSave';

// the white translucent sheet behind the control panel; signifies you're changing a record
export class CrudCurtain extends Component {
	constructor(props) {
		super(props);
		CrudCurtain.me = this;
		this.curtainClick = this.curtainClick.bind(this);
	}
	
	// clicking on the CrudCurtain does a Save
	curtainClick(ev) {
		if (this.props.selectedSerial >= 0)
			LoadSave.saveEditRecord();
		else
			LoadSave.saveAddRecord();
	}
	
	render() {
		let sel = this.props;
		if (!sel) return [];

		return <div className='crud-curtain' 
			onClick={this.curtainClick}
			style={{display: sel.editingRecord ? 'block' : 'none'}}>
		</div>;
	}
}

function mapStateToProps(state) {
	console.info("MS2P crud curtain");
	return state ? state.controlPanel : {};
}

export default connect(mapStateToProps)(CrudCurtain);

