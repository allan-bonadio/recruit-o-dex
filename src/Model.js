/*
** Model -- ajax calls for RecruitMan page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import $ from "jquery";

// download the whole thing
export function getAll(callback) {
	$.get({
		url: 'http://localhost:5555/getall', 
		success: function(data, status, jqxhr) {
			allRecruiters =data;
			callback(allRecruiters);
		},
		error: function(jqxhr, status, message) {
			console.error("Error loading data: %s %s", status, message);
			var er = new Error("error loading data: "+ status +': '+ message);
			callback(er);
		},
	});
}

// get a record given its position in the array
export function getBySerial(serial) {
	return allRecruiters[serial];
}

// put one to update an existing record
export function putOne(record, callback) {
	$.ajax({
		url: 'http://localhost:5555/one/'+ record._id, 
		method: 'put',
		contentType: 'application/json',  
		data: JSON.stringify(record),
		success: function(data, status, jqxhr) {
			callback('success', jqxhr.status);
		},
		error: function(jqxhr, status, message) {
			console.error("Error loading data: %d %s %s", jqxhr.status, status, message);
			callback('failure', jqxhr.status);
		},
	});
}

// a new one: add it in to the collection
export function postOne(record, callback) {
	$.ajax({
		url: 'http://localhost:5555/one', 
		method: 'post',
		contentType: 'application/json',  
		data: JSON.stringify(record),
		success: function(data, status, jqxhr) {
			callback('success', jqxhr.status);
		},
		error: function(jqxhr, status, message) {
			console.error("Error loading data: %d %s %s", jqxhr.status, status, message);
			callback('failure', jqxhr.status);
		},
	});
}
	
// ultimately this will have all the data in it
export let allRecruiters = [];




