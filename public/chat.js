function initChat() {

 
    var messages = [];    // chat
    var userList = [];	// Users
    var socket = io.connect(window.location.hostname, {'sync disconnect on unload' : true});
    var field = document.getElementById("field");	// chat text area
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");
    var userListBox = document.getElementById("userListBox");	// User List area



 // Process messages sent by users
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
		html += '<b>' + '<font color="' + messages[i].color + '">' +  (messages[i].username ? messages[i].username : 'Server')  + '</font>' + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;			// box log
	    content.scrollTop = content.scrollHeight;	// message box scroll bar
        } else {
            console.log("There is a problem:", data);
        }
    });
 
   /* input.keydown(function(e){
	if (e.keyCode === 13) {
		socket.emit('send', { message: text, username: name.value });
	}
     }*/


//  Message submit button
    sendButton.onclick = sendMessage = function() {
	if(name.value == ''){		// no name
		alert("Please enter name!");
	} else {
       	 	var text = field.value;

		// send entered text and name under the 'message' event
        	socket.emit('send', { message: text, username: name.value });
		
		// Empty message Field 
		field.value = "";
	}
    };
// Show list of current users
	socket.on('showUsers', function(data){

		var newUserList = '';
		for(var i in data.ID){
            if(data.ID[i]==null){
                continue;
            }
            newUserList += '<b>' + '<font color="' + data.ID[i].color + '">' + data.ID[i].name + '</font>' +'</b>' +'<br />';
		}
        userListBox.innerHTML = newUserList;			// box log
        userListBox.scrollTop = content.scrollHeight;		// message box scroll bar
	
	});

// update name form to match guest num
    socket.on('updateThisUser', function(data){
        name.value =  data.user;
        if(data.taken == 'y'){
            alert('Name already taken');
        }
    });

// update changes to user name
    name.onblur = sendName = function(){
        name.value = name.value.replace(/(^\s+|\s+$)/g,'');    // remove beginning and end whitespace
        socket.emit ('nameChange', {newName: name.value});
    };
}

document.onkeydown = function(evt) {
if (evt.keyCode === 13 && ['field'].indexOf(document.activeElement.id) > -1 ) { 
    sendMessage(); 
}
else if(evt.keyCode === 13 && ['name'].indexOf(document.activeElement.id) > -1){
        sendName();
    }
else { }
}









