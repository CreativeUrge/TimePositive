/////////////////////////////////////////////////
/*SET SOME VARIABLES*/
/////////////////////////////////////////////////
var windowHeight = $(window).height();
var windowWidth = $(window).width();

var settingsDivActive = false;
var currentDropinScreen = "";
var currentOverviewWeek = 0;
var numberOfWeeksInSchedule = 1;
var earliestPossibleFinishDate = "";
var bookedOutTillDate = new Date();

var U = ""; // U is used to store the User object
var userEmail = "";

// A premium feature is to be able to create multiple Profiles, each featuring a different work schedule and group of projects.
var Profile = 0; //The array ID of the user's chosen Profile
var Projects = []; //An array that gets loaded with the user's projects in the loadUserObjectAndSetUp function
var userProfileNames = []; //This is used to store a list of the user's profile names and is defined in the setUp() function
var numberOfProfiles = 0; //This gets defined in the setUp() function

var totalTimeSpentToday = 0;
var totalOvertimeSpentToday = 0;
var totalSuggestedAmountToday = 0;
var currentProjectId = "0";
var currentProfileId = "0"; //This does NOT relate with the active profile -- it is just for renaming and deleting profiles
var today = new Date();

/////////////////////////////////////////////////
/* TOUR */
/////////////////////////////////////////////////

$("#tourButton-1").click(function(){
	sound("bleepEcho");
	$("#tourBox-1").fadeOut(function(){
		$("#tourBox-2").fadeIn();
	});
});

$("#tourButton-2").click(function(){
	sound("bleepEcho");
	$("#tourBox-2").fadeOut(function(){
		$("#tourShade").fadeOut();
	});
	//Now you've had the tour!
	U.hasHadTour = true;
	updateUserData();
});

/////////////////////////////////////////////////
/* HOME PAGE */
/////////////////////////////////////////////////

function animateTitleBox(){
	windowHeight = $(window).height();
	
	$("#logoBox")[0].style.top = "-" + windowHeight + "px";
	$("#logoBox")[0].style.visibility = "visible";
	
	$("#mainTitle").animate({opacity: 1},1000,function(){
		$("#subTitle").animate({opacity: 1},700,function(){
			$("#logoBox").animate({top: 0},1000,"easeOutBounce",function(){
				$("#logo_T").animate({left: 10},300,"easeOutBack",function(){
					$("#logo_plus").animate({top: 0},800,"easeOutElastic",function(){
						$("#signUpButton,#caption,#teaserArrow").animate({opacity: 1},3000,"easeOutBack");
						$("#explanation").animate({opacity: 0.8},3000,"easeOutBack");
					});
				});
			});
		});
	});
}

//AUTOSCROLL PAGE WHEN YOU CLICK THE ARROW
$("#teaserArrow").click(function(){
	sound("bleepEcho");
	$('html, body').animate({scrollTop: $("#contentBody").offset().top - 65}, 800, "easeInQuart");
});

var currentPasscodeDigit = 1;

function typePasscodeNumber(n){
	if(currentPasscodeDigit <= 3){
		sound("jump");
		$("#number-"+currentPasscodeDigit)[0].innerHTML = n;
		$("#number-"+currentPasscodeDigit).animate({top:0},500,"easeOutElastic");
		currentPasscodeDigit += 1;
		if(currentPasscodeDigit == 4){
			tryPasscode();
		}
	}else{
		sound("blaster");
		$("#numberButtons").effect("shake",{
			distance: 10,
		});
	}
}

function clearPasscodeNumber(){
	if(currentPasscodeDigit > 1){
		sound("shoot");
		$("#number-"+(currentPasscodeDigit-1)).animate({top:60},200,"easeInBack",function(){
			$("#number-"+(currentPasscodeDigit-1))[0].innerHTML = "";
			currentPasscodeDigit -= 1;
		});
	}else{
		sound("blaster");
		$("#numberButtons").effect("shake",{
			distance: 10,
		});
	}
	if(currentPasscodeDigit == 0){
		currentPasscodeDigit = 1;
	}
}

function tryPasscode(){
	var thePasscode = "";
	thePasscode = $("#number-1")[0].innerHTML + $("#number-2")[0].innerHTML + $("#number-3")[0].innerHTML;
	console.log("Trying Passcode " + thePasscode);
	var x = "sun"; var y = "0"; var z = "intelligence"; //Very tricky
	var XXX = x.length + y + z.length / 4;
	
	if(thePasscode == XXX){
		setTimeout(function(){sound("levelUp");},500);
		console.log("success");
		$("#numberButtons").fadeOut(function(){
			$("#welcomeEarlyAdopter").fadeIn();
		});
		$("#number-1").delay(500).animate({top:60},200,"easeInBack",function(){
			$("#cherryCard-1").animate({top:2},800,"easeOutElastic");
			$("#number-2").animate({top:60},200,"easeInBack",function(){
				$("#cherryCard-2").animate({top:2},800,"easeOutElastic");
				$("#number-3").animate({top:60},200,"easeInBack",function(){
					$("#cherryCard-3").animate({top:2},800,"easeOutElastic",function(){
						$("#stillWantToHelp").fadeOut();
						$("#earlyAdoptersBlurb").fadeOut(function(){
							$("#passcodeDisplay").fadeOut();
							$("#numberPad").animate({marginTop:-75},600);
							$("#welcomeEarlyAdopter").animate({top:70},600,function(){
								$("#numberPad").animate({height:125},300);
								$("#numberPad").animate({height:125,marginBottom:0},300,function(){
									$("#earlyAdopterAccountDetailsDiv").fadeIn();
								});
							});
						});
					});
				});
			});
		});
	}else{
		console.log("wrong passcode");
		setTimeout(function(){sound("blaster");},500);
		$("#passcodeDisplay").delay(500).effect("shake",{
			distance: 10
		});
	}
}

function tryToAddEmailToList(){
	console.log('trying to add email to invitation list');
	//Clear any existing error messages
	$("#errorDiv-invitation,#errorDiv-invitationEmail").hide();
	
	//CHECK FOR ERRORS
	var errors = false;
	
	var emailInput = $("#invitationInputEmail")[0].value;
	
	//Be sure the email is not blank:
	if(($.trim( $('#invitationInputEmail').val() ) == '')||(emailInput == "Your Email")){
		showErrorMessage('errorDiv-invitationEmail','Please enter your email.');
		errors = true;
	}else{
		//Be sure the email is formatted correctly
		var emailRegex =/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if(!emailInput.match(emailRegex)){
			showErrorMessage('errorDiv-invitationEmail','Check the format of your email address. It should look something like this: <b>you@example.com</b>');
			errors = true;
		}
	}
	
	if(errors){
		//Play error sound
		sound("descend");
	}
	
	//If nothing is blank or formatted wrong, we go ahead and use AJAX to check files on the server
	if(!errors){
		addEmailToList(emailInput);
		//Note to self: there is no safeguard against an email being added more than once to the list.
		
		//Play success sound
		sound("oneUp");
	}
}

function addEmailToList(e){
	$.ajax({
  	  method: "POST",
  	  url: "scripts/updateEmailList.php",
  	  data: { email: e }
  	})
   	 .done(function( msg ) {
     	 console.log("Communication with updateEmailList.php:");
		 
		 if(msg == 1){
		 	//Success! Show Thank You message
			 console.log('Success.');
			 $("#signUpForInvitationDiv").fadeOut(function(){
			 	 $("#youWillGetYourInvitationDiv").fadeIn();
			 });
		 }else{
		 	//Failure. Show error message
			 console.log('Failed to add email.');
			 $("#signUpForInvitationDiv").fadeOut(function(){
			 	 $("#signupFailureDiv").fadeIn();
			 });
		 }
	});
}

function tryToCreateNewEarlyAdopterAccount(){
	//HIDE ANY ERROR MESSAGES THAT MAY BE PRESENT
	$(".errorDiv").hide();
	
	//GET THE INPUT VALUES
	var theName = $("#earlyAdopterInputName")[0].value;
	var theEmail = $("#earlyAdopterInputEmail")[0].value;
	thePassword = $("#earlyAdopterInputPassword")[0].value;
	theConfirmPassword = $("#earlyAdopterInputConfirmPassword")[0].value;
	
	//CHECK FOR ERRORS
	var error = false;
	
	//Be sure the Name is not blank
	if($.trim( theName ) == '' || theName == 'Your Name'){
		showErrorMessage("errorDiv-earlyAdopterSignupName","Please make a name for yourself:");
		error = true;
	}
	//Be sure the Email is not blank
	if($.trim( theEmail ) == '' || theEmail == 'Your Email'){
		showErrorMessage("errorDiv-earlyAdopterSignupEmail","Enter an email:");
		error = true;
	}
	
	//Be sure the Name is not crazy
	nameRegex = /^[a-zA-Z0-9 ]+$/;
	if((!theName.match(nameRegex)) && ($.trim( theName) != '')){
		showErrorMessage("errorDiv-earlyAdopterSignupName","Your name must only contain letters, numbers, and spaces. No special characters.");
		error = true;
	}
	//Be sure the Email is valid
	emailRegex =/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if((!theEmail.match(emailRegex)) && ($.trim( theEmail ) != '') && theEmail != 'Your Email'){
		showErrorMessage("errorDiv-earlyAdopterSignupEmail","Please check the format of your email address. It should look something like this: <b>you@example.com</b>");
		error = true;
	}
	
	//Be sure the Password is not blank
	if(($.trim( thePassword ) == '') || (thePassword == 'Password')){
		showErrorMessage("errorDiv-earlyAdopterSignupPassword","Please enter a password:");
		error = true;
	}else{
		//Be sure the Confirm Password is not blank
		if(($.trim( theConfirmPassword ) == '') || (theConfirmPassword == 'Confirm Password')){
			showErrorMessage("errorDiv-earlyAdopterSignupConfirmPassword","Please re-type your password to confirm it:");
			error = true;
		}else{
			//Be sure the Confirm Password matches the New Password
			if(theConfirmPassword != thePassword){
				showErrorMessage("errorDiv-earlyAdopterSignupConfirmPassword","The passwords do not match.");
				error = true;
			}
		}
	}
	
	if(error){
		//Play error sound
		sound("descend");
	}
	
	//IF EVERYTHING PASSES THE ERROR CHECKS SO FAR...
	if(!error){
		
		//CHECK IF THE EMAIL ALREADY EXISTS
		console.log("The Email: " + theEmail.toLowerCase());
		
		$.ajax({
		  method: "POST",
		  url: "scripts/checkForEmail.php",
		  data: { email: theEmail }
		})
	 	 .done(function( msg ) {
		   	 console.log("Communication with PHP successful. The message is this:");
			 console.log(msg);

		   	  if(msg == 1){
		   		  console.log('That email already exists!');
				  showErrorMessage("errorDiv-earlyAdopterSignupEmail","That email is already associated with a different account.");
				  return false;
		  
		   	  }else{
  					//IF EVERYTHING IS A GO, CREATE THE ACCOUNT
				 	createNewAccount(theName,theEmail,thePassword,"earlyAdopter");
					//Play success sound
					sound("oneUp");
		   	  }
		});
	}
}

function createNewAccount(theName,email,password,memberStatus){
	$("#saveStatusMessage")[0].innerHTML = "Saving...";
	$("#saveStatusMessage").show();

	//UPDATE THE RECORD IN users.js
	updateUserList("",email);
	
	//CREATE THE USER OBJECT
	U = new UserObject(theName,email,password,memberStatus);

	//CREATE THE USEREMAIL COOKIE
	userEmail = email;
	document.cookie = "userEmail=" + email;

	//UPDATE USER DATA
	updateUserData();
	
	//THIS NEXT BIT IS SPECIFIC TO EARLY ADOPTER SIGN UP
    $("#earlyAdopterAccountDetailsDiv,#numberPad").fadeOut(function(){
    	 $("#welcomeDiv").fadeIn(function(){
			 $("#earlyAdoptersDiv").fadeOut();
    	 });
    });
}

/* HOMEPAGE SOUND ON/OFF CONTROL */
$("#homePageSpeakerIcon").click(function(){
	if(soundIsOn){
		//Turn sounds off
		var newVolume = 0;
		$("#homePageSpeakerIcon")[0].src = "images/speakerIcon-off-white.png";
		soundIsOn = false;
		document.cookie = "soundPreference=off";
		
		//Fade Out introMusic
		$("#introMusic").animate({volume: newVolume}, 1000,function(){
			pause("introMusic");
		});
	}else{
		//Turn sounds on
		var newVolume = 0.07;
		$("#homePageSpeakerIcon")[0].src = "images/speakerIcon-on-white.png";
		soundIsOn = true;
		document.cookie = "soundPreference=on";
		
		//Play introMusic
		sound("introMusic");
		$("#introMusic").animate({volume: newVolume}, 2000);
	}
});

/* ENTER APP BUTTON */
$("#enterAppButton").click(function(){
	//Log in by refreshing the page
 	location.reload();
});

/* TRY AGAIN BUTTON */
$("#tryAgainButton").click(function(){
 $("#signupFailureDiv").fadeOut(function(){
 	 $("#signUpForInvitationDiv").fadeIn();
 });
});

/* CANCEL SIGNUP BUTTON */
$("#cancelSignUpButton,#closeSignUpButton").click(function(){
	$("#signupDiv,#youWillGetYourInvitationDiv").hide();
});

$("#cancelSignUpButton").click(function(){
	sound("playerDamage");
});

$("#closeSignUpButton").click(function(){
	sound("bleepEcho");
});


/* LITTLE LOGO ICON */
$("#preLoginLittleLogo").click(function(){
	sound("win");
	$("#signupDiv,#welcomeDiv,#earlyAdoptersDiv,#loginDiv").hide();
});

/* CANCEL EARLY ADOPTER BUTTON */
$("#earlyAdopterCancelButton,#earlyAdopterCancelSignUpButton").click(function(){
	sound("playerDamage");
	$("#earlyAdoptersDiv").hide();
});

/* SIGNUP LINKS */
$("#signUp,#signUpButton,.selectPlanButton").click(function(){
	sound("bleepEcho");
	$("#errorDiv-invitation,#errorDiv-invitationEmail").hide(); //Clear any existing error messages
	$("#signupDiv,#signUpForInvitationDiv").show();
	$("#invitationInputEmail")[0].value = "Your Email";
	$("#invitationInputEmail").focus();
});

$("#signUp").click(function(){
	$("#welcomeDiv,#earlyAdoptersDiv,#loginDiv").hide();
});

/* EARLY ADOPTERS LINK */
$("#earlyAdopters").click(function(){
	sound("bleepEcho");
	$("#earlyAdoptersDiv,#earlyAdoptersPasswordDiv").show();
	currentPasscodeDigit = 1;
	$("#number-1")[0].innerHTML = $("#number-2")[0].innerHTML = $("#number-3")[0].innerHTML = "";
	$("#number-1")[0].style.top = $("#number-2")[0].style.top = $("#number-3")[0].style.top = "60px";
	$("#cherryCard-1")[0].style.top = $("#cherryCard-2")[0].style.top = $("#cherryCard-3")[0].style.top = "-90px";
	$("#signupDiv,#welcomeDiv,#loginDiv").hide();
});

/* TRY EARLY ADOPTER SIGNUP BUTTON */
$("#tryEarlyAdopterSignupButton").click(function(){
	tryToCreateNewEarlyAdopterAccount();
});

/* TRYCREATEACCOUNT BUTTON */
$("#trySignUpButton").click(function(){
	tryToAddEmailToList();
});

/////////////////////////////////////////////////
/*SERVER-SIDE DATA WRANGLING*/
/////////////////////////////////////////////////

//On Page Load, check to see if the user is already logged in by looking for a cookie
function initiateApp(){
	userEmail = getCookie("userEmail");
	if(userEmail){
		console.log('You are logged in!');
		loadUserObjectAndSetUp();
	}else{
		console.log('NOT logged in.');
		$("#pre-login").show();
		
		//If the user is logged out and soundPreference is on, play introMusic
		if(getCookie("soundPreference") == "on"){
			console.log('YES');
			soundIsOn = true;
			sound("introMusic");
		}
		
	}
	//Check in on the soundPreference cookie
	if(getCookie("soundPreference") == "on"){
		soundIsOn = true;
		$("#speakerIcon")[0].src = "images/speakerIcon-on.png";
		$("#homePageSpeakerIcon")[0].src = "images/speakerIcon-on-white.png";
	}
}

//Read the user's file and load the U object
function loadUserObjectAndSetUp(){
	$.ajax({
	  method: "GET",
	  url: "scripts/treasure/"+userEmail+".js",
	  dataType: "text",
	  complete: function(r){
		  //console.log('Data retrieved: '+r.responseText);
		  
		  //Load the the U variable with the user's data
		  U = JSON.parse(r.responseText);
		  
		  //A little house keeping: delete any vacationDays that are in the past
		  deletePastVacationDays();
		  //Show that the user is logged in
		  U.activityStatus = "Logged In";
		  //Update lastLogIn date in user's data
		  U.lastActiveDate = new Date().toLocaleDateString();
		  //Set Midnight Refresh Trigger
		  setMidnightRefreshTrigger();
		  
		  //Set the userdata cookie
		  document.cookie = "userdata=" + JSON.stringify(U);
		  
		  //Set Up
		  setUp();
	  }
	});
}

//DELETE PAST VACATION DAYS
function deletePastVacationDays(){
	var l = U.profiles.length;
	//console.log("We have " + l + " profiles to check.");
	for(i=0;i<l;i++){
		//Attend to vacationDays in each profile
		var v = U.profiles[i].vacationDays.length;
		//console.log("====>The profile " + U.profiles[i].profileName + " has " + v + " vacation days.");
		
		if(v > 0){
			//If there are any vacationDays, loop through them and delete any that are past
			for(x=0;x<v;x++){
				var vacationDayToTest = U.profiles[i].vacationDays[0];
				//console.log("Testing the vacation day " + U.profiles[i].vacationDays[0]);
				if(new Date(U.profiles[i].vacationDays[0]).getTime() < new Date(today.toDateString()).getTime()){
					//console.log("That vacation day is in the past! Removing it...");
					U.profiles[i].vacationDays.splice(0,1);
				}else{
					//console.log("That vacation day checks out fine. We're done checking this profile.");
					//Vacation days are ordered chronologically, so once we find one that is not past, we know the rest will be fine too
					break;
				}
			}
		}
	}
}

//UPDATE USER DATA
function updateUserData(refresh){
	var D = JSON.stringify(U, null, "\t"); //Note the last parameter, "\t", makes the resulting object easy to read with indents
	//console.log("<======UPDATING USER DATA=====>"+D);
	//console.log("About to overwrite the "+userEmail+" user file with the following: "+D);
	$.ajax({
		method: "POST",
		url: "scripts/updateUserData.php",
		data: { user: userEmail, data: D }
		})
	 	 .done(function( msg ) {
	   	 //console.log( "Data Saved.");
		 
		 //Handle the Save Status Message
		 $("#saveStatusMessage").fadeOut(function(){
			 $("#saveStatusMessage")[0].innerHTML = "All up to date.";
			 $("#saveStatusMessage").fadeIn();
			 setTimeout(function(){$("#saveStatusMessage").fadeOut();},5000);
		 });
		 
	 	 //Set the userdata cookie
		  document.cookie = "userdata=" + JSON.stringify(U);
	  
		 //Refresh the display (not an actual page refresh) if the refresh argument has been given
		 if(refresh){
			 refreshProjectFlow();
		 }
	});
}

//UPDATE USERLIST (called when a user changes their email or deletes their account)
function updateUserList(o,n){
	$.ajax({
  	  method: "POST",
  	  url: "scripts/updateUserList.php",
  	  data: { oldEmail: o, newEmail: n }
  	})
   	 .done(function( msg ) {
     	 console.log("Communication with updateUserList.php:");
		 console.log(msg);
	});
}

//REFRESH PROJECT FLOW
function refreshProjectFlow(){
	//Reset relevant variables to the way they were when the page first loaded
	currentOverviewWeek = 0;
	numberOfWeeksInSchedule = 1;
	earliestPossibleFinishDate = "";
	bookedOutTillDate = new Date();
	U = ""; // I added this line and the next when debugging the renameProfile() function, since somehow the old profile name was persisting. But it did not solve it. // 01/29/16 This line previously read 'var U = ""', which obviously did nothing. I took out the "var" keyword today in hopes it would prevent the duplication problem I am having with the midnightRefresh() bug.
	Profile = 0;
	Projects = [];
	userProfileNames = [];
	currentProjectId = "0";
	currentProfileId = "0";
	totalTimeSpentToday = 0;
	totalOvertimeSpentToday = 0;
	totalSuggestedAmountToday = 0;
	today = new Date();
	orderedProjects = [];
	dateSpan = [];

	//Recreate the page
 	loadUserObjectAndSetUp();
}

//UPGRADE TO PREMIUM ACCOUNT (From a Basic Account, this function is called from the Account Screen)
function upgradeToPremium(){
	//When I launch Paid Premium, I will want to adjust this function to check if a user has already had a trial period, to prevent perpetual free trials
	U.memberStatus = "trial";
	U.trialStartDate = today.toLocaleDateString();
	U.trialEndDate = new Date(today.getTime() + 2592000000).toLocaleDateString();
	U.hasHadTrial = true;
	updateUserData(1);
	showMessageBar(0,"Woo Hoo! You have begun your 30-day free trial of TimePositive Premium.");
}

/////////////////////////////////////////////////
/* GENERAL PAGE DISPLAY STUFF */
/////////////////////////////////////////////////

function setUp(){
	//Hide the login stuff
	$("#loginDiv").hide();
	$("#pre-login").hide();
	
	
	/////////////////////////////////////////////////
	////////////SET THE APPROPRIATE PROFILE//////////
	/////////////////////////////////////////////////
	
	//Look through the user profiles and create an array of their names
	var l = U.profiles.length;

	for(i=0;i<l;i++){
		userProfileNames.push(U.profiles[i].profileName);
		//console.log(userProfileNames);
	}
	
	//Set our numberOfProfiles variable
	numberOfProfiles = userProfileNames.length;
	
	//Check to see if a profile cookie is set and load the given profile if it is
	/*EXPLANATION: The profile cookie persists even if the user logs out. This way, if they want to log out and log back in 
	on the same machine, the last profile they were using still comes up. But what if they log out, and someone else logs
	in with a different account? We want to make sure the profile cookie is ignored in that case. So we set the profile cookie
	to include the userEmail, so it looks like this: email@sample.com_ProfileName, with an underscore separating
	the two parts.*/
	
	var theProfile = getCookie("profile");
	if(theProfile){
		//IF A PROFILE COOKIE EXISTS
		var str = theProfile.split('_');
		//console.log("+ Profile cookie is already set to " + theProfile);
		
		if(U.email == str[0]){
			//IF THE PROFILE COOKIE MATCHES THE USER ACCOUNT, set the chosen Profile accordingly
			//console.log("+ This userEmail matches: " +  str[0]);

			//Loop through the userProfileNames array until you find the index of the profile name indicated by the profile cookie
			var profileNameLocated = false;
			
			for(i=0;i<l;i++){
				if(userProfileNames[i] == str[1]){
					Profile = i;
					profileNameLocated = true;
					break;
				}
			}
			
			//This is an error which supposedly never will happen, but sometimes HAS been when renaming the active profile!
			if(!profileNameLocated){
				console.log("===>THIS IS STRANGE... The profile name '" + str[1] + "' could not be located.");
				showMessageBar(1,"A mysterious error has occurred... Your profile name has been saved, but it is not showing up in the list.<br>Just refresh the page and all will be well. <a href='javascript:location.reload()'><b>[ Click here to refresh! ]</b></a>");
			}
			
			//console.log("+ Profile is set to " + Profile);
			
		}else{
			//IF THE PROFILE COOKIE DOES NOT MATCH THE USER ACCOUNT
			
			//Just set the Profile to the first one in the list
			Profile = 0;
			document.cookie = "profile=" + U.email + "_" + userProfileNames[0];
			//console.log("+ Profile Cookie was set but did not match this user. It is now set to " + U.email + "_" + userProfileNames[0]);
		}
	}else{
		//IF A PROFILE COOKIE DOES NOT EXIST
		
		//Just set the Profile to the first one in the list
		Profile = 0;
		document.cookie = "profile=" + U.email + "_" + userProfileNames[0];
		//console.log("+ Profile Cookie was not set but is now set to " + U.email + "_" + userProfileNames[0]);
	}
	
	///////////////////////////////////////////////////////////////////////////////
	//////////LOAD THE PROJECTS VARIABLE, SET AND CREATE VARIOUS ELEMENTS//////////
	///////////////////////////////////////////////////////////////////////////////
	
	//Give a tour if the user has not had one yet
	if(U.hasHadTour == false){
		$("#tourShade").show();
		$("#tourBox-1").show();
	}

	//Load the Projects variable with the user's projects and call a couple functions
 	Projects = U.profiles[Profile].projects;
 	calculateTotalTimeSpentToday();
	orderProjects();
	
	
	///////Set and create various elements:
	
	//Set Login Welcome Message
	$("#loginWelcome")[0].innerHTML = U.name;
	if(dateSpan[0].vacationDay == true){
		$("#vacationMessage")[0].style.display = "inline-block";
		$("#progressDisplay").hide();
	}else{
		$("#progressDisplay").show();
		$("#vacationMessage").hide();
	}
	//Set overview box project count
	var correctPlural = (U.profiles[Profile].projects.length == 1) ? "Project" : "Projects";
	$("#overviewBoxProjectCount")[0].innerHTML = "<span id='overviewBoxProjectNumber' class='bgcolor-9'>"+Projects.length+"</span> "+correctPlural;
	//Load the overviewBox week bar
	setOverviewBoxWeekBar(0);
	//Load the overviewBox day fills
	setCalendarDayFills(0);
	//Reset overviewBox calendar buttons
	$("#overviewBoxCalendarButton-right").show();
	$("#overviewBoxCalendarButton-right")[0].style.width = "240px";
	$("#overviewBoxCalendarButton-left").hide();
	//Load calculations
	if(Projects.length > 0){
		$("#earliestPossibleFinishDate")[0].innerHTML = findEarliestPossibleFinishDate();
		$("#youHaveSomeProjects").show();
		$("#youHaveNoProjects").hide();
		$("#youHaveUntimelyProjects").hide();
	}else{
		$("#youHaveSomeProjects").hide();
		$("#youHaveUntimelyProjects").hide();
		$("#youHaveNoProjects").show();
	}
	//Generate a project box for each project
	generateProjectBoxes(); //This function then calls 
	
	//Load the day's work progress bar
	setDailyWorkProgressDisplay(); // NOTE this will only work if calculateTotalTimeSpentToday() and generateProjectBoxes() have completed. So far it has not been a problem.
	
	//Load today's date display
	loadTodayDateDisplay();
	
	//Show extra features if user has a premium account
	switch(U.memberStatus){
		case "earlyAdopter":
			$("#infoModule-profile")[0].style.display = "inline-block";
			$("#premiumProfileModule").show();
			$("#basicProfileModule").hide();
			$("#trialAccountModule").show();
			$("#basicAccountModule").hide();
			//Display days left in free trial
			var daysLeftInTrialPeriod = (new Date(U.trialEndDate).getTime() - new Date(today.toLocaleDateString()).getTime()) / 86400000;
			daysLeftInTrialPeriod = Math.round(daysLeftInTrialPeriod);
			if(daysLeftInTrialPeriod < 0){daysLeftInTrialPeriod = 0;}
			$("#daysLeftInTrialPeriod")[0].innerHTML = daysLeftInTrialPeriod;
			break;
		case "premium":
			$("#infoModule-profile")[0].style.display = "inline-block";
			$("#premiumProfileModule").show();
			$("#basicProfileModule").hide();
			$("#premiumAccountModule").show();
			$("#basicAccountModule").hide();
			break;
		case "trial":
			$("#infoModule-profile")[0].style.display = "inline-block";
			$("#premiumProfileModule").show();
			$("#basicProfileModule").hide();
			$("#trialAccountModule").show();
			$("#basicAccountModule").hide();
			//Display days left in free trial
			var daysLeftInTrialPeriod = (new Date(U.trialEndDate).getTime() - new Date(today.toLocaleDateString()).getTime()) / 86400000;
			daysLeftInTrialPeriod = Math.round(daysLeftInTrialPeriod);
			if(daysLeftInTrialPeriod < 0){daysLeftInTrialPeriod = 0;}
			$("#daysLeftInTrialPeriod")[0].innerHTML = daysLeftInTrialPeriod;
			break;
		case "basic":
			$("#infoModule-profile").hide();
			$("#premiumProfileModule").hide();
			$("#basicProfileModule").show();
			break;
		case "sample": //Like Premium, but you can't edit the email or password
			$("#infoModule-profile")[0].style.display = "inline-block";
			$("#premiumProfileModule").show();
			$("#sampleAccountModule").show();
			$("#basicProfileModule").hide();
			$("#basicAccountModule").hide();
			$("#sampleUserBlockEditDiv").show(); //BOOYAH!
			break;
	}
	
	//Load Profiles into the profile info module
	loadProfilesIntoInfoModule();
	
	//Load Work Schedule DropIn Screen
	loadWorkScheduleScreen();
	//Load Vacation Days DropIn Screen
	loadVacationDaysScreen();
	//Load Account DropIn Screen
	loadAccountScreen();
	//Load Profiles DropIn Screen
	loadProfileScreen();
	
	//Once it is all set, show it
    $("#post-login").show();
}

function loadTodayDateDisplay(){
	var dateString = new Date().toDateString();
	var dayName = dateString.substring(0,3);
	$("#info-dayName")[0].innerHTML = dayName;
	
	var theLocaleDate = new Date().toLocaleDateString();
	//toLocaleDateString on iOS and Safari and mac produces something like "February 3, 2016" instead of 2/3/2016. Account for this.
	
	if(theLocaleDate.match("/")){
		//console.log("We Are Using Slashes");
		var theMonth = theLocaleDate.split("/")[0];
		var theDay = theLocaleDate.split("/")[1];
		var theYear = theLocaleDate.split("/")[2].substring(2,4);
	}else{
		//console.log("We Have No Slashes");
		var theMonth = new Date().getMonth();
		theMonth += 1;theYear
		var theDay = new Date().getDate();
		var theYear = new Date().getFullYear();
		theYear = theYear.toString();
		theYear = theYear.substring(2,4);
	}
	
	if(theMonth < 10){theMonth = "0" + theMonth;}
	if(theDay < 10){theDay = "0" + theDay;}
	
	$("#info-month")[0].innerHTML = theMonth;
	$("#info-day")[0].innerHTML = theDay;
	$("#info-year")[0].innerHTML = theYear;
}

function loadProfilesIntoInfoModule(){
	
	//Display the name of the active profile
	$("#info-profileName")[0].innerHTML = userProfileNames[Profile];
	
	if(numberOfProfiles > 1){
		var theClass = $("#info-profileName")[0].getAttribute("class");
		if(!theClass.match("clickable")){theClass = theClass + " clickable";}
		$("#info-profileName")[0].setAttribute("class",theClass);
		$("#info-profileName")[0].setAttribute("onclick","$('#info-additionalProfileItemsDiv').toggle()");
		
	}else{
		
		//If there is only one profile, be sure the profile name is not clickable
		var theClass = $("#info-profileName")[0].getAttribute("class");
		if(theClass.match("clickable")){theClass = theClass.replace("clickable", "");}
		$("#info-profileName")[0].setAttribute("class",theClass);
		$("#info-profileName")[0].setAttribute("onclick","");
	}
	
	var theClass = $("#info-profileName")[0].getAttribute("class");
	
	//START OF WITH AN EMPTY DIV
	$("#info-additionalProfileItemsDiv")[0].innerHTML = "";
	
	//numberOfProfiles is set in the setUp() function
	//Note that we have this for loop set up to list the items in reverse order (so that most recently created appear on top)
	for(i=numberOfProfiles-1;i>=0;i--){
		
		//CHECK IF THIS PROFILE IS THE ACTIVE PROFILE
		if(userProfileNames[i] == userProfileNames[Profile]){continue;} //We do not create a div for the active profile
		
		////////CREATE PROFILE ELEMENTS IN THE DOM
		
		//PROFILE ITEM
		var profileItem = document.createElement("div");
		profileItem.setAttribute("id","info-additionalProfileItem-" + i);
		profileItem.setAttribute("class","info-additionalProfileItem surpriseButton-color-0 color-6");
		profileItem.setAttribute("onclick","$('#info-additionalProfileItemsDiv').hide(); switchProfile(" + i + ");");
		profileItem.innerHTML = userProfileNames[i];
				
		//ATTACH TO PARENT CONTAINER
		$("#info-additionalProfileItemsDiv")[0].appendChild(profileItem);
	}
}

function setDailyWorkProgressDisplay(){
	//Start the timeFill off at 0
	$("#dayProgress-timeFill")[0].style.width = "0%";
	
	//IF ANY TIME HAS BEEN LOGGED TODAY, FILL IN THE START BALL
	if(totalTimeSpentToday > 0){
		var theClass = $("#dayProgress-workStartBall")[0].getAttribute("class");
		theClass += " bgcolor-7";
		//Check if it has been set to brighter (happens when you work bonus time) and remove it if so
		if(theClass.match(" bgcolor-brighter")){theClass = theClass.replace(" bgcolor-brighter", "");}
		$("#dayProgress-workStartBall")[0].setAttribute("class",theClass);
	}else{
		//IF NO TIME HAS BEEN LOGGED, RESET TO GRAY
		var theClass = $("#dayProgress-workStartBall")[0].getAttribute("class");
		if(theClass.match(" bgcolor-7")){theClass = theClass.replace(" bgcolor-7", "");}
		if(theClass.match(" bgcolor-brighter")){theClass = theClass.replace(" bgcolor-brighter", "");}
		$("#dayProgress-workStartBall")[0].setAttribute("class",theClass);
	}
	
	//Load totalSuggestedAmountToday by looping through all the projects
	var l = U.profiles[Profile].projects.length;
	for(i=0;i<l;i++){
		totalSuggestedAmountToday += U.profiles[Profile].projects[i].suggestedAmountToday;
		//orderedProjects[x].suggestedAmountToday
	}
	
	var leftToWork = totalSuggestedAmountToday - totalTimeSpentToday;
	var workedPercentage = 0;
	
	if(leftToWork >= 0){
		
		//LOAD THE PERCENTAGE OF TIME WORKED
		workedPercentage =  Math.round(totalTimeSpentToday / totalSuggestedAmountToday * 100);
		
		//RESET THE ENDBALL TO GRAY
		var theClass = $("#dayProgress-workEndBall")[0].getAttribute("class");
		if(theClass.match(" bgcolor-7")){theClass = theClass.replace(" bgcolor-7", "");}
		if(theClass.match(" bgcolor-brighter")){theClass = theClass.replace(" bgcolor-brighter", "");}
		$("#dayProgress-workEndBall")[0].setAttribute("class",theClass);
		
		//RESET THE TIMEFILL TO BGCOLOR-7
		var theClass = $("#dayProgress-timeFill")[0].getAttribute("class");
		if(theClass.match("bgcolor-brighter")){theClass = theClass.replace("bgcolor-brighter", "bgcolor-7");}
		$("#dayProgress-timeFill")[0].setAttribute("class",theClass);
		
		//Format workedSoFarDisplay:
		var workedSoFarMinutes = Math.round(totalTimeSpentToday * 60)
		var workedSoFarHours = Math.floor(workedSoFarMinutes / 60)
		var workedSoFarMinutesDisplay = (workedSoFarMinutes > 59) ? (workedSoFarMinutes % 60) : workedSoFarMinutes;
		if(workedSoFarMinutesDisplay < 10){workedSoFarMinutesDisplay = "0" + workedSoFarMinutesDisplay};
		var workedSoFarDisplay = workedSoFarHours + ":" + workedSoFarMinutesDisplay;
	
		//Format leftToWorkAmountDisplay:
		var leftToWorkMinutes = Math.round(leftToWork * 60)
		var leftToWorkHours = Math.floor(leftToWorkMinutes / 60)
		var leftToWorkMinutesDisplay = (leftToWorkMinutes > 59) ? (leftToWorkMinutes % 60) : leftToWorkMinutes;
		if(leftToWorkMinutesDisplay < 10){leftToWorkMinutesDisplay = "0" + leftToWorkMinutesDisplay};
		var leftToWorkAmountDisplay = leftToWorkHours + ":" + leftToWorkMinutesDisplay;
		
		//In case leftToWork is less than a minute, (and there was some work to be done) fill in the endBall
		if((leftToWork < 0.0166666666667) && (totalSuggestedAmountToday > 0)){
			var theClass = $("#dayProgress-workEndBall")[0].getAttribute("class");
			theClass += " bgcolor-7";
			$("#dayProgress-workEndBall")[0].setAttribute("class",theClass);
		}
		
	}else{
		
		$("#dayProgress-todaysWork")[0].innerHTML = "BONUS WORK:";
		
		//FILL IN THE ENDBALL
		var theClass = $("#dayProgress-workEndBall")[0].getAttribute("class");
		//(Be sure it has not already been filled in by leftToWork reaching exactly 0)
		if(theClass.match(" bgcolor-7")){theClass = theClass.replace(" bgcolor-7", "");}
		theClass += " bgcolor-brighter";
		$("#dayProgress-workEndBall")[0].setAttribute("class",theClass);
		
		//MAKE THE STARTBALL BRIGHTER
		var theClass = $("#dayProgress-workStartBall")[0].getAttribute("class");
		theClass = theClass.replace("bgcolor-7", "bgcolor-brighter");
		$("#dayProgress-workStartBall")[0].setAttribute("class",theClass);
		
		//MAKE THE TIMEFILL BRIGHTER
		var theClass = $("#dayProgress-timeFill")[0].getAttribute("class");
		theClass = theClass.replace("bgcolor-7", "bgcolor-brighter");
		$("#dayProgress-timeFill")[0].setAttribute("class",theClass);
		
		//FIND OUT HOW MUCH OVERTIME THERE IS AND MAKE IT A POSITIVE NUMBER
		var bonusWork = (leftToWork * -1);
		
		//FORMAT BONUSWORKDISPLAY:
		var bonusWorkMinutes = Math.round(bonusWork * 60)
		var bonusWorkHours = Math.floor(bonusWorkMinutes / 60)
		var bonusWorkMinutesDisplay = (bonusWorkMinutes > 59) ? (bonusWorkMinutes % 60) : bonusWorkMinutes;
		if(bonusWorkMinutesDisplay < 10){bonusWorkMinutesDisplay = "0" + bonusWorkMinutesDisplay};
		var bonusWorkDisplay = bonusWorkHours + ":" + bonusWorkMinutesDisplay;
		
		workedPercentage = 100;
		leftToWorkAmountDisplay = "0:00";
		workedSoFarDisplay = bonusWorkDisplay;
		
	}
	
	$("#dayProgress-workedSoFar")[0].innerHTML = workedSoFarDisplay;
	$("#dayProgress-leftToWork")[0].innerHTML = leftToWorkAmountDisplay;
	$("#dayProgress-timeFill")[0].style.width = workedPercentage + "%";
}

function getWeeklyWorkload(weeksIntoFuture){
	//console.log("+ Getting Weekly Workload");
	var daysInAdvance = weeksIntoFuture * 7;
	
	//console.log("daysInAdvance is set to: " + daysInAdvance);
	
	var totalWeekCapacity = 0;
	var theDay = today.getDay();
	//theDay = 1; //Just for testing
	
	//Shift the days over so Monday is 0 instead of Sunday
	theDay -= 1;
	if(theDay == -1){theDay = 6;}
	if(weeksIntoFuture > 0){var x = 0}else{var x = theDay}
	
	//console.log("theDay is set to: " + theDay);
	
	for(i=x;i<7;i++){
		if(i == 0){totalWeekCapacity += parseInt(U.profiles[Profile].workSchedule.mo);}
		if(i == 1){totalWeekCapacity += parseInt(U.profiles[Profile].workSchedule.tu);}
		if(i == 2){totalWeekCapacity += parseInt(U.profiles[Profile].workSchedule.we);}
		if(i == 3){totalWeekCapacity += parseInt(U.profiles[Profile].workSchedule.th);}
		if(i == 4){totalWeekCapacity += parseInt(U.profiles[Profile].workSchedule.fr);}
		if(i == 5){totalWeekCapacity += parseInt(U.profiles[Profile].workSchedule.sa);}
		if(i == 6){totalWeekCapacity += parseInt(U.profiles[Profile].workSchedule.su);}
	}
	
	
	if(totalWeekCapacity == 0){
		//The user has no work hours scheduled during the week
		return false;
	}
	
	//console.log("totalWeekCapacity is set to: " + totalWeekCapacity);
	
	var daysLeftInWeek;
	
	//Find out how many days are left in the week
	switch(theDay) {
	    case 0: daysLeftInWeek = 7; break;
		case 1: daysLeftInWeek = 6; break;
		case 2: daysLeftInWeek = 5; break;
		case 3: daysLeftInWeek = 4; break;
		case 4: daysLeftInWeek = 3; break;
		case 5: daysLeftInWeek = 2; break;
		case 6: daysLeftInWeek = 1; break;
	    default: console.log("TIMEPOSITIVE ERROR: Unable to determine daysLeftInWeek.");
	}
	
	var theWorkload = 0;
	
	if(weeksIntoFuture == 0){
		for(i=0;i<daysLeftInWeek;i++){
			if(dateSpan[i]){
				theWorkload += dateSpan[i].fill;
			}
		}
	}else{
		for(i=0;i<7;i++){
			if(dateSpan[i + (daysInAdvance-theDay)]){
				//console.log("Adding fill from day number " + parseInt(i + (daysInAdvance-theDay)) + ", which is " + dateSpan[i + (daysInAdvance-theDay)].date);
				theWorkload += dateSpan[i + (daysInAdvance-theDay)].fill;
			}
		}
	}
	
	//console.log("theWorkload is set to: " + theWorkload);
	var weekFillPercentage = theWorkload / totalWeekCapacity * 100;
	//console.log("weekFillPercentage is set to: " + weekFillPercentage);
	return weekFillPercentage;
}

function setOverviewBoxWeekBar(weeksIntoFuture){
	var theWidth = getWeeklyWorkload(weeksIntoFuture);
	
	//Start the overview box week bar as a blank slate
	$("#projectLoadWeeklyFill")[0].removeAttribute("style");
	
	//Load the overview box week bar
	$("#projectLoadWeeklyFill")[0].style.width = theWidth + "%";
	
	//Give it the "attention" color if it is overfull
	if(theWidth > 100){
		$("#projectLoadWeeklyFill")[0].style.width = "100%";
		$("#projectLoadWeeklyFill")[0].style.backgroundColor = "#F2E92A"; //The "attention" yellow color
	}
}

//This function sets the day fills as well as the day numbers (day of the month)
function setCalendarDayFills(weeksIntoFuture){
	
	var daysInAdvance = weeksIntoFuture * 7;
	
	var theDay = today.getDay();
	//theDay = 0; //Just for testing
	
	//Shift the days over so Monday is 0 instead of Sunday
	theDay -= 1;
	if(theDay == -1){theDay = 6;}
	
	//Variables for fill
	var fillMO = fillTU = fillWE = fillTH = fillFR = fillSA = fillSU = 0;
	
	//Variables for day numbers
	var numMO = numTU = numWE = numTH = numFR = numSA = numSU = 0;
	
	//Set day fills and day numbers
	if(weeksIntoFuture == 0){
		for(i=theDay;i<7;i++){
			if(dateSpan[i]){
				if(i == 0){
					fillMO = (dateSpan[i-theDay].capacity > 0) ? (dateSpan[i-theDay].fill / dateSpan[i-theDay].capacity * 100) : 0;
					numMO = new Date(dateSpan[i-theDay].date).getDate();
				}
				if(i == 1){
					fillTU = (dateSpan[i-theDay].capacity > 0) ? (dateSpan[i-theDay].fill / dateSpan[i-theDay].capacity * 100) : 0;
					numMO = new Date(new Date(dateSpan[i-theDay].date).getTime() - 86400000).getDate();
					numTU = new Date(dateSpan[i-theDay].date).getDate();
				}
				if(i == 2){
					fillWE = (dateSpan[i-theDay].capacity > 0) ? (dateSpan[i-theDay].fill / dateSpan[i-theDay].capacity * 100) : 0;
					numMO = new Date(new Date(dateSpan[i-theDay].date).getTime() - 172800000).getDate();
					numTU = new Date(new Date(dateSpan[i-theDay].date).getTime() - 86400000).getDate();
					numWE = new Date(dateSpan[i-theDay].date).getDate();
				}
				if(i == 3){
					fillTH = (dateSpan[i-theDay].capacity > 0) ? (dateSpan[i-theDay].fill / dateSpan[i-theDay].capacity * 100) : 0;
					numMO = new Date(new Date(dateSpan[i-theDay].date).getTime() - 259200000).getDate();
					numTU = new Date(new Date(dateSpan[i-theDay].date).getTime() - 172800000).getDate();
					numWE = new Date(new Date(dateSpan[i-theDay].date).getTime() - 86400000).getDate();
					numTH = new Date(dateSpan[i-theDay].date).getDate();
				}
				if(i == 4){
					fillFR = (dateSpan[i-theDay].capacity > 0) ? (dateSpan[i-theDay].fill / dateSpan[i-theDay].capacity * 100) : 0;
					numMO = new Date(new Date(dateSpan[i-theDay].date).getTime() - 345600000).getDate();
					numTU = new Date(new Date(dateSpan[i-theDay].date).getTime() - 259200000).getDate();
					numWE = new Date(new Date(dateSpan[i-theDay].date).getTime() - 172800000).getDate();
					numTH = new Date(new Date(dateSpan[i-theDay].date).getTime() - 86400000).getDate();
					numFR = new Date(dateSpan[i-theDay].date).getDate();
				}
				if(i == 5){
					fillSA = (dateSpan[i-theDay].capacity > 0) ? (dateSpan[i-theDay].fill / dateSpan[i-theDay].capacity * 100) : 0;
					numMO = new Date(new Date(dateSpan[i-theDay].date).getTime() - 432000000).getDate();
					numTU = new Date(new Date(dateSpan[i-theDay].date).getTime() - 345600000).getDate();
					numWE = new Date(new Date(dateSpan[i-theDay].date).getTime() - 259200000).getDate();
					numTH = new Date(new Date(dateSpan[i-theDay].date).getTime() - 172800000).getDate();
					numFR = new Date(new Date(dateSpan[i-theDay].date).getTime() - 86400000).getDate();
					numSA = new Date(dateSpan[i-theDay].date).getDate();
				}
				if(i == 6){
					fillSU = (dateSpan[i-theDay].capacity > 0) ? (dateSpan[i-theDay].fill / dateSpan[i-theDay].capacity * 100) : 0;
					numMO = new Date(new Date(dateSpan[i-theDay].date).getTime() - 518400000).getDate();
					numTU = new Date(new Date(dateSpan[i-theDay].date).getTime() - 432000000).getDate();
					numWE = new Date(new Date(dateSpan[i-theDay].date).getTime() - 345600000).getDate();
					numTH = new Date(new Date(dateSpan[i-theDay].date).getTime() - 259200000).getDate();
					numFR = new Date(new Date(dateSpan[i-theDay].date).getTime() - 172800000).getDate();
					numSA = new Date(new Date(dateSpan[i-theDay].date).getTime() - 86400000).getDate();
					numSU = new Date(dateSpan[i-theDay].date).getDate();
				}
			}
		}
		
		//Gray out the past days
		switch(theDay){
			case 1: grayOutDays('mo'); break;
			case 2: grayOutDays('mo','tu'); break;
			case 3: grayOutDays('mo','tu','we'); break;
			case 4: grayOutDays('mo','tu','we','th'); break;
			case 5: grayOutDays('mo','tu','we','th','fr'); break;
			case 6: grayOutDays('mo','tu','we','th','fr','sa'); break;
		
		}
		
	}else{
		//Recolor grayed out days
		recolorGrayDays();
			
		//Set day fills
		if((dateSpan[daysInAdvance-theDay]) && (dateSpan[daysInAdvance-theDay].capacity > 0)){
			fillMO = (dateSpan[daysInAdvance-theDay].fill / dateSpan[daysInAdvance-theDay].capacity * 100);
		}else{fillMO = 0;}
		if((dateSpan[(daysInAdvance-theDay)+1]) && (dateSpan[daysInAdvance-theDay].capacity > 0)){
			fillTU = (dateSpan[(daysInAdvance-theDay)+1].fill / dateSpan[(daysInAdvance-theDay)+1].capacity * 100);
		}else{fillTU = 0;}
		if((dateSpan[(daysInAdvance-theDay)+2]) && (dateSpan[daysInAdvance-theDay].capacity > 0)){
			fillWE = (dateSpan[(daysInAdvance-theDay)+2].fill / dateSpan[(daysInAdvance-theDay)+1].capacity * 100);
		}else{fillWE = 0;}
		if((dateSpan[(daysInAdvance-theDay)+3]) && (dateSpan[daysInAdvance-theDay].capacity > 0)){
			fillTH = (dateSpan[(daysInAdvance-theDay)+3].fill / dateSpan[(daysInAdvance-theDay)+1].capacity * 100);
		}else{fillTH = 0;}
		if((dateSpan[(daysInAdvance-theDay)+4]) && (dateSpan[daysInAdvance-theDay].capacity > 0)){
			fillFR = (dateSpan[(daysInAdvance-theDay)+4].fill / dateSpan[(daysInAdvance-theDay)+1].capacity * 100);
		}else{fillFR = 0;}
		if((dateSpan[(daysInAdvance-theDay)+5]) && (dateSpan[daysInAdvance-theDay].capacity > 0)){
			fillSA = (dateSpan[(daysInAdvance-theDay)+5].fill / dateSpan[(daysInAdvance-theDay)+1].capacity * 100);
		}else{fillSA = 0;}
		if((dateSpan[(daysInAdvance-theDay)+6]) && (dateSpan[daysInAdvance-theDay].capacity > 0)){
			fillSU = (dateSpan[(daysInAdvance-theDay)+6].fill / dateSpan[(daysInAdvance-theDay)+1].capacity * 100);
		}else{fillSU = 0;}
		
		//Set day numbers
		numMO = new Date(dateSpan[daysInAdvance-theDay].date).getDate();
		numTU = new Date(new Date(dateSpan[daysInAdvance-theDay].date).getTime() + 86400000).getDate();
		numWE = new Date(new Date(dateSpan[daysInAdvance-theDay].date).getTime() + 172800000).getDate();
		numTH = new Date(new Date(dateSpan[daysInAdvance-theDay].date).getTime() + 259200000).getDate();
		numFR = new Date(new Date(dateSpan[daysInAdvance-theDay].date).getTime() + 345600000).getDate();
		numSA = new Date(new Date(dateSpan[daysInAdvance-theDay].date).getTime() + 432000000).getDate();
		numSU = new Date(new Date(dateSpan[daysInAdvance-theDay].date).getTime() + 518400000).getDate();
		
	}
	
	//Use the results to animate the day fill divs
	$("#calendarDayFill-mo").animate({height: fillMO + "%"}, 1000, "easeOutElastic");
	$("#calendarDayFill-tu").animate({height: fillTU + "%"}, 1000, "easeOutElastic");
	$("#calendarDayFill-we").animate({height: fillWE + "%"}, 1000, "easeOutElastic");
	$("#calendarDayFill-th").animate({height: fillTH + "%"}, 1000, "easeOutElastic");
	$("#calendarDayFill-fr").animate({height: fillFR + "%"}, 1000, "easeOutElastic");
	$("#calendarDayFill-sa").animate({height: fillSA + "%"}, 1000, "easeOutElastic");
	$("#calendarDayFill-su").animate({height: fillSU + "%"}, 1000, "easeOutElastic");
	
	//...and set the day numbers
	$("#calendarDayNumber-mo")[0].innerHTML = numMO;
	$("#calendarDayNumber-tu")[0].innerHTML = numTU;
	$("#calendarDayNumber-we")[0].innerHTML = numWE;
	$("#calendarDayNumber-th")[0].innerHTML = numTH;
	$("#calendarDayNumber-fr")[0].innerHTML = numFR;
	$("#calendarDayNumber-sa")[0].innerHTML = numSA;
	$("#calendarDayNumber-su")[0].innerHTML = numSU;
}

//For the overview box calendar, this function serves to gray out days in the current week that are already past
function grayOutDays(){
	var args = grayOutDays.arguments;
	var l = args.length;
	for(z=0;z<l;z++){
		var theClass = $("#calendarDayColumn-"+args[z])[0].getAttribute('class');
		if(!theClass.match("gray")){theClass += " gray";}
		$("#calendarDayColumn-"+args[z])[0].setAttribute('class',theClass);
	}
}

function recolorGrayDays(){
	var args = ['mo','tu','we','th','fr','sa'];
	for(z=0;z<6;z++){
		var theClass = $("#calendarDayColumn-"+args[z])[0].getAttribute('class');
		theClass = theClass.replace(" gray", "");
		$("#calendarDayColumn-"+args[z])[0].setAttribute('class',theClass);
	}
}

//Generate Project Boxes
function generateProjectBoxes(){
	//Start with an empty div by removing any previous Project Box elements
	$("#projectBoxContainer")[0].innerHTML = "";
	
	//Find out how many projects there are
	var numberOfProjects = orderedProjects.length;
	//console.log("=====>GENERATING PROJECT BOXES:");
	
	//Adjust these variables as you loop through all the projects
	var projectsOverdue = false;
	var projectsOversize = false;
	
	for(x=0;x<numberOfProjects;x++){
		
		//GENERATE THE APPROPRIATE COLORCODE for the colored stripe on the project box
		var colorCode = 9 - x;
		if(colorCode < 0){colorCode = 0;}
		
		//FIND OUT IF THE PROJECT IS OVERDUE
		if(orderedProjects[x].projectStatus == "overdue"){
			colorCode = "alert";
			projectsOverdue = true;
		}
			
		//FIND OUT IF THE PROJECT IS OVERSIZE
		if(orderedProjects[x].projectStatus == "oversize"){
			colorCode = "attention";
			projectsOversize = true;
		}
		
		//FIND OUT IF THE DUEDATE IS TODAY OR TOMORROW AND FORMAT ACCORDINGLY
		var theDueDate = orderedProjects[x].dueDate;
		if(new Date(theDueDate).toDateString() == new Date(today).toDateString()){
			//console.log(orderedProjects[x].projectTitle + " IS DUE TODAY!")
			theDueDate = "Today";
		}
		if(new Date(new Date(today).getTime() + 86400000).toDateString() == new Date(theDueDate).toDateString()){
			//console.log(orderedProjects[x].projectTitle + " IS DUE TOMORROW.")
			theDueDate = "Tomorrow";
		}
		
		//ASSESS THE PROJECT'S CURRENT DAILY-WORK-SUGGESTED AGAINST THE AMOUNT WORKED SO FAR TODAY
		var theTitle = orderedProjects[x].projectTitle;
		var todaysFillItems = dateSpan[0].fillItems;
		var suggestedAmountToday = 0;
		var timeSpentToday = 0;
		var leftToWorkToday = 0;
		var suggestedToWorkOnProjectToday = false;
		
		for(xx=0;xx<todaysFillItems.length;xx++){
			var fillItemTitle = todaysFillItems[xx][0];
			
			if(fillItemTitle == theTitle){
				//If there is a match, it means this project is included in today's workload
				suggestedToWorkOnProjectToday = true;
				
				timeSpentToday = orderedProjects[x].timeSpentToday;
				
				//Find out the suggested amount of work for today
				suggestedAmountToday = todaysFillItems[xx][1]; //Should be equivalent to orderedProjects[x].suggestedAmountToday;
				
				//console.log("Project: " + theTitle + ": Suggested work hours today: " + suggestedAmountToday + " and you have already worked on it this many hours: " + timeSpentToday);
				leftToWorkToday = (suggestedAmountToday - timeSpentToday);
				
				//See how much of the suggested amount has already been worked off
				if(leftToWorkToday > 0){
					var percentageWorkedToday = (timeSpentToday / suggestedAmountToday) * 100;
					//console.log(theTitle + " work for today is this much complete: " + percentageWorkedToday + "%");
					
					//See if bonus time has been worked today
					if(percentageWorkedToday > 100){
						var bonusTime = percentageWorkedToday - 100;
						percentageWorkedToday = 100;
						console.log(theTitle + " has gotten bonus work time today of " + bonusTime + "%");
					}
					
				}else{
					var percentageWorkedToday = 100;
					console.log(theTitle + " is at 100% of its work requirement for today.");
				}
				
			}
		}
		
		//(Thanks: http://www.webdeveloper.com/forum/showthread.php?273645-How-to-convert-decimal-time-value-to-hh-mm)
		var hrs = parseInt(Number(leftToWorkToday));
		var min = Math.round((Number(leftToWorkToday)-hrs) * 60);
		if(min<10){min = "0" + min;}
		var formattedLeftToWorkToday = hrs+':'+min;
		
		//FORMAT NUMBERS FOR TIME SPENT AND TIME REMAINING, TIME SPENT TODAY and TIME SUGGESTED
		var theTimeSpent = orderedProjects[x].timeSpent;
		var theTimeLeft = orderedProjects[x].timeEstimate - theTimeSpent;
		
		var hrs = parseInt(Number(theTimeSpent));
		var min = Math.round((Number(theTimeSpent)-hrs) * 60);
		if(min<10){min = "0" + min;}
		theTimeSpent = hrs+':'+min;
		
		hrs = parseInt(Number(theTimeLeft));
		min = Math.round((Number(theTimeLeft)-hrs) * 60);
		if(min<10){min = "0" + min;}
		theTimeLeft = hrs+':'+min;
		
		hrs = parseInt(Number(suggestedAmountToday));
		min = Math.round((Number(suggestedAmountToday)-hrs) * 60);
		if(min<10){min = "0" + min;}
		suggestedAmountToday = hrs+':'+min;
		
		/////AND NOW LADIES AND GENTLEMEN, BUILD THE ELEMENTS THEMSELVES:
		
		//COMMENT
		var comment = document.createComment("PROJECT " + x);
		
		//PROJECT DIV
		var projectDiv = document.createElement("div");
		projectDiv.setAttribute("id","project-" + x);
		projectDiv.setAttribute("class","projectDiv bgcolor-00 bcolor-5");
		
			//PROJECT CONTROL DIV
			var projectControlDiv = document.createElement("div");
			projectControlDiv.setAttribute("id","projectControlDiv-" + x);
			projectControlDiv.setAttribute("class","projectControlDiv bgcolor-7");
			projectDiv.appendChild(projectControlDiv);
				
				//Close Button
				var projectControlCloseButton = document.createElement("div");
				projectControlCloseButton.setAttribute("class","projectControlCloseButton darkButton-color-7");
				projectControlCloseButton.innerHTML = "x";
				projectControlDiv.appendChild(projectControlCloseButton);
				
				//Control Buttons
				var projectControlButtons = document.createElement("div");
				projectControlButtons.setAttribute("class","projectControlButtons");
				projectControlDiv.appendChild(projectControlButtons);
					
					//Edit Button
					var projectEditButton = document.createElement("div");
					projectEditButton.setAttribute("class","projectEditButton darkButton-color-7 color-1");
					projectEditButton.innerHTML = "EDIT";
					projectControlButtons.appendChild(projectEditButton);
					
					//Delete Button
					var projectDeleteButton = document.createElement("div");
					projectDeleteButton.setAttribute("class","projectDeleteButton darkButton-color-7 color-1");
					projectDeleteButton.innerHTML = "COMPLETE";
					projectControlButtons.appendChild(projectDeleteButton);
					
			//SETTINGS ICON
			if(orderedProjects[x].projectStatus == "okay"){
				var projectSettingsIcon = document.createElement("div");
				projectSettingsIcon.setAttribute("class","projectSettingsIcon");
				projectDiv.appendChild(projectSettingsIcon);
				
					//Project Settings Dots
					for(counter=0;counter<3;counter++){
						var projectSettingsDot = document.createElement("div");
					projectSettingsDot.setAttribute("class","projectSettingsDot bgcolor-6");
						projectSettingsIcon.appendChild(projectSettingsDot);
					}
			}
				
			//TITLE BOX
			var projectTitleBox = document.createElement("div");
			projectTitleBox.setAttribute("class","projectTitleBox color-7 bbcolorCode-" + colorCode);
			projectDiv.appendChild(projectTitleBox);
					
				//Worktoday Badge (created if there is daily work left on the project or if the project is overdue)
				if((leftToWorkToday > 0) || (orderedProjects[x].projectStatus == "overdue")){
					var workTodayBadge = document.createElement("div");
					workTodayBadge.setAttribute("class","workTodayBadge bgcolor-" + colorCode);
					projectTitleBox.appendChild(workTodayBadge);
				}
		
				//Project Title
				var projectTitle = document.createElement("span");
				projectTitle.setAttribute("class","projectTitle");
				projectTitle.innerHTML = "&nbsp;" + theTitle;
				projectTitleBox.appendChild(projectTitle);
				
				//Line Break
				var br = document.createElement("br");
				projectTitleBox.appendChild(br);
				
				//Due
				var due = document.createElement("span");
				due.setAttribute("class","due color-6");
				due.innerHTML = "Due: <span class='dueDate color-7'>" + theDueDate + "</span>&nbsp;&nbsp;";
				projectTitleBox.appendChild(due);
				
				//Elapsed
				var elapsed = document.createElement("span");
				elapsed.setAttribute("class","elapsed color-6");
				elapsed.innerHTML = "Spent: <span class='elapsedTime color-7'>" + theTimeSpent + "</span>&nbsp;&nbsp;";
				projectTitleBox.appendChild(elapsed);
				
				//Remaining
				var remaining = document.createElement("span");
				remaining.setAttribute("class","remaining color-6");
				remaining.innerHTML = "Left: <span class='remainingTime color-7'>" + theTimeLeft + "</span>&nbsp;&nbsp;";
				projectTitleBox.appendChild(remaining);
				
				//OversizeAlert
				if(orderedProjects[x].projectStatus == "oversize"){
					var oversizeAlert = document.createElement("div");
					oversizeAlert.setAttribute("class","oversizeAlert color-8 bcolor-attention");
					oversizeAlert.innerHTML = "OVERSIZE";
					projectTitleBox.appendChild(oversizeAlert);
				}
				
				//OverdueAlert
				if(orderedProjects[x].projectStatus == "overdue"){
					var overdueAlert = document.createElement("div");
					overdueAlert.setAttribute("class","overdueAlert color-8 bcolor-alert");
					overdueAlert.innerHTML = "OVERDUE";
					projectTitleBox.appendChild(overdueAlert);
				}
				
				
			//SUGGESTED TODAY DIV
			if(percentageWorkedToday < 100 && suggestedToWorkOnProjectToday && orderedProjects[x].projectStatus == "okay"){
				
				var suggestedTodayDiv = document.createElement("div");
				suggestedTodayDiv.setAttribute("class","suggestedTodayDiv color-7");
				suggestedTodayDiv.innerHTML = "Left To Do Today: <span class='remainingToday color-7'>" + formattedLeftToWorkToday + "</span>";
				projectDiv.appendChild(suggestedTodayDiv);
			
					//Remaining Today Bar
					var remainingTodayBar = document.createElement("div");
					remainingTodayBar.setAttribute("class","remainingTodayBar bcolor-4");
					suggestedTodayDiv.appendChild(remainingTodayBar);
				
						//Remaining Today Fill
						var remainingTodayFill = document.createElement("div");
						remainingTodayFill.setAttribute("class","remainingTodayFill bgcolor-" + colorCode);
						remainingTodayFill.style.width = (100 - percentageWorkedToday) + "%";
						remainingTodayBar.appendChild(remainingTodayFill);
			}else{

				var projectAttentionDiv = document.createElement("div");
				projectAttentionDiv.setAttribute("class","projectAttentionDiv color-7");
				
				switch(orderedProjects[x].projectStatus){
					case "okay": projectAttentionDiv.innerHTML = "No further work needed on this project today"; break;
					case "overdue": projectAttentionDiv.innerHTML = "Hey, this project is... overdue. Better edit it to set a new due date."; break;
					case "oversize": projectAttentionDiv.innerHTML = "This project is oversize. Change its due date or time estimate to complete it on time."; break;
				}
				
				projectDiv.appendChild(projectAttentionDiv);
			}
			
			//START BUTTON
			if(orderedProjects[x].projectStatus == "okay"){
				var startButton = document.createElement("div");
				startButton.setAttribute("class","startButton hollowButton-color-7");
				startButton.innerHTML = "START";
				projectDiv.appendChild(startButton);
			}else{
				//SPECIAL EDIT BUTTON
				var specialEditButton = document.createElement("div");
				specialEditButton.setAttribute("class","specialEditButton hollowButton-color-7");
				specialEditButton.setAttribute("onclick","setTimeout(function(){$('#editProjectInput-dueDate')[0].focus()},300);");
				specialEditButton.innerHTML = "EDIT";
				projectDiv.appendChild(specialEditButton);
				
				//SPECIAL DELETE BUTTON
				var specialDeleteButton = document.createElement("div");
				specialDeleteButton.setAttribute("class","specialDeleteButton hollowButton-color-7");
				specialDeleteButton.innerHTML = "COMPLETE";
				projectDiv.appendChild(specialDeleteButton);
			}
		
		
		//ATTACH TO PARENT CONTAINER
		$("#projectBoxContainer")[0].appendChild(comment);
		//...and attach the projectDiv
		$("#projectBoxContainer")[0].appendChild(projectDiv);
	}
	
	//ATTACH CLICK EVENTS TO RELEVANT ELEMENTS
	
	/*PROJECT SETTINGS */
	$(".projectSettingsIcon").click(function(){
		//First of all, close any already open control div
		$("#projectControlDiv-"+currentProjectId).hide();
		//Figure out which project we are dealing with according to the project div's id
		theProjectId = this.parentElement.id.split("-")[1];
		//Set currentProjectId accordingly
		currentProjectId = theProjectId;
		$("#projectControlDiv-"+theProjectId).show();
	});

	/*PROJECT SETTINGS CLOSE*/
	$(".projectControlCloseButton").click(function(){
		$("#projectControlDiv-"+currentProjectId).hide();
	});
	
	$(".projectControlDiv").mouseleave(function(){
		$("#projectControlDiv-"+currentProjectId).hide();
	});

	/*PROJECT EDIT BUTTON
	For some time this line included '$(".projectEditButton,.specialEditButton").click'. It did not seem
	to cause any trouble, but it seemed redundant, given the function below, devoted to the specialEditButton.
	*/
	$(".projectEditButton").click(function(){ 
		//Format numbers
		var theTimeEstimate = orderedProjects[currentProjectId].timeEstimate;
		var theTimeSpent = orderedProjects[currentProjectId].timeSpent;
		var theTimeSpentToday = orderedProjects[currentProjectId].timeSpentToday;
	
		var hrs = parseInt(Number(theTimeEstimate));
		var min = Math.round((Number(theTimeEstimate)-hrs) * 60);
		if(min<10){min = "0" + min;}
		theTimeEstimate = hrs+':'+min;
		
		hrs = parseInt(Number(theTimeSpent));
		min = Math.round((Number(theTimeSpent)-hrs) * 60);
		if(min<10){min = "0" + min;}
		theTimeSpent = hrs+':'+min;
		
		hrs = parseInt(Number(theTimeSpentToday));
		min = Math.round((Number(theTimeSpentToday)-hrs) * 60);
		if(min<10){min = "0" + min;}
		theTimeSpentToday = hrs+':'+min;
		
		initialProjectTitle = orderedProjects[currentProjectId].projectTitle; //Used as a reference when getting suggested due date
		
		//Set the form input values
		$("#editProjectInput-projectTitle")[0].value = orderedProjects[currentProjectId].projectTitle;
		$("#editProjectInput-dueDate")[0].value = orderedProjects[currentProjectId].dueDate;
		$("#editProjectInput-timeEstimate")[0].value = theTimeEstimate;
		$("#editProjectInput-totalTimeSpent")[0].value = theTimeSpent;
		$("#editProjectInput-timeSpentToday")[0].value = theTimeSpentToday;
		
		$("#editProjectDueDateTip").hide();
		$("#editProjectTimeEstimateLabel")[0].style.marginTop = "10px";
		$("#projectControlDiv-"+currentProjectId).hide();
		$("#dropInDiv").show();
		$("#shadeScreen").show();
		$("#dropInScreen-editProject").show();
		currentDropinScreen = "editProject";
		//Hide the topBarButtons
		$("#topBarButtons").animate({top: "-40px"}, 200, "easeOutCirc", function(){
			$("#loginWelcome").animate({right: "10px"}, 200, "easeInCirc");
		});
	});
	
	/*SPECIAL EDIT BUTTON*/
	$(".specialEditButton").click(function(){
		//First of all just close the messageBar that may be showing
		$("#messageBar").fadeOut('fast');
		
		//Figure out which project we are dealing with according to the project div's id
		theProjectId = this.parentElement.id.split("-")[1];
		//Set currentProjectId accordingly
		currentProjectId = theProjectId;
		
		//Format numbers
		var theTimeEstimate = orderedProjects[currentProjectId].timeEstimate;
		var theTimeSpent = orderedProjects[currentProjectId].timeSpent;
		var theTimeSpentToday = orderedProjects[currentProjectId].timeSpentToday;
	
		var hrs = parseInt(Number(theTimeEstimate));
		var min = Math.round((Number(theTimeEstimate)-hrs) * 60);
		if(min<10){min = "0" + min;}
		theTimeEstimate = hrs+':'+min;
		
		hrs = parseInt(Number(theTimeSpent));
		min = Math.round((Number(theTimeSpent)-hrs) * 60);
		if(min<10){min = "0" + min;}
		theTimeSpent = hrs+':'+min;
		
		hrs = parseInt(Number(theTimeSpentToday));
		min = Math.round((Number(theTimeSpentToday)-hrs) * 60);
		if(min<10){min = "0" + min;}
		theTimeSpentToday = hrs+':'+min;
		
		initialProjectTitle = orderedProjects[currentProjectId].projectTitle; //Used as a reference when getting suggested due date
		
		//Set the form input values
		$("#editProjectInput-projectTitle")[0].value = orderedProjects[currentProjectId].projectTitle;
		$("#editProjectInput-dueDate")[0].value = orderedProjects[currentProjectId].dueDate;
		$("#editProjectInput-timeEstimate")[0].value = theTimeEstimate;
		$("#editProjectInput-totalTimeSpent")[0].value = theTimeSpent;
		$("#editProjectInput-timeSpentToday")[0].value = theTimeSpentToday;
		
		
		$("#projectControlDiv-"+currentProjectId).hide();
		$("#dropInDiv").show();
		$("#dropInScreen-editProject").show();
		currentDropinScreen = "editProject";
		//Hide the topBarButtons
		$("#topBarButtons").animate({top: "-40px"}, 200, "easeOutCirc", function(){
			$("#loginWelcome").animate({right: "10px"}, 200, "easeInCirc");
		});
	});

	/*PROJECT DELETE BUTTON*/
	$(".projectDeleteButton").click(function(){
		$("#confirmationDeleteProjectTitle")[0].innerHTML = orderedProjects[currentProjectId].projectTitle;
		$("#projectControlDiv-"+currentProjectId).hide();
		$("#confirmationDiv").show();
		$("#confirmationScreen-deleteProject").show();
	});
	
	/*SPECIAL DELETE BUTTON*/
	$(".specialDeleteButton").click(function(){
		//First of all just close the messageBar that may be showing
		$("#messageBar").fadeOut('fast');
		
		//Figure out which project we are dealing with according to the project div's id
		theProjectId = this.parentElement.id.split("-")[1];
		//Set currentProjectId accordingly
		currentProjectId = theProjectId;
		$("#confirmationDeleteProjectTitle")[0].innerHTML = orderedProjects[currentProjectId].projectTitle;
		$("#projectControlDiv-"+currentProjectId).hide();
		$("#confirmationDiv").show();
		$("#confirmationScreen-deleteProject").show();
	});
	
	
	/* PROJECT START BUTTON */
	$(".startButton").click(function(){
		
		//Figure out which project we are dealing with according to the project div's id
		theProjectId = this.parentElement.id.split("-")[1];
		
		//Set currentProjectId accordingly
		currentProjectId = theProjectId;
		
		//Set project title
		$("#timerProjectTitle")[0].innerHTML = orderedProjects[currentProjectId].projectTitle;
		
		//Prepare some variables for the settings below
		var timeSpentToday = orderedProjects[currentProjectId].timeSpentToday;
		var theSuggestedAmountToday = orderedProjects[currentProjectId].suggestedAmountToday;
		var progressPercentage = timeSpentToday / theSuggestedAmountToday * 100;
		
		//Set Done Today amount
		var hrs = parseInt(Number(timeSpentToday));
		var min = Math.round((Number(timeSpentToday)-hrs) * 60);
		if(min<10){min = "0" + min;}
		timeSpentToday = hrs+':'+min;
		$("#timerDoneToday")[0].innerHTML = timeSpentToday;
		
		//Set Today's Goal
		hrs = parseInt(Number(theSuggestedAmountToday));
		min = Math.round((Number(theSuggestedAmountToday)-hrs) * 60);
		if(min<10){min = "0" + min;}
		theSuggestedAmountToday = hrs+':'+min;
		$("#timerGoalToday")[0].innerHTML = theSuggestedAmountToday;
		
		//Set the width of the timerDailyProgressFill
		$("#timerDailyProgressFill")[0].style.width = progressPercentage + "%";

		$("#timerScreen").show();
		runTimer();
	});
	
	//SHOW MESSAGES, IF ANY PROJECTS ARE OVERDUE OR OVERSIZE
	if(projectsOverdue && projectsOversize){
		showMessageBar(1,"You have one or more overdue projects, as well as one or more oversize projects too big to be completed by their due date.");
		alterCalculationsScreen(); //Replace calculations with a note
		return true;
	}
	
	if(projectsOverdue){
		showMessageBar(1,"You have one or more overdue projects.");
		alterCalculationsScreen(); //Replace calculations with a note
		return true;
	}
	
	if(projectsOversize){
		showMessageBar(1,"You have one or more oversize projects that are too big to be completed by their due date.");
		alterCalculationsScreen(); //Replace calculations with a note
		return true;
	}
	
	
}

/////////////////////////////////////////////////
/* ENGINE ROOM */
/////////////////////////////////////////////////

var orderedProjects = [];

//Create an array of project IDs and due dates according to the order of their due dates
function orderProjects(){
	var l = Projects.length;
	//If there are any projects at all, put the first project in the orderedProjects array
	if(l > 0){
		orderedProjects[0] = Projects[0];
	}
	
	//Loop through the rest of the projects (if there is only one or zero projects, skip this)
	for(i=1;i<l;i++){
		
		//For each project, get its due date
		var unorderedDueDate = new Date(Projects[i].dueDate);
		//Find out how many projects have already been ordered so we know how many we need to loop through to compare against
		var l2 = orderedProjects.length;
		
		//Then loop through the projects that are already in the orderedProjects array, and insert it in its place
		for(a=0;a<l2;a++){
			var orderedDueDate = new Date(orderedProjects[a].dueDate);
			if(unorderedDueDate < orderedDueDate){
				//If the due date is sooner than the first one it comes to, just put it in first position and boom
				orderedProjects.splice(a, 0, Projects[i]);
				break;
			}
			if(a+1==l2){ //If there will be no further items to test against, just put the date at the end
				orderedProjects.push(Projects[i]);
			}
		}
	}
	//Now that the projects are ordered by date, it is easy to fill the dateSpan object
	//console.log("+ Projects have been ordered. Now calling fillDateSpan().")
	fillDateSpan();
}

//PROFILE PROTOTYPE FUNCTION
function ProfileObject(profileName){
	this.profileName = profileName;
	this.projects = [];
	this.workSchedule = {};
	//Set the default workSchedule. An interesting task. Right now I have it set at 5hrs/day. It could be set to 8 hrs M-F with weekends off, but I want to avoid implying a certain cultural standard (especially one that comes from mainstream worklife).
	this.workSchedule.mo = "5";
	this.workSchedule.tu = "5";
	this.workSchedule.we = "5";
	this.workSchedule.th = "5";
	this.workSchedule.fr = "5";
	this.workSchedule.sa = "5";
	this.workSchedule.su = "5";
	this.vacationDays = [];
}

//PROJECT PROTOTYPE FUNCTION
function ProjectObject(projectId,projectTitle,dueDate,timeEstimate){
	this.projectId = projectId;
	this.projectTitle = projectTitle;
	this.dueDate = dueDate;
	this.timeEstimate = timeEstimate;
	this.timeSpent = 0;
	this.timeSpentToday = 0;
	this.suggestedAmountToday = 0;
	this.projectStatus = "okay";
}

//USER PROTOTYPE FUNCTION
function UserObject(theName,email,password,memberStatus){
	var theDateToday = new Date().toLocaleDateString();
	this.name = theName;
	this.email = email;
	this.password = password;
	this.stripeID = null;
	this.memberStatus = memberStatus;
	this.joinDate = theDateToday;
	this.activityStatus = "Logged Out";
	this.lastActiveDate = theDateToday;
	this.trialStartDate = null;
	this.trialEndDate = null;
	this.hasHadTrial = false;
	this.hasHadTour = false;
	this.totalProjectsCreated = 0;
	this.profiles = [];
	this.profiles[0] = {};
	this.profiles[0].profileName = "Work Projects";
	this.profiles[0].projects = [];
	this.profiles[0].workSchedule = {};
	this.profiles[0].workSchedule.mo = "8";
	this.profiles[0].workSchedule.tu = "8";
	this.profiles[0].workSchedule.we = "8";
	this.profiles[0].workSchedule.th = "8";
	this.profiles[0].workSchedule.fr = "8";
	this.profiles[0].workSchedule.sa = "0";
	this.profiles[0].workSchedule.su = "0";
	this.profiles[0].vacationDays = [];
	
	if(memberStatus == "trial" || memberStatus == "earlyAdopter"){
		this.trialStartDate = theDateToday;
		//1-month free trial
		this.trialEndDate = new Date(new Date(theDateToday).getTime() + 2592000000).toLocaleDateString();
		this.hasHadTrial = true;
	}
	
	if(memberStatus == "earlyAdopter"){
		this.trialStartDate = theDateToday;
		//3-month free trial
		this.trialEndDate = new Date(new Date(theDateToday).getTime() + 7776000000).toLocaleDateString();
		this.hasHadTrial = true;
	}
}

//DAY PROTOTYPE FUNCTION
//A Day object is created for each day between now and the user's final deadline
function Day(date,dayNumber,vacationDay,capacity,fill,fillItems){
	this.date = date;
	this.dayNumber = dayNumber;
	this.vacationDay = vacationDay;
	this.capacity = capacity;
	this.fill = fill;
	this.fillItems = fillItems;
}

var dateSpan = []; //This is the array that will hold all the days of the user's project load

function fillDateSpan(){
	var n = 7;
	
	if(orderedProjects[0]){ //If there are no projects, we won't bother with this
		var l = orderedProjects.length;
		var farthestOutDueDate = orderedProjects[l-1].dueDate;
	
		//Find the number of milliseconds between today and the farthestOutDueDate
		var numberOfMilliseconds = new Date(farthestOutDueDate) - today;
		var numberOfDays = (numberOfMilliseconds / (1000*60*60*24)) + 1; // +1 to include today
	
		//Round up to the nearest whole day
		numberOfDays = Math.ceil(numberOfDays);

		//Make n at least 7 to cover the span of a week. This is important for the overviewBox calendar display
		if(numberOfDays > 7){
			n = numberOfDays;
		}
	}
	
	//Create a Day object for each day from now till the farthest out due date
	//Define its date and its dayNumber when creating it
	for(i=0;i<=n;i++){
		var d = new Day();
		d.date = new Date(today.getTime() + (i*86400000));
		d.dayNumber = d.date.getDay();
		d.fill = 0; //Start the fill off at 0
		d.fillItems = []; //An array to be filled
		dateSpan.push(d);
	}
	
	//FILL THE numberOfWeeksInSchedule VARIABLE
	var theDay = today.getDay();
	//Shift the days over so Monday is 0 instead of Sunday
	theDay -= 1;
	if(theDay == -1){theDay = 6;}
	//Figure out how many MO-SU calendar weeks need to be shown to show the full schedule
	numberOfWeeksInSchedule = (numberOfDays + theDay) / 7;
	numberOfWeeksInSchedule = Math.ceil(numberOfWeeksInSchedule);
	//console.log("+ numberOfWeeksInSchedule is set to " + numberOfWeeksInSchedule)
	
	//console.log("+ dateSpan has been filled. Now calling defineDayCapacities().")
	defineDayCapacities();
}

//Define the totalTimeSpentToday variable by referencing the user's work schedule and adding any work done today
function calculateTotalTimeSpentToday(){
	var l = Projects.length;
	for(i=0;i<l;i++){
		totalTimeSpentToday += Projects[i].timeSpentToday;
		
		//Calculate totalOvertimeSpentToday
		if(Projects[i].timeSpentToday > Projects[i].suggestedAmountToday){
			totalOvertimeSpentToday += Projects[i].timeSpentToday - Projects[i].suggestedAmountToday;
		}
	}
	

	
	var theDay = today.getDay();
	switch(theDay) {
	    case 0: var initialCapacity = U.profiles[Profile].workSchedule.su; break;
		case 1: var initialCapacity = U.profiles[Profile].workSchedule.mo; break;
		case 2: var initialCapacity = U.profiles[Profile].workSchedule.tu; break;
		case 3: var initialCapacity = U.profiles[Profile].workSchedule.we; break;
		case 4: var initialCapacity = U.profiles[Profile].workSchedule.th; break;
		case 5: var initialCapacity = U.profiles[Profile].workSchedule.fr; break;
		case 6: var initialCapacity = U.profiles[Profile].workSchedule.sa; break;
	    default:console.log("TIMEPOSITIVE ERROR: Unable to determine initialCapacity.")
	}
	
	var timeLeftToday = initialCapacity - totalTimeSpentToday;
	//console.log("TIME SPENT TODAY: " + totalTimeSpentToday);
	
	if(timeLeftToday < 0){
		//Do something if you have worked extra time today
		console.log("You worked bonus time today! Bonus: " + (timeLeftToday * -1));
	}
}

//We don't want to show the message about adjusting the day capacity more than once in a day
var dayCapacityAdjustmentMessageShown = false;

//This function sets the capacity and vacationDay parameters of each Day object
function defineDayCapacities(){
	var l = dateSpan.length;
	
	var workSchedule = [];
	workSchedule[0] = U.profiles[Profile].workSchedule.su;
	workSchedule[1] = U.profiles[Profile].workSchedule.mo;
	workSchedule[2] = U.profiles[Profile].workSchedule.tu;
	workSchedule[3] = U.profiles[Profile].workSchedule.we;
	workSchedule[4] = U.profiles[Profile].workSchedule.th;
	workSchedule[5] = U.profiles[Profile].workSchedule.fr;
	workSchedule[6] = U.profiles[Profile].workSchedule.sa;
	
	var vacationDays = U.profiles[Profile].vacationDays;
	var numberOfVacationDays = vacationDays.length;

	for(i=0;i<l;i++){
		dateSpan[i].capacity = workSchedule[dateSpan[i].dayNumber];
		
		if(i == 0){
			//The first day being set is today; see how much time remains before today is over
			var timeRemainingBeforeMidnight = (new Date(today.toDateString()).getTime() + 86400000) - (new Date().getTime());
			//Floor milliseconds to nearest full minute amount
			timeRemainingBeforeMidnight = Math.ceil(timeRemainingBeforeMidnight/60000);
			//Translate minutes to hours
			timeRemainingBeforeMidnight = timeRemainingBeforeMidnight/60;
			
			if(timeRemainingBeforeMidnight + totalTimeSpentToday < dateSpan[i].capacity){
				/*If the timeRemainingBeforeMidnight plus the totalTimeSpentToday is less than the day's capacity 
				(as defined in the workSchedule), it means there is not enough time left in the day to fit in a 
				full work day, so the day's capacity is reduced accordingly.*/
				if(!dayCapacityAdjustmentMessageShown && U.hasHadTour == true){ //We don't want to show this when someone first signs up
					showMessageBar(1,"Today's Work Schedule has been altered according to the remaining hours in the day.");
					dayCapacityAdjustmentMessageShown = true;
				}
				//console.log("Today's workSchedule says we should have " + dateSpan[i].capacity + " hours to work, but there are only " + timeRemainingBeforeMidnight + " hours left in the day.");
				dateSpan[i].capacity = timeRemainingBeforeMidnight + totalTimeSpentToday;
				console.log("Today's capacity has been adjusted to " + Math.floor(dateSpan[i].capacity) + ":" + dateSpan[i].capacity*60 %60);
			}
			
		}
		
		//Check if it is a vacationDay and if so, set its capacity to 0
		for(a=0;a<numberOfVacationDays;a++){
			untestedDate = dateSpan[i].date.toDateString();
			vacationDayToTest = new Date(vacationDays[a]).toDateString();
			if(untestedDate == vacationDayToTest){
				dateSpan[i].vacationDay = true;
				dateSpan[i].capacity = 0;
				break;
			}else{
				dateSpan[i].vacationDay = false;
			}
		}
	}
	//Once the Day Capacities and VacationDay projectStatus are set, flow the projects into the Days
	//console.log("+ capacity and vacationDay for each Day in the dateSpan has been defined. Now calling flowProjectsIntoDays().");
	flowProjectsIntoDays();
}

//This function sets the fill and fillItems parameters of each Day object
function flowProjectsIntoDays(){
	//console.log("=====> FLOWING PROJECTS INTO DAYS");
	
	var l = orderedProjects.length;
	var granularity = 5; //granularity defines what size chunks of time the projects should flow in by, in minutes
	var minimumPortion = 15; //minimumPortion defines the minimum number of minutes for a work session on a single project
	var totalTimeSpentTodayBalance = totalTimeSpentToday; // When setting workAllotment, we need to be sure not to overfill today. This variable helps track that.
	
	/////FOR EACH OF THE PROJECTS:
	for(i=0;i<l;i++){
		
		var theProjectBeingFlowedIn = orderedProjects[i];
		
		//console.log("Project: " + theProjectBeingFlowedIn.projectTitle + ". Due date: " + theProjectBeingFlowedIn.dueDate);
		
		var millisecondsTillDueDate = new Date(theProjectBeingFlowedIn.dueDate).getTime() - today.getTime();
		var daysTillDueDate = millisecondsTillDueDate / (1000*60*60*24);
		daysTillDueDate = Math.floor(daysTillDueDate);
		daysTillDueDate += 1;
		
		//Each project gets the chance to start out "okay"
		theProjectBeingFlowedIn.projectStatus = "okay";
		
		//Do something if the due date is past
		if(daysTillDueDate < 0){
			console.log(theProjectBeingFlowedIn.projectTitle + " has a past due date of " + theProjectBeingFlowedIn.dueDate);
			theProjectBeingFlowedIn.projectStatus = "overdue";
			theProjectBeingFlowedIn.suggestedAmountToday = 0;
			//Projects with a status of overdue are treated differently when the project boxes are being created. Their color code is red and a warning message is shown at the top of the screen.
			//Do not incorporate overdue projects into the flow.
			continue;
		}
		
		//Find out how much time remains on the project, ignoring time spent today
		var projectTimeLeft = theProjectBeingFlowedIn.timeEstimate - (theProjectBeingFlowedIn.timeSpent - theProjectBeingFlowedIn.timeSpentToday);
		
		//console.log("projectTimeLeft is set to "+projectTimeLeft);
		
		//reducedProjectTime starts equal to projectTimeLeft and then is reduced as the project's time gets flowed into the days
		var reducedProjectTime = projectTimeLeft;
		
		//Find out how much available time there is in the schedule between now and the dueDate
		var totalTimeAvailable = 0;
		for(a=0;a<=daysTillDueDate;a++){
			//console.log("Day " + a + " capacity is set to: " + dateSpan[a].capacity + " and fill is set to: " + dateSpan[a].fill);
			totalTimeAvailable += (dateSpan[a].capacity - dateSpan[a].fill);
		}

		//console.log("=======totalTimeAvailable is set to: " + totalTimeAvailable);
		
		//totalTimeAvailable += 0.016666667; //Add a minute. This is a bandaid fix for a bug where once in a while a project is deemed oversize when in fact it fits just perfectly.
		//I commented this line out when I saw it was causing a minute inaccuracy when the day capacity was being reduced according to hours remaining in the day.
		
		//NOTE: Previously I only tested (projectTimeLeft > totalTimeAvailable) and realTotalTimeAvailable did not exist.
		//The trouble was this allowed an oversize project to slip through if it was flowed in before a project with timeSpentToday. Hopefully this new method will not cause unexpected trouble.
		var realTotalTimeAvailable = totalTimeAvailable - (totalTimeSpentTodayBalance - theProjectBeingFlowedIn.timeSpentToday);
		
		//Find out if there is enough room for the project to be completed by its deadline
		if(projectTimeLeft > realTotalTimeAvailable){
			//console.log("The project will not fit in before its deadline!");
			
			//Update the projectStatus of the project to "oversize"
			theProjectBeingFlowedIn.projectStatus = "oversize";
			//Projects with a status of overdue are treated differently when the project boxes are being created. Their color code is yellow and a warning message is shown at the top of the screen.
		}
		
		//If the project is oversize, fill in all the remaining time available on each day with it
		if(theProjectBeingFlowedIn.projectStatus == "oversize"){
			for(a=0;a<=daysTillDueDate;a++){
				var roomLeft = dateSpan[a].capacity - (dateSpan[a].fill + totalTimeSpentTodayBalance); //Included totalTimeSpentTodayBalance in here. Okay?
				roomLeft += theProjectBeingFlowedIn.timeSpentToday; //Adding theProjectBeingFlowedIn.timeSpentToday to roomLeft. Okay?
				
				if(roomLeft > 0){
					//Only flow in project if there is any room left in the day
					
					/////UPDATE THE FILL
					var amountToFill = 0;
					//If the timeSpentToday is bigger than roomLeft, use that to fill the day. Otherwise just use the rest of the roomLeft.
					(theProjectBeingFlowedIn.timeSpentToday > roomLeft) ? amountToFill = theProjectBeingFlowedIn.timeSpentToday : amountToFill = roomLeft;
					// Update the Day's fill parameter
					dateSpan[a].fill += amountToFill;

					//Update the suggestedAmountToday variable in the orderedProjects array
					if(a == 0){
						theProjectBeingFlowedIn.suggestedAmountToday = amountToFill;
						//Update the userdata object now that the suggested amount is defined
						updateUserData();
					}
			
					// Add to the Day's fillItems
					var newFillItem = [];
					newFillItem.push(theProjectBeingFlowedIn.projectTitle);
					newFillItem.push(amountToFill);
					dateSpan[i].fillItems.push(newFillItem);
			
					//Update reducedProjectTime
					reducedProjectTime -= theProjectBeingFlowedIn.timeSpentToday;
					
				}
				
				//Once a project has been flowed in, adjust the totalTimeSpentTodayBalance
				totalTimeSpentTodayBalance -= theProjectBeingFlowedIn.timeSpentToday;
				
				//Advance the bookedOutTillDate by one day for each day we loop through and fill
				bookedOutTillDate = new Date(bookedOutTillDate.getTime() + 86400000);

				//On the due date, note how much time is left to complete the project
				if(a == daysTillDueDate){
					console.log("The due date has been reached and the project still has this many hours on it: " + reducedProjectTime);
				}
			}
		}else{
		//If the project is not oversize, fill the days proportionally with it
			for(a=0;a<=daysTillDueDate;a++){
				//console.log("reducedProjectTime equals " + reducedProjectTime);
				if(reducedProjectTime > 0){
					
					var workAllotment = 0;
					
					var roomLeft = dateSpan[a].capacity - dateSpan[a].fill;
					
					if((roomLeft * 60) >= minimumPortion){
						//If the roomLeft in the day is at least as big as the minimumPortion, flow some project into it.
					
						var percentOfTotalTimeAvailable = roomLeft / totalTimeAvailable;
						workAllotment = projectTimeLeft * percentOfTotalTimeAvailable;
						
						//console.log("roomLeft is set to: " + roomLeft);
						//console.log("totalTimeAvailable is set to: " + totalTimeAvailable);
						//console.log("percentOfTotalTimeAvailable is set to: " + percentOfTotalTimeAvailable);
					
						//console.log("Day " + a + ": percentOfTotalTimeAvailable is set to " + percentOfTotalTimeAvailable);
			
						if((reducedProjectTime > (minimumPortion / 60)) && (daysTillDueDate > 0)){
							//Except for the final workAllotment installment, we round workAllotment up to the nearest granular level
							var workAllotmentMinutes = workAllotment * 60;
							workAllotmentMinutes = Math.ceil(workAllotmentMinutes/granularity) * granularity;
							//And be sure that the workAllotment is at least the size of the minimumPortion
							if(workAllotmentMinutes < minimumPortion){workAllotmentMinutes = minimumPortion;}
							workAllotment = workAllotmentMinutes / 60;
							//console.log("Day " + a + ": workAllotmentMinutes is set to " + workAllotmentMinutes);
						}else{
							//On the final day set the workAllotment simply to the remaining time on the project
							workAllotment = reducedProjectTime;
							var workAllotmentMinutes = Math.round(workAllotment * 60);
							workAllotment = workAllotmentMinutes / 60;
							//console.log("Day " + a + ": ...and finally workAllotmentMinutes is set to " + workAllotmentMinutes);
						}
					
					//End if((roomLeft * 60) >= minimumPortion)
					}

					//console.log("======= workAllotment = "+workAllotment);
					
					////////Be sure not to overfill today:
					
					if(a == 0){
						//Take into account the time already worked today (excluding time worked on this particular project)
						var realRoomLeft = roomLeft - (totalTimeSpentTodayBalance - theProjectBeingFlowedIn.timeSpentToday);
						if(workAllotment > realRoomLeft){workAllotment = realRoomLeft;}
						
						//If the timeSpentToday is bigger than workAllotment, set workAllotment to timeSpentToday
						if(theProjectBeingFlowedIn.timeSpentToday > workAllotment){workAllotment = theProjectBeingFlowedIn.timeSpentToday;}
						
						//console.log("Suggested amount is being set. workAllotment is set to " + workAllotment);
						theProjectBeingFlowedIn.suggestedAmountToday = workAllotment;
						//Update the userdata object now that the suggested amounts are defined
						updateUserData();
					}
					
					//Once a project has been flowed in, adjust the totalTimeSpentTodayBalance
					totalTimeSpentTodayBalance -= theProjectBeingFlowedIn.timeSpentToday;
					
					//If any workAllotment has been set, add it to the day's fill, etc.
					if(workAllotment){
						//console.log("||||| workAllotment = "+workAllotment);
						// Update the Day's fill parameter
						dateSpan[a].fill += workAllotment;
			
						// Add to the Day's fillItems
						var newFillItem = [];
						newFillItem.push(theProjectBeingFlowedIn.projectTitle);
						newFillItem.push(workAllotment);
						dateSpan[a].fillItems.push(newFillItem);
						
						//Update the projectStatus of the project to "okay" since it is not oversized (in case it was previously)
						theProjectBeingFlowedIn.projectStatus = "okay";
			
						//Update reducedProjectTime
						reducedProjectTime -= workAllotment;
				
						//If reducedProjectTime is less than one minute, reduce it to 0
						if(reducedProjectTime < 0.016666667){reducedProjectTime = 0};
				
						//console.log("dateSpan[a].fillItems now looks like this:");
						//console.log(dateSpan[a].fillItems);

						if((roomLeft - workAllotment) < (minimumPortion / 60)){
							//console.log("workAllotment will fill the rest of the day.");
							//If the workAllotment is going to fill up the rest of the day, advance the bookedOutTillDate by one day
							bookedOutTillDate = new Date(bookedOutTillDate.getTime() + 86400000);
						}
					}
				}
			}
		}
	}//END the loop through all of the projects
	
	//console.log("+ Finished flowing projects into days. Now checking the bookedOutTillDate.");
	checkBookedOutTillDate();
}

function findEarliestPossibleFinishDate(){
	var totalProjectsTimeLeft = 0;
	var l = orderedProjects.length;
	
	//Loop through all the projects to find the total amount of time left on all projects:
	for(i=0;i<l;i++){
		totalProjectsTimeLeft += (orderedProjects[i].timeEstimate - orderedProjects[i].timeSpent);
	}
	
	var moreDaysRequired = true;
	var theDay = today.getDay();
	var counter = 0;
	var theCapacity = 0;
	
	var workSchedule = [];
	workSchedule[0] = U.profiles[Profile].workSchedule.su;
	workSchedule[1] = U.profiles[Profile].workSchedule.mo;
	workSchedule[2] = U.profiles[Profile].workSchedule.tu;
	workSchedule[3] = U.profiles[Profile].workSchedule.we;
	workSchedule[4] = U.profiles[Profile].workSchedule.th;
	workSchedule[5] = U.profiles[Profile].workSchedule.fr;
	workSchedule[6] = U.profiles[Profile].workSchedule.sa;
	
	//Start looping through each day required, subtracting from totalProjectsTimeLeft according each day's capacity
	while(moreDaysRequired){
		
		//Figure out which day of the week we are currently on so we can find its capacity
		var x = theDay + counter;
		if(x > 6){
			x = x % 6;
		}
		theCapacity = workSchedule[x];
		
		//Get the date of the day we're working with
		var currentDate = new Date(today.getTime() + (86400000 * counter));
		
		//Figure out if it's a vacation day
		var vacationDays = U.profiles[Profile].vacationDays;
		var numberOfVacationDays = vacationDays.length;
		
		for(i=0;i<numberOfVacationDays;i++){
			untestedDate = currentDate.toDateString();
			vacationDayToTest = new Date(vacationDays[i]).toDateString();
			if(untestedDate == vacationDayToTest){
				//If it is a vacation day, set its capacity to 0
				theCapacity = 0;
			}
		}
		
		if(counter == 0){
			//The first day considered is today, so subtract totalTimeSpentToday from its capacity
			//(And if totalTimeSpentToday is more than the day's capacity, just set the capacity to 0)
			theCapacity > totalTimeSpentToday ? theCapacity -= totalTimeSpentToday : theCapacity = 0;
		}
		
		totalProjectsTimeLeft -= theCapacity;
		
		//When totalProjectsTimeLeft is diminished, note the date
		if(totalProjectsTimeLeft <= 0){

			var theTest = new Date(currentDate);
			
			//If the date is today or tomorrow, just use that word instead of the date format
			if((theTest - today) == 86400000){
				earliestPossibleFinishDate = "Tomorrow";
			}
	
			if((theTest - today) == 0){
				earliestPossibleFinishDate = "Today";
			}
			
			//If the date is further out than tomorrow, format accordingly
			if((theTest - today) > 86400000){
				
				switch(currentDate.getDay()){
						case 0: earliestPossibleFinishDate = "Sunday, " + currentDate.toLocaleDateString(); break;
						case 1: earliestPossibleFinishDate = "Monday, " + currentDate.toLocaleDateString(); break;
						case 2: earliestPossibleFinishDate = "Tuesday, " + currentDate.toLocaleDateString(); break;
						case 3: earliestPossibleFinishDate = "Wednesday, " + currentDate.toLocaleDateString(); break;
						case 4: earliestPossibleFinishDate = "Thursday, " + currentDate.toLocaleDateString(); break;
						case 5: earliestPossibleFinishDate = "Friday, " + currentDate.toLocaleDateString(); break;
						case 6: earliestPossibleFinishDate = "Saturday, " + currentDate.toLocaleDateString(); break;
						default: console.log("TIMEPOSITIVE ERROR: Unable to determine the earliestPossibleFinishDate.");
				}
				
				if((theTest - today) <= 604800000){
					//If the day is within a week's time, add the word "This Coming "
					earliestPossibleFinishDate = "This coming " + earliestPossibleFinishDate;
				}
				
			}
			
			moreDaysRequired = false;
			return earliestPossibleFinishDate;
		}
		counter ++;
	}
}

function checkBookedOutTillDate(){
	//If the bookedOutTillDate falls on a day with no available work hours, advance it to the first workday with hours available
	
	//Find out the work capacity of the day of the week the bookedOutTillDate falls on
	var theDay = bookedOutTillDate.getDay();
	var dayCapacity = 0;
	
	switch(theDay) {
	    case 0: dayCapacity = U.profiles[Profile].workSchedule.su; break;
		case 1: dayCapacity = U.profiles[Profile].workSchedule.mo; break;
		case 2: dayCapacity = U.profiles[Profile].workSchedule.tu; break;
		case 3: dayCapacity = U.profiles[Profile].workSchedule.we; break;
		case 4: dayCapacity = U.profiles[Profile].workSchedule.th; break;
		case 5: dayCapacity = U.profiles[Profile].workSchedule.fr; break;
		case 6: dayCapacity = U.profiles[Profile].workSchedule.sa; break;
	    default:console.log("TIMEPOSITIVE ERROR: Unable to determine dayCapacity for bookedOutTillDate.")
	}
	
	if(dayCapacity == 0){
		//If there is no room in the work schedule, advance the bookedOutTillDate one more day
		bookedOutTillDate = new Date(bookedOutTillDate.getTime() + 86400000);
		//Call this function again
		checkBookedOutTillDate();
		return false;
	}
	
	//If the workschedule typically has work time available, check to see if there are any vacation days
	var vacationDays = U.profiles[Profile].vacationDays;
	var numberOfVacationDays = vacationDays.length;

	var untestedDate = new Date(bookedOutTillDate).toDateString();
	
	if(numberOfVacationDays > 0){
		//If there are any vacation days, check to see that the bookedOutTillDate is not one of them
		for(a=0;a<numberOfVacationDays;a++){
			var vacationDayToTest = new Date(vacationDays[a]).toDateString();
			if(untestedDate == vacationDayToTest){
				//If the day is a vacation day, advance the bookedOutTillDate one more day
				bookedOutTillDate = new Date(bookedOutTillDate.getTime() + 86400000);
				//Call this function again
				checkBookedOutTillDate();
				return false;
			}
		}
	}
	
	showBookedOutTillDate();
}

function showBookedOutTillDate(){
	var theText = "";
	//console.log(bookedOutTillDate);
	//console.log(today);
	
	if(bookedOutTillDate.toDateString() == today.toDateString()){
		$("#bookedOutTillDiv")[0].innerHTML = "You have room in your schedule, starting <span id='bookedOutTillDate' class='bgcolor-0 color-9'>today</span>";
	}else{
		switch(bookedOutTillDate.getDay()){
				case 0: theText = "Sunday, " + bookedOutTillDate.toLocaleDateString(); break;
				case 1: theText = "Monday, " + bookedOutTillDate.toLocaleDateString(); break;
				case 2: theText = "Tuesday, " + bookedOutTillDate.toLocaleDateString(); break;
				case 3: theText = "Wednesday, " + bookedOutTillDate.toLocaleDateString(); break;
				case 4: theText = "Thursday, " + bookedOutTillDate.toLocaleDateString(); break;
				case 5: theText = "Friday, " + bookedOutTillDate.toLocaleDateString(); break;
				case 6: theText = "Saturday, " + bookedOutTillDate.toLocaleDateString(); break;
				default: console.log("TIMEPOSITIVE ERROR: Unable to determine the bookedOutTillDate.");
		}
		
		if((bookedOutTillDate - today) <= 604800000){
			//If the day is within a week's time, add "This Coming "
			theText = "This coming " + theText;
		}
		
		if((bookedOutTillDate - today) == 86400000){
			//If the day is tomorrow, simpley say "Tomorrow"
			theText = "Tomorrow";
		}
		
		$("#bookedOutTillDiv")[0].innerHTML = "You're booked out until:<br><span id='bookedOutTillDate' class='bgcolor-0 color-9'>"+theText+"</span>";
	}

}

//////////////SET TRIGGER FOR MIDNIGHT REFRESH

//When midnight happens, we need to refresh the app content to reflect the new date
//However, we don't want to interrupt a running timer, so we check for that
//If a timer is running, the midnightRefresh() is called when it is done
midnightRefreshWhenTimerStops = false;

var midnightTimeout; //This line added to solve midnightRefresh duplication bug

function setMidnightRefreshTrigger(){
	//Only do this if the user is logged in
	if(U.activityStatus == "Logged In"){
		
		//Cancel the previous timeout
		clearTimeout(midnightTimeout); //This line added to solve midnightRefresh duplication bug
		
		//Find out how many milliseconds there are till midnight
		var timeRemainingBeforeMidnight = (new Date(today.toDateString()).getTime() + 86400000) - (new Date().getTime());
	
		//timeRemainingBeforeMidnight = 2000; //This line is just for testing

		//setTimeout to refresh the page when midnight happens
		midnightTimeout = setTimeout( //This line altered to solve midnightRefresh duplication bug
			function(){
				if(!timerScreenIsActive){
					//If the timer screen is not active, call midnightRefresh
					midnightRefresh();
				}else{
					//If the timer screen IS active, set a variable that will cause midnightRefresh to be called after the time is logged
					midnightRefreshWhenTimerStops = true;
				}
			},
			timeRemainingBeforeMidnight
		);
		
	}
}

function midnightRefresh(){
	console.log("Midnight Refresh");
	
	//////RESET ALL TIMESPENTTODAY VALUES TO 0
	var l = U.profiles.length;
	for(i=0;i<l;i++){
		var p = U.profiles[i].projects.length;
		if(p > 0){
			//If there are any projects in this profile, loop through them and set the timeSpentToday to 0
			for(x=0;x<p;x++){
				U.profiles[i].projects[x].timeSpentToday = 0;
			}
		}
	}
	
	//////RESET dayCapacityAdjustmentMessageShown
	dayCapacityAdjustmentMessageShown = false;
	
	//RECOLOR any gray days on the calendar
	recolorGrayDays();
	
	//////REFRESH THE DATA
	updateUserData(1);
}

///ON WINDOW REFRESH

//Check for passing midnight when the window receives focus (in case midnight happened while browser was minimized, or another tab was active)
$(window).focus(function(){
	//console.log("Window is in focus. Check the 'today' variable and call midnightRefresh if it is different from a new Date()");
	if(new Date().getDate() != today.getDate()){
		//Apparently the app has not been refreshed, possibly because the browser was minimized or not in focus
		if(!timerScreenIsActive){
			//If the timer screen is not active, call midnightRefresh
			midnightRefresh();
		}else{
			//If the timer screen IS active, set a variable that will cause midnightRefresh to be called after the time is logged
			midnightRefreshWhenTimerStops = true;
		}
	}
});

/////////////////////////////////////////////////
/*COOKIES*/
/////////////////////////////////////////////////

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function clearCookies(){
	//Delete all cookies by setting their expiration date to a time past
	document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
	document.cookie = "userdata=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}


/////////////////////////////////////////////////
/* LOGIN */
/////////////////////////////////////////////////

/* LOGIN BUTTON */
$("#login").click(function(){
	sound("bleepEcho");
	$("#loginDiv").show();
	$("#loginInputEmail").focus();
	$("#signupDiv,#welcomeDiv,#earlyAdoptersDiv").hide();
});

/* TRY LOGIN */
$("#tryLoginButton").click(function(){
	console.log('trying to log in');
	//Clear any existing error messages
	$("#errorDiv-login,#errorDiv-loginEmail,#errorDiv-loginPassword").hide();
	
	//CHECK FOR ERRORS
	var errors = false;
	
	var emailInput = $("#loginInputEmail")[0].value;
	var passwordInput = $("#loginInputPassword")[0].value;
	
	//Be sure the email is not blank:
	if($.trim( $('#loginInputEmail').val() ) == ''){
		showErrorMessage('errorDiv-loginEmail','Please enter your email.');
		errors = true;
	}
	
	//Be sure the password is not blank:
	if($.trim( $('#loginInputPassword').val() ) == ''){
		showErrorMessage('errorDiv-loginPassword','Please enter your password.')
		errors = true;
	}
	
	//Be sure the email is formatted correctly
	var emailRegex =/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if(!emailInput.match(emailRegex)){
		showErrorMessage('errorDiv-loginEmail','Check the format of your email address. It should look something like this: <b>you@example.com</b>');
		errors = true;
	}
	
	if(errors){
		//Play error sound
		sound("descend");
	}
	
	//If nothing is blank or formatted wrong, we go ahead and use AJAX to check files on the server
	if(!errors){
		//Check that the email exists in the records:
		$.ajax({
		  method: "POST",
		  url: "scripts/checkForEmail.php",
		  data: { email: emailInput }
		})
	 	 .done(function( msg ) {
	   	 console.log( "Check for email complete. The result is this: " + msg);

	   	  if(msg == 1){
	   		  console.log('That email exists!');
		  	  //If the email exists, check the password:
		  
		  	  $.ajax({
		        method: "POST",
		  	      url: "scripts/checkPassword.php",
		 	       data: { email: emailInput, password: passwordInput }
		  	    })
		  	      .done(function( msg ) {
		 	       	 console.log( "Checking of password complete. The result is this: " + msg);
  
		  	      	  if(msg == 1){
		   	     		  console.log('That password is correct!');
					 	  //If the password is correct, set the variable and create the userEmail cookie
					      userEmail = emailInput;
					   	  document.cookie = "userEmail=" + emailInput;
    					  
					  	  //Play success sound
					  	  sound("oneUp");
				  		  //Fade Out introMusic
				  		  $("#introMusic").animate({volume: 0}, 1000,function(){
				  		      pause("introMusic");
				  		  });
						  
					   	  //Continue into the app
					   	  loadUserObjectAndSetUp();	
						  return true;
					  
		  	      	  }else{
				  		  //Play error sound
				  		  sound("descend");
		  	        	  showErrorMessage('errorDiv-login','That email or password is incorrect.')
		  	  	  		  return false;
		  	      	  }
		  	  });
		  
	   	  }else{
			//If the email does not exist
	  		//Play error sound
	  		sound("descend");
	  	    showErrorMessage("errorDiv-loginEmail","Can't find that email in the records...");
	  		return false;
	   	  }
		  
		});
	}
});

//(So far I am not using either of these two next functions because I more or less incorporate their contents into other functions)

//CHECK FOR EMAIL
function checkForEmail(e){
	$.ajax({
	  method: "POST",
	  url: "scripts/checkForEmail.php",
	  data: { email: e }
	})
 	 .done(function( msg ) {
   	 console.log( "Communication with PHP successful. The message is this: " + msg);

   	  if(msg == 1){
   		  console.log('That email exists!');
   		  return true;
   	  }
      return false;
	});
}

//CHECK PASSWORD
function checkPassword(e,p){
	$.ajax({
  	  method: "POST",
  	  url: "scripts/checkPassword.php",
  	  data: { email: e, password: p }
  	})
   	 .done(function( msg ) {
     	 console.log( "Communication with PHP successful. The message is this: " + msg);

     	  if(msg == 1){
     		  console.log('That password is correct!');
     		  return true;
     	  }

        return false;
	});
}

/* CANCEL LOGIN */
$("#cancelLoginButton").click(function(){
	sound("playerDamage");
	$("#loginDiv").hide();
});

/////////////////////////////////////////////////
/* GENERAL FORM HANDLING */
/////////////////////////////////////////////////

//Prevent forms from using carrying out their default submit behavior
$("form").submit(function(){
	return false;
});

//Detect if the Enter button has been pressed and perform a click on the specified button
function customFormSubmit(event,buttonToPress){
	var k = event.which || event.keyCode;
	if(k==13){
		$('#' + buttonToPress).click();
	};
}

//Do this so that text is selected when an input field receives focus:
$("input").focus(function(){
	//alert("You clicked an input");
	$(this).select();
});

function showErrorMessage(id,message){
	$("#"+id)[0].innerHTML = message;
	$("#"+id).show();
}

function hideErrorMessage(id){
	$("#"+id).hide();
	$("#"+id)[0].innerHTML = "";
}

//prepInput is often called from the onfocus event on an input element, to remove the default placeholder text and darken the color
function prepInput(theElement,defaultValue,isPassword){
	var theValue = theElement.value;
	if(theElement.getAttribute("class")){
		var theClass = theElement.getAttribute("class");
	}else{
		var theClass = "";
	}
	if(theValue == defaultValue){
		theElement.value = "";
		theClass = theClass + " color-9";
		theElement.setAttribute("class",theClass);
	}
	if(isPassword){
		theElement.setAttribute("type","password");
	}
}

//checkInput is often called from the onblur event on an input element, to replace the default placeholder text and return the color to gray
function checkInput(theElement,defaultValue,isPassword){
	var theValue = theElement.value;
	if($.trim( theValue ) == ''){
		theElement.value = defaultValue;
		theElement.removeAttribute("class");
		if(isPassword){
			theElement.setAttribute("type","text");
		}
	}
}

/////////////////////////////////////////////////
/* WORK SCHEDULE SCREEN */
/////////////////////////////////////////////////

var currentWorkScheduleDay = "mo";

//Set up Work Schedule Screen
function loadWorkScheduleScreen(){
	var dayArray = ['mo','tu','we','th','fr','sa','su'];
	
	//Set the numbers and fill heights for the 7 days of the week
	for(i=0;i<7;i++){
		$("#workScheduleHours-" + dayArray[i])[0].innerHTML = U.profiles[Profile].workSchedule[dayArray[i]];
		$("#workScheduleDayFill-" + dayArray[i])[0].style.height = (U.profiles[Profile].workSchedule[dayArray[i]] * 4.7) + "%";
	}
	//Initial set up shows Monday by default
	$("#workScheduleCurrentDay")[0].innerHTML = "Monday";
	$("#workScheduleCurrentDayHoursInput")[0].value = U.profiles[Profile].workSchedule.mo;
	$(".errorDiv").hide();
}

function setWorkScheduleInput(day){
	var theDay = "";
	var theTime = 0;
	switch(day){
		case "mo": theDay = "Monday"; theTime = $("#workScheduleHours-mo")[0].innerHTML; currentWorkScheduleDay = "mo"; break;
		case "tu": theDay = "Tuesday"; theTime = $("#workScheduleHours-tu")[0].innerHTML; currentWorkScheduleDay = "tu"; break;
		case "we": theDay = "Wednesday"; theTime = $("#workScheduleHours-we")[0].innerHTML; currentWorkScheduleDay = "we"; break;
		case "th": theDay = "Thursday"; theTime = $("#workScheduleHours-th")[0].innerHTML; currentWorkScheduleDay = "th"; break;
		case "fr": theDay = "Friday"; theTime = $("#workScheduleHours-fr")[0].innerHTML; currentWorkScheduleDay = "fr"; break;
		case "sa": theDay = "Saturday"; theTime = $("#workScheduleHours-sa")[0].innerHTML; currentWorkScheduleDay = "sa"; break;
		case "su": theDay = "Sunday"; theTime = $("#workScheduleHours-su")[0].innerHTML; currentWorkScheduleDay = "su"; break; 
	}
	$("#workScheduleCurrentDay")[0].innerHTML = theDay;
	$("#workScheduleCurrentDayHoursInput")[0].value = theTime;
	$("#workScheduleCurrentDayHoursInput")[0].select();
}

function setWorkScheduleCalendarDisplay(){
	
	var errorPresent = false;
	
	//GET THE INPUT VALUE
	var n = $("#workScheduleCurrentDayHoursInput")[0].value;
	
	//CHECK IT FOR ERRORS
	if((n.toString()[0] == "0") && (n.toString()[1]) && (n.toString()[1] != ".")){
		//This is the case if someone types something like "03".
		n = n.substring(1);
		setTimeout(function(){$("#workScheduleCurrentDayHoursInput")[0].value = n;},300);
		errorPresent = true;
	}
	
	if(isNaN(n)){
		//Throw error about the input needing only to be a number
		showErrorMessage("errorDiv-workSchedule","Just type numbers, like 1, 2, 3... the decimal point is okay, too.");
		n = 0;
		//The timeout feature prevents a glitch where the error message disappeared too soon when typing quickly
		setTimeout(function(){$("#workScheduleCurrentDayHoursInput")[0].value = n;},300);
		errorPresent = true;
	}else{
		
		if(n>24){
			//Throw error about number being too big
			showErrorMessage("errorDiv-workSchedule","There are but 24 hours in the day.");
			n = 24;
			setTimeout(function(){$("#workScheduleCurrentDayHoursInput")[0].value = n;},300);
			errorPresent = true;
		}
		
		if((n % 0.5) != 0){
			//Throw error about no increments smaller than half hours being allowed
			showErrorMessage("errorDiv-workSchedule","Your estimate is rounded to the nearest half hour.");
			n = Math.round(n);
			setTimeout(function(){$("#workScheduleCurrentDayHoursInput")[0].value = n;},300);
			errorPresent = true;
		}
	}
	
	//If there are no errors, hide any error message that may be present
	if(errorPresent == false){
		hideErrorMessage("errorDiv-workSchedule");
	}
	
	//If n is blank, set it to 0
	if(n == ""){n = 0;}
	
	//SET THE DISPLAY
	$("#workScheduleHours-" + currentWorkScheduleDay)[0].innerHTML = n;
	$("#workScheduleDayFill-" + currentWorkScheduleDay)[0].style.height = (n * 4.7) + "%";
}

function saveWorkSchedule(){
	$("#saveStatusMessage")[0].innerHTML = "Saving...";
	$("#saveStatusMessage").show();

	var dayArray = ['mo','tu','we','th','fr','sa','su'];

	//Update the workSchedule data
	for(i=0;i<7;i++){
		U.profiles[Profile].workSchedule[dayArray[i]] = $("#workScheduleHours-" + dayArray[i])[0].innerHTML;
	}
	
	//The argument "1" will trigger the project flow to also be refreshed
	updateUserData(1);
	
	//Take care of some display elements
	$("#dropInDiv").hide();
	$("#dropInScreen-"+currentDropinScreen).hide();
	currentDropinScreen = "";
	$("#shadeScreen").hide();
	//Show the topBarButtons
	$("#loginWelcome").animate({right: "85px"}, 200, "easeOutCirc", function(){
		$("#topBarButtons").animate({top: "0px"}, 200, "easeInCirc");
	});
}

/////////////////////////////////////////////////
/* VACATION DAYS SCREEN */
/////////////////////////////////////////////////

//Set up Vacation Days Screen
function loadVacationDaysScreen(){
	$(".errorDiv").hide();
	
	var vacationDaysArray = [];
	vacationDaysArray = U.profiles[Profile].vacationDays;
	
	var l = vacationDaysArray.length;
	
	//If there are some vacationDays, loop through and generate the elements
	if(l > 0){
		$("#vacationDaysDiv")[0].innerHTML = "";
		
		for(i=0;i<l;i++){
			//Format Date
			var formattedDate = new Date (vacationDaysArray[i]);
			formattedDate = formattedDate.toDateString();
			//vacationDaysItem
			var vacationDaysItem = document.createElement("div");
			vacationDaysItem.setAttribute("class","vacationDaysItem color-6 bbcolor-3");
			vacationDaysItem.innerHTML = formattedDate;
			$("#vacationDaysDiv")[0].appendChild(vacationDaysItem);
			//vacationDaysDeleteButton
			var vacationDaysDeleteButton = document.createElement("div");
			vacationDaysDeleteButton.setAttribute("id",i); //id is set to the index easy reference for deleting the vacationDay
			vacationDaysDeleteButton.setAttribute("class","vacationDaysDeleteButton surpriseButton-color-2");
			vacationDaysDeleteButton.innerHTML = "x";
			vacationDaysItem.appendChild(vacationDaysDeleteButton);
		}
	
		//Attach the delete function to the delete buttons
		$(".vacationDaysDeleteButton").click(function(){
			deleteVacationDay(this);
		});
		
	}else{
		$("#vacationDaysDiv")[0].innerHTML = "";
		//noVacationDaysMessage
		var noVacationDaysMessage = document.createElement("div");
		noVacationDaysMessage.setAttribute("id","noVacationDaysMessage");
		noVacationDaysMessage.setAttribute("class","vacationDaysItem color-6 bgcolor-00 bbcolor-3");
		noVacationDaysMessage.setAttribute("style","opacity:0");
		noVacationDaysMessage.innerHTML = "You do not have any saved Vacation Days.";
		$("#vacationDaysDiv")[0].appendChild(noVacationDaysMessage);
		$("#noVacationDaysMessage").animate({opacity: 1}, 500, "easeInCirc");
	}
	
}

//Clear the Vacation Days Screen
function clearVacationDaysScreen(){
	$("#vacationDaysInput")[0].value = "";
	$("#vacationDaysInput").blur();
}

//To Delete a vacationDay
function deleteVacationDay(theElement){
	console.log("Deleting this vacationDay: ");
	console.log(theElement.parentNode);
	
	$("#saveStatusMessage")[0].innerHTML = "Saving...";
	$("#saveStatusMessage").show();
	
	//Handle the removal of the vacation day from the User object
	var theVacationDay = theElement.id;
	U.profiles[Profile].vacationDays.splice(theVacationDay,1);
	updateUserData(1);
	
	//Handle the removal of the element from the DOM
	var e = theElement.parentNode;
	e.remove();
}

//To Add a vacationDay
function addVacationDay(){
	
	//GET THE EXISTING VACATION DAYS, IF ANY
	var vacationDaysArray = [];
	vacationDaysArray = U.profiles[Profile].vacationDays;
	var l = vacationDaysArray.length;
	var startPosition = null; //Used later to help remove any duplicate dates
	
	//GET THE INPUT VALUE
	var theValue = $("#vacationDaysInput")[0].value;
	
	//HIDE ANY ERROR MESSAGE THAT MAY BE PRESENT
	hideErrorMessage("errorDiv-vacationDays");
	
	///////////CHECK FOR ERRORS
	
	//Be sure it is not blank
	if(($.trim( theValue ) == '') || ($.trim( theValue ) == 'MM/DD/YYYY')){
		showErrorMessage("errorDiv-vacationDays","Your entry is blank. Please type in a date.");
		return false;
	}
	
	//Be sure the input date is formatted correctly
	var date_regex = /^(\d{1}|\d{2})\/(\d{1}|\d{2})\/(\d{2}|\d{4})$/;
	var dateRange_regex = /^(\d{1}|\d{2})\/(\d{1}|\d{2})\/(\d{2}|\d{4})-(\d{1}|\d{2})\/(\d{1}|\d{2})\/(\d{2}|\d{4})$/;
	
	if(!theValue.match(date_regex)){
		
		//If it does not match the format mm/dd/yyyy, see if they are trying to enter a date range
		if(theValue.match(dateRange_regex)){
			/////////WE HAVE A DATE RANGE, LADIES AND GENTLEMEN!
			
			//Isolate the start and end dates
			var firstDate = theValue.split("-")[0];
			var lastDate = theValue.split("-")[1];
			
			var firstDateMilliseconds = new Date(firstDate).getTime();
			var lastDateMilliseconds = new Date(lastDate).getTime();
			var numberOfDaysInRange = ((lastDateMilliseconds - firstDateMilliseconds) / 86400000) + 1;
			
			//Be sure both first and last dates are valid
			var validDate = new Date(firstDate);
			var validDate2 = new Date(lastDate);
			if((validDate == "Invalid Date") || (validDate2 == "Invalid Date")){
				showErrorMessage("errorDiv-vacationDays","Your date range includes an invalid date. Use the format <b>month/day/year</b>, and make sure the month number is '12' or less, and the day is '31' or less.");
				return false;
			}
			
			//Check that the first date is before the last date
			if(firstDateMilliseconds > lastDateMilliseconds){
				showErrorMessage("errorDiv-vacationDays","The first date in your range is later than the last date in your range. Enter the earlier date first.");
				return false;
			}
			
			//Check that the first date and last date are not the same
			if(firstDateMilliseconds == lastDateMilliseconds){
				showErrorMessage("errorDiv-vacationDays","The first and last dates in your range are the same.");
				return false;
			}
			
			//Check that the first date is not in the past
			var todaysDateMilliseconds = new Date(today.toDateString()).getTime();
			if(firstDateMilliseconds < todaysDateMilliseconds){
				showErrorMessage("errorDiv-vacationDays","That date range includes dates in the past. <br>We don't care about dates in the past.");
				return false;
			}
			
			//IF the date range input passes all those error checks, go ahead and add the new vacation days
			
			//////////////////////////////////////////////
			//////////////////ADD A RANGE OF VACATION DAYS
			
			//If there are already some vacationDays saved, loop through and put the new vacation days in their place
			if(l > 0){
				for(i=0;i<l;i++){

					//Find the place in the array to insert the date range by comparing the first date in the range to the existing dates
					var existingDateMillisecondsToCheck = new Date(U.profiles[Profile].vacationDays[i]).getTime();
			
					if(firstDateMilliseconds == existingDateMillisecondsToCheck){
						
						//If the matched date is the last of the existing vacation days, just add the new dates on the end without adding the first date, by starting x at 1 instead of 0
						if ((i+1) == l){
							//CODE TO ADD EACH DATE IN THE RANGE
							for(x=1;x<numberOfDaysInRange;x++){
								var theNewDate = new Date(firstDateMilliseconds + (86400000 * x)).toLocaleDateString();
								U.profiles[Profile].vacationDays.splice((i+1+x),0,theNewDate);
							}
							//Update userData and reflow the projects
							updateUserData(1);
							$("#vacationDaysInput")[0].value = "";
							return true;
						}
						
						//If the matched date is not the last of the existing vacation days, insert all of the dates and remove duplicates after
						
						//ADD EACH DATE IN THE RANGE
						for(x=0;x<numberOfDaysInRange;x++){
							var theNewDate = new Date(firstDateMilliseconds + (86400000 * x)).toLocaleDateString();
							U.profiles[Profile].vacationDays.splice((i+x),0,theNewDate);
						}
						
						//CONTINUE LOOKING THROUGH THE ARRAY AND REMOVE ANY DUPLICATES
						startPosition = i + numberOfDaysInRange;
						var newNumberOfVacationDays = U.profiles[Profile].vacationDays.length;
						var remainingDaysToCheck = newNumberOfVacationDays - startPosition;
						
						for(x=0;x<remainingDaysToCheck;x++){
							var existingDateMillisecondsToCheck = new Date(U.profiles[Profile].vacationDays[startPosition]).getTime();
							if(existingDateMillisecondsToCheck <= lastDateMilliseconds){
								//If the date being checked is less than or equal to the lastDate in our range, remove it
								U.profiles[Profile].vacationDays.splice((startPosition),1);
							}else{
								break;
							}
						}
						//Update userData and reflow the projects
						updateUserData(1);
						$("#vacationDaysInput")[0].value = "";
						return true;
					}
					
					if(firstDateMilliseconds > existingDateMillisecondsToCheck){
						//If we are at the end of our loop, add the proposed date range at the end of the array and be done
						if(i+1 == l){
							
							//ADD EACH DATE IN THE RANGE
							for(x=0;x<numberOfDaysInRange;x++){
								var theNewDate = new Date(firstDateMilliseconds + (86400000 * x)).toLocaleDateString();
								U.profiles[Profile].vacationDays.splice((i+1+x),0,theNewDate);
							}
							//Update userData and reflow the projects
							updateUserData(1);
							$("#vacationDaysInput")[0].value = "";
							return true;
						}
						//Otherwise, continue looking through the loop
						continue;
					}else{
						//If we have come to a place where the existingDateToCheck is bigger than theFirstDate, insert the range there
						//ADD EACH DATE IN THE RANGE
						for(x=0;x<numberOfDaysInRange;x++){
							var theNewDate = new Date(firstDateMilliseconds + (86400000 * x)).toLocaleDateString();
							U.profiles[Profile].vacationDays.splice((i+x),0,theNewDate);
						}
						
						//CONTINUE LOOKING THROUGH THE ARRAY AND REMOVE ANY DUPLICATES
						startPosition = i + numberOfDaysInRange;
						var newNumberOfVacationDays = U.profiles[Profile].vacationDays.length;
						var remainingDaysToCheck = newNumberOfVacationDays - startPosition;
						
						for(x=0;x<remainingDaysToCheck;x++){
							var existingDateMillisecondsToCheck = new Date(U.profiles[Profile].vacationDays[startPosition]).getTime();
							if(existingDateMillisecondsToCheck <= lastDateMilliseconds){
								//If the date being checked is less than or equal to the lastDate in our range, remove it
								U.profiles[Profile].vacationDays.splice((startPosition),1);
							}else{
								break;
							}
						}
						//Update userData and reflow the projects
						updateUserData(1);
						$("#vacationDaysInput")[0].value = "";
						return true;
					}
				}
			}//If no vacationDays have been saved already, simply add the dates
			
			//ADD EACH DATE IN THE RANGE
			for(x=0;x<numberOfDaysInRange;x++){
				var theNewDate = new Date(firstDateMilliseconds + (86400000 * x)).toLocaleDateString();
				U.profiles[Profile].vacationDays.push(theNewDate);
			}
			//Update userData and reflow the projects
			updateUserData(1);
			$("#vacationDaysInput")[0].value = "";
			return true;
			
		}else{
			/////////WE DO NOT HAVE A DATE RANGE -- the date it is just poorly formatted.
			showErrorMessage("errorDiv-vacationDays","Please format your entry like this: <b>mm/dd/yyyy</b>. For a date range, use a hyphen between dates, like this: <b>mm/dd/yyyy-mm/dd/yyyy.</b> Do not use any spaces. ...And you should be golden.");
			return false;
		}
	}
	
	//Be sure it is a valid date
	var validDate = new Date(theValue);
	if(validDate == "Invalid Date"){
		showErrorMessage("errorDiv-vacationDays","That is an invalid date. Use the format <b>month/day/year</b>, and make sure the month number is '12' or less, and the day is '31' or less.");
		return false;
	}
	
	//Be sure it is not a date in the past
	var theProposedDateMilliseconds = new Date(theValue).getTime();
	var todaysDateMilliseconds = new Date(today.toDateString()).getTime();
	if(theProposedDateMilliseconds < todaysDateMilliseconds){
		showErrorMessage("errorDiv-vacationDays","That date is in the past, dude.");
		return false;
	}
	
	//If there are already some vacationDays saved, loop through and check that the new vacationDay is not a duplicate
	if(l > 0){
		for(i=0;i<l;i++){
			var theProposedDate = new Date(theValue).toDateString();
			var existingDateToCheck = new Date(U.profiles[Profile].vacationDays[i]).toDateString();
			if(theProposedDate == existingDateToCheck){
				showErrorMessage("errorDiv-vacationDays","That Vacation Day has already been saved. You're all set!");
				return false;
			}
		}
	}
	
	//IF YOU HAVE PASSED THE GAUNTLET OF ERROR-CHECKING, LET'S ADD THE NEW VACATION DAY
	
	////////////////////////////////////////////
	//////////////////ADD A SINGLE VACATION DAY
	if(l > 0){
		for(i=0;i<l;i++){
			//Loop through and put the new vacationDay in the right place according to chronological order
			var existingDateMilliseconds = new Date(U.profiles[Profile].vacationDays[i]).getTime();
			if(theProposedDateMilliseconds > existingDateMilliseconds){
				//If we are at the end of our loop, add the proposed date at the end of the array and be done
				if(i+1 == l){
					U.profiles[Profile].vacationDays.splice((i+1),0,new Date(theValue).toLocaleDateString());
					//Update user data and reflow projects
					updateUserData(1);
					$("#vacationDaysInput")[0].value = "";
					return true;
				}
				//Otherwise, continue looking through the loop
				continue;
			}else{
				U.profiles[Profile].vacationDays.splice(i,0,new Date(theValue).toLocaleDateString());
				//Update user data and reflow projects
				updateUserData(1);
				$("#vacationDaysInput")[0].value = "";
				return true;
			}
		}
	}else{
		//If there are no vacationDays saved, just simply add it
		U.profiles[Profile].vacationDays.push(new Date(theValue).toLocaleDateString());
		//Update user data and reflow projects
		updateUserData(1);
		$("#vacationDaysInput")[0].value = "";
		return true;
	}
}

/////////////////////////////////////////////////
/* ACCOUNT SCREEN */
/////////////////////////////////////////////////
var settingNewPassword = false;

function loadAccountScreen(){
	$("#accountNameInput")[0].value = U.name;
	$("#accountEmailInput")[0].value = U.email;
	$("#accountNewPasswordInput")[0].value = '';
	$("#accountConfirmPasswordInput")[0].value = '';
	checkInput($("#accountNewPasswordInput")[0],'Type your new password',1);
	checkInput($("#accountConfirmPasswordInput")[0],'Confirm password',1);
	settingNewPassword = false;
	$("#changePasswordLink").show();
	$("#changePasswordDiv").hide();
	$(".errorDiv").hide();
}

$("#changePasswordLink").click(function(){
	settingNewPassword = true;
});

function saveAccountDetails(){
	
	//HIDE ANY ERROR MESSAGES THAT MAY BE PRESENT
	$(".errorDiv").hide();
	
	//GET THE INPUT VALUES
	var theName = $("#accountNameInput")[0].value;
	var theEmail = $("#accountEmailInput")[0].value;
	if(settingNewPassword){
		var theNewPassword = $("#accountNewPasswordInput")[0].value;
		var theConfirmPassword = $("#accountConfirmPasswordInput")[0].value;
	}
	
	//CHECK FOR ERRORS
	var error = false;
	
	//Be sure the Name is not blank
	if($.trim( theName ) == ''){
		showErrorMessage("errorDiv-accountName","Please make a name for yourself:");
		error = true;
	}
	//Be sure the Email is not blank
	if($.trim( theEmail ) == ''){
		showErrorMessage("errorDiv-accountEmail","Enter an email:");
		error = true;
	}
	
	//Be sure the Email address does not already exist (every user must have a unique email address)
	//(ENTER CODE HERE)
	
	//Be sure the Name is not crazy
	nameRegex = /^[a-zA-Z0-9 ]+$/;
	if((!theName.match(nameRegex)) && ($.trim( theName) != '')){
		showErrorMessage("errorDiv-accountName","Your name must only contain letters, numbers, and spaces. No special characters.");
		error = true;
	}
	//Be sure the Email is valid
	emailRegex =/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if((!theEmail.match(emailRegex)) && ($.trim( theEmail ) != '')){
		showErrorMessage("errorDiv-accountEmail","Please check the format of your email address. It should look something like this: <b>you@example.com</b>");
		error = true;
	}
	
	//IF THE CHANGE PASSWORD LINK HAS BEEN CLICKED, PERFORM MORE ERROR CHECKS
	
	if(settingNewPassword){
		
		//Be sure the New Password is not blank
		if(($.trim( theNewPassword ) == '') || (theNewPassword == 'Type your new password')){
			showErrorMessage("errorDiv-accountNewPassword","Please enter a password:");
			error = true;
		}else{
			//Be sure the Confirm Password is not blank
			if(($.trim( theConfirmPassword ) == '') || (theConfirmPassword == 'Confirm password')){
				showErrorMessage("errorDiv-accountConfirmPassword","Please re-type your password to confirm it:");
				error = true;
			}else{
				//Be sure the Confirm Password matches the New Password
				if(theConfirmPassword != theNewPassword){
					showErrorMessage("errorDiv-accountConfirmPassword","The passwords do not match.");
					error = true;
				}
			}
		}
		
	}
	
	//IF EVERYTHING PASSES THE ERROR CHECKS SO FAR...
	if(!error){
		
		//IF THE EMAIL IS DIFFERENT FROM THE ONE USED TO LOG IN WITH, CHECK IF IT EXISTS OTHERWISE
		console.log("The New Email: " + theEmail.toLowerCase());
		console.log("The Old Email: " + userEmail.toLowerCase());
		
		if(theEmail.toLowerCase() != userEmail.toLowerCase()){ //.toLowerCase to avoid capitalization differences throwing it off
			console.log("This is a different email.")
			$.ajax({
			  method: "POST",
			  url: "scripts/checkForEmail.php",
			  data: { email: theEmail }
			})
		 	 .done(function( msg ) {
		   	 console.log("Communication with PHP successful. The message is this:");
			 console.log(msg);

		   	  if(msg == 1){
		   		  console.log('That email already exists!');
				  showErrorMessage("errorDiv-accountEmail","That email is already associated with a different account.");
				  return false;
			  
		   	  }else{
	   	  	
				//IF EVERYTHING IS A GO, UPDATE THE ACCOUNT
		  		$("#saveStatusMessage")[0].innerHTML = "Saving...";
		  		$("#saveStatusMessage").show();

				//UPDATE THE RECORD IN users.js AND DELETE THE OLD USER OBJECT .JS FILE
				updateUserList(userEmail,theEmail);

		  		//Update the local User object and userEmail cookie
		  		U.name = theName;
		  		U.email = theEmail;
				userEmail = theEmail;
				document.cookie = "userEmail=" + theEmail;

		  		if(settingNewPassword){
		  			U.password = theNewPassword;
		  		}

		  		//UPDATE USER DATA
		  		updateUserData();
				
				//Reset Login Welcome Message
				$("#loginWelcome")[0].innerHTML = theName;
				
				//Close the Account screen and show a confirmation message
				closeAccountDropInAndConfirm();
		  		return true;
			
		   	  }
		  
			});
			
		}else{
			//IF THE EMAIL IS THE SAME AS THE ONE USED TO LOG IN, NO NEED TO CHECK IT
	  		$("#saveStatusMessage")[0].innerHTML = "Saving...";
	  		$("#saveStatusMessage").show();

	  		//Update the local User object
	  		U.name = theName;
			userEmail = theEmail;
	  		if(settingNewPassword){
	  			U.password = theNewPassword;
	  		}

	  		//UPDATE USER DATA
	  		updateUserData();
			
			//Reset Login Welcome Message
			$("#loginWelcome")[0].innerHTML = theName;
			
			//Close the Account screen and show a confirmation message
			closeAccountDropInAndConfirm();
	  		return true;
		}
	}
}

function closeAccountDropInAndConfirm(){
	$("#dropInDiv").hide();
	$("#dropInScreen-"+currentDropinScreen).hide();
	currentDropinScreen = "";
	$("#shadeScreen").hide();
	//Show the topBarButtons
	$("#loginWelcome").animate({right: "85px"}, 200, "easeOutCirc", function(){
		$("#topBarButtons").animate({top: "0px"}, 200, "easeInCirc");
	});
	
	//Show a confirmation message
	showMessageBar(0,"Your Account details have been updated!")
}

//Attach click event to SAVE button
$("#editAccountSaveButton").click(function(){saveAccountDetails()});

/* CHANGE PASSWORD LINK */
$("#changePasswordLink").click(function(){
	$("#changePasswordLink").hide();
	$("#changePasswordDiv").show();
});

/////////////////////////////////////////////////
/* PROFILES SCREEN */
/////////////////////////////////////////////////

function loadProfileScreen(){
	$("#profileNameInput")[0].value = '';
	checkInput($("#profileNameInput")[0],'Profile Name');
	$(".errorDiv").hide();
	
	//Set the display for the active profile:
	$("#profileScreenCurrentProfileName")[0].innerHTML = userProfileNames[Profile];
	
	//START OF WITH AN EMPTY DIV
	$("#profileItemsDiv")[0].innerHTML = "";
	
	//numberOfProfiles is set in the setUp() function
	//Note that we have this for loop set up to list the items in reverse order (so that most recently created appear on top)
	for(i=numberOfProfiles-1;i>=0;i--){
		//console.log(userProfileNames[i]);
		
		var activeProfile = false;
		
		//CHECK IF THIS PROFILE IS THE ACTIVE PROFILE
		if(userProfileNames[i] == userProfileNames[Profile]){activeProfile = true;}
		
		////////CREATE PROFILE ELEMENTS IN THE DOM
		
		//COMMENT
		var comment = document.createComment("PROFILE ITEM " + i);
		
		//PROFILE ITEM
		var profileItem = document.createElement("div");
		profileItem.setAttribute("id","profileItem-" + i);
		//If this is the active profile, make it look special
		if(activeProfile){
			profileItem.setAttribute("class","profileItem active color-9 bgcolor-1 bbcolor-3");
		}else{
			profileItem.setAttribute("class","profileItem surpriseButton-color-0 bbcolor-3");
			profileItem.setAttribute("onclick","switchProfile(" + i + ")");
		}
		profileItem.setAttribute("onmouseleave","hideProfilesSettingDiv(" + i + ")");
		
			//PROFILE ITEM SETTINGS DIV
			var profileItemSettingsDiv = document.createElement("div");
			profileItemSettingsDiv.setAttribute("id","profileItemSettingsDiv-" + i);
			profileItemSettingsDiv.setAttribute("class","profileItemSettingsDiv bgcolor-5");
			profileItem.appendChild(profileItemSettingsDiv);
			
			if(activeProfile){
				//ACTIVE PROFILE ITEM SETTINGS RENAME
				var activeProfileItemSettingsRename = document.createElement("div");
				activeProfileItemSettingsRename.setAttribute("class","activeProfileItemSettingsRename darkButton-color-7");
				activeProfileItemSettingsRename.setAttribute("onclick","showConfirmRenameProfileScreen()");
				activeProfileItemSettingsRename.innerHTML = "RENAME";
				profileItemSettingsDiv.appendChild(activeProfileItemSettingsRename);
			}else{
				//PROFILE ITEM SETTINGS RENAME
				var profileItemSettingsRename = document.createElement("div");
				profileItemSettingsRename.setAttribute("class","profileItemSettingsRename darkButton-color-7");
				profileItemSettingsRename.setAttribute("onclick","showConfirmRenameProfileScreen()");
				profileItemSettingsRename.innerHTML = "RENAME";
				profileItemSettingsDiv.appendChild(profileItemSettingsRename);	
				
				//PROFILE ITEM SETTINGS DELETE
				var profileItemSettingsDelete = document.createElement("div");
				profileItemSettingsDelete.setAttribute("class","profileItemSettingsDelete darkButton-color-7");
				profileItemSettingsDelete.setAttribute("onclick","showConfirmDeleteProfileScreen()");
				profileItemSettingsDelete.innerHTML = "DELETE";
				profileItemSettingsDiv.appendChild(profileItemSettingsDelete);	
			}
				
			//PROFILE ITEM SETTINGS BUTTON
			var profileItemSettingsButton = document.createElement("div");
			profileItemSettingsButton.setAttribute("class","profileItemSettingsButton surpriseButton-color-2 bbcolor-3");
			profileItemSettingsButton.setAttribute("onclick","showProfilesSettingDiv(" + i + ")");
			profileItem.appendChild(profileItemSettingsButton);
			
				//PROFILE SETTINGS ICON
				var profilesSettingsIcon = document.createElement("div");
				profilesSettingsIcon.setAttribute("class","profilesSettingsIcon");
				profileItemSettingsButton.appendChild(profilesSettingsIcon);
				
					//Project Settings Dots
					for(counter=0;counter<3;counter++){
						var projectSettingsDot = document.createElement("div");
						projectSettingsDot.setAttribute("class","projectSettingsDot bgcolor-6");
						profilesSettingsIcon.appendChild(projectSettingsDot);
					}
					
			//PROFILE NAME SPAN
			var profileNameSpan = document.createElement("span");
			profileNameSpan.setAttribute("id","profileName-" + i);
			profileNameSpan.innerHTML = userProfileNames[i];
			profileItem.appendChild(profileNameSpan);
				
				
		//ATTACH TO PARENT CONTAINER
		$("#profileItemsDiv")[0].appendChild(comment);
		//...and attach the profileItem
		$("#profileItemsDiv")[0].appendChild(profileItem);
	}
}

//Show profile settings div
function showProfilesSettingDiv(theDiv){
	//We do not want the parent div to receive the click event, lest we trigger the switchProfile() function!
	event.stopPropagation();
	//alert("showing " + theDiv);
	currentProfileId = theDiv;
	$("#profileItemSettingsDiv-"+theDiv).show();
}

//Hide profile settings div
function hideProfilesSettingDiv(theDiv){
	$("#profileItemSettingsDiv-"+theDiv).hide();
}

//Attach click event to createNewProfileButton button
$("#createNewProfileButton").click(function(){createNewProfile();});

//Attach click event to confirmRenameProfileButton button
$("#confirmRenameProfileButton").click(function(){renameProfile();});

//Attach click event to confirmDeleteProfileButton button
$("#confirmDeleteProfileButton").click(function(){deleteProfile();});

/* PROFILE DELETE BUTTON*/
function showConfirmDeleteProfileScreen(){
	//We do not want the parent div to receive the click event, lest we trigger the switchProfile() function!
	event.stopPropagation();
	$("#confirmationDiv").show();
	$("#confirmationDeleteProfileTitle")[0].innerHTML = $("#profileName-"+currentProfileId)[0].innerHTML;
	$("#confirmationScreen-deleteProfile").show();
}

/* PROFILE RENAME BUTTON*/
function showConfirmRenameProfileScreen(){
	//We do not want the parent div to receive the click event, lest we trigger the switchProfile() function!
	event.stopPropagation();
	$("#confirmationDiv").show();
	$("#confirmationRenameProfileTitle")[0].innerHTML = $("#profileName-"+currentProfileId)[0].innerHTML;
	$("#confirmationScreen-renameProfile").show();
	$("#renameProfileInput").focus();
}

/* CANCEL PROFILE DELETE BUTTON*/
$("#cancelDeleteProfileButton").click(function(){
	$("#confirmationDiv").hide();
	$("#confirmationScreen-deleteProfile").hide();
});

/* CANCEL PROFILE RENAME BUTTON*/
$("#cancelRenameProfileButton").click(function(){
	$("#confirmationDiv").hide();
	$("#confirmationScreen-renameProfile").hide();
	//Reset the screen
	$("#renameProfileInput")[0].value = "";
	$("#errorDiv-renameProfile").hide();
});

function createNewProfile(){
	//HIDE ANY ERROR MESSAGES THAT MAY BE PRESENT
	$(".errorDiv").hide();
	
	//GET THE INPUT VALUES
	var theName = $("#profileNameInput")[0].value;
	
	/////CHECK FOR ERRORS
	
	//Be sure the Name is not blank
	if(($.trim( theName ) == '') || (theName == 'Profile Name')){
		showErrorMessage("errorDiv-profiles","Please give your new Profile a name:");
		return false;
	}
	
	//Be sure the Name is not crazy
	nameRegex = /^[a-zA-Z0-9 ]+$/;
	if(!theName.match(nameRegex)){
		showErrorMessage("errorDiv-profiles","Your Profile name must only contain letters, numbers, and spaces. No special characters.");
		return false;
	}
	
	//Be sure the Name is not a duplicate
	for(i=0;i<userProfileNames.length;i++){
		if(theName == userProfileNames[i]){
			showErrorMessage("errorDiv-profiles","This Profile Name already exists. Give this new one a unique name.");
			return false;
		}
	}
	
	sound("oneUp"); //Sound Effect
	
	//IF THERE HAVE BEEN NO ERRORS, CREATE THE NEW PROFILE
	var theNewProfile = new ProfileObject(theName);
	//console.log(U.profiles);
	U.profiles.push(theNewProfile);
	//console.log(U.profiles);
	
	//Update userData and reflow the projects
	$("#saveStatusMessage")[0].innerHTML = "Saving...";
	$("#saveStatusMessage").show();
	
	updateUserData(1);
	return true;
}

function renameProfile(){
	//Clear any existing error messages
	$("#errorDiv-renameProfile").hide();
	
	//Check for errors
	var newName = $("#renameProfileInput")[0].value;
	
	//Be sure the new name is not blank:
	if($.trim( $('#renameProfileInput').val() ) == ''){
		showErrorMessage('errorDiv-renameProfile','The new name is blank.')
		return;
	}else{
		//Be sure the Name is not crazy
		nameRegex = /^[a-zA-Z0-9 ]+$/;
		if(!newName.match(nameRegex)){
			showErrorMessage("errorDiv-renameProfile","Your Profile name must only contain letters, numbers, and spaces. No special characters.");
			return;
		}else{
			
			//Be sure the newName is not the same as the old name
			if(newName == userProfileNames[currentProfileId]){
				showErrorMessage("errorDiv-renameProfile","That new name is identical to the old name. So... umm..... yeah!");
				return false;
			}
			
			//Be sure the Name is not a duplicate
			for(i=0;i<userProfileNames.length;i++){
				if(newName == userProfileNames[i]){
					showErrorMessage("errorDiv-renameProfile","This Profile Name already exists. Every Profile is special, and unique in its own right. Would you give two of your children the same name?");
					return false;
				}
			}
			
			//If it looks good, carry on
			
			/////RENAME THE PROFILE
			U.profiles[currentProfileId].profileName = newName;
			
			//NOTE IF THE AFFECTED PROFILE IS ALSO THE ACTIVE PROFILE
			if(Profile == currentProfileId){
				console.log("---> NOTE: You are affecting the active profile")
				//If it is, we need to also update the profile cookie
				document.cookie = "profile=" + U.email + "_" + newName;
			}
			
			//Update userData and reflow the projects
			$("#saveStatusMessage")[0].innerHTML = "Saving...";
			$("#saveStatusMessage").show();
			updateUserData(1);
			
			//Take care of some display elements
			$("#confirmationDiv").hide();
			//Remove the projectDiv from the DOM
			$("#profileName-"+currentProfileId)[0].innerHTML = newName;
			//Reset the screen
			$("#confirmationScreen-renameProfile").hide();
			$("#renameProfileInput")[0].value = "";

			return true;
		}
	}
}

function deleteProfile(){
	sound("shoot"); //Sound Effect
	
	/////DELETE THE PROFILE
	console.log("Deleting the profile " + userProfileNames[currentProfileId] + " at index " + currentProfileId)
	console.log(U.profiles);
	U.profiles.splice(currentProfileId,1);
	console.log(U.profiles);
	
	//Update userData and reflow the projects
	$("#saveStatusMessage")[0].innerHTML = "Saving...";
	$("#saveStatusMessage").show();
	updateUserData(1);

	//Remove the projectDiv from the DOM
	$("#profileItem-"+currentProfileId).detach();
	//Take care of some display elements
	$("#confirmationDiv").hide();
	$("#confirmationScreen-deleteProfile").hide();

	return true;
}

function switchProfile(theID){
	currentProfileId = theID;
	switchToProfileName = userProfileNames[theID];
	console.log("Switching to profile " + userProfileNames[theID]);
	
	document.cookie = "profile=" + U.email + "_" + switchToProfileName;
	
	sound("blip"); //Sound Effect
	
	//Update userData and reflow the projects
	$("#saveStatusMessage")[0].innerHTML = "Switching Profiles...";
	$("#saveStatusMessage").show();
	updateUserData(1);
}

/////////////////////////////////////////////////
/* CALCULATIONS SCREEN */
/////////////////////////////////////////////////

//NOTE that the basics of the calculations screen are loaded in the setUp() function
//This function is called from the createProjectBoxes function if there are any overdue or oversize projects

function alterCalculationsScreen(){
	$("#youHaveNoProjects").hide();
	$("#youHaveSomeProjects").hide();
	$("#youHaveUntimelyProjects").show();
}

/////////////////////////////////////////////////
/* EDIT PROJECT SCREEN */
/////////////////////////////////////////////////

var initialProjectTitle = "";

function updateProjectDetails(){
	//Clear any existing error messages
	$(".errorDiv").hide();
	
	//AUTOFORMAT TIME INPUTS
	autoFormatTimeInput($("#editProjectInput-timeEstimate")[0]);
	autoFormatTimeInput($("#editProjectInput-totalTimeSpent")[0]);
	autoFormatTimeInput($("#editProjectInput-timeSpentToday")[0]);
	
	/////////////GET VARIABLES
	var newTitle = $("#editProjectInput-projectTitle")[0].value;
	var newDueDate = $("#editProjectInput-dueDate")[0].value;
	var newTimeEstimate = $("#editProjectInput-timeEstimate")[0].value;
	var newTotalTimeSpent = $("#editProjectInput-totalTimeSpent")[0].value;
	var newTimeSpentToday = $("#editProjectInput-timeSpentToday")[0].value;
	
	var theTimeEstimateMinutes = (newTimeEstimate.split(":")[0] * 60) + parseInt(newTimeEstimate.split(":")[1]);
	var theTotalTimeSpentMinutes = (newTotalTimeSpent.split(":")[0] * 60) + parseInt(newTotalTimeSpent.split(":")[1]);
	var theTimeSpentTodayMinutes = (newTimeSpentToday.split(":")[0] * 60) + parseInt(newTimeSpentToday.split(":")[1]);
	
	/////////////CHECK FOR ERRORS
	
	var error = false;
	
	//Be sure the new title is not blank:
	if($.trim( newTitle ) == ''){
		showErrorMessage('errorDiv-editProjectTitle','Give the project a title.')
		 error = true;
	}else{
		//Be sure the Title is not crazy
		nameRegex = /^[a-zA-Z0-9 ]+$/;
		if(!newTitle.match(nameRegex)){
			showErrorMessage("errorDiv-editProjectTitle","Your Project Title must only contain letters, numbers, and spaces. No special characters.");
			error = true;
		}
	}
	
	//Be sure the dueDate is not blank:
	if($.trim( newDueDate ) == ''){
		showErrorMessage('errorDiv-editProjectDueDate','Give the project a due date.')
		error = true;
	}else{
		//Be sure the dueDate is formatted correctly
		var date_regex = /^(\d{1}|\d{2})\/(\d{1}|\d{2})\/(\d{2}|\d{4})$/;
		if(!newDueDate.match(date_regex)){
			showErrorMessage("errorDiv-editProjectDueDate","Please format your Due Date like this: <b>mm/dd/yyyy</b>. Do not use any spaces, and you should be good to go.");
			error = true;
		}else{
			//Be sure it is not a date in the past
			var theProposedDateMilliseconds = new Date(newDueDate).getTime();
			var todaysDateMilliseconds = new Date(today.toDateString()).getTime();
			if(theProposedDateMilliseconds < todaysDateMilliseconds){
				showErrorMessage("errorDiv-editProjectDueDate","That Due Date is already in the past.");
				error = true;
			}
		}
	}
	
	//Be sure the newTimeEstimate is not blank:
	if($.trim( newTimeEstimate ) == ''){
		showErrorMessage('errorDiv-editProjectTimeEstimate','Estimate the time the project will take:')
		error = true;
	}else{
		//Be sure the newTimeEstimate is formatted correctly
		var time_regex = /^\d+:[0-5][0-9]$/;
		if(!newTimeEstimate.match(time_regex)){
			showErrorMessage("errorDiv-editProjectTimeEstimate","Please format your Time Estimate like this: <b>HH:MM</b>. Make it look like a digital clock display. For example, 3 hours and 15 minutes would look like this: <b>3:15</b>.");
			error = true;
		}
	}
	
	//Be sure the newTotalTimeSpent is not blank:
	if($.trim( newTotalTimeSpent ) == ''){
		showErrorMessage('errorDiv-editProjectTotalTimeSpent','Indicate the amount of time you have already spent on the project:')
		error = true;
	}else{
		//Be sure the newTotalTimeSpent is formatted correctly
		var time_regex = /^\d+:[0-5][0-9]$/;
		if(!newTotalTimeSpent.match(time_regex)){
			showErrorMessage("errorDiv-editProjectTotalTimeSpent","Please format your Total Time Spent like this: <b>HH:MM</b>. Make it look like a digital clock display. For example, 3 hours and 15 minutes would look like this: <b>3:15</b>.");
			error = true;
		}else{
			//Be sure the newTotalTimeSpent does not exceed newTimeEstimate
			if(theTotalTimeSpentMinutes > theTimeEstimateMinutes){
				showErrorMessage("errorDiv-editProjectTotalTimeSpent","The Total Time Spent cannot be greater than the Time Estimate. Maybe make your Time Estimate larger?");
				error = true;
			}
		}
	}
	
	//Be sure the newTimeSpentToday is not blank:
	if($.trim( newTimeSpentToday ) == ''){
		showErrorMessage('errorDiv-editProjectTimeSpentToday','Indicate the amount of time you have spent on the project <i>today</i>:')
		error = true;
	}else{
		//Be sure the newTimeSpentToday is formatted correctly
		var time_regex = /^\d+:[0-5][0-9]$/;
		if(!newTimeSpentToday.match(time_regex)){
			showErrorMessage("errorDiv-editProjectTimeSpentToday","Please format your total time spent like this: <b>HH:MM</b>. Make it look like a digital clock display. For example, 3 hours and 15 minutes would look like this: <b>3:15</b>.");
			error = true;
		}else{
			//Be sure the newTimeSpentToday does not exceed 24 hours
			if(theTimeSpentTodayMinutes > 1440){
				showErrorMessage("errorDiv-editProjectTimeSpentToday","Reality check: a day only has 24 hours. (The Time Spent Today cannot be greater than 24 hours.)");
				error = true;
			}else{
				//Be sure the newTimeSpentToday does not exceed newTotalTimeSpent
				if(theTimeSpentTodayMinutes > theTotalTimeSpentMinutes){
					showErrorMessage("errorDiv-editProjectTimeSpentToday","The Time Spent Today cannot be greater than the Total Time Spent. The Total Time Spent should include any time you have spent today on this project.");
					error = true;
				}
			}
		}
	}
	
	if(!error){
		//GO AHEAD AND UPDATE THE PROJECT
		
		//Start by locating the index of the project we are changing
		var l = U.profiles[Profile].projects.length;
		//currentProjectId refers to the index of the current project in the orderedProjects array, which are ordered by due date...which may be different from the order of projects in the actual user object. So we locate by matching with the projectId
		var targetProjectId = orderedProjects[currentProjectId].projectId;
		var targetProjectIndex = undefined; //This is what we are looking for in the following loop:
		
		for(i=0;i<l;i++){
			var theTestingId = U.profiles[Profile].projects[i].projectId;
			if(theTestingId == targetProjectId){
				targetProjectIndex = i;
				break;
			}
		}
		
		//Having found the index of the project to update, perform the changes
		U.profiles[Profile].projects[targetProjectIndex].projectTitle = newTitle;
		U.profiles[Profile].projects[targetProjectIndex].dueDate = newDueDate;
		
		//The time inputs need to be formatted from 0:00 to 0.0 hours
		newTimeEstimate = theTimeEstimateMinutes / 60;
		newTotalTimeSpent = theTotalTimeSpentMinutes / 60;
		newTimeSpentToday = theTimeSpentTodayMinutes / 60;
		
		//Now that they are formatted we can add those values too
		U.profiles[Profile].projects[targetProjectIndex].timeEstimate = newTimeEstimate;
		U.profiles[Profile].projects[targetProjectIndex].timeSpent = newTotalTimeSpent;
		U.profiles[Profile].projects[targetProjectIndex].timeSpentToday = newTimeSpentToday;
		
		//Update userData and reflow the projects
		$("#saveStatusMessage")[0].innerHTML = "Saving...";
		$("#saveStatusMessage").show();
		updateUserData(1);
		
		//Handle some display details
		$("#dropInDiv").hide();
		$("#dropInScreen-"+currentDropinScreen).hide();
		currentDropinScreen = "";
		$("#shadeScreen").hide();
		//Show the topBarButtons
		$("#loginWelcome").animate({right: "85px"}, 200, "easeOutCirc", function(){
			$("#topBarButtons").animate({top: "0px"}, 200, "easeInCirc");
		});
		
	}
	
}

function showEditProjectDueDateSuggestionDiv(){
	$("#editProjectTimeEstimateLabel").animate({"margin-top": "90px"}, 400, "easeOutBack");
	$("#editProjectDueDateTip").delay(800).fadeIn();
}

function hideEditProjectDueDateSuggestionDiv(){
	$("#editProjectDueDateTip").fadeOut('fast');
	$("#editProjectTimeEstimateLabel").animate({"margin-top": "10px"}, 400, "easeInBack");
}

//Attach function to click event
$("#editProjectSaveButton").click(function(){updateProjectDetails();});

//Get Due Date suggestion when you type in the time estimate input
$("#editProjectInput-timeEstimate").keyup(function(){tryToSuggestProjectDueDate();});

//...or when you put focus on the dueDate field
$("#editProjectInput-dueDate").focus(function(){tryToSuggestProjectDueDate();});

/////////////////////////////////////////////////
/* NEW PROJECT SCREEN */
/////////////////////////////////////////////////

function loadProjectScreen(){
	$(".errorDiv").hide();
	$("#newProjectInput-projectTitle")[0].value = "";
	checkInput($("#newProjectInput-projectTitle")[0],'Project Title');
	$("#newProjectInput-dueDate")[0].value = "";
	checkInput($("#newProjectInput-dueDate")[0],'Due Date');
	$("#newProjectInput-timeEstimate")[0].value = "";
	checkInput($("#newProjectInput-timeEstimate")[0],'Time Estimate');
}

function createNewProject(){
	//Clear any existing error messages
	$(".errorDiv").hide();
	
	//AUTOFORMAT TIME INPUT
	autoFormatTimeInput($("#newProjectInput-timeEstimate")[0]);
	
	/////////////GET VARIABLES
	var newTitle = $("#newProjectInput-projectTitle")[0].value;
	var newDueDate = $("#newProjectInput-dueDate")[0].value;
	var newTimeEstimate = $("#newProjectInput-timeEstimate")[0].value;
	
	var theTimeEstimateMinutes = (newTimeEstimate.split(":")[0] * 60) + parseInt(newTimeEstimate.split(":")[1]);
	
	/////////////CHECK FOR ERRORS
	
	var error = false;
	
	//Be sure the new title is not blank:
	if(($.trim( newTitle ) == '') || (newTitle == 'Project Title')){
		showErrorMessage('errorDiv-newProjectTitle','Give the project a title.')
		error = true;
	}else{
		//Be sure the Title is not crazy
		nameRegex = /^[a-zA-Z0-9 ]+$/;
		if(!newTitle.match(nameRegex)){
			showErrorMessage("errorDiv-newProjectTitle","Your Project Title must only contain letters, numbers, and spaces. No special characters.");
			error = true;
		}
	}
	
	//Be sure the dueDate is not blank:
	if(($.trim( newDueDate ) == '') || (newDueDate == 'Due Date')){
		showErrorMessage('errorDiv-newProjectDueDate','Give the project a due date.')
		error = true;
	}else{
		//Be sure the dueDate is formatted correctly
		var date_regex = /^(\d{1}|\d{2})\/(\d{1}|\d{2})\/(\d{2}|\d{4})$/;
		if(!newDueDate.match(date_regex)){
			showErrorMessage("errorDiv-newProjectDueDate","Please format your Due Date like this: <b>mm/dd/yyyy</b>. Do not use any spaces, and you should be good to go.");
			error = true;
		}else{
			//Be sure it is not a date in the past
			var theProposedDateMilliseconds = new Date(newDueDate).getTime();
			var todaysDateMilliseconds = new Date(today.toDateString()).getTime();
			if(theProposedDateMilliseconds < todaysDateMilliseconds){
				showErrorMessage("errorDiv-newProjectDueDate","That Due Date is already in the past.");
				error = true;
			}
		}
	}
	
	//Be sure the newTimeEstimate is not blank:
	if(($.trim( newTimeEstimate ) == '') || (newTimeEstimate == 'Time Estimate')){
		showErrorMessage('errorDiv-newProjectTimeEstimate','Estimate the time the project will take:')
		error = true;
	}else{
		//Be sure the newTimeEstimate is formatted correctly
		var time_regex = /^\d+:[0-5][0-9]$/;
		if(!newTimeEstimate.match(time_regex)){
			showErrorMessage("errorDiv-newProjectTimeEstimate","Please format your Time Estimate like this: <b>HH:MM</b>. Make it look like a digital clock display. For example, 3 hours and 15 minutes would look like this: <b>3:15</b>.");
			error = true;
		}
	}
	
	if(!error){
		//GO AHEAD AND CREATE THE PROJECT
		
		sound("oneUp"); //Sound Effect
		
		//The time inputs need to be formatted from 0:00 to 0.0 hours
		newTimeEstimate = theTimeEstimateMinutes / 60;
		
		//Create a unique ID for the new project
		var newProjectId = 0;

		var l = U.profiles[Profile].projects.length;
		for(i=0;i<l;i++){
			//Loop through all the projectId's and if a match is found, just increase newProjectId by 1 and try again
			if(U.profiles[Profile].projects[i].projectId == newProjectId){
				newProjectId++;
			}
		}

		var theNewProject = new ProjectObject(newProjectId,newTitle,newDueDate,newTimeEstimate);
		U.profiles[Profile].projects.push(theNewProject);
		U.totalProjectsCreated += 1;

		//Update userData and reflow the projects
		$("#saveStatusMessage")[0].innerHTML = "Saving...";
		$("#saveStatusMessage").show();
		updateUserData(1);

		//Handle some display details
		$("#dropInDiv").hide();
		$("#dropInScreen-"+currentDropinScreen).hide();
		currentDropinScreen = "";
		$("#shadeScreen").hide();
		//Show the topBarButtons
		$("#loginWelcome").animate({right: "85px"}, 200, "easeOutCirc", function(){
			$("#topBarButtons").animate({top: "0px"}, 200, "easeInCirc");
		});
	}
}

function autoFormatTimeInput(theElement){
	//This function makes the input a bit forgiving so you can, for example, type "3" instead of "3:00" and it will autoformat it.
	
	/////////////Get the input value
	var newTimeEstimate = theElement.value;
	
	//Be sure the newTimeEstimate is not blank:
	if(($.trim( newTimeEstimate ) != '') && (newTimeEstimate != 'Time Estimate')){
		
		//Be sure the newTimeEstimate is an acceptable number
		var number_regex = /^\d+$/;
		if(newTimeEstimate.match(number_regex)){
			//Format it
			theElement.value = newTimeEstimate + ":00";
			
			//If tryToSuggestProjectDueDate needs to be called, the function call will contain a second argument
			if(autoFormatTimeInput.arguments[1]){
				tryToSuggestProjectDueDate();
			}
		}
	}
}

$("#newProjectInput-timeEstimate").keyup(function(){tryToSuggestProjectDueDate();});

function tryToSuggestProjectDueDate(){
	//FOR NEW PROJECT SCREEN
	if(currentDropinScreen == "newProject"){
		//Get the current value of the New Project Time Estimate input
		var newTimeEstimate = $("#newProjectInput-timeEstimate")[0].value;
		var theTimeEstimateMinutes = (newTimeEstimate.split(":")[0] * 60) + parseInt(newTimeEstimate.split(":")[1]);
		
		//We only try our suggestion once we have a non-blank, properly formatted time estimate
		if($.trim( newTimeEstimate ) == ''){
			console.log("Blank");
			//Remove the suggestion div (in case it has already appeared)
			hideNewProjectDueDateSuggestionDiv();
			return false;
		}else{
			var time_regex = /^\d+:[0-5][0-9]$/;
			if(!newTimeEstimate.match(time_regex)){
				console.log("Wrong Format");
				//Remove the suggestion div (in case it has already appeared)
				hideNewProjectDueDateSuggestionDiv();
				return false;
			}
		}
	}else{
		//FOR EDIT PROJECT SCREEN
		
		//Get the current value of the Project's Time Estimate input
		var newTimeEstimate = $("#editProjectInput-timeEstimate")[0].value;
		var theTimeEstimateMinutes = (newTimeEstimate.split(":")[0] * 60) + parseInt(newTimeEstimate.split(":")[1]);
		
		var timeAlreadySpent = $("#editProjectInput-totalTimeSpent")[0].value;
		var timeAlreadySpentMinutes = (timeAlreadySpent.split(":")[0] * 60) + parseInt(timeAlreadySpent.split(":")[1]);
		
		//Subtract the time already worked from the time estimate
		theTimeEstimateMinutes = theTimeEstimateMinutes - timeAlreadySpentMinutes;
		
		//We only try our suggestion once we have a non-blank, properly formatted time estimate
		if($.trim( newTimeEstimate ) == ''){
			console.log("Blank");
			//Remove the suggestion div (in case it has already appeared)
			hideEditProjectDueDateSuggestionDiv();
			return false;
		}else{
			var time_regex = /^\d+:[0-5][0-9]$/;
			if(!newTimeEstimate.match(time_regex)){
				console.log("Wrong Format");
				//Remove the suggestion div (in case it has already appeared)
				hideEditProjectDueDateSuggestionDiv();
				return false;
			}
		}
	}
	
	//The time inputs need to be formatted from 0:00 to 0.0 hours
	newTimeEstimate = theTimeEstimateMinutes / 60;
	
	//If no errors, get a suggested due date and insert the suggestion into the DOM
	getSuggestedDueDate(newTimeEstimate);
}

function getSuggestedDueDate(t){
	var projectTimeLeft = t;
	var theSuggestedDayMilliseconds = today.getTime();
	var counter = 0;
	
	if(t > 100000){
		//Really large time estimates can bog down process with calculations.
		console.log("Time estimate exceeds 100,000 hours. Don't bother trying to calculate a finish date.");
		return false;
	}
	
	//Start going through the days and fill each one to its max capacity
	while(projectTimeLeft > 0){
		
		if(dateSpan[counter]){
			
			//If there has been a Day object created for the day in question, use it
			var remainingCapacity = dateSpan[counter].capacity - dateSpan[counter].fill;
			console.log("A Day object exists for this day, and its remaining capacity is " + remainingCapacity);
			console.log("A Day object exists for this day, and its fillItems looks like this:");
			console.log(dateSpan[counter].fillItems);
			
			//////FOR ALREADY EXISTING PROJECTS
			if(currentDropinScreen == "editProject"){
			/*When this function is called from the Edit Project screen, we need to replicate a day flow 
			that excludes the project being edited, so its own fill does not interfere with 
			an accurate suggested due date.*/
				var numberOfFillItems = dateSpan[counter].fillItems.length;
				for(i=0;i<numberOfFillItems;i++){
					if(dateSpan[counter].fillItems[i][0] == initialProjectTitle){
						//If this Day has a fillItem matching project being edited, add that fill back into the remainingCapacity
						console.log("initialProjectTitle is set to " + initialProjectTitle + " and some time is being added back to the day's capacity: " + dateSpan[counter].fillItems[i][1]);
						remainingCapacity += dateSpan[counter].fillItems[i][1];
					}
				}
			}
			
			projectTimeLeft -= remainingCapacity;
			//console.log("projectTimeLeft is now " + projectTimeLeft);
			
			if(projectTimeLeft > 0){
				theSuggestedDayMilliseconds += 86400000; //If there is still projectTimeLeft, advance the suggested day by one day
			}else{
				console.log("projectTimeLeft is less than or equal to 0. Today is the day.");
			}
			
		}else{
			
			//If there is no Day object, it means we have gone past the furthest date in our dateSpan
			var dayOfTheWeek = new Date(theSuggestedDayMilliseconds + 86400000).getDay();
			//console.log("We are carrying on into the great unknown and the daynumber we are checking now is " + dayOfTheWeek);

			//Find out the day's capacity based on the work schedule
			switch(dayOfTheWeek) {
			    case 0: var thisDayCapacity = U.profiles[Profile].workSchedule.su; break;
				case 1: var thisDayCapacity = U.profiles[Profile].workSchedule.mo; break;
				case 2: var thisDayCapacity = U.profiles[Profile].workSchedule.tu; break;
				case 3: var thisDayCapacity = U.profiles[Profile].workSchedule.we; break;
				case 4: var thisDayCapacity = U.profiles[Profile].workSchedule.th; break;
				case 5: var thisDayCapacity = U.profiles[Profile].workSchedule.fr; break;
				case 6: var thisDayCapacity = U.profiles[Profile].workSchedule.sa; break;
			    default:console.log("TIMEPOSITIVE ERROR: Unable to determine thisDayCapacity.")
			}
			
			if(thisDayCapacity > 0){
				//If the day's capacity is normally greater than 0, make sure the day is not a vacation day
				var vacationDays = U.profiles[Profile].vacationDays;
				var numberOfVacationDays = vacationDays.length;
		
				for(i=0;i<numberOfVacationDays;i++){
					var untestedDate = new Date(theSuggestedDayMilliseconds + 86400000).toDateString();
					var vacationDayToTest = new Date(vacationDays[i]).toDateString();
					if(untestedDate == vacationDayToTest){
						//If it is a vacation day, set the capacity to 0
						thisDayCapacity = 0;
					}
				}
			}
			
			//Having gotten the day's capacity, apply it to the projectTimeLeft
			
			projectTimeLeft -= thisDayCapacity;
			console.log("projectTimeLeft is now " + projectTimeLeft);
			if(projectTimeLeft > 0){
				theSuggestedDayMilliseconds += 86400000; //If there is still projctTimeLeft, advance the suggested day by one day
			}else{
				console.log("projectTimeLeft is less than or equal to 0. Today is the day.");
			}
			
		}
		//Before the loop repeats, advance the counter
		counter++;
	}
	
	var theSuggestion = new Date(theSuggestedDayMilliseconds).toDateString();
	var theTest = new Date(theSuggestedDayMilliseconds);
	
	console.log(theTest - today);
	
	if((theTest - today) == 86400000){
		theSuggestion = "Tomorrow, " + new Date(theSuggestedDayMilliseconds).toLocaleDateString();
	}
	
	if((theTest - today) == 0){
		theSuggestion = "Today, " + new Date(theSuggestedDayMilliseconds).toLocaleDateString();
	}

	if(currentDropinScreen == "newProject"){
		$("#newProjectSuggestedDueDate")[0].innerHTML = theSuggestion;
		showNewProjectDueDateSuggestionDiv();
	}else{
		$("#editProjectSuggestedDueDate")[0].innerHTML = theSuggestion;
		showEditProjectDueDateSuggestionDiv();
	}
}

//Insert the earliest possible due date into the form field when you click on the suggested date
$("#newProjectSuggestedDueDate").mousedown(function(){
	var suggestedDueDateText = new Date($("#newProjectSuggestedDueDate")[0].innerHTML).toLocaleDateString();
	$("#newProjectInput-dueDate")[0].value = suggestedDueDateText;
	$("#newProjectInput-dueDate")[0].setAttribute("class", "color-9");
});

//Same thing on the edit project screen
$("#editProjectSuggestedDueDate").mousedown(function(){
	var suggestedDueDateText = new Date($("#editProjectSuggestedDueDate")[0].innerHTML).toLocaleDateString();
	$("#editProjectInput-dueDate")[0].value = suggestedDueDateText;
});

function showNewProjectDueDateSuggestionDiv(){
	$("#createProjectButton").animate({"margin-top": "90px"}, 400, "easeOutBack");
	$("#newProjectDueDateTip").delay(800).fadeIn();
}

function hideNewProjectDueDateSuggestionDiv(){
	$("#newProjectDueDateTip").fadeOut('fast');
	$("#createProjectButton").animate({"margin-top": "0px"}, 400, "easeInBack");
}

//Attach function to click event
$("#createProjectButton").click(function(){createNewProject();});

//When the number of projects limit has been met on a Basic account
$("#notRightNowButton").click(function(){
	$("#confirmationDiv").hide();
	$("#confirmationScreen-projectLimit").hide();
});

$("#upgradeToCreateMoreProjectsButton").click(function(){
	upgradeToPremium();
	$("#confirmationDiv").hide();
	$("#confirmationScreen-projectLimit").hide();
	//Show the New Project Screen
	loadProjectScreen();
	$("#settingsDiv").hide();
	settingsDivActive = false;
	$("#dropInDiv").show();
	$("#shadeScreen").show();
	$("#dropInScreen-newProject").show();
	currentDropinScreen = "newProject";
	//Hide the topBarButtons
	$("#topBarButtons").animate({top: "-40px"}, 200, "easeOutCirc", function(){
		$("#loginWelcome").animate({right: "10px"}, 200, "easeInCirc");
	});
});


/////////////////////////////////////////////////
/* DELETE PROJECT */
/////////////////////////////////////////////////

function deleteProject(){
	sound("win"); //Sound Effect
	
	console.log("Deleting the profile " + userProfileNames[currentProfileId] + " at index " + currentProfileId)
	
	//Start by locating the index of the project we are deleting
	var l = U.profiles[Profile].projects.length;
	//currentProjectId refers to the index of the current project in the orderedProjects array, which are ordered by due date...which may be different from the order of projects in the actual user object. So we locate by matching with the projectId
	var targetProjectId = orderedProjects[currentProjectId].projectId;
	var targetProjectIndex = undefined; //This is what we are looking for in the following loop:
	
	for(i=0;i<l;i++){
		var theTestingId = U.profiles[Profile].projects[i].projectId;
		if(theTestingId == targetProjectId){
			targetProjectIndex = i;
			break;
		}
	}
	
	//Having found the index of the project to delete, do the deed
	/////DELETE THE PROFILE
	U.profiles[Profile].projects.splice(targetProjectIndex,1);

	//Update userData and reflow the projects
	$("#saveStatusMessage")[0].innerHTML = "Deleting Project...";
	$("#saveStatusMessage").show();
	updateUserData(1);

	//Take care of some display elements
	$("#confirmationDiv").hide();
	$("#confirmationScreen-deleteProject").hide();
	//Remove the projectDiv from the DOM
	$("#project-"+currentProjectId).detach();

	return true;
}

//Attach function to button click
$("#confirmDeleteProjectButton").click(function(){deleteProject();});

/* CANCEL DELETE PROJECT BUTTON*/
$("#cancelDeleteProjectButton").click(function(){
	$("#confirmationDiv").hide();
	$("#confirmationScreen-deleteProject").hide();
});


/////////////////////////////////////////////////
/* MESSAGE BAR */
/////////////////////////////////////////////////

function showMessageBar(priority,message){
	$("#message")[0].innerHTML = message;
	switch(priority){
		case 0: 
			$("#messageBarCloseButton").show();
			setTimeout(function(){$("#messageBar").fadeOut();},3000);
			break;
		case 1: 
			$("#messageBarCloseButton").show();
			break;
		default:
			console.log("TIMEPOSITIVE ERROR: The priority argument is not set for the Message Bar.")
	}
	$("#messageBar")[0].style.top = "-100px";
	$("#messageBar").show();
	$("#messageBar").animate({top:0}, 1000, "easeOutBounce");
}

//CLOSE MESSAGE BAR
$("#messageBarCloseButton").click(function(){
	$("#messageBar").fadeOut('fast');
});


/////////////////////////////////////////////////
/* OVERVIEW BOX EVENTS */
/////////////////////////////////////////////////

$(".overviewBoxCloseButton").click(function(){
	$("#overviewBox").hide();
	$("#navButton-overview")[0].style.display = ""; //Make the element visible again by removing the "style='display:none'" that was set by hide()
});

$(".overviewBoxCalendar").click(function(){
	if(numberOfWeeksInSchedule > 1){
		$(".overviewBoxCalendar").hide();
		$(".overviewBoxCalendarButtonDiv").show();
	}else{
		$("#overviewBoxCalendarNoMoreWeeksMessage").show();
		$("#overviewBoxCalendarNoMoreWeeksMessage").delay(1000).fadeOut();
	}
});

$(".overviewBoxCalendarButton").click(function(){
	$(".overviewBoxCalendarButtonDiv").hide();
	$(".overviewBoxCalendar").show();
});

$(".overviewBoxCalendarButtonDiv").mouseleave(function(){
	$(".overviewBoxCalendarButtonDiv").hide();
	$(".overviewBoxCalendar").show();
});

$("#overviewBoxCalendarButton-right").click(function(){
	//currentOverviewWeek starts at 0 which represents the current week. 1 represents next week, etc.
	if(currentOverviewWeek == 0){
		$("#overviewBoxCalendarButton-right")[0].style.width = "106px";
		$("#overviewBoxCalendarButton-left").show();
	}
	currentOverviewWeek += 1;
	setOverviewBoxWeekBar(currentOverviewWeek);
	setCalendarDayFills(currentOverviewWeek);
	$("#overviewBoxWorkWeekLabel")[0].innerHTML = defineOverviewWeekDates(currentOverviewWeek);
	
	if((currentOverviewWeek+1) == numberOfWeeksInSchedule){
		$("#overviewBoxCalendarButton-left")[0].style.width = "240px";
		$("#overviewBoxCalendarButton-right").hide();
	}
});

$("#overviewBoxCalendarButton-left").click(function(){
	if(currentOverviewWeek == (numberOfWeeksInSchedule-1)){
		$("#overviewBoxCalendarButton-left")[0].style.width = "106px";
		$("#overviewBoxCalendarButton-right").show();
	}
	currentOverviewWeek -= 1;
	setOverviewBoxWeekBar(currentOverviewWeek);
	setCalendarDayFills(currentOverviewWeek);
	$("#overviewBoxWorkWeekLabel")[0].innerHTML = defineOverviewWeekDates(currentOverviewWeek);
	if(currentOverviewWeek == 0){
		$("#overviewBoxCalendarButton-right")[0].style.width = "240px";
		$("#overviewBoxCalendarButton-left").hide();
	}
});

function defineOverviewWeekDates(weeksIntoFuture){
	var nextWeekMonday = "";
	var nextWeekSunday = "";
	var formatedStartDate = "";
	var formatedEndDate = "";
	var theDates = "";
	
	if(weeksIntoFuture == 0){
		theDates = "<b>This Week</b>";
		return theDates;
	}
	if(weeksIntoFuture > 1){
		var d = new Date(today);
		//Thanks pepkin88 for the following line: http://stackoverflow.com/questions/3638906/get-date-of-specific-day-of-the-week-in-javascript
		nextWeekMonday = d.setDate(d.getDate() + (1 - 1 - d.getDay() + 7) % 7 + 1);
		nextWeekMonday = nextWeekMonday + (604800000 * (weeksIntoFuture-1)); //Number of milliseconds in a week, times weeksIntoFuture
		nextWeekSunday = nextWeekMonday + 518400000; //Number of milliseconds in 6 days, to get from Monday to Sunday
		nextWeekMonday = new Date(nextWeekMonday).toLocaleDateString();
		nextWeekSunday = new Date(nextWeekSunday).toLocaleDateString();
	
		//Get rid of the year at the end -- we just want mm/dd
		nextWeekMonday = nextWeekMonday.split('/');
		nextWeekSunday = nextWeekSunday.split('/');
		formatedStartDate = nextWeekMonday[0] + "/" + nextWeekMonday[1];
		formatedEndDate = nextWeekSunday[0] + "/" + nextWeekSunday[1];
	
		theDates = "<b>" + formatedStartDate + "</b> to <b>" + formatedEndDate + "</b>";
	}else{
		theDates = "<b>Next Week</b>";
	}
	return theDates;
}

/////////////////////////////////////////////////
/*TOP BAR AND SETTINGS DIV EVENTS*/
/////////////////////////////////////////////////

/* NEW PROJECT PLUS BUTTON and ADD PROJECT BOX */
$("#addProjectIcon,#addProjectBox").click(function(){
	sound("bleepEcho");//Sound Effect
	//Limit Basic Accounts to 10 projects
	if((U.memberStatus == "basic") && (Projects.length > 9)){
		$("#confirmationDiv").show();
		$("#confirmationScreen-projectLimit").show();
	}else{
		loadProjectScreen();
		$("#settingsDiv").hide();
		settingsDivActive = false;
		$("#dropInDiv").show();
		$("#shadeScreen").show();
		$("#dropInScreen-newProject").show();
		currentDropinScreen = "newProject";
		//Hide the topBarButtons
		$("#topBarButtons").animate({top: "-40px"}, 200, "easeOutCirc", function(){
			$("#loginWelcome").animate({right: "10px"}, 200, "easeInCirc");
		});
	}
});

/* SETTINGS */
$("#settingsIcon").click(function(){
	if(!settingsDivActive){
		$("#settingsDiv").show();
		$("#shadeScreen").show();
		settingsDivActive = true;
	}else{
		$("#settingsDiv").hide();
		$("#shadeScreen").hide();
		settingsDivActive = false;
	}
	
	$("#dropInDiv").hide();
	$("#dropInScreen-"+currentDropinScreen).hide();
	currentDropinScreen = "";
});

/* SHADE SCREEN */
$("#shadeScreen").click(function(){
	if(settingsDivActive){
		$("#settingsDiv").hide();
		$("#shadeScreen").hide();
		settingsDivActive = false;
	}
});

/* New Project */
$("#navButton-newProject").click(function(){
	loadProjectScreen();
	$("#settingsDiv").hide();
	settingsDivActive = false;
	$("#dropInDiv").show();
	$("#dropInScreen-newProject").show();
	currentDropinScreen = "newProject";
	//Hide the topBarButtons
	$("#topBarButtons").animate({top: "-40px"}, 200, "easeOutCirc", function(){
		$("#loginWelcome").animate({right: "10px"}, 200, "easeInCirc");
	});
});

/* Overview */
$("#navButton-overview").click(function(){
	$("#settingsDiv").hide();
	settingsDivActive = false;
	$("#shadeScreen").hide();
	$("#navButton-overview").hide();
	$("#overviewBox")[0].style.display = "inline-block";
});

/* Work Schedule */
$("#navButton-workSchedule").click(function(){
	loadWorkScheduleScreen();
	$("#settingsDiv").hide();
	settingsDivActive = false;
	$("#dropInDiv").show();
	$("#dropInScreen-workSchedule").show();
	currentDropinScreen = "workSchedule";
	//Hide the topBarButtons
	$("#topBarButtons").animate({top: "-40px"}, 200, "easeOutCirc", function(){
		$("#loginWelcome").animate({right: "10px"}, 200, "easeInCirc");
	});
});

/* Vacation Days */
$("#navButton-vacationDays").click(function(){
	loadVacationDaysScreen();
	$("#settingsDiv").hide();
	settingsDivActive = false;
	$("#dropInDiv").show();
	$("#dropInScreen-vacationDays").show();
	currentDropinScreen = "vacationDays";
	//Hide the topBarButtons
	$("#topBarButtons").animate({top: "-40px"}, 200, "easeOutCirc", function(){
		$("#loginWelcome").animate({right: "10px"}, 200, "easeInCirc");
	});
});

/* Account */
$("#navButton-account").click(function(){
	loadAccountScreen();
	$("#settingsDiv").hide();
	settingsDivActive = false;
	$("#dropInDiv").show();
	$("#dropInScreen-account").show();
	currentDropinScreen = "account";
	//Hide the topBarButtons
	$("#topBarButtons").animate({top: "-40px"}, 200, "easeOutCirc", function(){
		$("#loginWelcome").animate({right: "10px"}, 200, "easeInCirc");
	});
});

/* Profiles */
$("#navButton-profiles").click(function(){
	loadProfileScreen();
	$("#settingsDiv").hide();
	settingsDivActive = false;
	$("#dropInDiv").show();
	$("#dropInScreen-profiles").show();
	currentDropinScreen = "profiles";
	//Hide the topBarButtons
	$("#topBarButtons").animate({top: "-40px"}, 200, "easeOutCirc", function(){
		$("#loginWelcome").animate({right: "10px"}, 200, "easeInCirc");
	});
});

/* Calculations */
$("#navButton-calculations").click(function(){
	$("#settingsDiv").hide();
	settingsDivActive = false;
	$("#dropInDiv").show();
	$("#dropInScreen-calculations").show();
	currentDropinScreen = "calculations";
	//Hide the topBarButtons
	$("#topBarButtons").animate({top: "-40px"}, 200, "easeOutCirc", function(){
		$("#loginWelcome").animate({right: "10px"}, 200, "easeInCirc");
	});
});

/* Sign Out */
$("#navButton-signOut").click(function(){
	$("#settingsDiv").hide();
	settingsDivActive = false;
	$("#shadeScreen").hide();
	//Show that the user is logged out
 	U.activityStatus = "Logged Out";
	updateUserData();
	//Clear the cookies and refresh the page
	clearCookies();
	window.location = "index.html";
});

/* Speaker Icon (Sound Control) */
$("#speakerIcon").click(function(){
	setTimeout(function(){
		$("#settingsDiv").hide();
		settingsDivActive = false;
		$("#shadeScreen").hide();
	},500)
	if(soundIsOn){
		$("#speakerIcon")[0].src = "images/speakerIcon-off.png";
		soundIsOn = false;
		document.cookie = "soundPreference=off";
		//Turn sounds off
	}else{
		$("#speakerIcon")[0].src = "images/speakerIcon-on.png";
		soundIsOn = true;
		document.cookie = "soundPreference=on";
		//Turn sounds on
	}
});

/////////////////////////////////////////////////
/*DROP IN SCREEN EVENTS*/
/////////////////////////////////////////////////

/* DROP IN SCREEN CLOSE BUTTON */
$(".dropInDivCloseButton,.dropInDivCloseButtonMobile").click(function(){
	$("#dropInDiv").hide();
	$("#dropInScreen-"+currentDropinScreen).hide();
	currentDropinScreen = "";
	$("#shadeScreen").hide();
	
	//Show the topBarButtons
	$("#loginWelcome").animate({right: "85px"}, 200, "easeOutCirc", function(){
		$("#topBarButtons").animate({top: "0px"}, 200, "easeInCirc");
	});
});

/////////////////////////////////////////////////
/*TIMER SCREEN*/
/////////////////////////////////////////////////

var startTime = 0;
var nowTime = 0;
var previouslyElapsedTime = 0;
var freshlyElapsedTime = 0;
var timerIsRunning = 0;
var timerScreenIsActive = 0;
var T;

function advanceSeconds(){
	nowTime = new Date().getTime();
	freshlyElapsedTime = previouslyElapsedTime + (nowTime - startTime);
	
	var elapsedSeconds = Math.round(freshlyElapsedTime/1000);
	var elapsedMinutes = Math.floor(elapsedSeconds/60);
	var elapsedHours = Math.floor(elapsedMinutes/60);

	//Once seconds and minutes have passed 59, get the remainders
	if(elapsedSeconds > 59){elapsedSeconds = elapsedSeconds % 60;}
	if(elapsedMinutes > 59){elapsedMinutes = elapsedMinutes % 60;}
	
	//CONFIGURE THE DONE TODAY DISPLAY
	var timeSpentTodayDisplay = $("#timerDoneToday")[0].innerHTML;
	var hoursSpentToday = timeSpentTodayDisplay.split(":")[0];
	var minutesSpentToday = timeSpentTodayDisplay.split(":")[1];
	
	if((elapsedMinutes > 0) && (elapsedSeconds == 0)){
		minutesSpentToday = parseInt(minutesSpentToday) + 1;
		if(minutesSpentToday < 10){minutesSpentToday = "0" + minutesSpentToday;}
	}
	
	if((elapsedHours > 0) && (elapsedMinutes == 0) && (elapsedSeconds == 0)){
		hoursSpentToday = parseInt(hoursSpentToday) + 1;
	}
	
	//Set the Done Today display
	$("#timerDoneToday")[0].innerHTML = hoursSpentToday + ":" + minutesSpentToday;
	
	//Set some variables to configure the width of the progress fill bar
	var theGoal = orderedProjects[currentProjectId].suggestedAmountToday;
	theGoal = theGoal * 60 * 60;
	var thePercentageIncrement = 100/theGoal;
	var theWidth = $("#timerDailyProgressFill")[0].style.width;
	theWidth = parseFloat(theWidth);
	theWidth += thePercentageIncrement;
	
	//Update the width of the timerDailyProgressFill
	$("#timerDailyProgressFill")[0].style.width = theWidth + "%";
	
	//Add a zero for display purposes when the number is less than 10. Note that this changes the variable from a number to a string.
	if(elapsedSeconds < 10){elapsedSeconds = "0" + elapsedSeconds;}
	if(elapsedMinutes < 10){elapsedMinutes = "0" + elapsedMinutes;}
	
	//console.log(elapsedSeconds + " seconds have elapsed.");
	//console.log(elapsedMinutes + " minutes have elapsed.");
	//console.log(elapsedHours + " hours have elapsed.");
	
	$("#timerSeconds")[0].innerHTML = elapsedSeconds;
	$("#timerMinutes")[0].innerHTML = elapsedMinutes;
	$("#timerHours")[0].innerHTML = elapsedHours;
	
	T = setTimeout(function(){ advanceSeconds() },1000);
}

function runTimer(){
	if (!timerIsRunning) {
		 sound("buttonPress"); //Sound Effect
		 timerIsRunning = 1;
		 timerScreenIsActive = 1;
		console.log("<-----TIMER IS RUNNING---->");
		startTime = new Date().getTime();
		advanceSeconds();
	}
}

function stopTimer(){
	sound("pauseStart"); //Sound Effect
	clearTimeout(T);
	timerIsRunning = 0;
	previouslyElapsedTime = freshlyElapsedTime;
}

function logTime(){
	sound("coin"); //Sound Effect
	
	timerScreenIsActive = 0; // Once time is logged, it is safe for midnightRefresh() to be called
	
	//freshlyElapsedTime = 3600000; // about 1 hour. This line is only for testing.
	//We are only interested in logging the time if at least 30 seconds have elapsed
	if(freshlyElapsedTime >= 30000){
		
		
		var valueToAdd = freshlyElapsedTime;
		valueToAdd = valueToAdd / 1000 / 60; //Turn milliseconds into minutes
		valueToAdd = Math.round(valueToAdd);
		console.log("About to add this many minutes: " + valueToAdd);
		
		valueToAdd = valueToAdd / 60; //Turn minutes into hours
		console.log("And thus this many hours: " + valueToAdd);
	
		//Locate the index of the project we are updating
		var l = U.profiles[Profile].projects.length;
		//currentProjectId refers to the index of the current project in the orderedProjects array, which are ordered by due date...which may be different from the order of projects in the actual user object. So we locate by matching with the projectId
		var targetProjectId = orderedProjects[currentProjectId].projectId;
		var targetProjectIndex = undefined; //This is what we are looking for in the following loop:
	
		for(i=0;i<l;i++){
			var theTestingId = U.profiles[Profile].projects[i].projectId;
			if(theTestingId == targetProjectId){
				targetProjectIndex = i;
				break;
			}
		}
	
		//Having found the index of the project to update, perform the changes
		var thePreviousValue = U.profiles[Profile].projects[targetProjectIndex].timeSpentToday;
		var thePreviousValue_allTime = U.profiles[Profile].projects[targetProjectIndex].timeSpent;

		console.log("...onto this project: " + U.profiles[Profile].projects[targetProjectIndex].projectTitle);
	
		U.profiles[Profile].projects[targetProjectIndex].timeSpentToday = thePreviousValue + valueToAdd;
		U.profiles[Profile].projects[targetProjectIndex].timeSpent = thePreviousValue_allTime + valueToAdd;
		
		//If the total time spent is greater than the time estimate, update the estimate to be equal to the time spent
		if(U.profiles[Profile].projects[targetProjectIndex].timeSpent > U.profiles[Profile].projects[targetProjectIndex].timeEstimate){
			U.profiles[Profile].projects[targetProjectIndex].timeEstimate = U.profiles[Profile].projects[targetProjectIndex].timeSpent;
			showMessageBar(1,'You have reached your time estimate on the project "'+U.profiles[Profile].projects[targetProjectIndex].projectTitle+'".');
		}
		
		//Update userData and reflow the projects
		$("#saveStatusMessage")[0].innerHTML = "Logging Time...";
		$("#saveStatusMessage").show();
		updateUserData(1);
		
	}else{
		console.log("Less than 30 seconds of time has elapsed.");
	}
	
	if(midnightRefreshWhenTimerStops){
		midnightRefresh();
		midnightRefreshWhenTimerStops = false;
	}
}

/* TIMER STOP BUTTON */
$("#timerStopButton").click(function(){
	stopTimer();
	//alert("timer stop");
	$("#timerStopButton").hide();
	$("#timerContinueButton").show();
	$("#timerDoneButton").show();
});

/* TIMER DONE BUTTON */
$("#timerDoneButton").click(function(){
	logTime();
	previouslyElapsedTime = 0;
	$("#timerStopButton").show();
	$("#timerContinueButton").hide();
	$("#timerDoneButton").hide();
	$("#timerScreen").hide();
});

/* TIMER CONTINUE BUTTON */
$("#timerContinueButton").click(function(){
	runTimer();
	$("#timerStopButton").show();
	$("#timerContinueButton").hide();
	$("#timerDoneButton").hide();
});

/////////////////////////////////////////////////
/*SOUNDS*/
/////////////////////////////////////////////////

var soundIsOn = false;

function sound(src){
	if(soundIsOn){
		document.getElementById(src).play();
	}
}

function pause(src){
	document.getElementById(src).pause();
}

//Set Some Volume Levels
$("#blaster")[0].volume = 0.5;
$("#coin")[0].volume = 0.5;
$("#levelUp")[0].volume = 0.2;
$("#bleepEcho")[0].volume = 0.2;
$("#blip")[0].volume = 0.2;
$("#buttonPress")[0].volume = 0.2;
$("#descend")[0].volume = 0.1;
$("#playerDamage")[0].volume = 0.1;
$("#gameOver")[0].volume = 0.1;
$("#jump")[0].volume = 0.1;
$("#oneUp")[0].volume = 0.1;
$("#shoot")[0].volume = 0.1;
$("#introMusic")[0].volume = 0.07;
$("#win")[0].volume = 0.05;
