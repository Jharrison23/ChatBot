// Information needed to access the api.ai bot, only thing needed to be changed 
var accessToken = "5489544adf6d490c8438cb7377f4bd60";
var baseUrl = "https://api.api.ai/v1/";

// Variable for the chatlogs div
var $chatlogs = $('.chatlogs');


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


// Method called whenver there is a new recieved message
// This message comes from the AJAX request sent to API.AI
function newRecievedMessage(messageText) {

	// Variable storing the message with the "" removed
	var removedQuotes = messageText.replace(/[""]/g,"");

	// If the message contains a \n split it into an array of messages
	if(removedQuotes.includes("\\n"))
	{
		// Split the message up into multiple messages based off the amount of \n's
		var messageArray = removedQuotes.split("\\n");


		var i = 0;

		var length = messageArray.length;
		showLoading();
		(function theLoop (messageArray, i, length) 
		{
			setTimeout(function () 
			{
				createNewMessage(messageArray[i]);
				if (i++ < length - 1) 
				{     
					showLoading();             
					theLoop(messageArray, i, length);
					
				}
			
			}, 3000);
		
		})(messageArray, i, length);
	}

	else
	{	
		showLoading();
		setTimeout(function() {
			createNewMessage(removedQuotes);

		}, 3000);
	}
   
}


function createNewMessage(message) {

	hideLoading();

	$('.sendButton').css('visibility', 'visible');
	$('textarea').css('visibility', 'visible');

	$chatlogs.append(
		$('<div/>', {'class': 'chat friend'}).append(
			$('<div/>', {'class': 'user-photo'}).append($('<img src="ana.JPG" />')), 
			$('<p/>', {'class': 'chat-message', 'text': message})));

	var $newMessage = $(".chatlogs .chat").last();

	checkVisibility($newMessage);

}


function send(text) {


	$chatlogs.append(
        $('<div/>', {'class': 'chat self'}).append(
            $('<p/>', {'class': 'chat-message', 'text': text})));

	var $sentMessage = $(".chatlogs .chat").last();
	
	checkVisibility($sentMessage);

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
			
		newRecievedMessage(JSON.stringify(data.result.fulfillment.speech, undefined, 2));

		},
		error: function() {
			newRecievedMessage("Internal Server Error");
		}
	});
}


function showLoading()
{
	$chatlogs.append($('#loadingGif'));

	$("#loadingGif").show();

	$('.sendButton').css('visibility', 'hidden');
	$('textarea').css('visibility', 'hidden');
 }

function hideLoading()
{
	$("#loadingGif").hide();

}


function checkVisibility(message)
{
	var $topOfMessage = message.position().top;
	//console.log(message.text());	
	//console.log($topOfMessage);

	var offset = message.offset().top - 600;
	//console.log("offset: " + offset);

	var out = $chatlogs.outerHeight();
	//console.log("out" + out);

	if($topOfMessage > out)
	{
		//console.log("Not visible");
		var scrollAmount = $topOfMessage - out;

		//console.log("scroll amount " + scrollAmount);
		$chatlogs.stop().animate({scrollTop: scrollAmount});
		
	}
}

