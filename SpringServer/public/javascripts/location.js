$(document).ready(function () {
  var location = localStorage.location;
  var pre_locationUpdateTime = localStorage.locationUpdateTime;
  var locationUpdateTime = $('#locationUpdateTime').val();

  var initLocationBox = function (location) {
    //alert(JSON.stringify(location.provinces));
    var pro_sel = $('#selectProvince');
    var city_sel = $('#selectCity');
    var area_sel = $('#selectArea');
    var init_pro_v = pro_sel.attr('init');
    var init_city_v = city_sel.attr('init');
    var init_area_v = area_sel.attr('init');
    pro_sel.empty();
    if (location && location.provinces) {
      location.provinces.forEach(function (pro) {
        appendOptionTo(pro_sel, pro.province, pro.province, init_pro_v);
      });
    } else {
      var pro_op = $('<option/>').text('数据加载失败,请刷新页面...');
      pro_sel.append(pro_op)
    }

    var pro_one = ['北京市', '天津市', '上海市', '重庆市', '香港特别行政区', '澳门特别行政区', '台湾省'];

    function isZeroAbove(curr) {
      var flag = false;
      pro_one.forEach(function (pro) {
        if (curr == pro) {
          flag = true;
        }
      });
      return flag;
    }

    pro_sel.change(function () {
      city_sel.hide().empty();
      area_sel.hide().empty();
      var pro_curr_val = $(this).val();
      var flag = isZeroAbove(pro_curr_val);
      if (!flag && pro_curr_val) {
        location.provinces.forEach(function (pro) {
          if (pro_curr_val == pro.province) {
            if (pro.cities) {
              city_sel.show();
              pro.cities.forEach(function (city) {
                appendOptionTo(city_sel, city.city, city.city, init_city_v);
              });
            }
          }
        });
      }
      city_sel.change();
    }).change();

    city_sel.change(function () {
      area_sel.hide().empty();
      var pro_curr_val = pro_sel.val();
      var flag = isZeroAbove(pro_curr_val);
      if (!flag && pro_curr_val) {
        var city_curr_val = $(this).val();
        location.provinces.forEach(function (pro) {
          if (pro_curr_val == pro.province) {
            if (pro.cities) {
              city_sel.show();
              pro.cities.forEach(function (city) {
                if (city_curr_val == city.city) {
                  if (city.areas) {
                    city.areas.forEach(function (area) {
                      area_sel.show();
                      appendOptionTo(area_sel, area.area, area.area, init_area_v);
                    });
                  }
                }
              });
            }
          }
        });
      } else {
        location.provinces.forEach(function (pro) {
          if (pro_curr_val == pro.province) {
            if (pro.cities) {
              pro.cities.forEach(function (city) {
                if (city.areas) {
                  city.areas.forEach(function (area) {
                    area_sel.show();
                    appendOptionTo(area_sel, area.area, area.area, init_area_v);
                  });
                }
              });
            }
          }
        });
      }
    }).change();

    function appendOptionTo(o, k, v, d) {
      var opt = $("<option>").text(k).val(v);
      if (v == d) {
        opt.attr("selected", "selected")
      }
      opt.appendTo(o);
    }
  };

  var pre_d = new Date(pre_locationUpdateTime);
  var d = new Date(locationUpdateTime);
  if (location && d >= pre_d) {
    initLocationBox(JSON.parse(location));
  } else {
    var webRoot_href = $("#webRoot_href").val();
    $.getJSON(webRoot_href + '/findAllLocation', function (data, status) {
      localStorage.location = JSON.stringify(data);
      localStorage.locationUpdateTime = d;
      initLocationBox(data);
    });
  }
});
