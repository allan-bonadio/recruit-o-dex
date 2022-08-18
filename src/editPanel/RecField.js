/*
** RecForm -- Recruiter form, misc fields
**
** Copyright (C) 2022-2022 Allan Bonadio   All Rights Reserved
*/
/* eslint-disable eqeqeq, default-case */

import React from 'react';
import PropTypes from 'prop-types';

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

RecField.propTypes = {
	fieldName: PropTypes.string.isRequired,
	rec: PropTypes.object.isRequired,
	placeholder: PropTypes.string,
};

RecField.defaultValues = {
	placeholder: '',
};


export default RecField;
