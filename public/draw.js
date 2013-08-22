function initDraw() {
    // socket.emit('drawPt',{newX: this.x, newY: this.y, lineWidth: lineWidth, color:color});
    // socket.emit('drawLine',{newX: e.clientX- justifyX, newY: e.clientY- justifyY,lastX: this.x, lastY: this.y,  lineWidth: lineWidth, color:color});
    // socket.emit('clear');
    var socket = io.connect(window.location.hostname, {'sync disconnect on unload' : true});
    var width = 450;    // Set Canvas width and height here
    var height = 250;
    var color = "black";
    var lineWidth = 5;
    var borderSize = 3;
    
    
    var canvas = document.getElementById("myCanvas");    // main drawing board
    var canvasCtx = canvas.getContext("2d");
    var palette = document.getElementById("palette");    // color palette
    var paletteCtx = palette.getContext("2d");
    var clearBtn = document.getElementById("clear");
    var canvasSize = document.getElementById("canvasSize");    // main drawing board
    var canvasSizeCtx = canvasSize.getContext("2d");
    var slider = document.getElementById("slider");
    
    // Canvas attributes
    canvas.height = height;
    canvas.width = width;
    canvas.style.border = borderSize +"px solid";
    canvas.style.cursor="crosshair"
    var canvasOffset = $(canvas).offset();
    var justifyX = canvasOffset.left+borderSize;    // justification depending on cavas location and border size
    var justifyY = canvasOffset.top+borderSize;
    canvasCtx.lineCap = 'round';    // Ensure smooth pen
    
    // Palette attributes
    var colors = new Array("black","grey","#C36241","brown","tan","purple","pink","blue","red","green","#33FFCC","orange","yellow","white");
    palette.height = 30;
    palette.width = 30*colors.length;
    palette.style.border = canvas.style.border;
    var paletteOffset = $(palette).offset();
    var palJustifyX = paletteOffset.left+borderSize;    // justification depending on cavas location and border size
    var palJustifyY = paletteOffset.top+borderSize;
    palette.style.cursor="pointer";
    initPalette();
    
    // Current Pen Attrib Canvas
    canvasSize.height = 30;
    canvasSize.width = 30;
    var canvasSizeOffset = $(canvasSize).offset(); 
    drawSample();
    
    // offset calculate scroll amount
    $(window).scroll(function() {
      var $h1 = $("h1");
      justifyY = canvasOffset.top+borderSize - $(window).scrollTop();
      palJustifyY = paletteOffset.top+borderSize- $(window).scrollTop();
    });

    
    canvas.addEventListener('mousedown', function(e) {
        event.preventDefault(); // prevent defaults (default cursor) 
        this.down = true;      // mouse down, start drawing
        this.x = e.clientX - justifyX ;    // update coords
        this.y = e.clientY - justifyY ;
        canvasCtx.strokeStyle=color;
        canvasCtx.lineWidth = lineWidth;
        canvasCtx.fillStyle=color;
        canvasCtx.beginPath();
        canvasCtx.arc(this.x,this.y,lineWidth/2,0,Math.PI*2,false);
        canvasCtx.fill();
        socket.emit('drawPt',{newX: this.x, newY: this.y, lineWidth: lineWidth, color:color});
    }, 0);
    canvas.addEventListener('mouseup', function() {
        this.down = false;      // mouse up, stop drawing  
    }, 0);
    canvas.addEventListener('mousemove', function(e) {
        if(this.down) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(this.x , this.y);
            canvasCtx.lineTo(e.clientX- justifyX, e.clientY- justifyY);
            canvasCtx.stroke();
            var lastX = this.x;
            var lastY = this.y;
            this.x = e.clientX - justifyX ;    // update the 'last' point
            this.y = e.clientY - justifyY ;
            socket.emit('drawLine',{newX: e.clientX- justifyX, newY: e.clientY- justifyY,lastX: lastX, lastY: lastY,  lineWidth: lineWidth, color:color});
        }
    }, 0);
    
    // Palette
    function initPalette(){
        
        for(var i=0; i<colors.length;i++){
            paletteCtx.fillStyle=colors[i];    //black
            paletteCtx.fillRect(i*30,0,40,40);
        }
        //"#C36241"   // light brown aka rust
        //"#33FFCC";    //teal
    }
    palette.addEventListener('click', function(e) {
        event.preventDefault();
        this.x = e.clientX - palJustifyX ;    // update coords
        //this.y = e.clientY - palJustifyY ;
        for(var i =1; i<colors.length+1;i++){
            if(this.x<i*30){ 
                color=colors[i-1];
                initPalette();
                drawSample();
                break;
            }
        }
    }, 0);
    
    // Resizer
    $('#slider').bind('DOMAttrModified input change focus', function () {
        lineWidth = this.value;
        drawSample();
    });
    
    function drawSample(){
        canvasSizeCtx.clearRect(0, 0, 50, 50);
        canvasSizeCtx.fillStyle = color;
        canvasSizeCtx.beginPath();  
        canvasSizeCtx.arc(15,15,lineWidth/2,0,Math.PI*2,false);
        if(color=="white"){
            canvasSizeCtxstrokeStyle = 'black';
            canvasSizeCtx.stroke();
        }
        else{
            canvasSizeCtx.fill();
        }
    }
    
    // Clear button
    clearBtn.addEventListener('click', function() {
        canvasCtx.clearRect(0, 0, width, height);
        socket.emit('clear');
    }, 0);
    
    socket.on('drawPtRe', function(data){
        //canvasCtx.drawImage(data.canvas, 0,0);
        canvasCtx.strokeStyle=data.color;
        canvasCtx.lineWidth = data.lineWidth;
        canvasCtx.fillStyle=data.color;
        canvasCtx.beginPath();
        canvasCtx.arc(data.newX,data.newY,data.lineWidth/2,0,Math.PI*2,false);
        canvasCtx.fill();
        canvasCtx.strokeStyle=color;
        canvasCtx.lineWidth = lineWidth;
        canvasCtx.fillStyle= color;
        
    });
    socket.on('drawLineRe', function(data){
       // canvasCtx.drawImage(data.canvas, 0,0);
        canvasCtx.strokeStyle=data.color;
        canvasCtx.lineWidth = data.lineWidth;
        canvasCtx.fillStyle=data.color;
        canvasCtx.beginPath();
        canvasCtx.moveTo(data.lastX , data.lastY);
        canvasCtx.lineTo(data.newX, data.newY);
        canvasCtx.stroke();
        canvasCtx.strokeStyle=color;
        canvasCtx.lineWidth = lineWidth;
        canvasCtx.fillStyle= color;
    
        });
    socket.on('clearRe', function(data){
        canvasCtx.clearRect(0, 0, width, height);
    });
    
}