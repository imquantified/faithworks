Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {

	Template.registerHelper("prettyDate", function(timestamp) {
		return moment(new Date(timestamp)).fromNow();
	});

	Template.registerHelper("isEditable", function() {
		return Session.equals("editTask", true);
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
		},
	});

	Template.task.helpers({
		selectedClass: function() {
			var taskId = this._id;
			var selectedTask = Session.get('selectedTask');
			if (taskId == selectedTask) {
				return "<form class=\"edit-field\"><input type=\"text\" name=\"text\" placeholder=\"Type to edit current tasks\"/></form>";
			}
		},
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

			Meteor.call("addTask", text);

			// Clear form
			event.target.text.value = "";

			// Prevent default form submit
			return false;
		},

		"click .delete": function (event) {
			Meteor.call("deleteTask", this._id);
			// Tasks.remove(this._id);
		},

		"click .edit-task": function () {
			var currentTask = this._id;
			Session.set('selectedTask', currentTask);
		},
		"submit .edit-field": function (event) {
			var text = event.target.text.value;
			var userId = Meteor.userId();
			Meteor.call("editThisTask", this._id, text);
			Session.set("selectedTask", null);
			event.target.text.value = "";
			
			// Prevent default form submit
			return false;
		}
	});

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
}

Meteor.methods({
  addTask: function (text) {
	// Make sure the user is logged in before inserting a task
	if (! Meteor.userId()) {
	  throw new Meteor.Error("not-authorized");
	}
	if (text) {
		Tasks.insert({
		  text: text,
		  createdAt: new Date(),
		  owner: Meteor.userId(),
		  username: Meteor.user().username
		});
	} else { throw new Meteor.Error("Please enter some text for the message"); }
  },
  deleteTask: function (taskId) {
	if (! Meteor.userId()) {
	  throw new Meteor.Error("not-authorized");
	}
	Tasks.remove(taskId);
  },
  findThisTask: function (taskId) {
	Tasks.find(taskId);
  },
  editThisTask: function (taskId, text) {
	if (! Meteor.userId()) {
	  throw new Meteor.Error("not-authorized");
	}
	if (text && taskId) {
		Tasks.update(taskId, {$set: {text: text}});
	} else { throw new Meteor.Error("no text or id"); }
  }
});

