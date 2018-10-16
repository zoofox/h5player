var CSEmoji = {
	defaultOption: {
		'inputObject': '',
		'emojiType': 1,
		'permissions':'-1'
	},

	reg: /\[(1_微笑)\]|\[(1_哭泣)\]|\[(1_痴迷)\]|\[(1_流汗)\]|\[(1_惊恐)\]|\[(1_夸奖)\]|\[(1_偷笑)\]|\[(1_略略略)\]|\[(1_么么哒)\]|\[(1_黑化)\]|\[(1_生气)\]|\[(1_石化)\]|\[(1_犯困)\]|\[(1_震惊)\]|\[(1_加油)\]|\[(1_吃货)\]|\[(2_喜欢)\]|\[(2_愤怒)\]|\[(2_大哭)\]|\[(2_大笑)\]|\[(2_666)\]|\[(2_再见)\]|\[(2_微笑)\]|\[(2_难过)\]|\[(2_奸笑)\]|\[(2_抠鼻)\]|\[(2_呕吐)\]|\[(2_衰神)\]|\[(2_汗颜)\]|\[(2_眩晕)\]|\[(2_伤心)\]|\[(2_可怜)\]/g,

	//使用表情类型，1：静态png，2：gif，默认为1
	emojiType: 1,

	//表情bar的icon
	emojiBarIcon:[1,2],

	fisrtEmojiKey : {
		'1_微笑':{'gifname':'cs1_1','staticname':'cs1_1_s'},
		'1_哭泣':{'gifname':'cs1_2','staticname':'cs1_2_s'},
		'1_痴迷':{'gifname':'cs1_3','staticname':'cs1_3_s'},
		'1_流汗':{'gifname':'cs1_4','staticname':'cs1_4_s'},
		'1_惊恐':{'gifname':'cs1_5','staticname':'cs1_5_s'},
		'1_夸奖':{'gifname':'cs1_6','staticname':'cs1_6_s'},
		'1_偷笑':{'gifname':'cs1_7','staticname':'cs1_7_s'},
		'1_略略略':{'gifname':'cs1_8','staticname':'cs1_8_s'},
		'1_么么哒':{'gifname':'cs1_9','staticname':'cs1_9_s'},
		'1_黑化':{'gifname':'cs1_10','staticname':'cs1_10_s'},
		'1_生气':{'gifname':'cs1_11','staticname':'cs1_11_s'},
		'1_石化':{'gifname':'cs1_12','staticname':'cs1_12_s'},
		'1_犯困':{'gifname':'cs1_13','staticname':'cs1_13_s'},
		'1_震惊':{'gifname':'cs1_14','staticname':'cs1_14_s'},
		'1_加油':{'gifname':'cs1_15','staticname':'cs1_15_s'},
		'1_吃货':{'gifname':'cs1_16','staticname':'cs1_16_s'}
	},

	secondEmojiKey : {
		'2_喜欢':{'gifname':'cs2_1','staticname':'cs2_1_s'},
		'2_愤怒':{'gifname':'cs2_2','staticname':'cs2_2_s'},
		'2_大哭':{'gifname':'cs2_3','staticname':'cs2_3_s'},
		'2_大笑':{'gifname':'cs2_4','staticname':'cs2_4_s'},
		'2_666':{'gifname':'cs2_5','staticname':'cs2_5_s'},
		'2_再见':{'gifname':'cs2_6','staticname':'cs2_6_s'},
		'2_微笑':{'gifname':'cs2_7','staticname':'cs2_7_s'},
		'2_难过':{'gifname':'cs2_8','staticname':'cs2_8_s'},
		'2_奸笑':{'gifname':'cs2_9','staticname':'cs2_9_s'},
		'2_抠鼻':{'gifname':'cs2_10','staticname':'cs2_10_s'},
		'2_呕吐':{'gifname':'cs2_11','staticname':'cs2_11_s'},
		'2_衰神':{'gifname':'cs2_12','staticname':'cs2_12_s'},
		'2_汗颜':{'gifname':'cs2_13','staticname':'cs2_13_s'},
		'2_眩晕':{'gifname':'cs2_14','staticname':'cs2_14_s'},
		'2_伤心':{'gifname':'cs2_15','staticname':'cs2_15_s'},
		'2_可怜':{'gifname':'cs2_16','staticname':'cs2_16_s'}
	},

	csemojiPath: MAIN_PIC_PREFIX_PATH + '/cs_emoji/',

	csemojiOtherPath: MAIN_PIC_PREFIX_PATH + '/cs_emoji/other/',

	//创建表情列表
	csemojiInit: function($triggerThis){
		if($("#chushouEmotion").length <= 0)
		{
			$("body").append("<div id='chushouEmotion' class='chushou-emotion'><ul class='chushou-emotion-list'></ul><div class='chushou-banner'></div></div>");
		
			CSEmoji.createEmojiBar();
			CSEmoji.bindFn();
		}
		var _this = $triggerThis.last();
		var _thisq = _this.offset();
		var bodyHeight = $("body").height();
		var emojiHeight = $("#chushouEmotion").height();
		var boxTop = _thisq.top + _this.outerHeight() + 5;
		if((bodyHeight - boxTop) <= emojiHeight)
		{
			boxTop = boxTop - emojiHeight - _this.height() - 10;
		}
		$("#chushouEmotion").css({
            top: boxTop,
            left: _thisq.left - 45
        }).show();
	},
	//创建表情banner
	createEmojiBar: function(){
		var barStr = '';
		for (var i = 0; i < (CSEmoji.emojiBarIcon).length; i++) {
			var iconName = 'bar'+(CSEmoji.emojiBarIcon)[i] + '.png';
			var otherClass = '';
			if(i==0)
				otherClass = 'active';
			barStr += '<div class="bar-list '+otherClass+'" data-index="'+(CSEmoji.emojiBarIcon)[i]+'"><img src="' + CSEmoji.csemojiOtherPath + iconName + '"/></div>';
		}
		$("#chushouEmotion").find('.chushou-banner').append(barStr);
		CSEmoji.createEmojiList('1');
	},
	//创建表情列表
	createEmojiList: function(index){
		var params = CSEmoji.defaultOption;
		var listStr = '', permissionsFlag = false;
		if(params.permissions.indexOf("-1") != -1)
		{
			//所有表情都有权限
			permissionsFlag = true;
		}
		else if(params.permissions.indexOf(index) != -1)
		{
			//对应相应表情的权限
			permissionsFlag = true;
		}

		if(permissionsFlag)
		{
			var obj;
			if(index == "1")
				obj = CSEmoji.fisrtEmojiKey;
			else if(index == "2")
				obj = CSEmoji.secondEmojiKey;

			for(var i in obj)
			{
				var imgName = '';
				if(params.emojiType == 2)
					imgName = obj[i].gifname + ".gif";
				else
					imgName = obj[i].staticname + ".png";
				listStr += '<li class="cs-emoji-item" data-value="['+i+']"><img src="' + CSEmoji.csemojiPath + imgName + '"></li>';
			}
		}
		else
		{
			//无权限使用
			var coverImg = 'cover'+index+'.png';
			var title = '', tips = '';
			listStr += '<div class="cover-image"><img src="'+ CSEmoji.csemojiOtherPath + coverImg +'"/></div>'
			if(index == "1")
			{
				title = '小触搞笑表情(16枚)';
				tips = '小触陪你一起宠爱主播~';
			}
			else if(index == "2")
			{
				title = '船长霸气表情(16枚)';
				tips = '有船长撑腰，主播是我的啦！';
			}

			listStr += '<div class="right-container">';
			listStr += '<p class="title">' + title + '</p>';
			listStr += '<p class="tips">' + tips + '</p>';
			listStr += '<div class="payfans-btn">开通铁粉</div>';
			listStr += '</div>';
		}

		$("#chushouEmotion").find('.chushou-emotion-list').html(listStr);
	},

	bindFn: function(){
		$("body").bind({
            click: function() {
                $("#chushouEmotion").hide();
            }
        });

        $("#chushouEmotion").bind({
            click: function(event) {
                event.stopPropagation();
            }
        });

        $("#chushouEmotion").on('click', '.cs-emoji-item', function(event) {
        	var oldVal = (CSEmoji.defaultOption.inputObject).val();
        	var maxLength = (CSEmoji.defaultOption.inputObject).attr("maxlength") || -1;
        	var emojiValue = $(this).data("value")
        	var newVal = oldVal+emojiValue;
        	if(maxLength > -1 && (emojiValue.length+oldVal.length) > maxLength)
        	{
        		newVal = oldVal;
        	}
        	(CSEmoji.defaultOption.inputObject).val(newVal);
        	event.preventDefault();
        });

        $("#chushouEmotion").on('click', '.bar-list', function(event) {
        	var index = $(this).data("index");
        	CSEmoji.createEmojiList(index);
        	$(this).addClass('active').siblings().removeClass('active');
        	event.preventDefault();
        });
	},

	//表情解析
	emoji: function(text) {
		CSEmoji.emoji = function(text) {
			setTimeout(function() {
				CSEmoji.trans(text);
			}, 0);
		}

		CSEmoji.emoji(text);
	},

	trans: function(text) {
		var isElement, el;
		if (text.nodeType) {
			el = text;
			text = el.innerHTML;
			isElement = true;
		}
		var hexToDec = function(str) {
				str = str.replace(/\\/g, "%");
				return unescape(str);
			}
			//unicode字符串转换，否则会当作普通字符处理
		var text = hexToDec(text);
		text = text.replace(CSEmoji.reg, function(code){
			return '<img class="csemoji" style="vertical-align:middle" src="' + CSEmoji.csemojiPath + CSEmoji._escapeEmojiName(code) + '">'
		});

		if (isElement) {
			el.innerHTML = text;
		}
		return text;
	},

	//转换对应图片路径
	_escapeEmojiName: function(str) {
		var escapeStr = str.substring((str.indexOf('[')+1), str.indexOf(']'));
		var imgName = str, emojiKey = '';
		if(escapeStr.indexOf("1_") != -1)
		{
			//使用第一套表情
			if(CSEmoji.fisrtEmojiKey[escapeStr])
			{
				emojiKey = CSEmoji.fisrtEmojiKey[escapeStr];
			}
		}
		else if(escapeStr.indexOf("2_") != -1)
		{
			//使用第二套表情
			if(CSEmoji.secondEmojiKey[escapeStr])
			{
				emojiKey = CSEmoji.secondEmojiKey[escapeStr];
			}
		}

		if(emojiKey != '')
		{
			if(CSEmoji.emojiType == 2)
				imgName = emojiKey.gifname + ".gif";
			else
				imgName = emojiKey.staticname + ".png";
		}

		return imgName;
	}
};

if (typeof $ !== 'undefined') {
	/*
	解析触手表情
	emojiType：1为png，2为gif
	 */
	$.fn.csemoji = function(emojiType) {
		CSEmoji.emojiType = emojiType || 1;
		this.each(function(index, element) {
			CSEmoji.emoji(element);
		});
	};
	/*
	params为object
	params.inputObject是输入框的jquery对象；
	params.emojiType是类型，1为png，2为gif；
	params.permissions字符串类型'1,2'，代表权限，数组里面的数字代表有权使用哪几套表情，'-1'代表全部表情；
	*/
	$.fn.csemojiInit = function(params) {
		CSEmoji.defaultOption = $.extend(CSEmoji.defaultOption, params);
		CSEmoji.csemojiInit(this);
	};
}