/*
h5播放器弹幕入口
 */
function h5playerBarrage(params,callback){
	this.player = params.player;
	this.videoId = params.videoId;
	this.userUid = params.userUid;
	this.singleTunnelHeight = params.singleTunnelHeight;
	this.barrageFlySpeed = params.barrageFlySpeed;
	this.barrageCheckTime = params.barrageCheckTime;
	this.SINGLE_TEXT_WIDTH = 13.5; //单个字宽度 修改弹幕文字大小后需要同步修改
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
		this.queueInit(function(){
			self.tunnelManagerInit(function(){
				self.bulletManagerInit(function(){
					h5playerLog('barrage tunnel and bullet init finish',2);
					self.sendTimer = setInterval(self.check.bind(self),self.barrageCheckTime);
					self.callback(self);
				})
			})
		})
	},
	queueInit:function(callback){
		var self = this;
		new h5playerBarrageQueue(function(queue){
			self.queue = queue;
			callback();
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
	},
	//检查当前是否有等待发送的弹幕
	check:function(){
		if(!this.firing && !this.queue.isEmpty()){
			var self = this;
			this.firing = true;
			this.getTunnelReady(function(obj){
				var tunnelReadyCount = obj.count;
				if(tunnelReadyCount != 0){
					var barrageReadyBuffer = self.queue.buffer.slice(0,tunnelReadyCount);
					self.distribute(barrageReadyBuffer,obj.tunnels,0);
					//clearInterval ?
				}else{
					self.firing = false;
				}
			});
		}
	},
	/*
	分配弹道和弹幕
	同步执行保证弹道检测正常，异步执行可能导致tunnel冲突但效率更高
	which one ?
	弹幕量大 异步更有优势么？
	 */
	distribute:function(barrageReadyBuffer,tunnels,index){
		var self = this;
		if(index != barrageReadyBuffer.length){
			this.bulletManager.produce(barrageReadyBuffer[index],function(bullet){
				self.fly(bullet,tunnels[index],function(){
					self.distribute(barrageReadyBuffer,tunnels,++index);
				});
			});
		}else{
			//this time barrage load end...
			this.firing = false;
		}
	},
	//异步 需要先获取到bullets tunnels
	asyncDistribute:function(){

	}
	,
	fly:function(bullet, tunnel, callback){
		var self = this;
		var videoWidth = $('#'+this.videoId).width();
		var textWidth = Math.floor(this.getBarrageContentLen(bullet.content)*this.SINGLE_TEXT_WIDTH);
		
		var allwidth = videoWidth+textWidth;
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
	},
	//查看是否有弹道可用 返回可用数
	getTunnelReady:function(callback){
		if(this.tunnelManager){
			this.tunnelManager.getTunnelReady(function(obj){
				callback(obj);
			});
		}else{
			callback({
				count:0,
				tunnels:[]
			});
		}
	},
	//查看是否有子弹可用 返回可用数
	getBulletsReady:function(callback){
		if(this.bulletManager){
			this.bulletManager.getStoreReadyBullets(function(obj){
				callback(obj);
			});
		}else{
			callback({
				count:0,
				bullets:[]
			});
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



