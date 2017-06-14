// Information needed to access the api.ai bot, only thing needed to be changed 
var accessToken = "b56ec2c85b2744ad81aeb6518d30a6ae";
var baseUrl = "https://api.api.ai/v1/";

// Variable for the chatlogs div
var $chatlogs = $('.chatlogs');

var DEFAULT_TIME_DELAY = 3000;


// Method which executes once the enter key on the keyboard is pressed
// Primary function sends the text which the user typed
$("textarea").keypress(function(event) {
    
	// If the enter key is pressed
    if(event.which === 13) {

		// Ignore the default function of the enter key(Dont go to a new line)
        event.preventDefault();

		// Call the method for sending a message, pass in the text from the user
   	    send(this.value);

		// Clear the text area
        this.value = "";
    }
});

$("#rec").click(function(event) {
				switchRecognition();
			});


// Method called whenver there is a new recieved message
// This message comes from the AJAX request sent to API.AI
function newRecievedMessage(messageText) {

	// Variable storing the message with the "" removed
	var removedQuotes = messageText.replace(/[""]/g,"");

	// If the message contains a \n split it into an array of messages
	if(removedQuotes.includes("<br "))
	{
		//messageType(removedQuotes);
		// tempSplit(removedQuotes);
		hopefullyFinalSplit(removedQuotes);
	}

	// If there is no \n, there arent multiple messages to be sent
	else
	{	
		// Show the typing indicator
		showLoading();

		// After 3 seconds call the createNewMessage function
		setTimeout(function() {
			createNewMessage(removedQuotes);
		}, DEFAULT_TIME_DELAY);
	}
}

// Method to create a new div showing the text from API.AI
function createNewMessage(message) {

	// Hide the typing indicator
	hideLoading();

	 
	// take the message and say it back to the user.
	speechResponse(message);

	// Show the send button and the text area
	$('#rec').css('visibility', 'visible');
	$('textarea').css('visibility', 'visible');

	// Append a new div to the chatlogs body, with an image and the text from API.AI
	$chatlogs.append(
		$('<div/>', {'class': 'chat friend'}).append(
			$('<div/>', {'class': 'user-photo'}).append($('<img src="ana.JPG" />')), 
			$('<p/>', {'class': 'chat-message', 'text': message})));

	// Find the last message in the chatlogs
	var $newMessage = $(".chatlogs .chat").last();

	// Call the method to see if the message is visible
	checkVisibility($newMessage);
}


// Method which takes the users text and sends an AJAX post request to API.AI
// Creates a new Div with the users text, and recieves a response message from API.AI 
function send(text) {

	// Create a div with the text that the user typed in
	$chatlogs.append(
        $('<div/>', {'class': 'chat self'}).append(
            $('<p/>', {'class': 'chat-message', 'text': text})));

	// Find the last message in the chatlogs
	var $sentMessage = $(".chatlogs .chat").last();
	
	// Check to see if that message is visible
	checkVisibility($sentMessage);

	// AJAX post request, sends the users text to API.AI and 
	// calls the method newReceivedMessage with the response from API.AI
	$.ajax({
		type: "POST",
		url: baseUrl + "query?v=20150910",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		headers: {
			"Authorization": "Bearer " + accessToken
		},
		data: JSON.stringify({ query: text, lang: "en", sessionId: "somerandomthing" }),
		success: function(data) {
            console.log(data);
		
		// Pass the response into the method 
		newRecievedMessage(JSON.stringify(data.result.fulfillment.speech, undefined, 2));

		},
		error: function() {
			newRecievedMessage("Internal Server Error");
		}
	});
}


// Funtion which shows the typing indicator
// As well as hides the textarea and send button
function showLoading()
{
	$chatlogs.append($('#loadingGif'));
	$("#loadingGif").show();

	$('#rec').css('visibility', 'hidden');
	$('textarea').css('visibility', 'hidden');
 }


// Function which hides the typing indicator
function hideLoading()
{
	$("#loadingGif").hide();

}


// Method which checks to see if a message is in visible
function checkVisibility(message)
{
	// Scroll the view down a certain amount
	$chatlogs.stop().animate({scrollTop: $chatlogs[0].scrollHeight});
}

// Old message parsing method, 
// Not deleting yet since I dont know if the other one is working fully
function messageType(message)
{
	var matches;
	var timeDelay = new Array(); 

	var regex = /\<br = (\d*)\>/g;
	
	while(matches = regex.exec(message))
	{
		if(matches[1] != "")
		{
			timeDelay.push(matches[1] * 1000); 
		}

		else
		{
			timeDelay.push(DEFAULT_TIME_DELAY);
		}
	
	}

	console.log(timeDelay);

	var nonGlobalRegex = /\<br = \d*\>/;

	var messageArray = message.split(nonGlobalRegex);

	if(messageArray[0] == "")
	{
		messageArray = messageArray.splice(1);
	}

	
	console.log(messageArray);

	// loop index 
	var i = 0;

	// Variable for the number of messages
	var numMessages = messageArray.length;

	// Show the typing indicator
	showLoading();

	// Function which calls the method createNewMessage after waiting 3 seconds
	(function theLoop (messageArray, i, numMessages) 
	{
		// After 3 seconds call method createNewMessage
		setTimeout(function () 
		{
			createNewMessage(messageArray[i]);
			
			// If there are still more messages
			if (i++ < numMessages - 1) 
			{   
				// Show the typing indicator
				showLoading();             

				// Call the Method Again
				theLoop(messageArray, i, numMessages);
			}
			
		}, timeDelay[i]);
	
	// Pass the parameters back into the method
	})(messageArray, i, numMessages);
}


///// old split method 
function tempSplit(message)
{

	var matches;
	var listOfMessages = [];
	
	var regex = /\<br\s+?(\d*)\>/g;

	var nonGlobalRegex = /\<br\s+?\d*\>/;

	var messageArray = message.split(nonGlobalRegex);

	if(messageArray[0] == "")
	{
		messageArray = messageArray.splice(1);
	}

	var j = 0;	
	
	while(matches = regex.exec(message))
	{
		if(matches[1] != "")
		{
			listOfMessages.push({
				text: messageArray[j],
				delay: matches[1]
			});		
		}

		else
		{
			listOfMessages.push({
				text: messageArray[j],
				delay: DEFAULT_TIME_DELAY
			});
		}
		j++;
	}

	// loop index 
	var i = 0;

	// Variable for the number of messages
	var numMessages = listOfMessages.length;

	// Show the typing indicator
	showLoading();

	// Function which calls the method createNewMessage after waiting 3 seconds
	(function theLoop (listOfMessages, i, numMessages) 
	{
		// After 3 seconds call method createNewMessage
		setTimeout(function () 
		{
			createNewMessage(listOfMessages[i].text);
			
			// If there are still more messages
			if (i++ < numMessages - 1) 
			{   
				// Show the typing indicator
				showLoading();             

				// Call the method again
				theLoop(listOfMessages, i, numMessages);
			}

		}, listOfMessages[i].delay);
	
	// Pass the parameters back into the method
	})(listOfMessages, i, numMessages);

}



function hopefullyFinalSplit(message)
{

	var matches;
	var listOfMessages = [];
	
	var regex = /\<br(?:\s+?(\d+))?\>(.*?)(?=(?:\<br(?:\s+\d+)?\>)|$)/g;

	while(matches = regex.exec(message))
	{

		listOfMessages.push({
				text: matches[2],
				delay: matches[1]
			});
	}

	// loop index 
	var i = 0;

	// Variable for the number of messages
	var numMessages = listOfMessages.length;

	// Show the typing indicator
	showLoading();

	// Function which calls the method createNewMessage after waiting 3 seconds
	(function theLoop (listOfMessages, i, numMessages) 
	{
		// After 3 seconds call method createNewMessage
		setTimeout(function () 
		{
			createNewMessage(listOfMessages[i].text);
			
			// If there are still more messages
			if (i++ < numMessages - 1) 
			{   
				// Show the typing indicator
				showLoading();             

				// Call the method again
				theLoop(listOfMessages, i, numMessages);
			}

		}, listOfMessages[i].delay);
	
	// Pass the parameters back into the method
	})(listOfMessages, i, numMessages);

}



//Voice stuff
var recognition;

function startRecognition() {

    console.log("Start")
	recognition = new webkitSpeechRecognition();

	recognition.onstart = function(event) {

        console.log("Update");
		updateRec();
	};
	
	recognition.onresult = function(event) {
	
		var text = "";
	
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			text += event.results[i][0].transcript;
		}
	
		setInput(text);
		stopRecognition();
	
	};
	
	recognition.onend = function() {
		stopRecognition();
	};
	
	recognition.lang = "en-US";
	recognition.start();

}



function stopRecognition() {
	if (recognition) {
        console.log("Stop Recog");
		recognition.stop();
		recognition = null;
	}
	updateRec();
}



function switchRecognition() {
	if (recognition) {
        console.log(" Stop if");
		stopRecognition();
	} else {
		startRecognition();
	}
}


function setInput(text) {
	$(".input").val(text);
	
    send(text);
	
    $(".input").val("");
    
}


function updateRec() {
	$("#rec").text(recognition ? "Stop" : "Speak");
}

function speechResponse(message)
{

	// var msg = new SpeechSynthesisUtterance();
 	// msg.voiceURI = "native";
  	// msg.text = message;
  	// msg.lang = "en-US";
  	// window.speechSynthesis.speak(msg);


	var msg = new SpeechSynthesisUtterance();

	// These lines list all of the voices which can be used in speechSynthesis
	//var voices = speechSynthesis.getVoices();
	//console.log(voices);
	
	
	msg.default = false;
 	msg.voiceURI = "Fiona";
	msg.name = "Fiona";
	msg.localService = true;
  	msg.text = message;
  	msg.lang = "en";
	msg.rate = 1;
	msg.volume = 1;
  	window.speechSynthesis.speak(msg);

}