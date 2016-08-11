'use strict';

app.service("commonProp", ['$location', '$firebaseAuth', function($location, $firebaseAuth){
	var user = "";
	var firebaseObj = new Firebase("https://blazing-inferno-2122.firebaseio.com/");
	var loginObj = $firebaseAuth(firebaseObj);
	return{
		getUser : function(){
			if(user == ''){
				user = localStorage.getItem('userEmail');
			}
			return user;
		},
		setUser: function(value){
			localStorage.setItem('userEmail', value);
			user = value;
		},
		logoutUser:function(){
            loginObj.$unauth();
            user='';
            localStorage.removeItem('userEmail');
            $location.path('/home');
        }
	};
}]);