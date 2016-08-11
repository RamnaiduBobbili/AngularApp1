'use strict';

/****HOME****/
app.controller("homeCtrl", ['$scope', '$location', 'commonProp', '$firebaseAuth', '$timeout', 'fbURL', function($scope, $location, commonProp, $firebaseAuth, $timeout, fbURL){
	$scope.title = "Login";
	var firebaseObj = new Firebase(fbURL);
	var loginObj = $firebaseAuth(firebaseObj);
	loginObj.$onAuth(function(authData){
		if(authData){
			commonProp.setUser(authData.password.email);
			$location.path('/profile');
		}
	});
	
	$scope.user = {};
	$scope.login = function(e){
		var username = $scope.user.email;
		var password = $scope.user.password;
		loginObj.$authWithPassword({
			email: username,
			password: password,
			
		}).then(function(user){
			$scope.showMsg = true;
			$scope.doFade = true;
			$scope.alertMsg = "Loged in sucessfully.";
			
			$timeout(function(){
				commonProp.setUser(user.password.email);
				$location.path("/profile")
			}, 3000);
			
		}, function(error){
			$scope.showMsg = true;
			$scope.regError = true;
			$scope.alertMsg = error.message;
			
			$timeout(function(){
				$scope.showMsg = false;
				$scope.regError = false;
			}, 3000);
		});
	}
	
}])


/****REGISTER****/
app.controller("registerCtrl", ['$scope', '$location', '$firebaseAuth', '$timeout', 'fbURL', function($scope, $location, $firebaseAuth, $timeout, fbURL){
	$scope.title = "Create Account";
	var firebaseObj = new Firebase(fbURL);
	var auth = $firebaseAuth(firebaseObj);
	// console.log(auth);
	$scope.showMsg = false;
	$scope.doFade = false;
	$scope.signUp = function(){
		if(!$scope.regForm.$invalid){
			var email = $scope.user.email;
			var password = $scope.user.password;
			if(email && password){
				auth.$createUser(email, password)
				.then(function(){
					//console.log('User creation success');
					$scope.showMsg = true;
					$scope.doFade = true;
					$scope.alertMsg = "User creation successfully.";
					$timeout(function(){
						$location.path("/home")
					}, 3000);
					
				}, function(error){
					$scope.showMsg = true;
					$scope.regError = true;
					$scope.alertMsg = error.message;
					
					$timeout(function(){
						$scope.showMsg = false;
						$scope.regError = false;
					}, 3000);
				});
			}
		}
	};
}]);

/****WELCOME****/
app.controller("welcomeCtrl", ['$scope', '$location', '$firebase', 'commonProp', '$filter', 'fbURL', function($scope, $location, $firebase, commonProp, $filter, fbURL){
	$scope.username = commonProp.getUser();
	// $scope.name = commonProp.setUser(value);
	// console.log($scope.name);
	var firebasePro = new Firebase(fbURL + "/profile/");
	var profileDB = $firebase(firebasePro.startAt($scope.username).endAt($scope.username));
	$scope.profileData = profileDB.$asObject();
	if(!$scope.username){
		$location.path("/home");
	};
	
	var firebaseObj = new Firebase(fbURL + "/Articles/");
	var sync = $firebase(firebaseObj.startAt($scope.username).endAt($scope.username));
	//console.log(sync);
	$scope.noPosts = false;
	$scope.articles = sync.$asArray();
	if(!$scope.articles){
		$scope.noPosts = false;
	}else{
		$scope.noPosts = true;
	}
	
	
	$scope.logout = function(){
		commonProp.logoutUser();
	}
	
	/****EDIT POST****/
	$scope.editPost = function(id){
		var firebaseObj = new Firebase(fbURL + "/Articles/" + id);
		var syn = $firebase(firebaseObj);
		$scope.postToUpdate = syn.$asObject();
		//console.log($scope.postToUpdate);
		//$("#editModal").modal();		
	}
	/****UPDATE POST****/
	$scope.update = function(){
		var firebaseObj = new Firebase(fbURL + "/Articles/" + $scope.postToUpdate.$id);
		var syn = $firebase(firebaseObj);
		$scope.date = $filter('date')(new Date(), 'MM/dd/yyyy');
		syn.$update({
			title: $scope.postToUpdate.title,
			post: $scope.postToUpdate.post,
			date: $scope.date,
			email: $scope.postToUpdate.email
		}).then(function(ref){
			$("#editModal").modal('hide');
		}, function(error){
			consloe.log(error);
		});
	}
	
	/****DELETE POST****/
	$scope.deletePost = function(id){
		var firebaseObj = new Firebase(fbURL + "/Articles/" + id);
		var delPost = $firebase(firebaseObj);
		$scope.postToDelete = delPost.$asObject();
		$("#deleteModel").modal();
	}
	$scope.confirmDelete = function(){
		var firebaseObj = new Firebase(fbURL + "/Articles/" + $scope.postToDelete.$id);
        var delPost = $firebase(firebaseObj);
        delPost.$remove().then(function(ref) {
            $('#deleteModal').modal('hide');
        }, function(error) {
            console.log("Error:", error);
        });
	}
}])

/****ADD POST****/
app.controller('addPostCtrl', ['$scope','$firebase','$location','commonProp', '$filter', 'Upload', 'fbURL', function($scope,$firebase,$location,commonProp, $filter, Upload, fbURL) {
	$scope.username = commonProp.getUser();
	var firebasePro = new Firebase(fbURL + "/profile/");
	var profileDB = $firebase(firebasePro.startAt($scope.username).endAt($scope.username));
	$scope.profileData = profileDB.$asObject();
	if(!$scope.username){
		$location.path('/home');
	}
	$scope.logout = function(){
		commonProp.logoutUser();
	}

    $scope.addPost = function(e){
		if(!$scope.articlePost.$invalid){
			var title = $scope.article.title;
			var post = $scope.article.post;
			//var file = $scope.article.file;
			//console.log(file);
			$scope.date = $filter('date')(new Date(), 'MM/dd/yyyy');
			var mdate = $scope.date;
			var firebaseObj = new Firebase(fbURL + "/Articles");
			var fb = $firebase(firebaseObj); 
			var user = commonProp.getUser();
			//var file = Upload.base64DataUrl(file).then(function(base64Urls){ 
				fb.$push({ 
					title: title,
					post: post,
					//file: base64Urls,
					date: mdate,
					email: user,
					'.priority': user
				}).then(function(ref) {
					$location.path('/welcome');
				}, function(error) {
					console.log("Error:", error);
				});
			//});
		};
	};
	
}]);

/****PROFILE****/
app.controller("profileCtrl", ['$scope', '$location', '$firebase', '$filter', 'commonProp', '$timeout', 'fbURL', 'Upload', function($scope, $location, $firebase, $filter, commonProp, $timeout, fbURL, Upload){
	$scope.username = commonProp.getUser();
	var firebaseObj = new Firebase(fbURL + "/profile/");
	var profileDB = $firebase(firebaseObj.startAt($scope.username).endAt($scope.username));
	$scope.profileData = profileDB.$asArray();
	$scope.loader = false;
	//console.log($scope.contactData);
	if(!$scope.username){
		$location.path('/home');
	}
	
	$scope.logout = function(){
		commonProp.logoutUser();
	}
	
	$scope.addProfile = function(){
		var fname = $scope.user.fname;
		var lname = $scope.user.lname;
		var mobile = $scope.user.mobile;
		//var file = $scope.user.file;
		var dob = $filter('date')($scope.user.dob, 'fullDate');
		var firebaseObj = new Firebase(fbURL + "/profile/");
		var db = $firebase(firebaseObj);
		var user = commonProp.getUser();
		var fileName = $("#nameImg").val();
		$scope.loader = true;
		if(fileName.length > 0){
			var filesSelected = document.getElementById("nameImg").files;
			if (filesSelected.length > 0) {
				var fileToLoad = filesSelected[0];
				var fileReader = new FileReader();
				fileReader.onload = function(fileLoadedEvent) {
					db.$push({
						fname: fname,
						lname: lname,
						dob: dob,
						mobile: mobile,
						image: fileLoadedEvent.target.result,
						email: user,
						'.priority': user
					}).then(function(ref){
						//console.log("Added Conatct.")
						$scope.loader = true;
						$scope.showMsg = true;
						$scope.doFade = true;
						$scope.alertMsg = "Profile added successfully with profile picture.";
						$timeout(function(){
							$scope.showMsg = false;
							$scope.doFade = false;
						}, 3000);
					}, function(error){
						//console.log(error);
						$scope.loader = false;
						$scope.showMsg = true;
						$scope.regError = true;
						$scope.alertMsg = error.message;
						
						$timeout(function(){
							$scope.showMsg = false;
							$scope.regError = false;
						}, 3000);
					});
				};
				fileReader.readAsDataURL(fileToLoad);
			}
		}else{
			db.$push({
				fname: fname,
				lname: lname,
				dob: dob,
				mobile: mobile,
				image: null,
				email: user,
				'.priority': user
			}).then(function(ref){
				//console.log("Added Conatct.")
				$scope.loader = true;
				$scope.showMsg = true;
				$scope.doFade = true;
				$scope.alertMsg = "Profile added successfully with out profile picture.";
				$timeout(function(){
					$scope.showMsg = false;
					$scope.doFade = false;
				}, 3000);
			}, function(error){
				//console.log(error);
				$scope.loader = false;
				$scope.showMsg = true;
				$scope.regError = true;
				$scope.alertMsg = error.message;
				
				$timeout(function(){
					$scope.showMsg = false;
					$scope.regError = false;
				}, 3000);
			});
		};
	}
	
	$scope.editPro = function(id){
		//console.log(id);
		var fbObj = new Firebase(fbURL + "/profile/" + id);
		var proDB = $firebase(fbObj);
		$scope.profileEditData = proDB.$asObject(); 
		//console.log($scope.profileEditData);
		//alert("modal");
		//$("#editProfile").modal();		
		
	}
	$scope.updateProfile = function(id){
		//console.log(id);
		var fbObj = new Firebase(fbURL + "/profile/" + $scope.profileEditData.$id);
		var proDB = $firebase(fbObj);
		//$scope.profileEditData = proDB.$asObject(); 
		//console.log($scope.profileEditData);
		//$("#editProfile").modal();
		var fileName = $("#updateImg").val();
		//alert(fileName);
		if(fileName.length > 0){
			//alert("new image");
			var filesSelected = document.getElementById("updateImg").files;
			if (filesSelected.length > 0) {
				var fileToLoad = filesSelected[0];
				var fileReader = new FileReader();
				fileReader.onload = function(fileLoadedEvent) {
					proDB.$update({
						fname: $scope.profileEditData.fname,
						lname: $scope.profileEditData.lname,
						dob: $scope.profileEditData.dob,
						mobile: $scope.profileEditData.mobile,
						image: fileLoadedEvent.target.result,
						email: $scope.profileEditData.email
					}).then(function(ref){
						//console.log("Added Conatct.")
						
						$("#editProfile").modal('hide');
						$scope.showMsg = true;
						$scope.doFade = true;
						$scope.alertMsg = "Profile updated successfully with new profile picture.";
						$timeout(function(){
							
							$scope.showMsg = false;
							$scope.doFade = false;
						}, 3000);
					}, function(error){
						//console.log(error);
						$scope.showMsg = true;
						$scope.regError = true;
						$scope.alertMsg = error.message;
						
						$timeout(function(){
							$scope.showMsg = false;
							$scope.regError = false;
						}, 3000);
					});
				}
				fileReader.readAsDataURL(fileToLoad);
			}
		}else{
			//alert("old image");
			proDB.$update({
				fname: $scope.profileEditData.fname,
				lname: $scope.profileEditData.lname,
				dob: $scope.profileEditData.dob,
				mobile: $scope.profileEditData.mobile,
				image: $scope.profileEditData.image,
				email: $scope.profileEditData.email
			}).then(function(ref){
				//console.log("Added Conatct.")
				$("#editProfile").modal('hide');
				$scope.showMsg = true;
				$scope.doFade = true;
				$scope.alertMsg = "Profile updated successfully with previous profile picture.";
				
				$timeout(function(){
					$scope.showMsg = false;
					$scope.doFade = false;
				}, 3000);
			}, function(error){
				//console.log(error);
				$scope.showMsg = true;
				$scope.regError = true;
				$scope.alertMsg = error.message;
				
				$timeout(function(){
					$scope.showMsg = false;
					$scope.regError = false;
				}, 3000);
			});
		}
		
	}
}]);

/****ADDRESS BOOK****/
app.controller("addressCtrl", ['$scope', '$firebase', '$location', 'commonProp', '$timeout', 'fbURL', '$filter', function($scope, $firebase, $location, commonProp, $timeout, fbURL, $filter){
	$scope.username = commonProp.getUser();
	var firebaseObj = new Firebase(fbURL + "/profile/");
	var proDB = $firebase(firebaseObj.startAt($scope.username).endAt($scope.username));
	$scope.profileData = proDB.$asArray();
	
	if(!$scope.username){
		$location.path('/home');
	}
	
	$scope.logout = function(){
		commonProp.logoutUser();
	}
	
	var firebaseAddressObj = new Firebase(fbURL + "/address_book/");
	var addressDB = $firebase(firebaseAddressObj.startAt($scope.username).endAt($scope.username));
	$scope.addressbook = addressDB.$asArray();
	$scope.date = $filter('date')(new Date(), 'MM/dd/yyyy');
	
	$scope.saveAddress = function(){
		var fname = $scope.address.fname;
		var lname = $scope.address.lname;
		var contemail = $scope.address.contemail;
		var mobile = $scope.address.mobile;
		var address = $scope.address.address;
		var pin = $scope.address.pin;
		var city = $scope.address.city;
		var state = $scope.address.state;
		var country = $scope.address.country;
		var mdate = $scope.date;
		var user = commonProp.getUser();
		addressDB.$push({
			fname: fname,
			lname: lname,
			contemail: contemail,
			mobile: mobile,
			address: address,
			pin: pin,
			city: city,
			state: state,
			country: country,
			date: mdate,
			email: user,
			'.priority': user
		}).then(function(data){
			console.log("Address Added.");
			$("#addressBook").modal('hide');
		}, function(error){
			console.log(error);
		});
	}
	
	$scope.editContact = function(id){
		var fbUpdateObj = new Firebase(fbURL + "/address_book/" + id);
		var editAddressDB = $firebase(fbUpdateObj);
		$scope.editAddress = editAddressDB.$asObject();
	}
	
	$scope.updateAddress = function(){
		var fname = $scope.editAddress.fname;
		var lname = $scope.editAddress.lname;
		var contemail = $scope.editAddress.contemail;
		var mobile = $scope.editAddress.mobile;
		var address = $scope.editAddress.address;
		var pin = $scope.editAddress.pin;
		var city = $scope.editAddress.city;
		var state = $scope.editAddress.state;
		var country = $scope.editAddress.country;
		var mdate = $scope.date;
		var fbUpdateObj = new Firebase(fbURL + "/address_book/" + $scope.editAddress.$id);
		var updateAddressDB = $firebase(fbUpdateObj);
		updateAddressDB.$update({
			fname: fname,
			lname: lname,
			contemail: contemail,
			mobile: mobile,
			address: address,
			pin: pin,
			city: city,
			state: state,
			country: country,
			date: mdate
		}).then(function(data){
			console.log("Address updated.");
			$("#editContactModal").modal('hide');
		}, function(error){
			console.log(error);
		});
	}
	
	$scope.viewConatct = function(id){
		var fbViewObj = new Firebase(fbURL + "/address_book/" + id);
		var viewContactDB = $firebase(fbViewObj);
		$scope.viewContactData = viewContactDB.$asObject();
	}
	
	$scope.deleteConatct = function(id){
		var fbViewObj = new Firebase(fbURL + "/address_book/" + id);
		var delContactDB = $firebase(fbViewObj);
		$scope.delContactData = delContactDB.$asObject();
	}
	
	$scope.confirmDeleteContact = function(){
		var fbViewObj = new Firebase(fbURL + "/address_book/" + $scope.delContactData.$id);
		var delContactDB = $firebase(fbViewObj);
		delContactDB.$remove().then(function(ref){
			$("#deleteContactModal").modal('hide');
		}, function(error){
			console.log(error);
		});
	}
}]);

/****CALCULATOR****/
app.controller("calculatorCtrl", ['$scope', 'commonProp', '$firebase', 'fbURL', function($scope, commonProp, $firebase, fbURL){
	$scope.username = commonProp.getUser();
	var firebaseObj = new Firebase(fbURL + "/profile/");
	var profileDB = $firebase(firebaseObj.startAt($scope.username).endAt($scope.username));
	$scope.profileData = profileDB.$asArray();
	//console.log($scope.contactData);
	if(!$scope.username){
		$location.path('/home');
	}
	
	$scope.logout = function(){
		commonProp.logoutUser();
	}
	
	$scope.displayValue = 0;                    
    $scope.valueA = 0;                          
    $scope.valueB = 0;                          
    $scope.selectedOperation = null;            
    $scope.clearValue = true;   
	
	$scope.digitClicked = function(clickNum){
		if($scope.clearValue) {
			$scope.displayValue = clickNum;     
			$scope.clearValue = false;
		}else{
			$scope.displayValue = $scope.displayValue * 10 + clickNum;
		}
		$scope.valueB = $scope.displayValue;     
	}
	
	
	$scope.operationClicked = function(operation) {
		$scope.selectedOperation = operation;
		$scope.valueA = $scope.displayValue; 
		$scope.valueB = $scope.displayValue;
		$scope.displayValue = $scope.valueA + " " + $scope.selectedOperation + " ";		
		//$scope.valueB = $scope.displayValue;
		$scope.clearValue = true;
	};

	$scope.compute = function(){
		switch(this.selectedOperation) {
			case "+":
				$scope.displayValue = $scope.valueA + $scope.valueB;
				//alert($scope.displayValue);
				break;
			case "-":
				$scope.displayValue = $scope.valueA - $scope.valueB;
				//alert($scope.displayValue);
				break;
			case "*":
				$scope.displayValue = $scope.valueA * $scope.valueB;
				//alert($scope.displayValue);
				break;
			case "/":
				$scope.displayValue = $scope.valueA / $scope.valueB;
				//alert($scope.displayValue);
				break;
		}
		  
		$scope.clearValue = true;
		$scope.valueA = $scope.displayValue;   
	}
	$scope.clear = function(){
		$scope.displayValue = 0;                    
		$scope.valueA = 0;                          
		$scope.valueB = 0;                          
		$scope.selectedOperation = null;            
		$scope.clearValue = true;  
	}
}]);
