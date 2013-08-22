var express = require("express");
var app = express();
var port = process.env.PORT || 5000;

var Canvas = require('canvas');

// Enable Jade use with ExpressJS
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// request data from root, then render page
app.get("/", function(req, res){
    res.render("page");
});

// Tell Express to use resources from public folder
app.use(express.static(__dirname + '/public'));
// Express server is passed to socket.io
var io = require('socket.io').listen(app.listen(port));


// assuming io is the Socket.IO server object   *** For Heroku which doesnt support WS **
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});
// *************************

// socket connection
var allSockets = new Object();   // all users
io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat', color: 'black' });
    // get guest id
    var x = socket.id.charCodeAt(0) % 10000  ;  // calculate guest number
    var xName = 'guest_' + x;
        while(1){
            if((allSockets[xName] !== undefined)){  // already guest with same number or index taken
                x = x+1;
                xName = 'guest_' + x;
                continue;
            }
        break;   
        }
    var xColor;          // Determine user color
    switch (x % 6){
        case 0: xColor = 'black'; break;
        case 1: xColor = 'red'; break;
        case 2: xColor = 'blue'; break;
        case 3: xColor = 'green'; break;
        case 4: xColor = 'orange'; break;
        case 5: xColor = 'purple'; break;
        
    }
    var userObj = {
        key :   'key',
        name : '1',
        color : 'black'
    };
    userObj.name = xName;
    userObj.key = xName
    userObj.color = xColor;
    allSockets[userObj.key] = userObj;
    socket.emit('updateThisUser', {user: userObj.name, taken: 'n'});       // fill in 'name' form with guest num
    io.sockets.emit('showUsers', { ID: allSockets});
    // finish init
    
    // message handler
    socket.on('send', function (data) {
        io.sockets.emit('message', {message: data.message, username: data.username, color: userObj.color});
    });    
    
   // User input custom name
    socket.on('nameChange', function(data){
        if(data.newName == ""){
            socket.emit('updateThisUser', {user: userObj.name, taken: 'n'});   
        }
        else if(allSockets[data.newName.toLowerCase()] != undefined){ // name exists
            if(data.newName.toLowerCase() != userObj.key){   // name is not the user's
                socket.emit('updateThisUser', {user: userObj.name, taken: 'y'}); 
            }
            else {socket.emit('updateThisUser', {user: data.newName, taken: 'n'});   // user changes capitalization
                userObj.name = data.newName;
                allSockets[userObj.key] = userObj;
                io.sockets.emit('showUsers', { ID: allSockets});
            }
        }
        else{
            delete allSockets[userObj.key];
            userObj.name = data.newName;
            userObj.key = data.newName.toLowerCase();
            allSockets[userObj.key] = userObj;
            io.sockets.emit('showUsers', { ID: allSockets});
        }
    });
    // remove disconnected users from our list
    socket.on('disconnect', function() {    
        delete allSockets[userObj.key];
        io.sockets.emit('showUsers', { ID: allSockets});
    });
    
    // Begin draw.js handlers
    socket.on('drawPt', function(data){
        io.sockets.emit('drawPtRe',{newX: data.newX, newY: data.newY, lineWidth: data.lineWidth, color:data.color});
    });
    socket.on('drawLine', function(data){
        io.sockets.emit('drawLineRe',{newX: data.newX, newY: data.newY,lastX: data.lastX, lastY: data.lastY,  lineWidth: data.lineWidth, color:data.color});
    });
    socket.on('clear', function(data){
        io.sockets.emit('clearRe');
    });
});


/*app.listen(port);
console.log("Listening on port " + port);*/

