import $ from "jquery";


let Model = {
	getAll: function(callback) {
		let mod = this;
		$.get({
			url: 'http://localhost:5555/getall', 
			success: function(data, status, jqxhr) {
				mod.allRecruiters =data;
				callback(mod.allRecruiters);
			},
			error: function(jqxhr, status, message) {
				console.error("Error loading data: %s %s", status, message);
			},
		});
	},
	
	getBySerial: function(serial) {
		return this.allRecruiters[serial];
	},
	
	putOne: function(record, callback) {
		let mod = this;
		
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
	},
	
	// ultimately this will have all the data in it
	allRecruiters: [],
};
export default Model;



