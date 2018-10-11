/**
 * 直播弹幕队列
 */
function h5playerBarrageQueue(callback){
	this.buffer = [];
	this.init(callback);
}
h5playerBarrageQueue.prototype = {
	init:function(callback){
		this.fatedata();
		callback(this);
	},
	isEmpty:function(){
		return this.buffer.length == 0?true:false;
	},
	clearBuffer:function(){
		this.buffer = [];
	}
	,
	getBufferLen:function(){
		return this.buffer.length;
	},
	inQueue:function(barrages){
		this.buffer.push(barrages);
	},
	outQueue:function(length){
		var bufferLength = this.getBufferLen();
		if(length <= bufferLength){
			this.buffer.splice(0,length);
		}else{
			this.buffer = [];
			h5playerLog('barrage buffer length less than delete length!',3);
		}
	},
	fatedata:function(){
		var a =  [
		{
			content:'666666666666',
			type:1,
			uid:1201
		},
		{
			content:'222222创造快乐生活12创造快乐生活1',
			type:1,
			uid:1001
		},
		{
			content:'3333创造快乐生活12创造快乐生活12创造快乐生活',
			type:1,
			uid:1201
		},
		{
			content:'4创造',
			type:1,
			uid:1201
		},
		

		{
			content:'3333创造快乐生活12创造快乐生活12创造快乐生活',
			type:1,
			uid:1201
		},
		{
			content:'4创造',
			type:1,
			uid:1201
		},
	
		{
			content:'666666',
			type:1,
			uid:1201
		},
		{
			content:'666666666666',
			type:1,
			uid:1201
		},
		{
			content:'222222创造快乐生活12创造快乐生活1',
			type:1,
			uid:1001
		},
		{
			content:'3333创造快乐生活12创造快乐生活12创造快乐生活',
			type:1,
			uid:1201
		}

		];
		this.buffer = [
		{
			content:'66666666',
			type:1,
			uid:1201
		},
		{
			content:'222222创造快乐生',
			type:1,
			uid:1001
		},
		{
			content:'3333创造快乐生活12创造快乐生活12创造快乐生活',
			type:1,
			uid:1201
		},
		{
			content:'4创造',
			type:1,
			uid:1201
		},
		{
			content:'666666666666',
			type:1,
			uid:1201
		},
		{
			content:'222222创造快乐生活12创造快乐生活1',
			type:1,
			uid:1001
		},
		{
			content:'3333创造快乐生活12创造快乐生活12创造快乐生活',
			type:1,
			uid:1201
		},
		{
			content:'666666666666',
			type:1,
			uid:1201
		},
		{
			content:'222222创造快乐生活12创造快乐生活1',
			type:1,
			uid:1001
		},
		{
			content:'3333创造快乐生活12创造快乐生活12创造快乐生活',
			type:1,
			uid:1201
		},
		{
			content:'4创造',
			type:1,
			uid:1201
		},
		{
			content:'666666666666',
			type:1,
			uid:1201
		},
		{
			content:'222222创造快乐生活12创造快乐生活1',
			type:1,
			uid:1001
		},
		{
			content:'3333创造快乐生活12创造快乐生活12创造快乐生活',
			type:1,
			uid:1201
		}
		];
		var self = this;
		setInterval(function(){
			if(self.buffer.length  < 30){
				var s = Math.floor(Math.random()*a.length);
				var m = a.slice(0,s);
				self.buffer = self.buffer.concat(m);
			}
		},800)

	}
}