const iconv = require('iconv-lite');
const crypto = require('crypto');
class Times{
    autoFill(str) {
        if (str < 10) {
            str = "0" + str;
        }
        return str
    }
}
class Util extends Times{
    constructor(){
        super();
    }

    /**
     * 随机小数点
     * **/
    randomNum(number) {
        let num = "";
        for (let i = 0; i < number; i++) {
            num += Math.floor(Math.random() * 10)
        }
        return num;
    }

    /**
     * 是否为null、undefined、空字符串
     * **/
    isNull(str) {
        if (str == undefined || str == null || str.toString().replace(/(^s*)|(s*$)/g, "").length == 0)
            return true
        else
            return false;
    }
    /**
     * 随机字符串
     * **/
    randomString(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
    /**
     * 是否为数字
     * **/
    isNumber(str) {
        return (!isNaN(str));
    }

    /**
     * 获取当前时间
     * **/
    getNowTime(){
        let times = new Date();
        let y = times.getFullYear();
        let m = times.getMonth()+1;
        let d = times.getDate();
        let h = times.getHours();
        let mm = times.getMinutes();
        let s = times.getSeconds();
        return y + "-" + this.autoFill(m) + "-" + this.autoFill(d) + " " + this.autoFill(h) + ":" + this.autoFill(mm) + ":" + this.autoFill(s);
    }
    /**
     * 时间转格式
     * **/
    getNewTime(t){
        let times = new Date(t);
        let y = times.getFullYear();
        let m = times.getMonth()+1;
        let d = times.getDate();
        let h = times.getHours();
        let mm = times.getMinutes();
        let s = times.getSeconds();
        return y + "-" + this.autoFill(m) + "-" + this.autoFill(d) + " " + this.autoFill(h) + ":" + this.autoFill(mm) + ":" + this.autoFill(s);
    }
    /**
     * 获取今年哪一年
     * **/
    getNowYear(times){
        let d = times.getFullYear();
        return d;
    }
    /**
     * 获取今年哪一月
     * **/
    getNowMonth(times){
        let d = times.getMonth();
        return d;
    }
    /**
     * 获取今天多少号
     * **/
    getNowDay(times){
        let d = times.getDate();
        return d;
    }
    /**
     * md5加密
     * **/
    md5(text) {
        return crypto.createHash('md5').update(text).digest('hex');
    };
    /**编码GB2312 */
    encodeGB2312(text) {
        let pad = function (number, length, pos) {
            var str = "%" + number;
            while (str.length < length) {
                //向右边补0
                if ("r" == pos) {
                    str = str + "0";
                } else {
                    str = "0" + str;
                }
            }
            return str;
        };
        let toHex = function (chr, padLen) {
            if (null == padLen) {
                padLen = 2;
            }
            return pad(chr.toString(16), padLen);
        };
        let gb2312 = iconv.encode(text.toString('UCS2'), 'GB2312');
        let gb2312Hex = "";
        for (let i = 0; i < gb2312.length; ++i) {
            gb2312Hex += toHex(gb2312[i]);
        }
        return gb2312Hex.toUpperCase();

    }

    /*获取Json数组长度 */
    getJsonLength(jsonData){
        var jsonLength = 0;
        for(var item in jsonData){
            jsonLength++;
        }
        return jsonLength;
    }
    /*获取用户指定面额天数日期 */
    getTomorrow(tian) {
        Date.prototype.Format = function(fmt) { //author: meizz
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
        return  new Date(new Date().getTime() + tian*1000 * 60 * 60 * 24).Format("yyyy-MM-dd");
    }
    /*日期拼接天数*/
    getdatatime(tian)
    {
        let data= this.getTomorrow(tian);
        let myDate = new Date();
        let mytime=myDate.toLocaleTimeString(); //获取当前时间
        //console.log(getTomorrow(5)+" "+mytime);
        return data+" "+mytime;
    }
    /*计算两个时间的时间差 */
    timeFn(d1) {//di作为一个变量传进来
        //如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
        var dateBegin = new Date(d1.replace(/-/g, "/"));//将-转化为/，使用new Date
        var dateEnd = new Date();//获取当前时间
        var dateDiff = dateEnd.getTime() - dateBegin.getTime();//时间差的毫秒数
        var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
        var leave1=dateDiff%(24*3600*1000)    //计算天数后剩余的毫秒数
        var hours=Math.floor(leave1/(3600*1000))//计算出小时数
        //计算相差分钟数
        var leave2=leave1%(3600*1000)    //计算小时数后剩余的毫秒数
        var minutes=Math.floor(leave2/(60*1000))//计算相差分钟数
        //计算相差秒数
        var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
        var seconds=Math.round(leave3/1000)
        console.log(" 相差 "+dayDiff+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒")
        //console.log(dateDiff+"时间差的毫秒数",dayDiff+"计算出相差天数",leave1+"计算天数后剩余的毫秒数",hours+"计算出小时数",minutes+"计算相差分钟数",seconds+"计算相差秒数");
        // datime ={
        //     day :dayDiff,
        //     when:hours,
        //     points:minutes,
        //     secons:seconds
        // }
        if(dayDiff <= 0 && hours <= 0)//相差0天，是规定领取时间，否则不是领取时间
        {
            return true;
        }
        return true;
    }
    /*pager函数发送 */
    fureturn(code,message,data)
    {
        let pager = {
            code : code,
            message :message,
            data : data
        }
        return pager;
    }
    /**
     * 当前时间转换为时间戳
     * **/
    getTimeStamp(time)
    {
        var date = (new Date(Date.parse(time.replace(/-/g,"/")))).getTime() / 1000;
        return date;
    }
    //日期加天数的方法
    //dataStr日期字符串
    //dayCount 要增加的天数
    //return 增加n天后的日期字符串
    dateAddDays(dataStr,dayCount)
    {
        // var strdate=dataStr; //日期字符串
        var isdate = new Date(dataStr.replace(/-/g,"/"));  //把日期字符串转换成日期格式
        isdate = new Date((isdate/1000+(86400*dayCount))*1000);  //日期加1天
        var pdate = isdate.getFullYear()+"-"+(isdate.getMonth()+1)+"-"+(isdate.getDate()) + " " +(isdate.getHours()) +":"+ (isdate.getMinutes()) +":"+(isdate.getSeconds());   //把日期格式转换成字符串

        return pdate;
    }
    /*分割时间与积分 */
    SptimeCode(queryExCd)
    {
        let temp = [];
        let exdatatime=JSON.parse(queryExCd.data[0].getpointtime);
        for(let i = 1;i<=this.getJsonLength(exdatatime);i++)
        {
            for(let item in exdatatime[i])
            {
                let that = exdatatime[i];
                temp.push({time:item,value:that[item]});
            }
        }
        return temp;
    }
    //时间日期补0
	getNowFormatDate(time) {
		var day = new Date(time);
		var Year = 0;
		var Month = 0;
		var Day = 0;
		var h = 0;
		var mm = 0;
		var s = 0;
		var CurrentDate = "";
		//初始化时间
		Year = day.getFullYear();
		Month = day.getMonth() + 1;
		Day = day.getDate();
		h = day.getHours();
        	mm = day.getMinutes();
        	s = day.getSeconds();
		CurrentDate += Year + "-" ;
		if (Month >= 10) {
			CurrentDate += Month + "-";
		}
		else {
			CurrentDate += "0" + Month + "-";
		}
		if (Day >= 10) {
			CurrentDate += Day + " ";
		}
		else {
			CurrentDate += "0" + Day + " ";
		}
		if (h >= 10) {
			CurrentDate += h + ":";
		}
		else {
			CurrentDate += "0" + h + ":";
		}
		if (mm >= 10) {
			CurrentDate += mm + ":";
		}
		else {
			CurrentDate += "0" + mm + ":";
		}
		if (s >= 10) {
			CurrentDate += s;
		}
		else {
			CurrentDate += "0" + s;
		}
		return CurrentDate;
	}
}

module.exports = new Util();
