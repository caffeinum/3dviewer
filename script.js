function CanvasWrapper(canvasId, type) {
    var canvas  = document.getElementById( canvasId || "cvs" );
    if ( ! canvas ) return;
    var cnt = canvas.getContext( type || "2d");
    if ( ! cnt ) return;
    
    this.context = cnt;
	this.canvas = canvas;
	
    this.fillRect = function (x,y,w,h) {
        cnt.fillStyle = "#000000";
        cnt.fillRect(x,y,w,h);
    };
    
    this.clear = function () { 
        cnt.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    this.drawCircle = function (centerX, centerY, radius, color) {
        cnt.fillStyle = color;
        cnt.beginPath();
        cnt.arc( centerX, centerY, radius, 0, 2*Math.PI );
        cnt.fill();
    };
    
    this.drawImage = function (img, cx,cy,cw,ch, x,y,w,h) {
        cnt.drawImage(img,cx,cy,cw,ch,x,y,w,h);
    };
    
    this.drawText = function (text) {
        cnt.font = "36px Verdana";
        cnt.fillStyle = "#ffffff";
        cnt.fillText(text, 500,400);
    };
    
    this.drawLine = function (x1, y1, x2, y2, color) {
        
        cnt.strokeStyle = color || "#ffffff";
        
        cnt.beginPath();
        cnt.moveTo(x1, y1);
        cnt.lineTo(x2, y2);
        cnt.stroke();
        return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
    };
    
    this.moveTo = function (x, y, color) {
        
        cnt.strokeStyle = color || "#ffffff";
        
        cnt.beginPath();
        cnt.moveTo(x, y);
    };
    this.lineTo = function (x, y) {
        cnt.lineTo(x, y);
    };
    this.stroke = function () {
        cnt.stroke();
    };
    this.arc = function (x,y,x1,y1,x2,y2,radius) {
        cnt.beginPath();
        cnt.moveTo(x,y);
        cnt.arcTo(x1,y1,x2,y2,radius);
        cnt.stroke();
    };
}

// WebGl
CanvasWrapper.prototype.init = function () {
	var gl = this.gl = this.context;

	gl.viewportWidth 	= this.canvas.width;
	gl.viewportHeight 	= this.canvas.height;

	initShaders(gl);
	initBuffers(gl);

	gl.clearColor(0.9, 0.9, 0.9, 1.0);
	gl.enable(gl.DEPTH_TEST);

	var shaderProgram;

	function initShaders() {
		var fragmentShader	= getShader(gl, "shader-fs");
		var vertexShader 	= getShader(gl, "shader-vs");

		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		gl.useProgram(shaderProgram);

		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.pMatrixUniform 	= gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform 	= gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.colourUniform 	= gl.getUniformLocation(shaderProgram, "uColour");

	}

	var mvMatrix	= mat4.create();
	var pMatrix		= mat4.create();

	function setMatrixUniforms() {
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	}

	var triangleVertexPositionBuffer;
	var squareVertexPositionBuffer;

	function initBuffers() {
		triangleVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		var vertices = [
			 0.0,  1.0,  0.0,
			-1.0, -1.0,  0.0,
			 1.0, -1.0,  0.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		triangleVertexPositionBuffer.itemSize = 3;
		triangleVertexPositionBuffer.numItems = 3;

		squareVertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		vertices = [
			 1.0,  1.0,  0.0,
			-1.0,  1.0,  0.0,
			 1.0, -1.0,  0.0,
			-1.0, -1.0,  0.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		squareVertexPositionBuffer.itemSize = 3;
		squareVertexPositionBuffer.numItems = 4;
	}
	


	this.drawScene = function(frame, colour) {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

		mat4.identity(mvMatrix);

		mat4.translate(mvMatrix, mvMatrix, [-1.5, 0.0, -7.0]);
	/*
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
							   triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

	*/
	//	x = (frame % 2) ? 1.0 : -1.0;
	//	colour = (frame % 2) ? [1.0, 0, 1, 1] : [0.0, 0, 1, 1];

		mat4.translate(mvMatrix, mvMatrix, [1.0, 0.0, 0.0]);
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
							   squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		setMatrixUniforms(gl);
		gl.uniform4fv(shaderProgram.colourUniform, colour[ frame % colour.length ]);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
	}

}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function echo ( str ) {
	$('#output').text( str );
}

$(document).ready(function () {
    var lefteye		= new CanvasWrapper('leftEye', 'experimental-webgl');
    var righteye	= new CanvasWrapper('rightEye', 'experimental-webgl');

	lefteye.init();
	righteye.init();
	
	var frame = 0;
	
	var paused	= false,
		pause	= function ( state ) {
			paused = state;
		};
	
	$('#output')
	.mouseenter(	function() { pause(true) }	)
	.mouseleave(	function() { pause(false) }	);


	var int	= 0;
	var R0	= $V(	[.7, .7, .3]	),
		r0	= $V(	[-.1, .1,  0]	),
		amp	= .3,
		rt, r, R, result, rl, rr;
	
//	setInterval(function () {
		frame = 0;
		
	clearInterval(int);
	int = setInterval(function () {
	//	PAUSE
		if ( paused ) return;

	//	Modulating R color by small rotating r vector with modulus .2
	//	r += [R x r] / |r| / |R| / 50
	//	r = r / |r|  x .2  
	//	colour = R + r

		r0	= r0.add( R0.cross(r0).x( 1 / r0.modulus() / R0.modulus() / 50 ) );
		r0	= r0.x( amp / r0.modulus() );

		rl	= r0;
		r	= rl.elements;

		R	= R0.elements;

		result = $V([R[0], R[1], R[2], 1]).add( $V([r[0], r[1], r[2], 0]) );

		lefteye.drawScene(frame, [
			result.elements
		]);


		rr	= r0.x( -1 );
		r	= rr.elements;

		result = $V([R[0], R[1], R[2], 1]).add( $V([r[0], r[1], r[2], 0]) );

		righteye.drawScene(frame, [
			result.elements
		]);


		echo (
			" R: " + result.elements[0].toFixed(3)
		+ 	" G: " + result.elements[1].toFixed(3)
		+ 	" B: " + result.elements[2].toFixed(3)
		);

		console.log( result.elements );

		frame++;
	}, 50/3);
//	}, 1000);
});