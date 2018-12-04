
/*
喇叭和飘屏动画
说明：
1.初始化参数systemMessage giftCombo需要至少一个为true，其他非必传
2.关闭动画，setSwitcher(false)
3.初始化后调 parseMessages(messages)传入弹幕数据
 */
function ScreenAnimation(params, callback) {
	this.systemMessageBuffer = [];
	this.giftComboBuffer = [];
	this.SINGLE_TEXT_WIDTH = 7;
	this.systemMessageRunning = false;
	this.comboAnimationRunning = false;
	this.defaultConfig = {
		systemMessage: false, //是否初始化喇叭
		giftCombo: false, //是否初始化飘屏
		systemMessageSpeed: 100, //喇叭速度
		giftComboSpeed: 120, //飘屏速度
		parent: $('body'), //父级
		switcher: true, //动画总开关，初始化默认为显示动画
		zIndex: 100 //动画层级
	};
	this.config = $.extend(this.defaultConfig, params);
	this.init(callback);
}

ScreenAnimation.prototype = {
	init: function(callback) {
		if (!(this.config.systemMessage || this.config.giftCombo)) {
			this.callbackIsFunction(callback) && callback('at least one sceen animation,set true for systemMessage or giftCombo');
			return;
		}
		if (isNaN(this.config.systemMessageSpeed) || isNaN(this.config.giftComboSpeed)) {
			this.callbackIsFunction(callback) && callback('param speed error');
			return;
		}
		if (this.config.parent.length == 0) {
			this.callbackIsFunction(callback) && callback('param parent error');
			return;
		}
		this.supportCSS3 = this.isSupport('transform');
		this.initDom();
		this.callbackIsFunction(callback) && callback(null);
	},
	initDom: function() {
		this.config.parent.css({
			'overflow':'hidden',
			'position':'relative'
		});
		this.config.parent.append('<div class="screenanimation-system-message" id="screenanimation-system-message" style="z-index:' + this.config.zIndex + ';height:24px;position:absolute;top:5px;left:100px;display:none;"><div class="left-bar" style="width:40px;height:24px;float:left;background:url(' + MAIN_PIC_PREFIX_PATH + '/screenAnimation/sys_0.png) no-repeat;"></div><div class="middle-bar" style="height:24px;float:left;font-size:14px;line-height:24px;z-index:20;position:relative;white-space:nowrap;color:#fff"><img src="' + MAIN_PIC_PREFIX_PATH + '/screenAnimation/sys_1.png" style="width:100%;height:24px;"><p class="message-content" style="height:24px;padding:0;margin:0;margin-left:-28px;position:absolute;top:0;left:0;"></p></div><div class="right-bar" style="width:70px;height:24px;float:left;margin-left:-30px;background:url(' + MAIN_PIC_PREFIX_PATH + '/screenAnimation/sys_2.png) no-repeat;"></div><div class="clear"></div></div>');
		if (this.supportCSS3) {
			this.config.parent.append('<div class="screenanimation-giftcombo-animation" id="screenanimation-giftcombo-animation" style="z-index:' + this.config.zIndex + ';height: 28px;position: absolute;top: 100px;display:none;"><canvas class="left-bar" id="giftcombo-left-bar" width="50" height="28" style="display: block;width: 50px;height: 28px;float: left;background:url(' + MAIN_PIC_PREFIX_PATH + '/h5player/combo/0/bar0.png) repeat;background-size:50px 28px;"></canvas><div class="middle-bar" style="width: 300px;height: 28px;float: left;font-size: 14px;line-height: 28px;z-index: 20; position: relative;white-space: nowrap;background:url(' + MAIN_PIC_PREFIX_PATH + '/h5player/combo/0/bar1.png) repeat;background-size:300px 28px;"><canvas class="" id="giftcombo-middle-bar" height="28" style="display: block;"></canvas><div class="giftcombo-content" style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;z-index: 20;"><img src="' + MAIN_PIC_PREFIX_PATH + '/h5player/combo/0/gift.gif" alt="" class="giftcombo-img" style="width: 60px;height: 60px;display: block;float: left;margin-top: -16px;margin-left: -80px;"><p class="giftcombo-text" style="padding:0;margin:0;float: left;margin-left: -20px;color: #fff;"></p></div></div><canvas class="right-bar" id="giftcombo-right-bar" width="50" height="28" style="display: block;width: 50px;height: 28px;float: left;background:url(' + MAIN_PIC_PREFIX_PATH + '/h5player/combo/0/bar2.png) repeat;background-size:50px 28px;"></canvas><div class="clear"></div></div>');
		} else {
			this.config.parent.append('<div class="screenanimation-giftcombo-animation" id="screenanimation-giftcombo-animation" style="z-index:' + this.config.zIndex + ';height: 24px;position: absolute;top: 100px;display:none;background:#6c34d5;border-radius:20px;border:2px solid #8d62ba;"><div class="middle-bar" style="width: 300px;height: 24px;float: left;font-size: 14px;line-height: 24px;z-index: 20; position: relative;white-space: nowrap;margin-left: 50px;margin-right:50px;"><div class="giftcombo-content" style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;z-index: 20;"><img src="' + MAIN_PIC_PREFIX_PATH + '/h5player/combo/0/gift.gif" alt="" class="giftcombo-img" style="width: 60px;height: 60px;display: block;float: left;margin-top: -16px;margin-left: -80px;"><p class="giftcombo-text" style="padding:0;margin:0;float: left;margin-left: -20px;color: #fff;"></p></div></div></div>');
		}
	},
	//type 0 system message,1 gift combo, 2 all
	clearBuffer: function(type) {
		if (type >= 1) {
			this.giftComboBuffer = [];
		}
		if (type >= 0 && type != 1) {
			this.systemMessageBuffer = [];
		}
	},
	setSwitcher: function(status) {
		if (typeof status == 'boolean') {
			this.config.switcher = status;
			if (!status) {
				this.clearBuffer(2);
			}
		}
	},
	clearAnimation:function(){
		$('#screenanimation-system-message,#screenanimation-giftcombo-animation').hide();
	}
	,
	//弹幕解析，弹幕接口中messages
	parseMessages: function(messages) {
		var tempBuffer = [];
		if (this.config.switcher) {
			for (var i = 0; i < messages.length; i++) {
				switch (messages[i].type) {
					case 2:
						if (messages[i].metaInfo && messages[i].metaInfo.animation == 5 && this.config.giftCombo) {
							//全站飘屏
							this.parseComboAnimation(messages[i].metaInfo);
						} else {
							//喇叭
							this.config.systemMessage && this.parseSystemMessage(messages[i].content);
						}

						break;
					case 3:
						if (this.config.giftCombo) {
							if (messages[i].metaInfo && messages[i].metaInfo.animation == 2) {
								//房间礼物飘屏
								this.parseComboAnimation(messages[i].metaInfo);
							}
						}
						break;
					case 4:
						if (this.config.systemMessage) {
							if (messages[i].metaInfo && messages[i].metaInfo.animation == 5) {
								//系统消息动画（加入铁粉 等）
								this.parseComboAnimation(messages[i].metaInfo);
							}
						}
						break;
				}
			}
		}
	},
	//解析飘屏动画
	parseComboAnimation: function(metaInfo) {
		var animationIcon = metaInfo.animationIcon;
		var giftId = animationIcon.match(/v4\/(\S*)_/)[1];
		var combotext = this.reformContent(metaInfo.animationText);
		this.insert(1, {
			combotext: combotext,
			icon: animationIcon,
			bgUrl: metaInfo.animationBg
		});
	},
	//解析喇叭
	parseSystemMessage: function(content) {
		var msg = this.reformContent(content);
		this.insert(0, msg);
	},
	//脱壳
	takeOffContentShell: function(content) {
		if (content.indexOf('<![JSON[') == 0 && content.indexOf(']]>' > -1)) {
			return $.parseJSON(content.slice(8, -3));
		} else {
			return {
				type: 1,
				content: content,
				fontColor: ''
			};
		}
	},
	//处理文案
	reformContent: function(text) {
		var contentArr = text.match(/\<\!\[JSON\[(.*?)\]\]\>/g); //拆分
		var str = '';
		var pureStr = '';
		for (var i = 0, len = contentArr.length; i < len; i++) {
			var contentJSON = this.takeOffContentShell(contentArr[i]); //脱壳
			//1文字 2图片
			if (contentJSON.type == 1) {
				str += '<span style="color:' + contentJSON.fontColor + '">' + contentJSON.content + '</span>';
				pureStr += contentJSON.content;
			} else {
				str += '<img src="' + contentJSON.image + '">';
				pureStr += '[图]';
			}
		}
		return {
			str: str,
			pureStr: pureStr
		};
	},
	//type 0:system message 1:gift combo  
	//文案解析完成，准备动画。正在动画则排队
	insert: function(type, params) {
		if (type == 0) {
			if (this.systemMessageRunning) {
				this.systemMessageBuffer.push(params);
			} else {
				this.prepareSystemMessage(params);
			}
		} else {
			if (this.comboAnimationRunning) {
				this.giftComboBuffer.push(params);
			} else {
				this.prepareGiftCombo(params);
			}
		}
	},
	prepareSystemMessage: function(msg) {
		this.systemMessageRunning = true;
		var parentWidth = this.config.parent.width();
		var textWidth = Math.floor(this.getBarrageContentLen(msg.pureStr) * this.SINGLE_TEXT_WIDTH);
		var middleBarWidth = textWidth - 28 - 10; //左28 右10
		var contentWidth = textWidth;
		$('#screenanimation-system-message .middle-bar').css({
			'width': middleBarWidth,
			'background-size': middleBarWidth + 'px 24px'
		});
		$('#screenanimation-system-message .message-content').html(msg.str).css('width', textWidth + 'px').find('img').css({
			'vertical-align': 'middle',
			'height': '20px',
			'position': 'relative',
			'top': '-2px'
		});
		var systemMessageWidth = textWidth + 80;
		var allWidth = parentWidth + systemMessageWidth;
		$('#screenanimation-system-message').css({
			'display': 'block',
			'width': systemMessageWidth + 'px',
			'left': parentWidth + 'px',
			'marginLeft': 0
		});
		if (this.supportCSS3) {
			$('#screenanimation-system-message').css({
				'transform': 'translateX(0)'
			});
		}
		var time = (allWidth / this.config.systemMessageSpeed).toFixed(2);
		this.runSystemMessage(allWidth, time);
	},
	prepareGiftCombo: function(params) {
		var self = this;
		this.comboAnimationRunning = true;

		var parentWidth = this.config.parent.width();
		var textWidth = Math.floor(this.getBarrageContentLen(params.combotext.pureStr) * this.SINGLE_TEXT_WIDTH);
		var middleBarWidth = textWidth - 30 - 20; //20（leftbar）30 (rightbar)
		textWidth -= 20;
		$('#screenanimation-giftcombo-animation .giftcombo-img').attr('src', params.icon);

		$('#screenanimation-giftcombo-animation .middle-bar').css('width', middleBarWidth + 'px');
		$('#screenanimation-giftcombo-animation .giftcombo-text').html(params.combotext.str).css('width', textWidth + 'px');
		var leftW = this.isBrowser('safari') ? 81 : 0; //解决safari层级问题
		var comboleft = parentWidth + 30 - leftW;
		var comboWidth = textWidth + 30 + 20 + 30;
		$('#screenanimation-giftcombo-animation').css({
			'display': 'block',
			'width': comboWidth + 'px',
			'left': comboleft + 'px',
			'marginLeft': 0
		});
		var allWidth = $('#screenanimation-giftcombo-animation').width() + comboleft;
		var time = (allWidth / this.config.giftComboSpeed).toFixed(2);
		var bgUrl = params.bgUrl;
		if (this.supportCSS3) {
			$('#screenanimation-giftcombo-animation').css({
				'transform': 'translateX(0)'
			})
		}
		this.setGiftComboImg(bgUrl, middleBarWidth, function() {
			self.runGiftCombo(allWidth, time);
		});

	},
	setGiftComboImg: function(bgUrl, middleBarWidth, callback) {
		if (this.supportCSS3) {
			var canvas = document.getElementById('giftcombo-left-bar');
			var canvas2 = document.getElementById('giftcombo-right-bar');
			var canvas3 = document.getElementById('giftcombo-middle-bar');
			canvas3.width = middleBarWidth;
			var ctx = canvas.getContext('2d');
			var ctx2 = canvas2.getContext('2d');
			var ctx3 = canvas3.getContext('2d');
			var img = new Image();
			img.src = bgUrl;
			img.onload = function() {
				ctx3.drawImage(img, 100, 0, 10, 56, 0, 0, middleBarWidth, 28);
				ctx.drawImage(img, 0, 0, 100, 56, 0, 0, 50, 28);
				ctx2.drawImage(img, 110, 0, 100, 56, 0, 0, 50, 28);
				setTimeout(callback, 100);
			}
		} else {
			callback();
		}
	},
	runSystemMessage: function(allWidth, time) {
		var self = this;
		if (this.config.switcher) {
			if (this.supportCSS3) {
				setTimeout(function() {
					$('#screenanimation-system-message').css({
						'transform': 'translateX(-' + allWidth + 'px)',
						'transition': 'transform ' + time + 's linear 0s'
					})
				}, 50)
				setTimeout(function() {
					$('#screenanimation-system-message').css({
						'transition': 'none'
					})
					self.nextSystemMessage();
				}, time * 1000)
			} else {
				$('#screenanimation-system-message').animate({
					'marginLeft': '-' + allWidth + 'px'
				}, time * 1000, 'linear', function() {
					self.nextSystemMessage();
				})
			}
		}
	},
	nextSystemMessage: function() {
		this.systemMessageRunning = false;
		if (this.systemMessageBuffer.length != 0) {
			var msg = this.systemMessageBuffer.shift();
			this.prepareSystemMessage(msg);
		}
	},
	runGiftCombo: function(allWidth, time) {
		var self = this;
		if (this.supportCSS3) {
			setTimeout(function() {
				$('#screenanimation-giftcombo-animation').css({
					'transform': 'translateX(-' + allWidth + 'px)',
					'transition': 'transform ' + time + 's linear 0s'
				})
			}, 50)
			setTimeout(function() {
				$('#screenanimation-giftcombo-animation').css({
					'transition': 'none'
				})
				self.nextGiftCombo();
			}, time * 1000)
		} else {
			$('#screenanimation-giftcombo-animation').animate({
				'marginLeft': '-' + allWidth + 'px'
			}, time * 1000, 'linear', function() {
				self.nextGiftCombo();
			})
		}

	},
	nextGiftCombo: function() {
		this.comboAnimationRunning = false;
		if (this.giftComboBuffer.length != 0) {
			var params = this.giftComboBuffer.shift();
			this.prepareGiftCombo(params);
		}
	},
	//判断浏览器是否支持该样式
	isSupport: function(prop) {
		var div = document.createElement('div'),
			vendors = 'Ms O Moz Webkit'.split(' '),
			len = vendors.length;
		if (prop in div.style) return true;
		prop = prop.replace(/^[a-z]/, function(val) {
			return val.toUpperCase();
		});
		while (len--) {
			if (vendors[len] + prop in div.style) {
				return true;
			}
		}
		return false;
	},
	callbackIsFunction: function(callback) {
		return callback && typeof callback == 'function';
	},
	getBarrageContentLen: function(val) {
		var len = 0;
		for (var i = 0; i < val.length; i++) {
			var a = val.charAt(i);
			if (a.match(/[^\x00-\xff]/ig) != null) {
				len += 2;
			} else {
				len += 1;
			}
		}
		return len;
	},
	isBrowser: function(name) {
		var ua = navigator.userAgent.toLowerCase();
		var reg = {
			'ie': /msie\s([\d.]+)/,
			'chrome': /chrome\/([\d.]+)/,
			'firefox': /firefox\/([\d.]+)/,
			'opera': /opera\/.*version\/([\d.]+)/,
			'safari': /version\/([\d.]+).*safari/,
			'edge': /Windows NT 6.1; Trident\/7.0;/
		};
		var currentReg = reg[name] ? reg[name] : new RegExp(name, "g");
		if (currentReg.test(ua)) {
			return true;
		}
		return false;
	}

};