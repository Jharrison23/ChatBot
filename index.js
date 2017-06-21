// Information needed to access the api.ai bot, only thing needed to be changed 

// Datanautix help bot
//var accessToken = "b56ec2c85b2744ad81aeb6518d30a6ae";

// Emoji Bot
var accessToken ="5ae7adf062fa4b5692087da997d2e3a5";

var baseUrl = "https://api.api.ai/v1/";

// Variable for the chatlogs div
var $chatlogs = $('.chatlogs');

var DEFAULT_TIME_DELAY = 3000;

// If the user selects one of the dynamic button responses
$('.chat-form').on("click", '.buttonResponse', function() {

	// Send the text on the button as a user message
	send(this.innerText);

	// Show the record button and text input area
	$('#rec').toggle();
	$('textarea').toggle();

	// Hide the button responses and the switch input button
	$('.buttonResponse').toggle();
	$('#switchInputType').hide();

	// Remove the button responses from the div
	$('.buttonResponse').remove();
});



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


// If the user presses the button for voice input
$("#rec").click(function(event) {

	// Call the method to switch recognition to voice input
	switchRecognition();
});

// Hide the switch input type button initially
$("#switchInputType").toggle();

// If the switch input type button is pressed
$("#switchInputType").click(function(event) {

	// Toggle which input type is shown
	$('#rec').toggle();
	$('textarea').toggle();
	$('.buttonResponse').toggle();

});





// Method called whenver there is a new recieved message
// This message comes from the AJAX request sent to API.AI
// This method tells which type of message is to be sent
// Splits between the button messages, multi messages and single message
function newRecievedMessage(messageText) {

	// Variable storing the message with the "" removed
	var removedQuotes = messageText.replace(/[""]/g,"");

	// If the message contains a <ar then it is a message
	// whose responses are buttons
	if(removedQuotes.includes("<ar"))
	{
		buttonResponse(removedQuotes);	
	}

	// if the message contains only <br then it is a multi line message
	else if (removedQuotes.includes("<br")) 
	{
		multiMessage(removedQuotes);
	} 

	// There arent multiple messages to be sent, or message with buttons
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

	 //Commented out speech response
	// take the message and say it back to the user.
	///////sponse(message);

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





// Method which takes messages and splits them based off a the delimeter <br 2500>
// The integer in the delimeter is optional and represents the time delay in milliseconds
// if the delimeter is not there then the time delay is set to the default
function multiMessage(message)
{

	// Stores the matches in the message, which match the regex
	var matches;

	// List of message objects, each message will have a text and time delay
	var listOfMessages = [];
	
	// Regex used to find time delay and text of each message
	var regex = /\<br(?:\s+?(\d+))?\>(.*?)(?=(?:\<br(?:\s+\d+)?\>)|$)/g;

	// While matches are still being found in the message
	while(matches = regex.exec(message))
	{
		// if the time delay is undefined(empty) use the default time delay
		if(matches[1] == undefined)
		{
			matches[1] = DEFAULT_TIME_DELAY;
		}

		// Create a message object and add it to the list of messages
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

	// Function which calls the method createNewMessage after waiting on the message delay
	(function theLoop (listOfMessages, i, numMessages) 
	{

		// Method which executes after the timedelay
		setTimeout(function () 
		{

			// Create a new message from the server
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


// Method called whenever an <ar tag is found
// The responses for this type of message will be buttons
// This method parses out the time delays, message text and button responses
// Then creates a new message with the time delay and creates buttons for the responses
function buttonResponse(message)
{

	// Stores the matches in the message, which match the regex
	var matches;

	// Used to store the new HTML div which will be the button	
	var $input;

	// Regex used to find time delay, text of the message and responses to be buttons
	var regex = /\<br(?:\s+?(\d+))?\>(.*?)(?=(?:\<ar(?:\s+\d+)?\>)|$)/g;

	// Seach the message and capture the groups which match the regex
	matches = regex.exec(message);

	// Create an array of the responses which will be buttons
	var buttonList = message.split(/<ar>/);

	// Remove the first element, The first split is the actual message
	buttonList = buttonList.splice(1);

	// Array which will store all of the newly created buttons
	var listOfInputs = [];

	// Loop through each response and create a button
	for (var index = 0; index < buttonList.length; index++)
	{
		// Store the current button response
		var response = buttonList[index];
		
		// Create a new div element with the text for the current button response
		$input = $('<div/>', {'class': 'buttonResponse' }).append(
            $('<p/>', {'class': 'chat-message', 'text': response}));

		// add the new button to the list of buttons
		listOfInputs.push($input);
	}


	// Show the typing indicator
	showLoading();
	
	// After the time delay call the createNewMessage function
	setTimeout(function() {
			
		// Create and display a new message with the text from the server
		createNewMessage(matches[2]);
		
		// Hide the send button and the text area
		$('#rec').toggle();
		$('textarea').toggle();

		// Show the switch input button
		$("#switchInputType").show();

		// For each of the button responses
		for (var index = 0; index < listOfInputs.length; index++) {
						
			// Append to the chat-form div which is at the bottom of the chatbox
			listOfInputs[index].appendTo($('.chat-form'));
		}	
		
	}, matches[1]);

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
	var voices = speechSynthesis.getVoices();
	console.log(voices);
	
	
	msg.default = false;
 	msg.voiceURI = "Fiona";
	msg.name = "Fiona";
	msg.localService = true;
  	msg.text = message;
  	msg.lang = "en";
	msg.rate = .9;
	msg.volume = 1;
  	window.speechSynthesis.speak(msg);

}