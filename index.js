var accessToken = "5489544adf6d490c8438cb7377f4bd60";
var baseUrl = "https://api.api.ai/v1/";


var $chatlogs = $('.chatlogs');

$("textarea").keypress(function(event) {
    
    if(event.which === 13) {
        event.preventDefault();
        console.log("enter");
	    send(this.value);
        newSentMessage(this.value);
        this.value = "";

    }

    else{
        console.log("you pressed " + this.value);
    }
});

function newSentMessage(messageText){
    $chatlogs.append(
        $('<div/>', {'class': 'chat self'}).append(
            $('<div/>', {'class': 'user-photo'}), 
            $('<p/>', {'class': 'chat-message', 'text': messageText})));


}

function newRecievedMessage(messageText){
    $chatlogs.append(
        $('<div/>', {'class': 'chat friend'}).append(
            $('<div/>', {'class': 'user-photo'}), 
            $('<p/>', {'class': 'chat-message', 'text': messageText})));


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
			setResponse(JSON.stringify(data, undefined, 2));
		},
		error: function() {
			setResponse("Internal Server Error");
		}
	});
	setResponse("Loading...");
}

function setResponse(val) {
			newRecievedMessage(val);
		}

