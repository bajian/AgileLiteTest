// jQuery(document).ready(function($) {


var timeIntervalId;//刷新音频时间的Interval Id
var currentAudio=null; //当前播放音频对象
var currentAudioId=""; //当前播放音频id
var isRecording=false;//是否在录音
var Max_MSG_LENGTH=10;//最多10条消息记录
var commit=1;//对话条数

var TEXT_ME=0;
var TEXT_USER=1;

var EXTRA_REC_AUDIO_V1='0101001';

/**
* 获得当前时间 格式06-26 20:23:50 r="now" 为当前时间
*/
function curDateTime(r){var p,o,n,m,l,k,f,q=new Date;return"now"!=r&&(p=parseInt(r),10==r.length?q.setTime(1000*p):q.setTime(p)),o=q.getMonth()+1,n=q.getDate(),q.getDay(),m=q.getHours(),l=q.getMinutes(),k=q.getSeconds(),f="",f=o>9?f+o+"-":f+"0"+o+"-",f=n>9?f+n+" ":f+"0"+n+" ",f=m>9?f+m+":":f+"0"+m+":",f=l>9?f+l+":":f+"0"+l+":",k>9?f+=k:f=f+"0"+k,f};

//播放/暂停
function clicks(audioId,controlId) {

  var audio = document.getElementById(audioId);

  var controlObj=$("#"+controlId);
  if (controlObj.hasClass("play")) {
    controlObj.addClass("pause").removeClass("play");
            audio.play();//开始播放
            controlObj.html("暂停");
          }else {
            controlObj.addClass("play").removeClass("pause");
            controlObj.html("播放");
            audio.pause();
          }
        }

//播放时间
function timeChange(time, timePlaceId) {//默认获取的时间是时间戳改成我们常见的时间格式
    //分钟
    var minute = time / 60;
    var minutes = parseInt(minute);
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    //秒
    var second = time % 60;
    seconds = parseInt(second);
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var allTime =  minutes  + ":" + seconds ;
    var timePlace = document.getElementById(timePlaceId);
    timePlace.innerHTML = allTime;
  }


//播放事件监听
function prepareSong(audioId,controlId,TimePlaceId,currentTimeId){
  clearInterval(timeIntervalId);
  console.log("prepareSong");
  if (currentAudio!=null) {
    if (currentAudioId!=audioId) {
      currentAudio.currentTime=0;
    }
    currentAudio.pause();
    clearInterval(timeIntervalId);
  }

  var audio = document.getElementById(audioId);
  currentAudio=audio;
  currentAudioId=audioId;
  var controlObj=$("#"+controlId);
    timeChange(audio.duration, TimePlaceId);//设置全长时间
    

    if ($("#"+controlId).hasClass('play')) {
      setTimeout(function(){
        timeIntervalId =setInterval(function() {
        timeChange(audio.currentTime, currentTimeId);//刷新播放进度时间
        console.log("time.currentTime");

      }, 400);
      },100);
    }


    clicks(audioId,controlId);

    audio.addEventListener("pause",
        function() { //监听暂停
          console.log("pause");
          controlObj.addClass("play").removeClass("pause");
          controlObj.html("播放");
          clearInterval(timeIntervalId);
          if (audio.currentTime == audio.duration) {
            audio.currentTime = 0;
                // audio.stop();
              }
            }, false);
    audio.addEventListener("play",
        function() { //播放
          console.log("play");
          controlObj.addClass("pause").removeClass("play");
          controlObj.html("暂停");
        }, false);

    audio.addEventListener("ended", function() {
      console.log("ended");
      clearInterval(timeIntervalId);
      currentAudio=null;
    }, false);
  }
//audio end

//重置录音按钮
function resetRecordBtn(){
  isRecording=false;
  $('#startRecord').removeAttr('disabled');
  $('#startRecord').removeClass('disable');
  $('#uploadVoice').attr("disabled",true);
  $('#uploadVoice').removeClass('submit').addClass('disable');
  $('#stopRecord').attr("disabled",true);
  $('#stopRecord').removeClass('cancel').addClass('disable');
}
//将录音状态设置禁止
function setRecordBtn(){
  isRecording=true;
  $('#startRecord').attr("disabled",true);
  $('#startRecord').addClass('disable');

  $('#uploadVoice').attr("disabled",false);
  $('#uploadVoice').removeClass('disable').addClass('submit');

  $('#stopRecord').attr("disabled",false);
  $('#stopRecord').removeClass('disable').addClass('cancel');
}

      //wechat
      wx.ready(function () {
        wx.hideOptionMenu();
        $('#startRecord').removeAttr('disabled');
        $('#startRecord').removeClass('disable');

          // 4.2 开始录音
          $('#startRecord').on(A.options.clickEvent, function(){

            if (getCurrentDeviceType()=="kqk") {
              A.showToast(TIPS_NOT_SUPPORT_ACTION);
              return;
            }
            setRecordBtn();
            A.showToast("startRecord");
            wx.startRecord({
              cancel: function () {
                A.showToast('用户拒绝授权录音');
                $('#stopRecord').click();
              }
            });
          });


          $('#stopRecord').on(A.options.clickEvent, function(){
            console.log('stopRecord');
            wx_stopRecord();

          });


          function wx_stopRecord(){
            wx.stopRecord({
              success: function (res) {
                voice.localId = res.localId;
                if (!isRecording) {
                  resetRecordBtn();
                  wx_uploadRecord();
                }else{

                  voice.localId = "";
                  resetRecordBtn();
                }
              },
              fail: function (res) {
                resetRecordBtn();
                A.showToast('录音失败，请重试');
              }
            });
          }

          // 4.4 监听录音自动停止
          wx.onVoiceRecordEnd({
            complete: function (res) {
              voice.localId = res.localId;
              resetRecordBtn();
              A.showToast('录音时间已超过一分钟,自动停止');
            }
          });

        //
        $('#uploadVoice').on(A.options.clickEvent, function(){
          if (getCurrentDeviceType()=="kqk") {
            A.showToast(TIPS_NOT_SUPPORT_ACTION);
            return;
          }
          console.log('uploadVoice');
          
          if (!isRecording) {
                  //先暂停录音再上传
                  A.showToast('请先录音');
                  return ;
                }
                resetRecordBtn();
                wx_stopRecord();
              });


        function wx_uploadRecord(){
          if (voice.localId == '') {
            A.showToast('请先录制一段声音');
            return;
          }
          wx.uploadVoice({
            localId: voice.localId,
            success: function (res) {
              voice.localId = '';
                      // alert('上传语音成功，serverId 为' + res.serverId);
                      voice.serverId = res.serverId;
                      ajax_get("/card_downloadVoice?media_id="+voice.serverId+"&device_id="+getCurrentDeviceId()+"&r="+Math.random(),handleDownloadVoice);
                      isRecording=false;
                    }
                  });
        }

//将服务器返回的url发给app
function sendAudioToApp(url,extra){
  var content=null;
  if (getCurrentSelectedDeviceVer()==DEVICE_VER_1) {
    content=RongIMClient.TextMessage.obtain(toMsg(url));
    content.setExtra(extra);
  }else{
    content=RongIMClient.TextMessage.obtain(url);
    content.setExtra(EXTRA_SEND_AUDIO_V2);
  }
  rongyunSendMsg(DeviceId,content,'语音发送成功','语音发送失败');
}


function handleDownloadVoice(data){
  if (data.errcode==0) {
    writeToChatLog(data.data,TEXT_ME,'我','now',default_owner_pic_url);
  }else if (data.errmsg!='') {
    A.showToast(data.errmsg);
  }else{
    A.showToast('未知错误，请联系管理员');
  }
}

          // 3 智能接口
          var voice = {
            localId: '',
            serverId: ''
          };

        });



  //将音频写到对话框里
  function writeToChatLog(audio_url,message_type,from,tm,header_url,msg_id)
  {
    // var refresh = A.Refresh('#article_device_main');
    if (header_url==undefined) {
      header_url=default_device_pic_url;
    }

    if (msg_id==undefined) {
      msg_id=commit;
    }

    var s=document.getElementById('list_audio');
    if(commit>=Max_MSG_LENGTH){
      var t=s.childNodes.length;
      s.removeChild(s.childNodes[s.childNodes.length-1]);
    }
    commit++;
    var li= document.createElement("div");
    if(message_type==TEXT_ME){
     li.innerHTML='<li class="am-comment-success am-animation-slide-right am-comment-flip" style="margin: 3px auto;text-align: center"><a href="#"><img src='+header_url+' alt="头像" class="am-comment-avatar" width="48" height="48"/></a><div class="am-comment-main"><div class="am-comment-hd"><div class="am-comment-meta"><a class="am-comment-author">'+from+'</a><time>&nbsp;'+curDateTime(tm)+'</time></div></div><div class="am-comment-bd"><p><div class="div_audio"><button id="control'+msg_id+'" class="control play" onclick="prepareSong(\'audio'+msg_id+'\',\'control'+msg_id+'\',\'allTime'+msg_id+'\',\'currentTime'+msg_id+'\');">播放</button><audio id="audio'+msg_id+'" preload="true"><source src="'+audio_url+'">浏览器不支持音频</audio><spam class="time_block"><span id="time"><span class="tiemDetail"><span class="currentTime" id="currentTime'+msg_id+'">00:00</span>/<span class="allTime" id="allTime'+msg_id+'">00:00</span></span></span></spam></div></p></div></div></li><br/>';
   }else if(message_type==TEXT_USER){
    li.innerHTML='<li class="am-comment-primary am-animation-slide-left" style="margin: 3px auto;text-align: center"><a href="#"><img src="'+header_url+'" alt="头像" class="am-comment-avatar" width="48" height="48"/></a><div class="am-comment-main"><div class="am-comment-hd"><div class="am-comment-meta"><a class="am-comment-author">'+from+'</a><time>&nbsp;'+curDateTime(tm)+'</time></div></div><div class="am-comment-bd"><p><div class="div_audio"><button id="control'+msg_id+'" class="control play" onclick="prepareSong(\'audio'+msg_id+'\',\'control'+msg_id+'\',\'allTime'+msg_id+'\',\'currentTime'+msg_id+'\');">播放</button><audio id="audio'+msg_id+'" preload="true"><source src="'+audio_url+'">浏览器不支持音频</audio><spam class="time_block"><span id="time"><span class="tiemDetail"><span class="currentTime" id="currentTime'+msg_id+'">00:00</span>/<span class="allTime" id="allTime'+msg_id+'">00:00</span></span></span></spam></div></p></div></div></li><br/>';
  }
  s.insertBefore(li,s.childNodes[0]);

  // refresh.refresh();
}



rongyunIni();

rongIMClientConnet();
function rongIMClientConnet(){

        //融云链接
        RongIMClient.connect(RongToken, {
          onSuccess: function (x) {
            A.showToast('TCP连接成功');

          },
          onError: function (x) {
            // console.log(x);
            A.showToast('TCP连接失败');

          }
        });
      }

      function rongyunIni(){
        RongIMClient.init(RongKey);

        if (localStorage.getItem(LS_LastReceiveTime)==null) 
          localStorage.setItem(LS_LastReceiveTime,0);
      }
      RongIMClient.setConnectionStatusListener({
        onChanged: function (status) {
              // alert("status"+status);
              if (status==RongIMClient.ConnectionStatus.CLOSURE) {
                // myAlert('您已离线，请检查您的网络');
                // var showmsg=getShowCommand('<span class="am-icon-remove"> </span>&nbsp;您已离线，请检查您的网络','danger');
                // $('#picMsgContainer').html(showmsg);
                // timeoutHandler=setTimeout("closeShowCommand()",SHOWMSG_TIME);
                //A.showToast('您已离线，请检查您的网络');
              }else if(status==RongIMClient.ConnectionStatus.OTHER_DEVICE_LOGIN){
                // myAlert('您的账号已在其他设备登录');
                // window.location="http://lamp.snewfly.com/hzsb_login_page?otherDevice=1";
              }

              if (status==RongIMClient.ConnectionStatus.CONNECTED) {
                // $('#div_online_state').hide();
                A.showToast("rongyun connected");
              }else{
                // $('#div_online_state').show();
              }
            }
          });



RongIMClient.getInstance().setOnReceiveMessageListener({
            //接收消息
            onReceived: function (data) {
              //getSentTime()//十三位
              A.showToast("onReceived");
              var con=eval('('+data.getContent()+')');
              if (localStorage.getItem(LS_LastReceiveTime)>data.getSentTime()) {
                return;
              }
              localStorage.setItem(LS_LastReceiveTime,data.getSentTime());

              switch (data.getExtra()) {
                case EXTRA_REC_AUDIO_V1:
                
                recAudio(data);
                break;

                default:
                break;
              }

            }
          });


function recAudio(data){
  var obj=eval('('+data.getContent()+')');
  if (data.getExtra()==EXTRA_REC_AUDIO_V1) {
    writeToChatLog(obj.url,TEXT_USER,obj.nick,data.getSentTime(),getCurrentDeviceHeadUrl(),obj.msg_id);
  }
}
