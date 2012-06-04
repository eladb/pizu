function createLayer() {
  return {
    objects: { },
    next: 0,
    add: function(obj) {
      var self = this;
      obj._id = self.next;
      obj.bringToTop = function() {
        self.remove(obj);
        self.add(obj);
      };
      obj.remove = function() {
        self.remove(obj);
      };
      self.next = self.next + 1;
      self.objects[obj._id] = obj;
    },
    draw: function(ctx) {
      var self = this;
      Object.keys(self.objects).forEach(function(key) {
        var obj = self.objects[key];
        obj.draw.call(obj, ctx);
      });
    },
    remove: function(obj) {
      var self = this;
      delete self.objects[obj._id];
      return obj;
    },
    onclick: function(x, y) {
      console.log(x, y)
      var self = this;
      var keys = Object.keys(self.objects);
      for (var i = keys.length - 1; i >= 0; i--) {
        var obj = self.objects[keys[i]];
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
      
      //ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
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