/*
h5播放器弹幕入口
 */
function h5playerBarrage(params,callback){
	this.player = params.player;
	this.videoId = params.videoId;
	this.userUid = params.userUid;
	this.singleTunnelHeight = params.singleTunnelHeight;
	this.barrageFlySpeed = params.barrageFlySpeed;
	this.firing = false;
	this.callback = callback;
	this.barrageInit(params);
	
}
h5playerBarrage.prototype = {
	barrageInit:function(params){
		var self = this;
		var bs = this.getBarrageParam('barrageSwitch');
		var bfis = this.getBarrageParam('barrageFullscreenInputSwitch');
		var bo = this.getBarrageParam('barrageOpacity');
		var bp = this.getBarrageParam('barragePosition');
		this.barrageConfig = {
			barrageSwitch:bs===''?params.barrageSwitch:bs,//弹幕开关 0关 1开
			barrageFullscreenInputSwitch:bfis===''?params.barrageFullscreenInputSwitch:bfis,//全屏弹幕输入开关 0关 1开
			barrageOpacity:bo===''?params.barrageOpacity:bo,//弹幕透明度 0无 1低 2中 3高
			barragePosition:bp===''?params.barragePosition:bp//弹幕位置 0全屏 1顶端 2底端
		}
		this.tunnelManagerInit(function(){
			self.bulletManagerInit(function(){
				h5playerLog('barrage tunnel and bullet init finish',2);
				self.sendTimer = setInterval(self.check.bind(self),30);
				self.callback(self);
			})
		})
	},
	tunnelManagerInit:function(callback){
		var self = this;
		new h5playerBarrageTunnelManager({
			videoId:this.videoId,
			singleTunnelHeight:this.singleTunnelHeight
		},function(tunnelManager){
			self.tunnelManager = tunnelManager;
			callback();
		});
	},
	bulletManagerInit:function(callback){
		var self = this;
		new h5playerBarrageBulletManager({
			userUid:this.userUid
		},function(bulletManager){
			self.bulletManager = bulletManager;
			callback();
		});
	}
	,
	//检查当前是否有等待发送的弹幕
	check:function(){
		if(!this.firing){
			if(h5playerBarrage.buffer.length!=0){
				this.firing = true;
				console.log(this.hasTunnelReady())
				var tunnelReadyCount = this.hasTunnelReady();
				if(tunnelReadyCount!=0){
					var barrageReadyBuffer = h5playerBarrage.buffer.slice(0,tunnelReadyCount);
					this.distribute(barrageReadyBuffer,0);
					//clearInterval ?
				}else{
					// this.firing = false;
				}
			}
		}
	},
	//分配弹道和弹幕
	distribute:function(barrageReadyBuffer,index){
		var self = this;
		if(index != barrageReadyBuffer.length){
			this.bulletManager.produce(barrageReadyBuffer[index],function(bullet){
				self.tunnelManager.getTunnel(index,function(tunnel){
					if(tunnel){
						self.fly(bullet,tunnel,function(){
							console.log('1')
							self.distribute(barrageReadyBuffer,++index);
						});
					}else{
						//get tunnel failed
					}
					
				})
			});
		}else{
			console.log('barrage load end.....');
			this.firing = false;
		}
	},
	fly:function(bullet, tunnel, callback){
		var self = this;
		var videoWidth = $('#'+this.videoId).width();
		var textWidth = Math.floor(this.getBarrageContentLen(bullet.content)*13.5);
		
		var allwidth = Math.floor(videoWidth+textWidth);
		var time = (allwidth / this.barrageFlySpeed).toFixed(2);
		
		var top = tunnel.id*this.singleTunnelHeight;
		bullet.bulletDom.css({
			'top':top+'px',
			'left':videoWidth,
			'transition':'transform '+time+'s linear 0s'
		}).text(bullet.content);
	
		bullet.isBusy = true;
		$('.live-h5player-barrage').append(bullet.bulletDom);
		setTimeout(function(){
			bullet.bulletDom.css({
				'transform':'translateX(-'+allwidth+'px)'
			})
		},0)

		//update tunnel status
		this.tunnelManager.setTunnelStatus(tunnel.id,false);
		setTimeout(function(){
			bullet.isBusy = false;
		},time*1000);
		var releaseTunnelTime = (textWidth / this.barrageFlySpeed).toFixed(2);
		setTimeout(function(){
			self.tunnelManager.setTunnelStatus(tunnel.id,true);
		},releaseTunnelTime*1000);
		this.bulletManager.bullets.push(bullet); //?
		callback();
	}
	,
	//查看是否有弹道可用 返回可用数
	hasTunnelReady:function(){
		if(this.tunnelManager){
			return this.tunnelManager.hasTunnelReady();
		}else{
			return 0;
		}
	}
	,
	getBarrageParam:function(name){
		if(this.player && name != ''){
			return this.player.getCookie(name);
		}else{
			return '';
		}
	},
	setBarrageParam:function(name,value){
		if(this.player){
			this.player.setCookie(name,value);
			this.barrageConfig[name] = value;
		}
	},
	getAllBarrageParams:function(){
		return this.barrageConfig;
	},
	getBarrageContentLen:function(val) {
        var len = 0;
        for (var i = 0; i < val.length; i++) {
             var a = val.charAt(i);
             if (a.match(/[^\x00-\xff]/ig) != null) 
            {
                len += 2;
            }
            else
            {
                len += 1;
            }
        }
        return len;
    }
};

h5playerBarrage.buffer = [
{
	content:'11111111创造快乐生活',
	type:1,
	uid:1201
},
{
	content:'2有你有我',
	type:1,
	uid:1001
},
{
	content:'3创造快乐创造快乐生活创造快乐生活创造快乐生活创造快乐生活创造快乐生活生活',
	type:1,
	uid:1201
},
{
	content:'4创造快乐创造快乐生活创造快乐生活生活',
	type:1,
	uid:1201
},
{
	content:'5创造快创造快乐生活乐生活',
	type:1,
	uid:1201
},
{
	content:'6133123123123创造快乐生活',
	type:1,
	uid:1201
},
{
	content:'7创造快乐创造快乐生活创造快乐生活创造快乐生活创造快乐生活创造快乐生活生活',
	type:1,
	uid:1201
},
{
	content:'8创造4快乐生活8创造4快乐生活',
	type:1,
	uid:1201
},
{
	content:'9创',
	type:1,
	uid:1201
},
{
	content:'102333333333333333',
	type:1,
	uid:1201
},
{
	content:'11创活',
	type:1,
	uid:1201
},
{
	content:'12创造快乐生活',
	type:1,
	uid:1201
},
{
	content:'13创造快乐生活',
	type:1,
	uid:1201
},
{
	content:'14创造快乐生活',
	type:1,
	uid:1201
},
];



