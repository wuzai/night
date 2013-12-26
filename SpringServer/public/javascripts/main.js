$(document).ready(function () {
  $("table.dTable").dataTable({
    //sPaginationType  : "full_numbers",
    "sDom"           :'<"table-header"fl>t<"table-footer"ip>',
    "sPaginationType":"bootstrap",
    "aaSorting"      :[],
    "oLanguage"      :{
      "sLengthMenu"    :" 每页 _MENU_ 记录",
      "sSearch"        :" 筛选  _INPUT_ ",
      "oPaginate"      :{
        "sFirst"   :"最前",
        "sLast"    :"最后",
        "sNext"    :"下页",
        "sPrevious":"上页"
      },
      "sEmptyTable"    :" 没有数据",
      "sInfo"          :" 共有 _TOTAL_ 条记录 (_START_ - _END_)",
      "sInfoEmpty"     :" 没有记录显示",
      "sInfoFiltered"  :" - 总共 _MAX_ 条记录",
      //"sInfoPostFix": "所有记录源自实时数据.",
      "sLoadingRecords":" 请稍等 - 加载中...",
      "sProcessing"    :" 数据表目前正忙",
      //sUrl": "http://www.sprymedia.co.uk/dataTables/lang.txt",
      "sZeroRecords"   :" 没有记录显示"
    }});

  $(".datepicker").datepicker({
    language:'zh-CN'
  });

  $('#breadcrumbs .breadcrumb-button.blue:first').click(function(){
    var webRoot = $("#webRoot_wehere").val();
    window.location.href = webRoot + '/dashboard';
  });
  $('.carousel .carousel-inner').mousemove(function(){
    $('a.deleteRedButtomImage').show();
  });
  $('.carousel .carousel-inner').mouseout(function(){
    $('a.deleteRedButtomImage').hide();
  });
  var setActiveNavItem = function () {
    var pathName = window.location.pathname;
    var activeHref = $('.collapse li a[href="' + pathName + '"]');
    if (activeHref.length == 0) {
      pathName = pathName.substr(0, pathName.lastIndexOf('/'));
      activeHref = $('.collapse li a[href="' + pathName + '"]');
    }
    if (activeHref.length > 0) {
      var liNode = activeHref[0].parentNode;

      liNode.className += " active";
      var ulNode = liNode.parentNode;
      ulNode.className += " in";
      ulNode.parentNode.className += " active";
    }
  };

  setActiveNavItem();
});


