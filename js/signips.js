var signips = {
	callbacks: {
		loaded:		function(){},
		finished:	function(){},
		skip:		function(){},
		initdone:	function(){}
	},
	templateCallbacks: {
		fontsLoaded: function(){}
	},
	status: {
		ready: {
			document: false,
			fonts: false,
			init: false
		},
		fontCallback: function(callback){
			if(signips.status.ready.fonts)
				callback();
			else
				signips.templateCallbacks.fontsLoaded = callback;
		},
		initDone: function(){
			// Run template callbacks if the browser does not provide these functions
			if(!(document.fonts && document.fonts.ready)) {
				signips.templateCallbacks.fontsLoaded();
			}
			
			signips.status.ready.init = true;
			signips.status.checkReady();
		},
		initReady: function(){
			$(document).ready(function(){
				signips.status.ready.document = true;
				signips.status.checkReady();
			});
			if(document.fonts && document.fonts.ready)
			{
				var dfr = document.fonts.ready;
				if(typeof(dfr) == "function") dfr = document.fonts.ready();
				dfr.then(function() {
					signips.templateCallbacks.fontsLoaded();
					signips.status.ready.fonts = true;
					signips.status.checkReady();
				});
			}
			else
				signips.status.ready.fonts = true;
		},
		checkReady: function(){
			if(signips.status.ready.document && signips.status.ready.fonts && signips.status.ready.init) {
				// Give it time to load the last things
				setTimeout(function(){signips.callbacks.initdone();}, 500);
			}
		}
	},
	initialize: function(width, height){
		canvasBG		= $("#canvasBackground");
		htmlRoot		= $("#htmlMiddle");
		canvasTop		= $("#canvasTop");
		htmlTop			= $("#htmlTop");
		if(canvasBG.length > 0)
		{
			stageBG		= new createjs.Stage(canvasBG[0]);
			canvasBG. prop("width",width).prop("height",height).css({width: width, height: height});
		}
		if(canvasTop.length > 0)
		{
			stageTop	= new createjs.Stage(canvasTop[0]);
			canvasTop.prop("width",width).prop("height",height).css({width: width, height: height});
		}
	},
	debugStart: function() {
		// if(!signips.tools.inIframe() && !signips.tools.isBBPlayer() && !signips.tools.isMobile())
			init(
				debugData, {
					original_width:		templateInfo.width,
					original_height:	templateInfo.height,
					player_width:		templateInfo.width,
					player_height:		templateInfo.height,
					player_zoom:		1,
					base_url:			"",
					stream_server:		""
				},
				{
					loaded:		function(){},
					finished:	function(){},
					skip:		function(){},
					initdone:	function(){},
					initdone:	function(){play()}
				}
			);
	},
	calculate: {
		gradientCoordinates: function(width, height, degrees) {
			/*
				Calculates the ending point of a gradient based on the formula used by Flash.
				The angle is "a".
				The coordinates are the point located at "x".
			
				  +-----------------------width----------------------+
				  |\                                                 |
				  |a\                                                |
				  |  \                                               |
				  |   \                                              |
				  |    \                                             |
				  |     \                                            |
				  A      C                                           |
				  |       \                                          |
				  |        \                                         |
				  |         \                                        |
				  |          \                                       |
				  |           \                                      |
				  +-----B-------------------------D------------------+
								\                           ___---
								 \                    ___---
								  E             ___---
								   \      ___---
									x__---
			*/
			var A = height;
			var B = Math.tan(degrees * (Math.PI / 180)) * A;
			var C = A / Math.cos(degrees * (Math.PI / 180))
			var D = width - B;
			var E = Math.sin(degrees * (Math.PI / 180)) * D;
			
			var length = C + E;
			var X = Math.sin(degrees * (Math.PI / 180)) * length;
			var Y = Math.cos(degrees * (Math.PI / 180)) * length;
			
			return [X,Y];		
		}
	},
	canvas: {
		square: function(x, y, width, height, color) {
			var container = new createjs.Container();
			container.initialize();
			var shape = new createjs.Shape();
			shape.graphics.f(color).dr(x,y,width,height);
			container.addChild(shape);
			return container;
		},
		squareGradient: function(x, y, width, height, gradientColors, gradientRatios, angle) {
			var container = new createjs.Container();
			container.initialize();
			var shape = new createjs.Shape();
			var coor = signips.calculate.gradientCoordinates(width, height, angle);
			shape.graphics.lf(gradientColors, gradientRatios, 0, 0, coor[0], coor[1]).dr(x,y,width,height);
			container.addChild(shape);
			return container;
 		}
	},
	html: {
		text: {
			headBody: function(container, x, y, width, height, font, color, head, body, fontSize, minimumSize, ratio, textMargin) {
				var textContainer = $("<div></div>").addClass("staticPosition textBound").css({left: x, top: y, width: width, "font-family": font, color: color, "max-height": height}).appendTo(container);
				var currentFontsize = fontSize;
				var currentHeight = height + 1;
				while(currentHeight > height && currentFontsize >= minimumSize) {
					var spanHead = $("<span></span>").css({"display":"block", "margin-bottom":textMargin, "font-size": currentFontsize}).html(head);
					var spanBody = $("<span></span>").css({"font-size": Math.round(currentFontsize/ratio)}).html(body);
					textContainer.html("").append(spanHead).append(spanBody);
					currentHeight = textContainer[0].scrollHeight + 30;
					currentFontsize--;
				}
				return textContainer;
			},
			multiLine: function(container, x, y, width, height, font, color, text, fontSize, minimumSize) {
				var textContainer = $("<div></div>").addClass("staticPosition textBound").css({left: x, top: y, width: width, "font-family": font, color: color, "max-height": height}).html(text).appendTo(container);
				var currentFontsize = fontSize;
				var currentHeight = height + 1;
				while(currentHeight > height && currentFontsize >= minimumSize) {
					textContainer.css({"font-size": currentFontsize});
					currentHeight = textContainer[0].scrollHeight + 30;
					currentFontsize--;
				}
				return textContainer;
			},
			singleLine: function(container, x, y, width, height, font, color, text, fontSize) {
				var textContainer = $("<div></div>").addClass("staticPosition textSingle").css({left: x, top: y, "font-family": font, color: color, "max-width": width, "max-height": height, "width": width, "font-size": fontSize+"px"}).html(text).appendTo(container);
				return textContainer;
			}
		},
		image: {
			sizeIn: function(container, x, y, width, height, image, callback) {
				$("<img />").addClass("staticPosition").load(function(){
					var imgWidth = this.width;
					var imgHeight = this.height;
					var imgRatio = imgWidth / imgHeight;
					
					var newWidth = width;
					var newHeight = height;
					
					var destRatio = width / height;
					if(imgRatio > destRatio)
						newHeight = imgHeight / (imgWidth / width);
					else
						newWidth = imgWidth / (imgHeight / height);
					
					$(this).css({width: newWidth, height: newHeight, left: x, top: y + ((height - newHeight)/2)}).show();
					
					if(callback !== undefined) callback();
				}).prop("src",image).hide().appendTo(container);
			},
			sizeOut: function(container, x, y, width, height, image, callback) {
				var imgContainer = $("<div></div>").addClass("staticPosition imageContainer").css({"max-width":width, "max-height":height, left: x, top: y}).appendTo(container);
				$("<img />").load(function(){
					var imgWidth = this.width;
					var imgHeight = this.height;
					var imgRatio = imgWidth / imgHeight;
					
					var newWidth = width;
					var newHeight = height;
					
					var destRatio = width / height;
					if(imgRatio < destRatio)
						newHeight = imgHeight / (imgWidth / width);
					else
						newWidth = imgWidth / (imgHeight / height);
					
					$(this).css({position: "relative", width: newWidth, height: newHeight, left: ((width - newWidth)/2), top: ((height - newHeight)/2)}).show();
					
					if(callback !== undefined) callback();
				}).prop("src",image).hide().appendTo(imgContainer);
				return imgContainer;
			}
		}
	},
	tools: {
		rotate: function(container, angle) {
			return container.css({"-ms-transform": "rotate("+angle+"deg)", "-webkit-transform": "rotate("+angle+"deg)", "transform": "rotate("+angle+"deg)"});
		},
		strToDate: function(str) {
			return new Date(
				parseInt(str.substr(0,4)),
				parseInt(str.substr(5,2))-1,
				parseInt(str.substr(8,2)),
				parseInt(str.substr(11,2)),
				parseInt(str.substr(14,2)),
				parseInt(str.substr(17,2)),
				0
			);
		},
		strToTimestamp: function(str) {
			return new Date(
				parseInt(str.substr(0,4)),
				parseInt(str.substr(5,2))-1,
				parseInt(str.substr(8,2)),
				parseInt(str.substr(11,2)),
				parseInt(str.substr(14,2)),
				parseInt(str.substr(17,2)),
				0
			).getTime();
		},
		getTime: function() {
			var now = new Date();
			return (now.getHours() < 10 ? "0" : "") + now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
		},
		setTime: function(container) {
			container.text(signips.tools.getTime());
			setInterval(function(){container.text(signips.tools.getTime())},1000);
		},
		setDay: function(container, dayArr) {
			var now = new Date();
			container.text(dayArr[now.getDay()]);
			setInterval(function(){
				var now = new Date();
				container.text(dayArr[now.getDay()]);
			},1000);
		},
		setDate: function(container, dateBeforeMonth, monthArr) {
			var now = new Date();
			if(dateBeforeMonth)
				container.text(now.getDate() + " " + monthArr[now.getMonth()]);
			else
				container.text(monthArr[now.getMonth()] + " " + now.getDate());
			setInterval(function(){
				var now = new Date();
				if(dateBeforeMonth)
					container.text(now.getDate() + " " + monthArr[now.getMonth()]);
				else
					container.text(monthArr[now.getMonth()] + " " + now.getDate());
			},1000);
		},
		getNumericDate: function(dateBeforeMonth) {
			var now = new Date();
			if(dateBeforeMonth)
				return (now.getDate() < 10 ? "0" : "") + now.getDate() + "-" + (now.getMonth() < 9 ? "0" : "") + (now.getMonth() + 1) + "-" + now.getFullYear();
			else
				return (now.getMonth() < 9 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate() + "-" + now.getFullYear();
		},
		setNumericDate: function(container, dateBeforeMonth) {
			container.text(signips.tools.getNumericDate(dateBeforeMonth));
			setInterval(function(){
				container.text(signips.tools.getNumericDate(dateBeforeMonth));
			},1000);
		},
		inIframe: function() {
			try {return window.self !== window.top;} catch (e) {return true;}
		},
		intToRGB: function(num) {
			var hexcolor = num.toString(16);
			var hexlength = hexcolor.length;
			for(var i=hexlength; i < 6; i++)
				hexcolor = "0" + hexcolor;
			return "#"+hexcolor;
		},
		intToRGBA: function(num, alpha) {
			var red = num >> 16;
			var green = (num >> 8) & 0xFF;
			var blue = num & 0xFF;
			return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";
		},
		zoom: function(object, scale) {
			object.css({
				transform:		"scale("+scale+")",
				transformOrigin:	"0 0"
			});
		},
		isBBPlayer: function() {
			var browser = navigator.userAgent||navigator.vendor||window.opera;
			if(/blibblib/i.test(browser)) return true;
			return false;
		},
		bbPlayerVersion: function() {
			if(signips.tools.isBBPlayer()) {
				var browser = navigator.userAgent||navigator.vendor||window.opera;
				var parts = browser.split(" ");
				for(var i = 0; i < parts.length; i++) {
					var part = parts[i];
					if(part.length > 9 && part.toLowerCase().substr(0,8) == "blibblib")
						return part.toLowerCase().substr(9);
				}
			}
			return false;
		},
		isMobile: function() {
			var browser = navigator.userAgent||navigator.vendor||window.opera;
			if( browser.match(/Android/i) || browser.match(/webOS/i) || browser.match(/iPhone/i) || browser.match(/iPad/i) || browser.match(/iPod/i) || browser.match(/BlackBerry/i) || browser.match(/Windows Phone/i)) return true;
			return false;
		},
		unserialize: function(data) {
			var that = this,
			utf8Overhead = function(chr) {
				var code = chr.charCodeAt(0);
				if (code < 0x0080) return 0;
				if (code < 0x0800) return 1;
				return 2;
			};
			read_until = function(data, offset, stopchr) {
				var i = 2;
				var buf = [];
				var chr = data.slice(offset, offset + 1);

				while (chr != stopchr) {
					if ((i + offset) > data.length) return false;
					buf.push(chr);
					chr = data.slice(offset + (i - 1), offset + i);
					i += 1;
				}
				return [buf.length, buf.join('')];
			};
			read_chrs = function(data, offset, length) {
				var i;
				var buf = [];
				var chr;
				for (i = 0; i < length; i++) {
					chr = data.slice(offset + (i - 1), offset + i);
					buf.push(chr);
					length -= utf8Overhead(chr);
				}
				return [buf.length, buf.join('')];
			};
			_unserialize = function(data, offset) {
				var dtype, dataoffset, keyandchrs, keys, contig, length, array, readdata, readData, ccount, stringlength, i, key, kprops, kchrs, vprops, vchrs, value, chrs = 0;
				var typeconvert = function(x) {return x};
				if (!offset) offset = 0;
				dtype = (data.slice(offset, offset + 1)).toLowerCase();
				dataoffset = offset + 2;
				switch (dtype) {
					case 'i':
						typeconvert = function(x) {return parseInt(x, 10)};
						readData = read_until(data, dataoffset, ';');
						chrs = readData[0];
						readdata = readData[1];
						dataoffset += chrs + 1;
						break;
					case 'b':
						typeconvert = function(x) {return parseInt(x, 10) !== 0};
						readData = read_until(data, dataoffset, ';');
						chrs = readData[0];
						readdata = readData[1];
						dataoffset += chrs + 1;
						break;
					case 'd':
						typeconvert = function(x) {return parseFloat(x)};
						readData = read_until(data, dataoffset, ';');
						chrs = readData[0];
						readdata = readData[1];
						dataoffset += chrs + 1;
						break;
					case 'n':
						readdata = null;
						break;
					case 's':
						ccount = read_until(data, dataoffset, ':');
						chrs = ccount[0];
						stringlength = ccount[1];
						dataoffset += chrs + 2;

						readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
						chrs = readData[0];
						readdata = readData[1];
						dataoffset += chrs + 2;
						if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {return false;}
						break;
					case 'a':
						readdata = {};

						keyandchrs = read_until(data, dataoffset, ':');
						chrs = keyandchrs[0];
						keys = keyandchrs[1];
						dataoffset += chrs + 2;

						length = parseInt(keys, 10);
						contig = true;

						for (i = 0; i < length; i++) {
							kprops = _unserialize(data, dataoffset);
							if(kprops === false) return false;
							kchrs = kprops[1];
							key = kprops[2];
							dataoffset += kchrs;

							vprops = _unserialize(data, dataoffset);
							if(vprops === false) return false;
							vchrs = vprops[1];
							value = vprops[2];
							dataoffset += vchrs;

							if(key !== i) contig = false;
							readdata[key] = value;
						}

						if (contig) {
							array = new Array(length);
							for (i = 0; i < length; i++)
							array[i] = readdata[i];
							readdata = array;
						}

						dataoffset += 1;
						break;
					default:
						return false;
						break;
				}
				return [dtype, dataoffset - offset, typeconvert(readdata)];
			};
			return _unserialize((data + ''), 0)[2];
		}
	}
}
if(!Date.now) {Date.now = function(){return new Date().getTime();}}
signips.status.initReady();