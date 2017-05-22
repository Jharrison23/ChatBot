// Information needed to access the api.ai bot, only thing needed to be changed 
var accessToken = "5489544adf6d490c8438cb7377f4bd60";
var baseUrl = "https://api.api.ai/v1/";


var $chatlogs = $('.chatlogs');

$("#loadingGif").hide();

$("textarea").keypress(function(event) {
    
    if(event.which === 13) {
        event.preventDefault();
        newSentMessage(this.value);
   	    send(this.value);
        this.value = "";
    }
});

function newSentMessage(messageText) {

	$chatlogs.append(
        $('<div/>', {'class': 'chat self'}).append(
            $('<p/>', {'class': 'chat-message', 'text': messageText})));

	
	$('.sendButton').css('visibility', 'hidden');
	$('textarea').css('visibility', 'hidden');

	//showLoading();

	var $sentMessage = $(".chatlogs .chat").last();
	
	checkSentVisibility($sentMessage);
}


function newRecievedMessage(messageText) {

	var removedQuotes = messageText.replace(/[""]/g,"");

	if(removedQuotes.includes("\\n"))
	{
		var messages = removedQuotes.split("\\n");


		var i = 0;

		var length = messages.length;
		showLoading();
		(function theLoop (messages, i, length) 
		{
			setTimeout(function () 
			{
				createNewMessage(messages[i]);
				if (i++ < length) 
				{     
					showLoading();             // If i > 0, keep going
					theLoop(messages, i);  // Call the loop again
					
				}
			
			}, 3000);
		
		})(messages, i, length);
	}

	else
	{	
		showLoading();
		setTimeout(function() {
			createNewMessage(removedQuotes);

		}, 3000);
	}
   
}



function delayMessage(messages, i, max) {
	
	setTimeout(createNewMessage, 3000, messages[i]);

	i++;

	if(i < max)
	{
		delayMessage(messages, i, max);
	}
	
}




function createNewMessage(message) {

	// showLoading();


	hideLoading();

			
	$('.sendButton').css('visibility', 'visible');
	$('textarea').css('visibility', 'visible');

	$chatlogs.append(
		$('<div/>', {'class': 'chat friend'}).append(
			$('<div/>', {'class': 'user-photo'}).append($('<img src="ana.JPG" />')), 
			$('<p/>', {'class': 'chat-message', 'text': message})));

	var $newMessage = $(".chatlogs .chat").last();

	checkReceivedVisibility($newMessage);

	// setTimeout(function(){

	// 	hideLoading();

			
	// 	$('.sendButton').css('visibility', 'visible');
	// 	$('textarea').css('visibility', 'visible');

	// 	$chatlogs.append(
	// 		$('<div/>', {'class': 'chat friend'}).append(
	// 			$('<div/>', {'class': 'user-photo'}).append($('<img src="ana.JPG" />')), 
	// 			$('<p/>', {'class': 'chat-message', 'text': message})));

	// 	var $newMessage = $(".chatlogs .chat").last();

	// 	checkReceivedVisibility($newMessage);
	// }, 3000);

	
	
		
}


function send(text) {
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
 }

function hideLoading()
{
	$("#loadingGif").hide();

}



function checkSentVisibility(message)
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


function checkReceivedVisibility(message)
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

