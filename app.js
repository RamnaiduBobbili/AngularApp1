'use strict';

var app = angular.module("app", [
	'ngRoute',
	'ngFileUpload',
	'firebase'
]);

app.config(function($routeProvider){
	$routeProvider.when("/home", {
		templateUrl : "includes/home.html",
		controller : "homeCtrl",
	}).when("/register", {
		templateUrl : "includes/signup.html",
		controller : "registerCtrl",
	}).when("/welcome", {
		templateUrl : "includes/welcome.html",
		controller : "welcomeCtrl",
	}).when('/addPost', {
		templateUrl: 'includes/addpost.html',
		controller: 'addPostCtrl',
	}).when("/profile", {
		templateUrl : "includes/profile.html",
		controller : "profileCtrl",
	}).when("/addressBook", {
		templateUrl : "includes/addressbook.html",
		controller : "addressCtrl",
	}).when("/calculator", {
		templateUrl : "includes/calculator.html",
		controller : "calculatorCtrl",
	}).otherwise({
		redirectTo : "/home"
	})
});

app.value('fbURL', 'https://blazing-inferno-2122.firebaseio.com');
  // .factory('Person', function (fbURL, $firebase) {
    // return $firebase(new Firebase(fbURL)).$asArray();
  // })