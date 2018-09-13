function H5LiveHomePageControlBar(player) {
	this.player = player;
    var self = this;

    this.flv_div = $(".palyer_video");
    this.flv_video = $(".flv_video");
    this.flv_toplay = $(".flv_toplay");
    this.flv_play = $(".flv_play");
    this.flv_screenl = $(".flv_screenl"); 
    this.flv_controls = $(".flv_controls");
    this.flv_screen = $(".flv_screen");
    this.flv_soundno = $(".flv_soundno");
    this.flv_volume = $(".flv_volume");
    this.flv_percent = $(".flv_percent");
    this.flv_soundc = $(".flv_soundc");
    this.flv_selvolume = $(".flv_selvolume");
    this.screenl = $(".screenl");
    this.flv_menu = $("#h5video_right_menu");
    this.flv_fullvolume = $(".flv_fullvolume");
    this._streamFlag = true;//是否获取了视频清晰度

    document.getElementById("player").addEventListener("canplay", function (evvnt) {
        if(self.player) {
            if(self.player.getMute()) {
                self.selvolume(0);
            } else {
                self.selvolume(parseInt(self.player.getVolume()));
            }

            var screenList = self.player.getStreamDefinitionList();
            self._screenIndex = self.player.getCurrentStreamDefinitionIndex();
            var screenStr = "";
            $(".flv_rote").addClass(screenList[self._screenIndex].def);
            for(var i=0;i<screenList.length;i++){
                if(self._screenIndex == i)
                    screenStr += '<p class="screenl screenon" data-def="'+screenList[i].def+'" data-index="'+i+'">'+screenList[i].str+'</p>';
                else
                    screenStr += '<p class="screenl" data-def="'+screenList[i].def+'" data-index="'+i+'">'+screenList[i].str+'</p>';
            }
            $(".flv_screenl").html("").append(screenStr);
        }
    });
    $.fn.extend({
        slideToUnlock: function(options) {
            return this.each(function() {
                var slider = new Slider($(this), options, self);
                slider.create();
                slider.bindDragEvent();
            });
        }
    });
    $(".flv_selvolume").slideToUnlock({"dir":"y"});
    //播放暂停
    $('body').on('click','.flv_play',function(event) {
        self.onPlayPause(event);
    });
    //播放暂停
    $('body').on('click','.flv_freash',function(event) {
        if($(".flv_play") && $(".flv_play").hasClass("flv_pause")){
            $(".flv_play").removeClass("flv_pause");
        }
        self.player.refresh(event);
    });

    //触发hover
    $(".flv_video,.flv_controls,.flv_toroom").hover(function(event) {
        self.onHover();
    },function(event){
        self.onHoverOut();
    });

    $(".flv_clickvolume,.flv_selvolume").hover(function(event) {
        self.onShowVolumeSlider(event);
    },function(event) {
        self.onHideVolumeSlider(event);
    });
        //切换视频清晰度
    $("body").on("click",".screenl",function(){
        var slectindex = $(this).data("index")+"";
        $(".screenl").attr("class","screenl");
        $(this).addClass("screenon");
        var def = $(this).data("def");
        $(".flv_rote").attr("class","flv_rote "+def);
        if($(".flv_play") && $(".flv_play").hasClass("flv_pause")){
            $(".flv_play").removeClass("flv_pause");
        }
        self.onChangeStreamLine(parseInt(slectindex));
    });
    //safari高版本静音第一次点击
    if(self.player.isDefaultMute()){
        $("body").on("click",".flv_video",function(){
            if(safariFlag) {
                safariFlag = false;
                self.player.setUnMute();
                self.selvolume(self.player.getVolume());
            }
        });
    }
     $('body').on('click','.flv_clickvolume',function(event){
        //safari高版本静音第一次点击
        if(self.player.isDefaultMute() && safariFlag){
            safariFlag = false;
            self.player.setUnMute();
            self.selvolume(this.player.getVolume());
            return false;
        } else {
            self.onMuteUnMute(event);
        }
    });
    var videoOb = $("#player,.flv_fullbg");
    // 清除右键的监听
    videoOb.contextmenu(function (event) {
        self.flv_menu.css("left", event.pageX-window.scrollX-1);
        self.flv_menu.css("top", event.pageY-window.scrollY-1);
        self.flv_menu.data('player-id', "player");
        self.flv_menu.show();
        return false;
    });
    $(window).scroll(function (event) {
        self.flv_menu.hide();
    });

    $(document).click(function(event) {
        self.onRemoveMenu(event);
    });
     document.onkeydown=function(event) {
        self.onKeyDown(event);
    };

    $('body').on('click','#player,.flv_controls',function(event){
        self.onVideoClick(event);
    });

    //点击音量进度
    $('body').on('click','.flv_selvolume',function(event){
        self.onClickToSound(event);
    });
    
    //
    $(".flv_play").mousemove(function (event) {
        self.onPlayBtnTips(event);
    });

    $(".flv_play").mouseout(function(event){
        self.onPlayBtnTipsOut(event);
    });
    $(".flv_freash").mousemove(function (event) {
        self.onFreashBtnTips(event);
    });

    $(".flv_freash").mouseout(function(event){
        self.onFreashBtnTipsOut(event);
    });

};
function Slider(elem, options, player) {
    this.$container = elem;
    this.default = {
        width: this.$container.width() - 2,
        height: this.$container.height() - 2,
        bgColor: '#E8E8E8',
        progressColor: '#FFE97F',
        handleColor: '#fff',
        succColor: '#78D02E',
        text: '',
        succText: 'ok!',
        textColor: '#000',
        succTextColor: '#000',
        successFunc: function() {
            this._isFocus = true;
            //console.log('successfully unlock!');
        }
    };
    this.options = $.extend({}, this.default, options);
    this.isSuccess = false;
    this.player = player;
}
Slider.prototype = {
    create: function() {
        var $container = this.$container;
        var options = this.options;
        initDOM();
        initStyle();
        function initDOM() {
        }

        function initStyle() {
        }
    },
    bindDragEvent: function() {
        var that = this;
        var $container = this.$container;
        var options = this.options;
        var downX;
        var player = this.player;
        var $prog = $container.find('.slide-to-unlock-progress'),
            $bg = $container.find('.slide-to-unlock-bg'),
            $handle = $container.find('.slide-to-unlock-handle');
        var succMoveWidth = 750;
        $handle.on('mousedown', null, mousedownHandler);
        function getLimitNumber(num, min, max) {
            if (num > max) {
                num = max;
            } else if (num < min) {
                num = min;
            }
            return num;
        }
        function mousedownHandler(event) {
            downX = event.clientX;
            this._isFocus = true;
            $(document).on('mousemove', null, mousemoveHandler);
            $(document).on('mouseup', null, mouseupHandler);
        }
        function mousemoveHandler(event) {
            player.onSlideThumbMove(event, options, $prog, $handle);
        }
        function mouseupHandler(event) {
            player.onSliderThumbOut(event, options, that);
            $(document).off('mousemove', null, mousemoveHandler);
            $(document).off('mouseup', null, mouseupHandler);
        }
        function success() {
            slideFlag = true;
            this._isFocus = true;
            $prog.css({
                backgroundColor: options.succColor,
            });
            $container.find('span').css({
                color: options.succTextColor
            });
            that.isSuccess = true;
            $container.find('span').html(options.succText);
            $handle.off('mousedown', null, mousedownHandler);
            $(document).off('mousemove', null, mousemoveHandler);
            setTimeout(function() {
                options.successFunc && options.successFunc();
            }, 30);
        }
    }
};

H5LiveHomePageControlBar.prototype.onSlideThumbMove = function (event, options, prog, handle) {
    this._slideFlag = false;
    this._isFocus = true;
   if(options.dir == "y"){
        $(".flv_percent").show();
        var moveX = event.clientY;
        var postop = $(".flv_sound").offset().top - $(window).scrollTop();
        var eventY = moveX - postop;
        var diffX = 75;
        if(eventY <= 0){//sound == 100
            eventY = 0;
        }else if(eventY >= 75){//sound == 0
            eventY = 75;
            if(!$(".flv_volume").hasClass("flv_novolume"))
                $(".flv_volume").addClass("flv_novolume");
        }else{
            if($(".flv_volume").hasClass("flv_novolume"))
                $(".flv_volume").removeClass("flv_novolume");
        }
        prog.css("marginTop",eventY-75+"px");
        handle.css({
            top: eventY+5+"px"
        });
        var soundProcess = Math.round((75-eventY)*100/75);
        if(soundProcess == 0){
            $(".flv_percent").html("静音").css({top: eventY+"px"});
        }else{
            $(".flv_percent").html(soundProcess+"%").css({top: eventY+"px"});
        }
        this.player.volume(soundProcess);
        event.preventDefault();
    }
    event.preventDefault();
}

H5LiveHomePageControlBar.prototype.onSliderThumbOut = function (event, options, that) {
    var getTotalTime = Math.floor(this.player.getTotalTime());
    this._slideFlag = true;
    this._isFocus = true;
 
}
/**
 *  显示音量
 * */
H5LiveHomePageControlBar.prototype.onShowVolumeSlider = function (event) {
    // if(self.player.getMute()) {
    //     this.selvolume(0);
    // } else {
    //     this.selvolume(Math.round(this.player.getVolume()));
    // }
    this.selvolume(Math.round(this.player.getVolume()));
    this.flv_percent.hide();
    this.flv_selvolume.show();
    event.preventDefault();
}

H5LiveHomePageControlBar.prototype.onPlayBtnTips = function (event) {
    var leftX = event.clientX - this.flv_play.offset().left-15;
    $(".flv_play .fly_playshow").show().css("left",leftX+"px");
    if(this.flv_play.hasClass("flv_pause")){
        $(".flv_play .fly_playshow").html("播放");
    }else{
        $(".flv_play .fly_playshow").html("暂停");
    }
    event.preventDefault();
}
H5LiveHomePageControlBar.prototype.onPlayBtnTipsOut = function (event) {
    $(".flv_play .fly_playshow").hide();
    event.preventDefault();
}
H5LiveHomePageControlBar.prototype.onFreashBtnTips = function (event) {
    var leftX = event.clientX - this.flv_play.offset().left-65;
    $(".flv_freash .fly_playshow").show().css("left",leftX+"px"); 
    $(".flv_freash .fly_playshow").html("重新载入");
    event.preventDefault();
}
H5LiveHomePageControlBar.prototype.onFreashBtnTipsOut = function (event) {
    $(".flv_freash .fly_playshow").hide();
    event.preventDefault();
}
/**
 *  鼠标hover
 * */
H5LiveHomePageControlBar.prototype.onHover = function (handle) {
    if(self.player) {
        this.selvolume(this.player.getVolume());
        this._fullConHov = true;
        if(parseInt(this.flv_controls.css("height"))){
            this.flv_controls.show().stop().animate({"height":"50px"},150);
        }else{
            if(this.flv_controls.hasClass("flv_controls")) {
                this.flv_controls.stop().animate({"height":"50px"},150);
            } else {
                this.flv_controls.slideDown();
            }
        }
        $(".flv_toroom").show();

    }
    event.preventDefault();
    event.stopPropagation();
}

/**
 *  鼠标hover out
 * */
H5LiveHomePageControlBar.prototype.onHoverOut = function (handle) {
    this._fullConHov = false;
    this.flv_selvolume.hide();
    $(".flv_toroom").hide();
    this.flv_controls.stop().slideUp();
    event.preventDefault();
    event.stopPropagation();
}

H5LiveHomePageControlBar.prototype.onVideoClick = function (event) {
    this._isFocus = true;
    this.flv_menu.hide();
    event.stopPropagation();
}

H5LiveHomePageControlBar.prototype.onRemoveMenu = function (event) {
    this.flv_menu.hide();
    event.stopPropagation();
}
H5LiveHomePageControlBar.prototype.onClickToSound = function (event) {
    this.flv_volume.hasClass("flv_novolume") && this.flv_volume.removeClass("flv_novolume");
    var soundvol = event.clientY + $(window).scrollTop() - $(".flv_sound").offset().top;
    if(soundvol<=0){
        soundvol = 0;
    }else if(soundvol >=75){
        soundvol = 75;
        !this.flv_volume.hasClass("flv_novolume") && this.flv_volume.addClass("flv_novolume");
    }
    this.selvolume(Math.round((75-soundvol)*100/75));
    this.player.volume(Math.round((75-soundvol)*100/75));
    event.preventDefault();
    event.stopPropagation();
}
/**
 *  静音还原
 * */
H5LiveHomePageControlBar.prototype.onMuteUnMute = function (event) {
    if(this.flv_volume.hasClass("flv_novolume")){//静音->有声音
        this.player.setUnMute();
        var sound_per = Math.floor(this.player.getVolume() * 75 / 100);
        this.flv_soundno.css({"marginTop": "-"+sound_per +"px"});
        this.flv_percent.html(Math.round(this.player.getVolume())+"%").css({"top":75-sound_per+"px"}).show();
        this.flv_soundc.css({"top":80-sound_per+"px"});
    }else{
        this.player.setMute();
        this.flv_soundno.css({"marginTop": "0px"});
        this.flv_percent.html("静音").css({"top":"75px"}).show();
        this.flv_soundc.css({"top":"80px"});
    }
    this.flv_volume.toggleClass("flv_novolume");
}

H5LiveHomePageControlBar.prototype.onChangeStreamLine = function(index) {
    if(this.player && this._screenIndex != index){
        this.player.setStreamDefinition(index);
        this._screenIndex = index;
    }
};

//设置音量
H5LiveHomePageControlBar.prototype.selvolume = function(volumenum){
    var pertop = 80-Math.floor(volumenum*75/100);
    var soundtop = Math.floor(volumenum*75/100);
    this.flv_soundc.css("top",pertop+"px");
    this.flv_percent.show();
    if(volumenum == 0){
        this.flv_percent.html("静音").css({top: pertop-3+"px"});
        !this.flv_volume.hasClass("flv_novolume") && this.flv_volume.addClass("flv_novolume");
    } else {
        this.flv_volume.hasClass("flv_novolume") && this.flv_volume.removeClass("flv_novolume");
        this.flv_percent.html(Math.floor(volumenum)+"%").css({top: pertop-3+"px"});
    }

    this.flv_soundno.css({"marginTop":"-"+soundtop+"px"});
}
/**
 *  隐藏音量
 * */
H5LiveHomePageControlBar.prototype.onHideVolumeSlider = function (event) {
    this.flv_selvolume.hide();
    event.preventDefault();
}
/**
 *  点击播放/暂停
 * */
H5LiveHomePageControlBar.prototype.onPlayPause = function (event) {
if(this.player.isPaused()){}
    if(this.player && this.player.isPaused()){
        this.player.play();
        this.flv_toplay.hide();
        this._isplay = true;
        if(this.flv_play.hasClass("flv_pause")){
            this.flv_play.removeClass("flv_pause");
            $(".flv_play .fly_playshow").html("暂停");
        }
    }else{
        this.player.pause();
        this.flv_toplay.show();
        this._isplay = false;
        if(!this.flv_play.hasClass("flv_pause")){
            this.flv_play.addClass("flv_pause");
            $(".flv_play .fly_playshow").html("播放");
        }
    }
    this._isFocus = true;
}

H5LiveHomePageControlBar.prototype.onKeyDown = function (event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(this._isFocus) {
        switch (e.keyCode || e.which.keyCode) {
            case 38:    // sound add 向上键
                this.player.soundUp();
                if(this.flv_controls.css("display")=="none"){//全屏状态下
                    this.flv_fullvolume.show().html(Math.round(this.player.getVolume())+"%");
                } else {
                    this.flv_selvolume.show();
                }
                this.selvolume(Math.round(this.player.getVolume()));
                event.preventDefault();
                break;

            case 40:    // sound mins 向下键
                this.player.soundDown();
                if(this.flv_controls.css("display")=="none"){
                    if(Math.round(this.player.getVolume()) == 0){
                        this.flv_fullvolume.show().html("静音");
                    }else{
                        this.flv_fullvolume.show().html(Math.round(this.player.getVolume())+"%");
                    }
                }else{
                    this.flv_selvolume.show();
                    this.flv_soundno.show();
                }
                this.selvolume(Math.round(this.player.getVolume()));
                event.preventDefault();
                break;

            default:
                break;
        }
    }
    event.stopPropagation();
}