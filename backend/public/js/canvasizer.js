function createLayer() {
  return {
    _objects: { },
    _next: 0,
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
      self._objects[obj._id] = obj;
    },
    draw: function(ctx) {
      var self = this;
      Object.keys(self._objects).forEach(function(key) {
        var obj = self._objects[key];
        ctx.save();
        obj.draw.call(obj, ctx);
        ctx.restore();
      });
    },
    remove: function(obj) {
      var self = this;
      delete self._objects[obj._id];
      return obj;
    },
    onclick: function(x, y) {
      console.log(x, y)
      var self = this;
      var keys = Object.keys(self.objects);
      for (var i = keys.length - 1; i >= 0; i--) {
        var obj = self._objects[keys[i]];
        if (x >= obj.x && x <= obj.x + obj.width &&
            y >= obj.y && y <= obj.y + obj.height) {
          if (obj.onclick) {
            obj.onclick.call(obj, x, y);
            break;
          }
        }
      }
    },
  };
}

function createImage(img, x, y, w, h, alpha, deg) {
  return {
    img: img,
    alpha: alpha || 1.0,
    deg : deg || 0.0,
    visible: true,
    x: x,
    y: y,
    width: w,
    height: h,
    visible: true,
    draw: function(ctx) {
      if (!this.visible) return;
      ctx.globalAlpha = this.alpha;

      var centerX = (this.x + this.width / 2);
      var centerY = (this.y + this.height / 2);
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(deg);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
      ctx.restore();
    },
  };
}

function canvasize(canvas, obj) {
  var ctx = canvas.getContext("2d");

  function redraw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    obj.draw.call(obj, ctx);
  }

  function adjustSize() {
    canvas.width = $(window).width();
    canvas.height = $(window).height();
  }

  $(window).resize(adjustSize);
  adjustSize();

  setInterval(redraw, 30);

  canvas.onclick = function(e) {
    var x = Math.floor((e.pageX - $("canvas").offset().left));
    var y = Math.floor((e.pageY - $("canvas").offset().top));
    if (obj.onclick) {
      obj.onclick.call(obj, x, y);
    }
  };
}

function createView(view) {
  view = view || {};
  view.x = view.x || 10;
  view.y = view.y || 10;
  view.width = view.width || 50;
  view.height = view.height || 50;
  view.rotate = view.rotate || 0.0;
  view._children = {};
  view._nextid = 0;

  view.add = function(child) {
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
    Object.keys(self._children).forEach(function(key) {
      var child = self._children[key];
      ctx.save();
      ctx.translate(self.x, self.y);
      child.draw.call(child, ctx);
      ctx.restore();
    });
  };

  return view;
}

function createRectangle(attr) {
  var self = createView();
  for (var k in attr) self[k] = attr[k];

  var fill = !!self.fillStyle;
  var stroke = !!self.strokeStyle;

  self.radius = self.radius || 0;

  var _draw = self.draw;
  self.draw = function(ctx) {
    var self = this;

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

    ctx.beginPath();
    ctx.moveTo(self.x + self.radius, self.y);
    ctx.lineTo(self.x + self.width - self.radius, self.y);
    ctx.quadraticCurveTo(self.x + self.width, self.y, self.x + self.width, self.y + self.radius);
    ctx.lineTo(self.x + self.width, self.y + self.height - self.radius);
    ctx.quadraticCurveTo(self.x + self.width, self.y + self.height, self.x + self.width - self.radius, self.y + self.height);
    ctx.lineTo(self.x + self.radius, self.y + self.height);
    ctx.quadraticCurveTo(self.x, self.y + self.height, self.x, self.y + self.height - self.radius);
    ctx.lineTo(self.x, self.y + self.radius);
    ctx.quadraticCurveTo(self.x, self.y, self.x + self.radius, self.y);
    ctx.closePath();
    
    if (fill) {
      ctx.fill();
    }

    if (stroke) {
      ctx.stroke();
    }

    ctx.restore();

    return _draw.call(self, ctx);
  };

  return self;
}