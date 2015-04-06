// simple-todos.js
Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
	Template.registerHelper("prettyDate", function(timestamp) {
		return moment(new Date(timestamp)).fromNow();
	});

	Template.body.helpers({
		tasks: function () {
			var startDate = moment().startOf('day').toDate();
			var endDate = moment().add(1, 'days').toDate();
			//get the logs
			return Tasks.find({createdAt: {$gte: startDate, $lt: endDate}}, {sort: {createdAt: -1}});
		},
		topFives: function () {
			return Tasks.find({}, {limit: 5, sort: {createdAt: -1}});
		}
	});

	Template.numberTotal.helpers({
		//gets the number of goals met for all time
		numberTotal: function () {
			return Tasks.find({}).count();
		},
	});

	Template.numberToday.helpers({
		//get the number of goals met today
		numberToday: function () {
			var startDate = moment().startOf('day').toDate();
			var endDate = moment().add(1, 'days').toDate();
			return Tasks.find({createdAt: {$gte: startDate, $lt: endDate}}).count();
		}
	});

	Template.body.events({
		"submit .new-task": function (event) {
			var text = event.target.text.value;
			var owner = Meteor.userId();
			var username = Meteor.user().username;

			Tasks.insert({
				text: text,
				createdAt: new Date(),
				owner: owner,
				username: username
			});

			// Clear form
			event.target.text.value = "";

			// Prevent default form submit
			return false;
		}
	});

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
}

