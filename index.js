var $chatlogs = $('.chatlogs');

$("textarea").keypress(function(event){
    
    if(event.which === 13){
        console.log("enter");

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

