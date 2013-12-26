$(document).ready(function () {
  $("#jquery_jplayer.jp_audio").jPlayer({
    ready   :function () {
      $(this).jPlayer("setMedia", {
        mp3:"http://www.script-tutorials.com/demos/45/media/track.mp3"
      }); // auto play
    },
    ended   :function (event) {
      //$(this).jPlayer("play");
    },
    swfPath :"js",
    supplied:"mp3"
  }).bind($.jPlayer.event.play, function () { // pause other instances of player when current one play
        $(this).jPlayer("pauseOthers");
  });

  $("#jquery_jplayer.jp_video").jPlayer({
    ready              :function () {
    },
    ended              :function (event) {
      //$("#jquery_jplayer.jp_video").jPlayer("play", 0);
    },
    size               :{
      width   :"480px",
      height  :"270px",
      cssClass:"jp-video-270p"
    },
    sizeFull           :{
      width   :"100%",
      height  :"100%",
      cssClass:"jp-video-full"
    },
    swfPath            :"swf",
    supplied           :"m4v, webma, webmv, oga, ogv, wav, fla, flv, rtmpa, rtmpv",
    backgroundColor    :"#000000",
    errorAlerts        :false,
    warningAlerts      :false,
    cssSelectorAncestor:"#jp_container.jp_video"
  }).bind($.jPlayer.event.play, function (event) { // pause other instances of player when current one play
    $(this).jPlayer("pauseOthers");
  }).bind($.jPlayer.event.error, function(event) {
    //初次加载文件时遇到错误
    //alert("Error Event: type = " + event.jPlayer.error.type);
    //alert("Error Event: message = " + event.jPlayer.error.message);
    switch(event.jPlayer.error.type) {
      case $.jPlayer.error.URL:
        alert("对不起,该视频系统不支持.");
        break;
      case $.jPlayer.error.URL_NOT_SET:
      case $.jPlayer.error.NO_SUPPORT:
      case $.jPlayer.error.NO_SOLUTION:
        alert("没有视频文件.");
        break;
    }
  });
  //判断是否是手机
  if ($.jPlayer.platform.mobile || $.jPlayer.platform.android) {
    $("#jquery_jplayer.jp_video").jPlayer({
      size:{
        width   :"100%",
        height  :"auto",
        cssClass:"jp-video-180p"
      }
    });
  }

});  