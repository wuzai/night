var Province = require('./model/Province').Province;
var City = require('./model/City').City;
var Area = require('./model/Area').Area;

var location_provinceJSON = require('./utils/core/location_province');
var location_cityJSON = require('./utils/core/location_city');
var location_areaJSON = require('./utils/core/location_area');


var initSaveAllProvinceCityArea = function () {
  if (location_provinceJSON && location_provinceJSON.province) {
    location_provinceJSON.province.forEach(function (province) {
      var province_data = new Province({
        provinceID:province.provinceID,
        province  :province.province
      });
      province_data.save();
    });
  }

  if (location_cityJSON && location_cityJSON.city) {
    location_cityJSON.city.forEach(function (city) {
      var city_data = new City({
        fatherID:city.fatherID,
        cityID  :city.cityID,
        city    :city.city
      });
      city_data.save();
    });
  }

  if (location_areaJSON && location_areaJSON.area) {
    location_areaJSON.area.forEach(function (area) {
      var area_data = new Area({
        fatherID:area.fatherID,
        areaID  :area.areaID,
        area    :area.area
      });
      area_data.save();
    });
  }
};

module.exports = {
  initSaveAllProvinceCityArea:initSaveAllProvinceCityArea
};


