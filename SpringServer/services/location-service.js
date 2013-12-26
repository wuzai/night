var Province = require('../model/Province').Province;
var City = require('../model/City').City;
var Area = require('../model/Area').Area;

//获取所有的省-市-县区
var findAllProvinceCityArea = function (callback) {
  Province.find(function (err, provinceList) {
    var provinceLen = provinceList.length;
    var provinceList_data = [];

    function provinceLoop(i) {
      if (i < provinceLen) {
        var province = provinceList[i];
        var province_data = {
          _id       :province._id,
          provinceID:province.provinceID,
          province  :province.province
        }
        findCityAndAreaByProvinceID(province.provinceID, function (err, result_city) {
          if (!err && result_city.cities) {
            province_data.cities = result_city.cities;
          } else {
            province_data.cities = [];
          }
          provinceList_data.push(province_data);
          provinceLoop(i + 1);
        });
      } else {
        callback(err, {provinces:provinceList_data});
      }
    }

    provinceLoop(0);
  });
};

//获取省provinceID下的市-县区
var findCityAndAreaByProvinceID = function (provinceID, callback) {
  City.find({fatherID:provinceID}, function (err, cityList) {
    var cityLen = cityList.length;
    var cityList_data = [];

    function cityLoop(i) {
      if (i < cityLen) {
        var city = cityList[i];
        var city_data = {
          _id     :city._id,
          fatherID:city.fatherID,
          cityID  :city.cityID,
          city    :city.city
        }
        findAreaByCityID(city.cityID, function (err, result_area) {
          if (!err && result_area.areas) {
            city_data.areas = result_area.areas;
          } else {
            city_data.areas = [];
          }
          cityList_data.push(city_data);
          cityLoop(i + 1);
        });
      } else {
        callback(err, {cities:cityList_data});
      }
    }

    cityLoop(0);
  });
};

//获取市cityID下的县区
var findAreaByCityID = function (cityID, callback) {
  Area.find({fatherID:cityID}, function (err, areaList) {
    callback(err, {areas:areaList});
  });
};


module.exports = {
  findAllProvinceCityArea:findAllProvinceCityArea
};