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

$("#switchInputType").click(function(event) {

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

	// If the message contains a <ar then it is a message with buttons
	// for its response
	if(removedQuotes.includes("<ar"))
	{
		createButton(removedQuotes);	
	}

	// if the message contains only <br then it is a multi line message
	else if (removedQuotes.includes("<br")) 
	{
		splitMessages(removedQuotes);
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
function splitMessages(message)
{

	var matches;
	var listOfMessages = [];
	
	var regex = /\<br(?:\s+?(\d+))?\>(.*?)(?=(?:\<br(?:\s+\d+)?\>)|$)/g;

	while(matches = regex.exec(message))
	{
		if(matches[1] == undefined)
		{
			matches[1] = DEFAULT_TIME_DELAY;
		}

		listOfMessages.push({
				text: matches[2],
				delay: matches[1]
			});

		console.log(matches[1]);
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



function createButton(message)
{

	
	var matches;
	var listOfMessages = [];
	
	var $input;

	var regex = /\<br(?:\s+?(\d+))?\>(.*?)(?=(?:\<ar(?:\s+\d+)?\>)|$)/g;

	// Create object which stores the message response text and time delay
	matches = regex.exec(message);

	// Create an array of the responses which will be buttons
	var buttonList = message.split(/<ar>/);

	// Remove the first element
	buttonList = buttonList.splice(1);

	var listOfInputs = [];

	for (var index = 0; index < buttonList.length; index++)
	{
		var response = buttonList[index];

		$input = $('<input type="button" class="buttonResponse"/>');
		$input.val(response);
		listOfInputs.push($input);
		

	}

// Show the typing indicator
		showLoading();
	// After 3 seconds call the createNewMessage function
		setTimeout(function() {
			
			createNewMessage(matches[2]);
			
			$('#rec').toggle();
			$('textarea').toggle();

			for (var index = 0; index < listOfInputs.length; index++) {
				listOfInputs[index].appendTo($('.chat-form'));
			}

		}, matches[1]);



	console.log(matches);
	console.log(buttonList);



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