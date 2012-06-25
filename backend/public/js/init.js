var MutualFriendsAnimation = {
	init: function(){
		this._globals();
		this.position();
		this.events.init();
	},
	_globals: function(){
		S = $('.showcase'),
		H = $('.helper'),
		A = S.find('.inside').children('a');
	},
	_transform: function(css){
		var arr = [];
		for (i in css){
			var c = css[i];
			arr.push(i+'('+c+')');
		}
		var css3d = arr.join(' ');
		return {
			'-webkit-transform': css3d
		}
	},
	_loop: function(element){
		var z = A.length;
		element.each(function(i){
			var t = $(this),
				scale = (100-i*2)/100,
				css = {
					left: 10*i,
					'-webkit-transform': 'perspective(300px) rotateY(-20deg) scale('+scale+')'
				}
			if (element === A){
				css.zIndex = z--;
			}
			t.css(css);
		});
	},
	position: function(){
		this._loop(A);
	},
	events: {
		init: function(){
			this.prev();
			this.next();
		},
		control: function(control){
			var active = A.filter('.active'), name = 'active';
			
			if (control == 'prev'){
				var a = active.prev('a'), 
					all = a.nextAll('a').andSelf(),
					transform = {
						perspective: '300px',
						rotateY: '-20deg',
						translateY: '0',
						scale: '1'
					}
			} else if (control == 'next'){
				var a = active.next('a'),
					all = active.nextAll('a'),
					transform = {
						perspective: '300px',
						rotateY: '-20deg',
						translateY: '600px'
					}
			}
			
			if (a.length){
				var css3d = MutualFriendsAnimation._transform(transform);
				active.css(css3d);
				MutualFriendsAnimation._loop(all);
				A.removeClass(name);
				a.addClass(name);
			}
			
		},
		prev: function(){
			H.find('.prev').click(function(){
				MutualFriendsAnimation.events.control('prev');
				return false;
			});
		},
		next: function(){
			H.find('.next').click(function(){
				MutualFriendsAnimation.events.control('next');
				return false;
			});
		}
	}
}

//$(function(){
	
	//P.init();
	
//});
