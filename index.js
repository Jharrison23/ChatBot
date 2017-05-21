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

//$(".sendButton").on("click", newSentMessage($("textarea").value));

function newSentMessage(messageText){
    // $chatlogs.append(
    //     $('<div/>', {'class': 'chat self'}).append(
    //         $('<div/>', {'class': 'user-photo'}), 
    //         $('<p/>', {'class': 'chat-message', 'text': messageText})));

	$chatlogs.append(
        $('<div/>', {'class': 'chat self'}).append(
            $('<p/>', {'class': 'chat-message', 'text': messageText})));

	
	$('.sendButton').css('visibility', 'hidden');
	$('textarea').css('visibility', 'hidden');
	// setResponse("...");

	showLoading();


	var $sentMessage = $(".chatlogs .chat").last();
	
	checkSentVisibility($sentMessage);

	// $('.sendButton').html('Wait');
	// $('.sendButton').css("background", "gray");
	// $('.sendButton').css("box-shadow", "gray");


	// setTimeout(function(){
	// 	console.log("in here");
	// 	// $('.sendButton').html('Send');
	// 	$('.sendButton').css('visibility', 'visible');
	// 	$('textarea').css('visibility', 'visible');


	// 	// $('.sendButton').css("background", "orange");
	// 	// $('.sendButton').css("box-shadow", "orange");
	// 	// $('.sendButton').prop('disabled', false);
	// }, 3000);		
}


function newRecievedMessage(messageText){
    $chatlogs.append(
        $('<div/>', {'class': 'chat friend'}).append(
            $('<div/>', {'class': 'user-photo'}).append($('<img src="ana.JPG" />')), 
            $('<p/>', {'class': 'chat-message', 'text': messageText})));

	// setTimeout(function(){
	// 	$('.input').prop('disabled', false);
	// }, 5000);
	// $('.input').prop('disabled', false);

	var $newMessage = $(".chatlogs .chat").last();
	
	checkReceivedVisibility($newMessage);
	
	hideLoading();

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
			
		setTimeout(function(){
		
			$('.sendButton').css('visibility', 'visible');
			$('textarea').css('visibility', 'visible');

			setResponse(JSON.stringify(data.result.fulfillment.speech, undefined, 2));

		// $('.sendButton').css("background", "orange");
		// $('.sendButton').css("box-shadow", "orange");
		// $('.sendButton').prop('disabled', false);
		}, 3000);



		},
		error: function() {
			setResponse("Internal Server Error");
		}
	});
	// setResponse("...");
}


function setResponse(json) {
    newRecievedMessage(json);

	

}

function showLoading()
{
	$chatlogs.append($('#loadingGif'));
// 	$chatlogs.append(
//         $('<div/>', {'class': 'chat friend'}).append(
//             $('<div/>', {'class': 'user-photo'}).append($('<img src="ana.JPG" />')), 
//             $('<div/>', {'class': 'user-photo'}).append($('<img src="https://m.popkey.co/9cacd5/Q8Gb6.gif" />'))));

	$("#loadingGif").show();
 }

function hideLoading()
{
	$("#loadingGif").hide();

	//  $('<div/>', {'class': 'chat friend'}).append(
    //         $('<div/>', {'class': 'user-photo'}).append($('<img src="ana.JPG" />')), 
    //         $('<div/>', {'class': 'user-photo'}).append($('<img src="https://m.popkey.co/9cacd5/Q8Gb6.gif" />')));

}



function checkSentVisibility(message)
{

	console.log("sent");
	var $topOfMessage = message.position().top;
	console.log(message.text());
	
	console.log($topOfMessage);
	
	var offset = message.offset().top - 600;

	console.log("offset: " + offset);

	var out = $chatlogs.outerHeight();

	console.log("out" + out);
	if($topOfMessage > out)
	{
		console.log("Not visible");

		var scrollAmount = $topOfMessage - out;

		console.log("scroll amount " + scrollAmount);

		$chatlogs.stop().animate({scrollTop: scrollAmount});
			
	}
}


function checkReceivedVisibility(message)
{
	console.log("got");
	var $topOfMessage = message.position().top;
	console.log(message.text());
	
	console.log($topOfMessage);
	
	var offset = message.offset().top - 600;

	console.log("offset: " + offset);

	var out = $chatlogs.outerHeight();

	console.log("out" + out);
	if($topOfMessage > out)
	{
		console.log("Not visible");
		var scrollAmount = $topOfMessage - out;

		console.log("scroll amount " + scrollAmount);
		$chatlogs.stop().animate({scrollTop: scrollAmount});
			
	}
}

