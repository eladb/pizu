///<reference path="facebook_js_sdk.js" />
///<reference path="jquery-1.7.2.min.js" />
///<reference path="cordova-1.7.0.js" />
///<reference path="cdv-plugin-fb-connect.js" />
///<reference path="geohash.js" />
///<reference path="canvasizer.js" />
///<reference path="app.js" />


function createLayer() {
  return {
    _objects: { },
    _next: 0,
    needsClearing: true,
    add: function(obj) {
      var self = this;
      obj._id = self._next;
      obj.bringToTop = function() {
        self.remove(obj);
        self.add(obj);
      };
      obj.remove = function() {
        self.remove(obj);
      };
      self._next = self._next + 1;
      obj.needsRefresh = true;
      self._objects[obj._id] = obj;
    },
    draw: function(ctx) {
      var self = this;
      Object.keys(self._objects).forEach(function(key) {
        var obj = self._objects[key];
        if (self.needsClearing || obj.needsRefresh){
          ctx.save();
          obj.draw(ctx);
          ctx.restore();
        };
      });
      self.needsClearing = false;
    },
    remove: function(obj) {
      var self = this;
      delete self._objects[obj._id];
      self.needsClearing = true;
      return obj;
    },
    onclick: function(x, y) {
      var found = false;
      var self = this;
      var keys = Object.keys(self._objects);
      for (var i = keys.length - 1; i >= 0; i--) {
        var obj = self._objects[keys[i]];
        if (obj.hittest && obj.hittest(x, y)) {
          obj.onclick.call(obj, x, y);
          found = true;
          break;
        }
        else {
          if (x >= obj.xcoor && x <= obj.xcoor + obj.width() &&
              y >= obj.ycoor && y <= obj.ycoor + obj.height()) {
            if (obj.onclick) {
              obj.onclick(x, y);
              found = true;
              break;
            }
          }
        }
      }
      return found;
    },
  };
}

var TO_RADIANS = Math.PI/180; 

function createImage(img, x, y, w, h, alpha, deg, fbid) {
  return {
    xlength: w,
    ylength: h,
    width: function() 
    { 
      var self = this;
      return self.xlength; 
    },
    height: function() 
    { 
      var self = this;
      //return self.xlength * self.xtoyratio;
      return self.xlength; 
    },
    needsRefresh: true,

    xcoor: x,
    ycoor: y,
    //xtoyratio: x / y,
    fillStyle: 'white',
    shadowBlur: 5.0,
    shadowColor: 'black',
    shadowOffsetX: 1.0,
    shadowOffsetY: 1.0,
    radius: 3,
    deg: deg || 0.0,

    x: function() 
    { 
      var self = this;
      return self.xcoor; 
    },

    y: function() 
    { 
      var self = this;
      return self.ycoor; 
    },

    rotate: function() 
    { 
      var self = this;
      return self.deg; 
    },

    fbid: fbid || 0,
    alpha: alpha || 1.0,



    img: img,
    
    visible: true,
    
    draw: function(ctx) {
      var self = this;
      if (!self.visible) return;
      if (!self.needsRefresh) 
        alert('Baaa trying to draw a view which doesnt need refresh');

      var centerX = (self.xcoor + self.width() / 2);
      var centerY = (self.ycoor + self.height() / 2);
      
      ctx.save();
      ctx.globalAlpha = self.alpha;
      ctx.translate(centerX, centerY);
      ctx.rotate(self.deg * TO_RADIANS);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(self.img, self.xcoor, this.ycoor, self.width(), self.height());
      ctx.restore();

      self.needsRefresh = false;
    },
  };
}

function canvasize(fgCanvas, bgCanvas, fgBufferCanvas, bgBufferCanvas, fgObj, bgObj) {
  var fgCtx = fgCanvas.getContext("2d");
  var bgCtx = bgCanvas.getContext("2d");
  var fgBufferCtx = fgBufferCanvas.getContext("2d");  
  var bgBufferCtx = bgBufferCanvas.getContext("2d");  
  var frameCounter = 0;

  function redraw() {
    function DrawLayerOnCanvas(bufferCtx, ctx, obj, isBackground)
    {
        // Clear the buffer if needed
        if (obj.needsClearing) 
          {
            if (isBackground) {
                bufferCtx.fillRect(0, 0, bufferCtx.canvas.width, bufferCtx.canvas.height);    
            }
            else{
                bufferCtx.clearRect(0, 0, bufferCtx.canvas.width, bufferCtx.canvas.height);
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);        
            }
          };
        obj.draw(bufferCtx);
    
        // copy the entire rendered image from the buffer canvas to the visible one
        ctx.save();
	    ctx.drawImage(bufferCtx.canvas, 0, 0, bufferCtx.canvas.width, bufferCtx.canvas.height);
        ctx.restore();   
    }

    // First, draw BG if needed
    DrawLayerOnCanvas(bgBufferCtx, bgCtx, bgObj, true);

    // Now, draw FG
    DrawLayerOnCanvas(fgBufferCtx, fgCtx, fgObj, false);
  }

  function adjustSize() {
    fgCanvas.width = $(window).width();
    fgCanvas.height = $(window).height();
    bgCanvas.width = fgCanvas.width;
    bgCanvas.height = fgCanvas.height;
    fgBufferCanvas.width = fgCanvas.width;
    fgBufferCanvas.height = fgCanvas.height;
    bgBufferCanvas.width = bgCanvas.width;
    bgBufferCanvas.height = bgCanvas.height;
  }

  $(window).resize(adjustSize);
  adjustSize();

  //redraw();


  bgBufferCtx.fillStyle = "black";
  //bgBufferCtx.fillRect(0, 0, bgBufferCtx.canvas.width, bgBufferCtx.canvas.height);    
  setInterval(redraw, 30);

  bgCanvas.onclick = function(e) {
    var x = Math.floor((e.pageX - $("canvas").offset().left));
    var y = Math.floor((e.pageY - $("canvas").offset().top));
    if (bgObj.onclick) {
      bgObj.onclick(x, y);
    }
  };

  fgCanvas.onclick = function(e) {
    
    var foundFgObject = false;

    var x = Math.floor((e.pageX - $("canvas").offset().left));
    var y = Math.floor((e.pageY - $("canvas").offset().top));
    if (fgObj.onclick) {
      foundFgObject = fgObj.onclick(x, y);
    }

    if (!foundFgObject){
        //Pass click to BG if didn't find a FG object
        bgCanvas.onclick(e);
    }

    
  };
}

function createView(view) {
  view = view || {};
  view._isView = true;
  view.x = view.x || 0;
  view.y = view.y || 0;
  view.width = view.width || 0;
  view.height = view.height || 0;
  view.rotate = view.rotate || null;
  view.visible = true;
  view._children = {};
  view._nextid = 0;
  view.needsRefresh = true;

  view.add = function(child) {
    if (!child._isView) throw new Error('can only add views as children to a view');

    var self = this;
    child._id = view._nextid++;
    child.bringToTop = function() {
      self.remove(child);
      self.add(child);
    };
    child.remove = function() {
      self.remove(child);
    };
    self._children[child._id] = child;
  };

  view.remove = function(child) {
    var self = this;
    delete self._children[child._id];
    return child;
  };

  view.draw = function(ctx) {
    var self = this;
    
    ctx.save();

    var centerX = self.x() + self.width() / 2;
    
    if (!self.y) {alert('aa');}

    var centerY = self.y() + self.height() / 2;

    if (self.rotate && self.rotate()) {
      ctx.translate(centerX, centerY);
      ctx.rotate(self.rotate());
      ctx.translate(-centerX, -centerY);
    }

    if (self.visible) {
      if (!self.needsRefresh) 
        alert('Baaa trying to draw an image which doesnt need refresh');
      
      if(self.needsRefresh){
          Object.keys(self._children).forEach(function(key) {
            var child = self._children[key];
            child.needsRefresh = true;
          });
      }
      ctx.translate(self.x(), self.y());

      ctx.save();

      if (self.fillStyle) ctx.fillStyle = self.fillStyle;
      if (self.shadowBlur) ctx.shadowBlur = self.shadowBlur;
      if (self.shadowColor) ctx.shadowColor = self.shadowColor;
      if (self.shadowOffsetX) ctx.shadowOffsetX = self.shadowOffsetX;
      if (self.shadowOffsetY) ctx.shadowOffsetY = self.shadowOffsetY;
      if (self.lineCap) ctx.lineCap = self.lineCap;
      if (self.lineJoin) ctx.lineJoin = self.lineJoin;
      if (self.lineWidth) ctx.lineWidth = self.lineWidth;
      if (self.strokeStyle) ctx.strokeStyle = self.strokeStyle;

      if (self.ondraw) {
        self.ondraw(ctx);
      }

      ctx.restore();

      Object.keys(self._children).forEach(function(key) {
        var child = self._children[key];
        child.draw.call(child, ctx);
      });

      ctx.restore();
      self.needsRefresh = false;
    }
  };

  view.hittest = function(ex, ey) {
    var self = this;

    var x = self.x();
    var y = self.y();
    var w = self.width();
    var h = self.height();

    return (ex >= x && ex <= x + w && 
            ey >= y && ey <= y + h);
  };

  return view;
}

function createImageView(view) {
  var self = createView(view);
  if (!self.img) throw new Error('`img` is required');
  self.ondraw = function(ctx) {
    ctx.drawImage(self.img, 0, 0, self.width(), self.height());
  };
  return self;
}

function createRectangleView(attr) {
  var self = createView(attr);

  self.radius = self.radius || 0;

  self.ondraw = function(ctx) {
    var self = this;

    ctx.beginPath();
    ctx.moveTo(0 + self.radius, 0);
    ctx.lineTo(0 + self.width() - self.radius, 0);
    ctx.quadraticCurveTo(0 + self.width(), 0, 0 + self.width(), 0 + self.radius);
    ctx.lineTo(0 + self.width(), 0 + self.height() - self.radius);
    ctx.quadraticCurveTo(0 + self.width(), 0 + self.height(), 0 + self.width() - self.radius, 0 + self.height());
    ctx.lineTo(0 + self.radius, 0 + self.height());
    ctx.quadraticCurveTo(0, 0 + self.height(), 0, 0 + self.height() - self.radius);
    ctx.lineTo(0, 0 + self.radius);
    ctx.quadraticCurveTo(0, 0, 0 + self.radius, 0);
    ctx.closePath();
    
    if (self.fillStyle) {
      ctx.fill();
    }

    if (self.strokeStyle) {
      ctx.stroke();
    }
  };

  return self;
}