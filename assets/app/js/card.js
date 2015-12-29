  var select1=document.getElementById('select_1');//按键1选择框
  var select2=document.getElementById('select_2');//按键2选择框
  var select3=document.getElementById('select_3');//按键3选择框

  // $(document).ready(function(){

//各按钮点击事件：
btnOnClick();

//各articleshow事件：
articleshow();

//各种全局函数：

//获取设备后添加到ul listview中
function ulAddLi(){
  var refresh = A.Refresh('#article_cardcenter');
  var ul=$('#lv_device');
  ul.html('');//先清空ul
  var arr=user_bind_deivce_obj.data.devices;
  var len=arr.length;
  for (var i = 0; i < len; i++) {
    var nick=arr[i].nick==null?"未设置昵称":arr[i].nick;
    var status=(arr[i].status==null||arr[i].status=='0')?"已关机":"已开机";
    var volume=arr[i].volume==null?"-":arr[i].volume;
    var electricity=arr[i].electricity==null?"-":arr[i].electricity;
    var picture=(arr[i].picture==null||arr[i].picture=='')?default_device_pic_url:arr[i].picture;
    var li='<li href="section_device_main.html?id='+i+'" data-toggle="section"><div class="img appimg"><img class="am-circle" src="'+picture+'" width="60px" height="60px" /></div><i class="icon-color-blue ricon iconfont iconline-arrow-right"></i><div class="text">'+nick+'<small>'+status+'<br/>电量'+electricity+' | 音量'+volume+'</small></div> </li>';
    ul.append(li);
  }

  refresh.refresh();
  // ul.html(li);

}

function redirectToCardCenter(){
  setTimeout(function(){
    document.location="http://lamp.snewfly.com/card_center_page";
  },800);//有点延迟才友善
  
}

function getCurrentDeviceType(){
  return user_bind_deivce_obj.data.devices[current_device_position].device_type;
}

function getCurrentDeviceId(){
  return user_bind_deivce_obj.data.devices[current_device_position].device_id;
}

function getCurrentDeviceHeadUrl(){
  var obj= user_bind_deivce_obj.data.devices[current_device_position];
  return (obj.picture==null||obj.picture=='')?default_device_pic_url:obj.picture;
}

function initViewByDeviceType(){
  if (getCurrentDeviceType()!='kqk') {
    $('#btn_school_manage').show();
    $('#btn_remote_shutdown').show();
    $('#form_volume').show();
    $('#form_key_phone').show();

  }else{
    $('#btn_school_manage').hide();
    $('#btn_remote_shutdown').hide();
    $('#form_volume').hide();
    $('#form_key_phone').hide();

  }
}


//首次打开设备管理页面设置设备的音量，可否开关机等 重复了
/*function initCardSettings(){
  if (user_bind_deivce_obj!=null && user_bind_deivce_obj.data.devices.length>current_device_position) {
    var obj=user_bind_deivce_obj.data.devices[current_device_position];
            var volume=obj.volume==null?0:obj.volume;//默认静音
            var attendance_notice=obj.flag_attendance_notice==1?1:0;//到离校通知1开启

          }
        }*/


//handle succ result callback section:

function defaultSuccCallback(data){
  if (data.errcode==0) {
    // A.showToast("提交成功");
  }else{
    A.showToast(data.errmsg);
  }
}

function handleDeteleDevice(data) {
  if (data.errcode==0) {
    A.showToast("删除成功");
    redirectToCardCenter();

  }else{
    A.showToast(data.errmsg);
  }
}

function handleWechatinfo(data) {
  if (data.nickname!=null) {
    user_info_obj=data;
    $('#img_userhead').attr('src',data.headimgurl);
    default_owner_pic_url=data.headimgurl;
    $('#sp_user_name').html(data.nickname);
  }
}

function handleGetMsgCenter(data) {
          //TODO 
        }

        function handleQueryDevice(data) {
          if (data.errcode!=null) {
            user_bind_deivce_obj=data;
            if (user_bind_deivce_obj.data.devices.length!=0) {
              //添加设备到列表
              ulAddLi();
            };
          }
        }

        function handleSubmitEditDevice(data) {
          if (data.errcode==0) {
            A.showToast("提交成功");
            redirectToCardCenter();

          }else{
            A.showToast(data.errmsg);
          }
        }

        function handleGetBindPhoneByImei(data) {
          if (data.errcode==0) {
              //#TODO {"errcode":0,"errmsg":"ok","data":[{"userid":"c_4QQ9PnAv3aPG626IGZ5x","userphone":"13590213451","openid":"123","username":"456"},{"userid":"c_4QQ9PnAv3aPG626IGZ5y","userphone":"13590211122","openid":"456","username":"789"}]}
              var arr=data.data;
              
              for (var i = 0; i < arr.length; i++) {

                if (!jsSelectIsExitItem(select1, arr[i].userphone)) {
                  addSelect(select1,arr[i].userphone,arr[i].userphone);
                  addSelect(select2,arr[i].userphone,arr[i].userphone);
                  addSelect(select3,arr[i].userphone,arr[i].userphone);
                }
              }
              setKeypressState();

              hasSetBind=true;
            }
            checkSessionTimeout(data.errcode);
          }

          function toEditType(){
            $('#title_card_edit').html("编辑设备");
            $('#edit_pwd_right').hide();
            $('#edit_pwd_left').hide();
            $('#edit_pwd_hr').hide();
            $('#ic_device_delete').show();
          }

          function toAddType(){
            $('#title_card_edit').html("添加设备");
            $('#edit_pwd_right').show();
            $('#edit_pwd_left').show();
            $('#edit_pwd_hr').show();
            $('#ic_device_delete').hide();
          }

//修改设备编辑页面
function changeType(){
        var params = A.Component.params('#section_card_edit');//获取所有参数
        current_edit_type=params.type;
        if (current_edit_type==2) {//编辑设备
          toEditType();

          //et 自动填入
          if (user_bind_deivce_obj!=null && user_bind_deivce_obj.data.devices.length>current_device_position) {

            var obj=user_bind_deivce_obj.data.devices[current_device_position];
            var nick=obj.nick==null?"未设置昵称":obj.nick;
            var IMEI=obj.device_id;
            var sex=obj.sex==null?"男":obj.sex;
            $('#edit_imei').val(IMEI);
            $('#edit_nick').val(nick);
            if (sex=='男') {
              $('#male').attr("checked",true);
            }else{
              $('#female').attr("checked",true);
            }
          //TODO pic
        }

        }else{//undefined
          toAddType();
        }
      }

//修改设备详情页面
function changeDeviceDetail(){
  if (user_bind_deivce_obj!=null && user_bind_deivce_obj.data.devices.length>current_device_position) {
    var obj=user_bind_deivce_obj.data.devices[current_device_position];
    var nick=obj.nick==null?"未设置昵称":obj.nick;
    var status=(obj.status==null||obj.status=='0')?"已关机":"已开机";
    var volume=obj.volume==null?"-":obj.volume;
    var electricity=obj.electricity==null?"-":obj.electricity;
    var picture=(obj.picture==null||obj.picture=='')?default_device_pic_url:obj.picture;
    $('#img_device_main_head').attr("src",picture);
    $('#title_device_main').html(nick);
    $('#device_main_status').html(status);
    $('#device_main_electricity').html('电量 '+electricity);

  }
}

//获取绑定此设备的手机号
function getBindPhoneByImei(){
  if (hasSetBind) {
    return ;
  }
  if (user_bind_deivce_obj!=null && user_bind_deivce_obj.data.devices.length>current_device_position) {
    var obj=user_bind_deivce_obj.data.devices[current_device_position];
    var IMEI=obj.device_id;
    ajax_get("/getBindPhoneByImei?r="+Math.random()+'&imei='+IMEI,handleGetBindPhoneByImei);
  }
}

//设置音量展示给用户
function setVolumeSelect(volume){
  if (volume==0) {
    $('#vol_0').attr("checked",true);
  }
  else if (volume<2) {
    $('#vol_1').attr("checked",true);
  }else if(volume>=2 && volume<4){
    $('#vol_2').attr("checked",true);
  }else{
    $('#vol_3').attr("checked",true);
  }
}

//到离校通知
function setAttendanceToggle(attendance_notice){
  var isToggleActive=getIsToggleActive('toggle_attendance');
  if (attendance_notice==0) {
    if (isToggleActive==1) {
      $('#toggle_attendance').removeClass('active');
    }
  }else{
    if (!isToggleActive) {
      $('#toggle_attendance').addClass('active');
    }
  }
}

function submitManageSettings(){
  if (user_bind_deivce_obj!=null && user_bind_deivce_obj.data.devices.length>current_device_position) {
    var obj=user_bind_deivce_obj.data.devices[current_device_position];
    var IMEI=obj.device_id;
    var quick_dial=select_1.value+","+select_2.value+","+select_3.value;
    var volume=$('#select_volume input[name="volume"]:checked').val();
          volume=volume==undefined?0:volume;//电脑端可取消点击问题& 服务器端0-6
          ajax_get("/submitManageSettings?quick_dial="+quick_dial+"&volume="+volume+"&imei="+IMEI,defaultSuccCallback);

        }
      }

      function submitToggleAttendance(){
        var isToggleActive=getIsToggleActive('toggle_attendance');
        if (user_bind_deivce_obj!=null && user_bind_deivce_obj.data.devices.length>current_device_position) {
          var obj=user_bind_deivce_obj.data.devices[current_device_position];
          var IMEI=obj.device_id;
    var attendance_notice=obj.flag_attendance_notice==1?1:0;//到离校通知1开启
    if (isToggleActive!=attendance_notice) {//如果没变化就不提交，变化了提交
      ajax_get("/submitToggleAttendance?flag="+isToggleActive+"&imei="+IMEI);//暂时不需要成功提示
      user_bind_deivce_obj.data.devices[current_device_position].flag_attendance_notice=isToggleActive;
    }
    A.showToast('提交完成');
    
  }
}

//@return 1=true,0=false
function getIsToggleActive(toggleId){
  if ($('#'+toggleId).hasClass('active')) {
    return 1;
  }
  return 0;
}

/*function setSwitchSelect(flag_shutdown){
      if (flag_shutdown==0) {//不可关
        $('#closerdo1').attr("checked",true);
      }
      else{
        $('#closerdo2').attr("checked",true);
      }
    }*/


    function setVolumeAndSwtich(){
      if (user_bind_deivce_obj!=null && user_bind_deivce_obj.data.devices.length>current_device_position) {
        var obj=user_bind_deivce_obj.data.devices[current_device_position];
        var volume=obj.volume==null?0:obj.volume;
        var attendance_notice=obj.flag_attendance_notice==1?1:0;//到离校通知1开启
        // var flag_shutdown=obj.flag_shutdown==null?0:obj.flag_shutdown;
        setVolumeSelect(volume);
        setAttendanceToggle(attendance_notice);
        // setSwitchSelect(flag_shutdown);//取消这个功能了

      }
    }

    //设置学生卡按键选中项
    function setKeypressState(){
      if (user_bind_deivce_obj!=null && user_bind_deivce_obj.data.devices.length>current_device_position) {
        var obj=user_bind_deivce_obj.data.devices[current_device_position];
        var quick_dial=obj.quick_dial;
        if (quick_dial==null || quick_dial=='') {

        }else{
          var arr=quick_dial.split(",",3);
          setSelectedItem(select1,arr[0]);
          if (arr.length>1) {
            setSelectedItem(select2,arr[1]);
          }
          if (arr.length>2) {
            setSelectedItem(select3,arr[2]);
          }
        }

      }
    }

      /*
        * 自定义一个select添加器 js版
        * @param select 选择器对象
        * @param value 值
        * @param text 展示的名字
        */
        function addSelect(select,value,text){
          // select.append('<option value="' + value +'"> ' + name + '</option>');
          var varItem = new Option(text, value);
          select.options.add(varItem);
        }

        /*
        * 判断select选项中 是否存在Value="paraValue"的Item js版
        * @return boolean true 存在，false 不存在
        */
        function jsSelectIsExitItem(objSelect, objItemValue) {
          var isExit = false;
          for (var i = 0; i < objSelect.options.length; i++) {
            if (objSelect.options[i].value == objItemValue) {
              isExit = true; 
              break; 
            }
          }
          return isExit;  
        } 

        /*
        * 如果select选项中存在制定text，将其设置为选中
        * @return boolean true 设置成功，false 不存在
        */
        function setSelectedItem(objSelect,objItemText){
          for (var i = 0; i < objSelect.options.length; i++) {
            if (objSelect.options[i].text == objItemText) {
              objSelect.options[i].selected = true;
              return true;
            }
          }
          return false;
        }

      /*
        * 检查用户时候登录过期
        * @return true 过期，false 没过期
        */
        function checkSessionTimeout(code){
        if (code==110) {//超时
          //TO DO 超时提示用户，redirect to auth
          A.showToast('登录超时');
          return true;
        }
        return false;
      } 



//提交设备编辑页面
function submitEditDevice(){

  var imei=$('#edit_imei').val();
  var pwd=$('#edit_pwd').val();
  var nick=$('#edit_nick').val();
        var sex=$('#radio_group_sex input[name="sex"]:checked').val();//男、女
        var pic=$('#iconInfos').val();//男、女

        if (imei=="" || nick=="") {
          A.showToast('设备信息未填写完整');
          return ;
        }
        if (current_edit_type==2) {//编辑设备
          ajax_submitEditDevice(imei,pwd,nick,sex,pic,2);

        }else{//undefined 添加设备
          if (pwd=="") {
            A.showToast('未输入设备密码');
            return ;
          }
          ajax_submitEditDevice(imei,pwd,nick,sex,pic,1);
        }
      }

      //type=1添加2编辑
      function ajax_submitEditDevice(imei,pwd,nick,sex,pic,type){
        if (imei!='' && nick!='' && sex!='' && pic!='') {
          //type=1添加2编辑
          var url="/submitEditDevice?r="+Math.random()+'&imei='+imei+'&nick='+nick+'&pwd='+pwd+'&sex='+sex+'&pic='+pic+'&type='+type;
          ajax_get(url,handleSubmitEditDevice);
        }
      }




    //获取设备最新状态信息
    function card_getTerminalStatus(){
      $.ajax({
        url:"/card_getTerminalStatus?r="+Math.random(),
        type:"get",
        dataType: "xml",
        success: function (data) {
          if($(data).find('Code').text()=='200'){
            var Lat=$(data).find('Lat').text();
            var Lng=$(data).find('Lng').text();
            var OrgiLat=$(data).find('OrgiLat').text();
            var OrgiLng=$(data).find('OrgiLng').text();
            var LastGpsTime=$(data).find('LastGpsTime').text();
            var IsGps=$(data).find('IsGps').text();
            var LastGpsTime=$(data).find('LastGpsTime').text();
            var Battery=$(data).find('Battery').text()+'%';
            var OnlineStatus=$(data).find('OnlineStatus').text()=='0'?'关机':'开机';
        var locateType=IsGps=='0'?'GSM':'GPS';//定位类型


        $('#time_type').html(LastGpsTime+'  '+locateType);
        $('#card_status').html(OnlineStatus+' 电量'+Battery);
        card_last_lat=Lat;
        card_last_lng=Lng;
        card_last_update_time=LastGpsTime;

        card_getGeoReverse(Lat,Lng,OrgiLat,OrgiLng,IsGps);
      }else{
        A.showToast('错误码：'+$(data).find('Code').text()+" "+$(data).find('Info').text());
      }
    },
    error: function (msg) {
      A.showToast('网络错误');
    }
  });
}
    //经纬度转实际地址
    function card_getGeoReverse(Lat,Lng,OrgiLat,OrgiLng,IsGps){
      if (Lat!='' && Lng!='' && OrgiLat!='' && OrgiLng!='' && IsGps!='') {
        $.ajax({
          url:"/card_getGeoReverse?r="+Math.random()+'&orgiLat='+OrgiLat+'&orgiLng='+OrgiLng+'&lat='+Lat+'&lng='+Lng+'&isGps='+IsGps,
          type:"get",
          dataType: "xml",
          success: function (data) {
            if($(data).find('Code').text()=='200'){
              var address=$(data).find('Address').text();
              if (address!='') {
                card_last_location=address;
                $('#last_location').html(address);
              }

            }else{
              A.showToast('错误码：'+$(data).find('Code').text()+" "+$(data).find('Info').text());
            }
          },
          error: function (msg) {
            A.showToast('网络错误');
          }
        });
      }

    }

    //获取微信用户信息
    function getWechatinfo(){
      if (user_info_obj==null) {
        ajax_get("/wechatinfo",handleWechatinfo);
      }
    }

    //获取用户绑定设备
    function getBindDevice(){
      if (user_bind_deivce_obj==null) {
        ajax_get("/queryDevice",handleQueryDevice);
      }
    }

    //获取消息中心的信息
    function card_getMsgCenter(){
      ajax_get("/card_getMsgCenter?r="+Math.random(),handleGetMsgCenter);
    }


    //设置按钮点击事件
    function btnOnClick(){

      $('#ic_device_delete').on(A.options.clickEvent, function(){
        var imei=$('#edit_imei').val();
        if ($('#edit_imei').val()!='') {
          A.confirm('提示','确定要删除此设备吗',
            function(){
              // 确定
              ajax_get('/deleteDevice?imei='+imei,handleDeteleDevice);
            },
            function(){
              // 取消
            });
        }

        return false;
      });

      //编辑/添加设备提交按钮
      $('#btn_edit_submit').on(A.options.clickEvent, function(){
        submitEditDevice();
        return false;
      });

      //设备管理提交按钮
      $('#btn_manage_setting_submit').on(A.options.clickEvent, function(){
        if (getCurrentDeviceType()!='kqk') {
          submitManageSettings();
        }
        
        submitToggleAttendance();
        return false;
      });

       //定位按钮
       $('#btn_location').on(A.options.clickEvent, function(){
          // 跳转定位页面
          A.Controller.section('#section_trace');
          return false;
        });

       //校园管理按钮
       $('#btn_school_manage').on(A.options.clickEvent, function(){
          // 跳转校园管理页面
          A.Controller.section('#section_school_manage');
          return false;
        });

       //消息中心
       $('#sp_msg_center').on(A.options.clickEvent, function(){
          // 跳转消息中心
          A.Controller.section('#section_msgcenter');
          return false;
        });
       
       //设备管理
       $('#sp_card_change').on(A.options.clickEvent, function(){
          // 跳转设备管理（号码设置）
          A.Controller.section('#section_card_manage');
          return false;
        });

       //添加设备
       $('#btn_addDevice').on(A.options.clickEvent, function(){
          // 跳转学生卡管理
          A.Controller.section('#section_card_edit');
          return false;
        });

              //选择头像
              $('.head-img').on(A.options.clickEvent, function(){
                var t=$(this);
                if(previewSelected){
                  previewSelected.css("border","0px");
                }
                t.css("border","solid 1px #3779D0");
                previewSelected=t;
                document.getElementById("iconInfos").value=t.attr("src");
                return false;
              });
            }

    //监听articleshowshow事件（核心）
    function articleshow(){

      //article和section 状态切换：
      //articleload只在初次载入执行，若每次打开刷新应使用articleshow
/*      $('#article_msgcontent').on('articleload', function(){
        // var params = A.Component.params(this);//获取所有参数
        A.showToast('article_msgcontent--articleload');
      });*/

//一般当Article为refresh组件的时候，都是通过监听refresh初始化事件（refreshInit）而不是监听articleload或者articleshow事件，因为前者通常比后者晚触发，所以如果需要异步加载数据可能会出现refresh组件尚未初始化的情况，所以一般建议在refreshInit中执行注入等操作。
      $('#article_cardcenter').on('refreshInit', function(){//首页每次展示调用，考虑到频繁recreate，以后可以使用articleload
        getWechatinfo();
        getBindDevice();

      });

            //当scroll初始化会进入此监听
            $('#article_device_main').on('scrollInit', function(){
      var scroll = A.Scroll(this);//已经初始化后不会重新初始化，但是可以得到滚动对象
      //监听滚动到顶部事件，可以做一些逻辑操作
      scroll.on('scrollTop', function(){
          // A.showToast('滚动到顶部');
          scroll.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域
        });
      //监听滚动到底部事件，可以做一些逻辑操作
      scroll.on('scrollBottom', function(){
          // A.showToast('滚动到底部');
          scroll.refresh(); //如果scroll区域dom有改变，需要刷新一下此区域，
        });
    });

            $('#article_cardcenter').on('articleshow', function(){//首页每次展示调用，考虑到频繁recreate，以后可以使用articleload

            });

      $('#article_card_edit').on('articleshow', function(){//设备添加编辑每次展示调用
        changeType();
      });

      $('#article_msgcontent').on('articleshow', function(){//消息中心每次展示调用
        card_getMsgCenter();
      });


      $('#article_device_main').on('articleshow', function(){//设备详情每次展示调用
          var params = A.Component.params('#section_device_main');//获取所有参数
          current_device_position=params.id==null?0:params.id;
          changeDeviceDetail();
          getBindPhoneByImei();
          setVolumeAndSwtich();
          initViewByDeviceType();
          //TODO 其他页面的设置
        });



      $('#article_card_manage').on('refreshInit', function(){//设备管理页面每次展示调用,只首次刷新
        // initCardSettings();
      });
      $('#article_trace').on('articleshow', function(){//轨迹页面每次展示调用

        var map = new BMap.Map("container");// 创建地图实例 
        map.addControl(new BMap.NavigationControl());    
        map.addControl(new BMap.ScaleControl());    
        map.addControl(new BMap.OverviewMapControl());    
        map.addControl(new BMap.MapTypeControl());
        ShenZhen ();
        if (card_last_lat!='') {
          // alert(card_last_lng);
          setTimeout(function(){
            LocalMap (card_last_lng,card_last_lat,card_last_location);
          }, 500);
          
        }else{
          ShenZhen ();
        }
/*
        // refresh();
        $("#dingwei").click(function  (event) {
          // $("div.test").replaceWith('<div class="test"><li>用户名：读取中... | 更新时间：读取中... | 电池电量：读取中... | 定位方式：读取中...</li><li id="weizhi">所在位置：读取中...</li></div>');
          LocalMap ('116.422792','40.009471','GPS');
        });*/



//各种函数：


//当数组为空时定位到深圳
function ShenZhen () {
  map.centerAndZoom("深圳", 12);  
}

/*function refresh(){
  $('#dingwei').click();
}*/

/*
* @param GPS 中文地理位置
*/
function LocalMap (lng,lat,GPS) {
  map.clearOverlays();
    lng = parseFloat(lng) + 0.01185;//经度校正
    lat = parseFloat(lat) + 0.00328;//纬度校正
    map.setZoom(17);
    map.panTo(new BMap.Point(parseFloat(lng),parseFloat(lat)), 17);
    map.enableScrollWheelZoom(true);
    var opts = {
                width : 250,     // 信息窗口宽度
                height: 80,     // 信息窗口高度
                title : "所在位置" , // 信息窗口标题
                enableMessage:true//设置允许信息窗发送短息
              };
    var point = new BMap.Point(parseFloat(lng),parseFloat(lat)); //创建一个坐标点
    var marker = new BMap.Marker(point);  // 创建标注
    var content = GPS;
    map.addOverlay(marker);               // 将标注添加到地图中
    marker.setAnimation(BMAP_ANIMATION_BOUNCE); //标记点跳动效果    
    if(content ==""){

      var geoc = new BMap.Geocoder();
        // var point = new BMap.Point(parseFloat(lng),parseFloat(lat));
        geoc.getLocation(point,function  (rs) {
          var addComp = rs.addressComponents;
          var content = addComp.province +
          addComp.city +
          addComp.district +
          addComp.street +
          addComp.streetNumber;
          $("#weizhi").replaceWith('<li id="weizhi">所在位置：' + content + '附近</li>');
          addClickHandler(content,marker);
        })
      } else {
        addClickHandler(content,marker); //如果数据库存在位置信息则调用数据库的位置信息
      }


      function addClickHandler(content,marker){
        marker.addEventListener("click",function(e){
          openInfo(content,e)}
          );
      }
      function openInfo(content,e){
        var p = e.target;
        var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
        var infoWindow = new BMap.InfoWindow(content+"附近",opts);  // 创建信息窗口对象 
        map.openInfoWindow(infoWindow,point); //开启信息窗口
      }
    }
  });
}

// });
