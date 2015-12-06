Parse.initialize("O72xLjjVCEClACE9i42yd5niBw92vETKbKofHMga", "nXz5EGCUd7MAGGgKn8m2oUlNCFwLP70PLWlj1A8D");

//Run code on reload
var currentPageHash = window.location.hash.split('#');
var currentPageId = currentPageHash[1];

//Universal functions
function hasClass(element, cls) {
	return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function hidePages() {
	var pages = document.getElementsByClassName('page');
	for (i = 0; i < pages.length; i++) {
		pages[i].style.display = 'none';
	}
}

function logout() {
	document.getElementById('logout').style.display = 'block';
}


//Sign Up
var user = new Parse.User();

document.getElementById('register-submit').addEventListener('click', function(e) {
	e.preventDefault();

	user.set("username", document.getElementById('register-email').value);
	user.set("password", document.getElementById('register-password').value);
	user.set("email", document.getElementById('register-email').value);

	user.signUp(null, {
		success: function(user) {
			hidePages();
			logout();
			document.getElementById('dashboardPage').style.display = 'block';
		},
		error: function(user, error) {
			var query = new Parse.Query(Parse.User);
			query.equalTo('email', document.getElementById('register-email').value); // find all the women
			query.find({
				success: function(email) {
					if (email) {
						document.getElementById('alert').style.display = 'none';
						document.getElementById('alert').innerHTML = 'The email address already exists.'
					}
				}
			});
			// Show the error message somewhere and let the user try again.
			document.getElementById('alert').style.display = 'none';
			document.getElementById('alert').innerHTML = 'There was an error with the registration.'
		}
	});

});

//Login

document.getElementById('login').addEventListener('click', function(e) {
	hidePages();
	document.getElementById('loginPage').style.display = 'block';
});

document.getElementById('login-submit').addEventListener('click', function(e) {
	e.preventDefault();

	var user = document.getElementById('login-email').value;
	var password = document.getElementById('login-password').value;

	Parse.User.logIn(user, password, {
		success: function(user) {
			hidePages();
			logout();
			findPrs();
			document.getElementById('dashboardPage').style.display = 'block';
		},
		error: function(user, error) {
			document.getElementById('alert').innerHTML = 'There was an error with the login.'
		}
	});
});

document.getElementById('signUp').addEventListener('click', function(e) {
	hidePages();
	document.getElementById('registerPage').style.display = 'block';
});

//Logout 
document.getElementById('logout').addEventListener('click', function(e) {
	Parse.User.logOut();
	hidePages();
	logout();
	document.getElementById('loginPage').style.display = 'block';
});

//Current User Session
var currentUser = Parse.User.current();
if (currentUser) {
	hidePages();
	logout();
	if(!currentPageId){
		document.getElementById('dashboardPage').style.display = 'block';
	}
	else {
			document.getElementById(currentPageId).style.display = 'block';

	}
	findPrs();
}

//Homepage Link
document.getElementById('logo').addEventListener('click', function(e) {
	hidePages();
	findPrs();
	document.body.scrollTop = document.documentElement.scrollTop = 0;
	document.getElementById('dashboardPage').style.display = 'block';
	document.getElementById('percentage-input').value = '';
	document.getElementById('calc-results').innerHTML = ''
	//Prevent anchor jump on dashboard
	if (currentPageHash) {
		setTimeout(function() {
			window.scrollTo(0, 0);
		}, 1);
	}
});

var match = false;

//Get user PR's
function findPrs() {
	var prResults = '';
	var query = new Parse.Query('prObject');
	query.equalTo('user', currentUser);
	query.include('user');
	query.find({
		success: function(results) {
			for (var i = 0; i < results.length; i++) {
				var object = results[i];
				if (object.get('user').get('weightSetting') === 'kilograms') {
					prResults += '<div class="pr-item" data-id="' + object.id + '"><h3>' + object.get('liftName') + ' </h3><p> ' + parseFloat((object.get('liftWeight')*100)/100).toFixed(2) + ' kg</p><p>' + object.get('prDate') + '</div>'
				} else {
					prResults += '<div class="pr-item" data-id="' + object.id + '"><h3>' + object.get('liftName') + ' </h3><p> ' + parseFloat((object.get('liftWeight') * 2.2046 * 100) / 100).toFixed(2) + ' lbs</p><p>' + object.get('prDate') + '</div>'
				}	
			}
			document.getElementById('results').innerHTML = prResults


			//Internal Pages
			var prItems = document.getElementsByClassName('pr-item');

			for (i = 0; i < prItems.length; i++) {
				var prObject = prItems[i];
				var liftNameMatch

				prObject.addEventListener('click', function(e) {
					hidePages();
					logout();
					document.getElementById('internalPage').style.display = 'block';

					for (i = 0; i < results.length; i++) {
						var object = results[i];
						if (object.id === this.dataset.id) {
							var match = true;
							var liftNameMatch = object.get('liftName');

							document.getElementById('title').innerHTML = object.get('liftName')

							var query = new Parse.Query('User');

							query.get(Parse.User.current().id, {
							  success: function(user) {
							    var weightSetting = user.get('weightSetting');

							    if(weightSetting === 'kilograms'){
									document.getElementById('currentPr').innerHTML = '<p>' + parseFloat((object.get('liftWeight')*100)/100).toFixed(2) + " kg</p><p>" + object.get('prDate')
								}
								else {
									document.getElementById('currentPr').innerHTML = '<p>' + parseFloat((object.get('liftWeight') * 2.2046 * 100) / 100).toFixed(2) + " lbs</p><p>" + object.get('prDate')			
								}
							  },
							  error: function(object, error) {
							    console.log('There was an error.')
							  }
							});
						}
					}
					if(match === true){

							//Update PR
							var kilograms = document.getElementById('update-kilograms');
							var pounds = document.getElementById('update-pounds');

							pounds.addEventListener('click', function(e) {
								pounds.classList.add('active');
								kilograms.classList.remove('active');
							});
							kilograms.addEventListener('click', function(e) {
								kilograms.classList.add('active');
								pounds.classList.remove('active');
							});

							document.getElementById('update-submit').addEventListener('click', function(e){
								e.preventDefault();
								console.log('update');
								var err = false;
								var PrObject = Parse.Object.extend("prObject");
								var prObject = new PrObject();
								var liftName = liftNameMatch;
								console.log(liftName);
								var prDate = Date.parse(document.getElementById('prDateUpdate').value);
								var liftWeight = parseFloat(document.getElementById('liftWeightUpdate').value);

								function isEmpty(str) {
									return str.replace(/^\s+|\s+$/g, '').length == 0;
								}

								if (hasClass(kilograms, 'active') === true) {
									prObject.set("liftMetric", "kilograms");
								} else {
									var convertedWeight = parseFloat((liftWeight / 2.2046 * 100) / 100).toFixed(2);
									prObject.set("liftMetric", "pounds");
								}

								if (isNaN(prDate) === false) {
									var prD = new Date(prDate);
									prObject.set("prDate", prD);
								} else {
									err = true;
								}

								if (liftWeight === null || isNaN(liftWeight)) {
									err = true
								} else if (hasClass(kilograms, 'active') === true) {
									prObject.set("liftMetric", "kilograms");
									prObject.set("liftWeight", liftWeight);
								} else {
									var convertedWeight = liftWeight / 2.2046;
									prObject.set("liftMetric", "pounds");
									prObject.set("liftWeight", convertedWeight);
								}

								var currentUser = Parse.User.current();
								if (currentUser) {
									prObject.set('user', currentUser);
								} else {
									err = true;
								}

								if (err === true) {
									console.log('there was an error')
								} else {
									prObject.set("liftName", liftName);

									prObject.save(null, {
										success: function(prObject) {
											$('#updatePr').modal('hide');
										},
										error: function(prObject, error) {
											document.getElementById('alert').innerHTML = 'There was a problem creating the PR.'
										}
									});
								}

							});

							var matchQuery = new Parse.Query('prObject');
							matchQuery.equalTo('user', currentUser);
							matchQuery.include('user');
							var prLog = '';
							matchQuery.find({
								success: function(results) {
									for(i = 0; i < results.length; i++){
										var object = results[i];
										if (object.get('liftName') === liftNameMatch) {
											if(object.get('user').get('weightSetting') === 'kilograms'){
												prLog += '<p>' + parseFloat((object.get('liftWeight')*100)/100).toFixed(2) + 'kg</p><p>' + object.get('prDate') + '</p>'
											}
											else {
												prLog += '<p>' + parseFloat((object.get('liftWeight') * 2.2046 * 100) / 100).toFixed(2)	 + 'lbs</p><p>' + object.get('prDate') + '</p>'

											}
											
										}
										
									}
									document.getElementById('prLog').innerHTML = prLog
								},
								error: function(error) {
									alert('There was an error');
								}
							});

							
						}

				});
			}

		

			//Calculate percentage
			document.getElementById('calc-submit').addEventListener('click', function(e){
				e.preventDefault();

				var percentage = parseFloat(document.getElementById('percentage-input').value);
				var query = new Parse.Query('User');

				query.get(Parse.User.current().id, {
				  success: function(user) {
				    var weightSetting = user.get('weightSetting');

				    if(weightSetting === 'kilograms'){
				    	var kgWeight = parseFloat((object.get('liftWeight')*100)/100).toFixed(2)
						document.getElementById('calc-results').innerHTML = parseFloat(kgWeight*(percentage/100)).toFixed(2) + ' kg'
					}
					else {
						var lbWeight = parseFloat((object.get('liftWeight') * 2.2046 * 100) / 100).toFixed(2);
						console.log(lbWeight);
						document.getElementById('calc-results').innerHTML = parseFloat(lbWeight*(percentage/100)).toFixed(2) + ' lbs'			
					}
				  },
				  error: function(object, error) {
				    console.log('There was an error.')
				  }
				});


			});


		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

//User set settings on refresh
function findSettings() {
	var settingsResults = '';
	var settingsQuery = new Parse.Query('prObject');
	settingsQuery.equalTo('user', currentUser);
	settingsQuery.include('user');
	settingsQuery.find({
		success: function(results) {
			var object = results[i];
			if (object.get('user').get('weightSetting') === 'kilograms') {
				lbSetting.classList.remove('active');
				kgSetting.classList.add('active');
			} else {
				lbSetting.classList.add('active');
				kgSetting.classList.remove('active');
			}
		},
		error: function(error) {
			alert('There was an error');
		}
	});
}


//New PR
var kilograms = document.getElementById('new-kilograms');
var pounds = document.getElementById('new-pounds');

pounds.addEventListener('click', function(e) {
	pounds.classList.add('active');
	kilograms.classList.remove('active');
});
kilograms.addEventListener('click', function(e) {
	kilograms.classList.add('active');
	pounds.classList.remove('active');
});

document.getElementById('pr-submit').addEventListener('click', function(e) {

	var PrObject = Parse.Object.extend("prObject");
	var prObject = new PrObject();
	var liftName = document.getElementById('liftName').value;
	var prDate = Date.parse(document.getElementById('prDate').value);
	var liftWeight = parseFloat(document.getElementById('liftWeight').value);

	function isEmpty(str) {
		return str.replace(/^\s+|\s+$/g, '').length == 0;
	}

	var duplicateQuery = new Parse.Query('prObject');
	duplicateQuery.find({
		success: function(results) {
			var err = false;

			for (var i = 0; i < results.length; i++) {
				var object = results[i];
				var liftResult = object.get('liftName').toLowerCase();
				var inputResult = liftName.toLowerCase();

				if (liftResult === inputResult || isEmpty(inputResult)) {
					err = true;
				}
			}

			if (hasClass(kilograms, 'active') === true) {
				prObject.set("liftMetric", "kilograms");
			} else {
				var convertedWeight = parseFloat((liftWeight / 2.2046 * 100) / 100).toFixed(2);
				prObject.set("liftMetric", "pounds");
			}

			if (isNaN(prDate) === false) {
				var prD = new Date(prDate);
				prObject.set("prDate", prD);
			} else {
				err = true;
			}

			if (liftWeight === null || isNaN(liftWeight)) {
				err = true
			} else if (hasClass(kilograms, 'active') === true) {
				prObject.set("liftMetric", "kilograms");
				prObject.set("liftWeight", liftWeight);
			} else {
				var convertedWeight = liftWeight / 2.2046;
				prObject.set("liftMetric", "pounds");
				prObject.set("liftWeight", convertedWeight);
			}

			var currentUser = Parse.User.current();
			if (currentUser) {
				prObject.set('user', currentUser);
			} else {
				err = true;
			}



			if (err === true) {
				console.log('there was an error')
			} else {
				prObject.set("liftName", liftName);

				prObject.save(null, {
					success: function(prObject) {
						$('#addPr').modal('hide');
						findPrs();
					},
					error: function(prObject, error) {
						document.getElementById('alert').innerHTML = 'There was a problem creating the PR.'
					}
				});
			}
		},
		error: function(error) {
			console.log('There was an error creating the lift.')
		}
	});
});

//Settings Page
findSettings();
document.getElementById('settings').addEventListener('click', function(e) {
	hidePages();
	logout();
	document.getElementById('settingsPage').style.display = 'block';
});

var kgSetting = document.getElementById('settings-kg');
var lbSetting = document.getElementById('settings-lbs');

lbSetting.addEventListener('click', function(e) {
	lbSetting.classList.add('active');
	kgSetting.classList.remove('active');
	currentUser.save({
		weightSetting: 'pounds'
	});

	document.getElementById('percentage-input').value = '';
	document.getElementById('calc-results').innerHTML = ''
});
kgSetting.addEventListener('click', function(e) {
	kgSetting.classList.add('active');
	lbSetting.classList.remove('active');
	currentUser.save({
		weightSetting: 'kilograms'
	});

	document.getElementById('percentage-input').value = '';
	document.getElementById('calc-results').innerHTML = ''
});

