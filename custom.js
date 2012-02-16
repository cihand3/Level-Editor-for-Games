(function(){
var g, points = [], history = [], sprites = [], pressed = false, selected = -1, closePoint = -1, selectedSprite = -1, closePointToSprite = -1;

window.onload = function(){
	
	var canvas = document.createElement( "canvas" );
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	g = canvas.getContext( "2d" );

	if( storageSupport() ){
		
		var data = localStorage.getItem( "points" );
		if( data != null ){
			try{
				points = JSON.parse( data );
				redraw();
			}catch(exc){
				console.log( 'Parse Error' );
			}
			
		}
	}
	
	document.getElementById( 'imageImportOption' ).onchange = function( evt ){
		var files = evt.target.files;
            var reader = new FileReader();
            reader.onload = function(e){
              	
				var dd = e.target.result;
				
				var img = new Image();
				img.src = dd;
				img.onload = function(){
				img.style.position = 'absolute';
				img.style.left = '0';
				img.style.top = '0';
				img.style.zIndex = '-99';
								
				document.body.appendChild( img );
				};
				
            }
            reader.readAsDataURL(files[0]);		
		
		
	};
	
	document.getElementById( 'spriteImportOption' ).onchange = function( evt ){
		var files = evt.target.files;
            var reader = new FileReader();
            reader.onload = function(e){
              	
				var dd = e.target.result;
				
				var img = new Image();
				img.src = dd;
				
				var name = 'sprite' + sprites.length;
				
				sprites.push( { 'image': img, 'x': 0, 'y': 0, 'name': name, 'tileX' : 1, 'tileY': 1 } );
				
				redraw();
				
            }
            reader.readAsDataURL(files[0]);		
		
		
	};
	
	
	document.getElementById( 'importOption' ).onchange = function( evt ){
		var files = evt.target.files;
            var reader = new FileReader();
            reader.onload = function(e){

              var dd = e.target.result;

              try{
                points = [];
                points = JSON.parse( dd );
				saveHistory();
				redraw();
                }catch(e){
                    console.log(e.toString());
                }

            }
            reader.readAsText(files[0]);
 	};
	
	// Clear Operation
	document.getElementById( 'clearOption' ).onclick = function(){
		history.push( arrayCopy( points ) );
		points = [];
		redraw();
	};
	
	// Undo Operation
	document.getElementById( 'undoOption' ).onclick = function(){
		if( history.length > 0 ){
			points = history.pop();
		}else{
			points = [];
		}
			redraw();
	
	};
	
	// Export Operation
	document.getElementById( 'exportOption' ).onclick = function(){
		var content = JSON.stringify( points );		
		uriContent = "data:application/octet-stream," + encodeURIComponent(content);
		window.open(uriContent,"Save as File");
	};
	
	// Edit Name
	document.getElementById( 'editName' ).onchange = function(){
		if( selectedSprite > -1 ){
			sprites[ selectedSprite ].name = this.value;
		}
	};
	
	// tile X
	document.getElementById( 'tileX' ).onchange = function(){
		var v = this.value;
		
		if( v.match( /^([0-9]+)$/gi ) !== null){
			sprites[ selectedSprite ].tileX = v;
		}else{
			alert( 'You should enter an integer' );
		}
		redraw();
	};
	
	// tile Y
	document.getElementById( 'tileY' ).onchange = function(){
		var v = this.value;
		
		if( v.match( /^([0-9]+)$/gi ) !== null){
			sprites[ selectedSprite ].tileY = v;
		}else{
			alert( 'You should enter an integer' );
		}
		redraw();		
	};
	
	document.body.appendChild( canvas );
	
	// disable right-click menu
	canvas.oncontextmenu = function(){
		return false;
	};
	
	
	var coorDiv = document.getElementById( "coordinates" );
	var objCoorDiv = document.getElementById( "obj-coordinates" );
	
	window.onmousemove = function( ev ){
		var x = ev.pageX,
			y = ev.pageY;
		coorDiv.innerHTML = "Screen Coordinates <br> X: " + x + " , Y: " + y;
	};
	
	canvas.onmousedown = function( ev ){
	
		var x = ev.pageX,
			y = ev.pageY;
			
			pressed = true;
			selected = searchPoint( x, y );
			selectedSprite = searchSprite( x, y );
			
			
			if( selected === -1 && selectedSprite === -1 ){
				points.push( { 'x': x, 'y': y } );
			}else{
				if( selected !== -1 && ev.which === 3 ){
					// delete point
					pressed = false;
					points = points.slice( 0, selected ).concat( points.slice( selected + 1 ) );
					selected = -1;
				}else if( selectedSprite !== -1 && ev.which === 3 ){
					// delete sprite
					pressed = false;
					sprites = sprites.slice( 0, selectedSprite ).concat( sprites.slice( selectedSprite + 1 ) );
					selectedSprite = -1;
				}
				
			}
			
	};
	
	canvas.onmousemove = function( ev ){		
		   var x = ev.pageX,
	           y = ev.pageY;

	        if( pressed ){
	            if( selected > -1 ){
	                points[ selected ].x = x;
	                points[ selected ].y = y;
	            }
	 			if( selectedSprite > -1 ){
				   sprites[ selectedSprite ].x = x;
		           sprites[ selectedSprite ].y = y;
				   objCoorDiv.innerHTML = getSpriteInfoHTML( selectedSprite );
				}else{
					objCoorDiv.innerHTML =  "";
				}
	        }else{
	            closePoint = searchPoint(x, y);
				closePointToSprite = searchSprite( x, y );
			
	        }
	
		
	
			redraw();

	};
	
	canvas.onmouseup = function( ev ){
		pressed = false;
	
		if( selected > -1 ){
				objCoorDiv.innerHTML = "Point Coordinates <br> X: " + points[ selected ].x + " , Y: " + points[ selected ].y;
		}
		
		if( selectedSprite > -1 ){
				document.getElementById( 'infoBar' ).style.visibility = 'visible';
			   objCoorDiv.innerHTML = getSpriteInfoHTML( selectedSprite );
		}else{
				document.getElementById( 'infoBar' ).style.visibility = 'hidden';
		}
		
		saveHistory();
		
		if( history.length > 50 ){
			history = history.slice( -50 );
		}
		
		redraw();
	};
	 
	
}

function saveHistory(){
	
	if( storageSupport() ){
		localStorage.clear();
		localStorage.setItem( 'points', JSON.stringify( points ) );
	}
	history.push( arrayCopy( points ) );
	
}

function getSpriteInfoHTML(i){
	var html = "Sprite Coordinates <br> X: " + sprites[i].x + " , Y: " + sprites[i].y +
	 " <br> W: " + sprites[ i ].image.width + " , H: " + sprites[ i ].image.height;
	
	var editInput = document.getElementById( 'editName' );
	editInput.value = sprites[i].name;
	
	var tileX = document.getElementById( 'tileX' ),
	    tileY = document.getElementById( 'tileY' );
	
	tileX.value = sprites[i].tileX;
	tileY.value = sprites[i].tileY;	
	
	return html;
}

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};

function arrayCopy( ar ){
	var nAr = [], i = 0;
	
	for( i = 0; i < ar.length; i += 1 ){
		nAr.push( ar[i].clone() );
	}
	
	return nAr;
	
}

function searchPoint( x, y ){
    var i;
    for(i = 0; i < points.length; i += 1){
        if(Math.abs(points[i].x - x) < 5 && Math.abs(points[i].y - y) < 5){
            return i;
        }        
    }
    return -1; 
}


function searchSprite( x, y ){
    var i;
    for(i = 0; i < sprites.length; i += 1){
        if(Math.abs(sprites[i].x - x) < sprites[i].image.width && Math.abs(sprites[i].y - y) < sprites[i].image.height){
            return i;
        }        
    }
    return -1; 
}

function storageSupport(){

        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
}


function redraw(){
	var i = 0, p1, p2, close = false, closeToSprite = false, isSelected = false;
	
	g.clearRect( 0, 0, window.innerWidth, window.innerHeight );
	
	var w, h, range;
	
	for( i = 0; i < sprites.length; i += 1 ){
		
		closeToSprite = ( i === closePointToSprite ) ? true : false;
		
		w = sprites[i].image.width / sprites[i].tileX;
		h = sprites[i].image.height / sprites[i].tileY;
		
		if( closeToSprite || selectedSprite === i ){
					
			range = ( w > h ) ? w : h;
			 var c = '#F213A4';
		        if( selectedSprite !== -1 ){
		            c = '#E89700';
		        }
		     drawCircle( sprites[i].x + w/2, sprites[i].y + h/2, range + 5, c );
			
		}
		g.drawImage( sprites[i].image, 0, 0, w, h, sprites[i].x, sprites[i].y, w, h );
		
		
	}
	
	
	for( i = 0; i < points.length; i += 1 ){
		
		close = ( i === closePoint ) ? true : false;
		isSelected = ( i === selected ) ? true : false;
		p1 = points[ i ];
		
		putPoint( { x: p1.x,  y: p1.y, r: 3, 'close': close, 'selected': isSelected } );
		
	}
	
	
	for( i = 1; i < points.length; i += 1 ){
		
		p1 = points[ i - 1 ];
		p2 = points[ i ];	
			
		drawLine( p1.x, p1.y, p2.x, p2.y );	
	}
	

	
	
}


function drawPoint(x,y){
    g.beginPath();
    g.fillRect(x, y, 1, 1);

    g.fillStyle = '#000';
    
    g.fill();
    
    g.closePath();
     
}


function drawLine(x,y,x2, y2, color){
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x2, y2);
    
    if(color === undefined){
        color = '#000000';
    }
    
    g.strokeStyle = color;
    
    g.stroke();
    
    g.closePath();
     
}


function putPoint(o){
    
    
    fillCircle(o.x, o.y, o.r,"#CC60B1");
    
    if( ( o.close !== undefined && o.close === true ) || o.selected ){
        var c = '#F213A4';
        if( selected !== -1 ){
            c = '#E89700';
        }
        drawCircle( o.x, o.y, o.r + 5, c );
        
    }
    
    
    if( o.text !== undefined && options.pointData ){
        g.beginPath();
        g.font = '13px Helvetica, Arial, sans-serif';
        g.fillText(o.text,o.x - 16, o.y - 16);
        g.fill();
        g.closePath();
    }
    
}



function drawCircle(x,y,r,c){
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2, true);
    
    g.strokeStyle = c;
    
    g.stroke();
    
    g.closePath();
     
}


function fillCircle(x,y,r,c){
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2, true);
       
    g.fillStyle = c;
    
    g.fill();
    
    g.closePath();
     
}

})();

