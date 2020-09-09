//------------------- Creating a new map & getting DOM elements ----------

var mymap = L.map("myMap").setView([51.505, -0.09], 5);

// ---------------------Curent location variable-----------

var curentLocation = mymap.locate({ setView: true, maxZoom: 5 });
//--------------------- Implementing the tile layers---------------------

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/satellite-streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: "API KEY",
  }
).addTo(mymap);

//---------------- Get location on document ready-------------------------

var lat = curentLocation._lastCenter.lat;
var lng = curentLocation._lastCenter.lng;
var latlng = lat + "," + lng;

// -------------------------- DOCUMENT READY RESPONSE ---------------

function loadJSONFile(callback) {
  var xmlobj = new XMLHttpRequest();

  xmlobj.overrideMimeType("application/json");

  xmlobj.open("GET", "countries.geojson", true);

  xmlobj.onreadystatechange = function () {
    if (xmlobj.readyState == 4 && xmlobj.status == "200") {
      callback(xmlobj.responseText);
    }
  };

  xmlobj.send();
}

// ------------------------ SET A DATALIST FOR INPUT FIELD ----------------------

function dataList(callback) {
  var xmlobj = new XMLHttpRequest();

  xmlobj.overrideMimeType("application/json");

  xmlobj.open("GET", "allCountries.json", true);

  xmlobj.onreadystatechange = function () {
    if (xmlobj.readyState == 4 && xmlobj.status == "200") {
      callback(xmlobj.responseText);
    }
  };

  xmlobj.send();
}
dataList(function (response) {
  let allCountries = JSON.parse(response);

  jQuery.map(allCountries, function (n) {
    $("#countryList").append(`
      <option value='${n.name}'>
    `);
  });
});

// -------------- Change layers -----------------------------

$(document).ready(function () {
  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/satellite-streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: "API KEY",
    }
  ).addTo(mymap);
  $.ajax({
    url: "php/reverseLocation.php",
    type: "GET",
    dataType: "json",
    data: { q: latlng },
    success: function (result) {
      mymap.locate({ setView: true, maxZoom: 5 });
      mymap.on("locationfound", onLocationFound);

      async function onLocationFound(e) {
        await $.ajax({
          url: "php/getInfo.php",
          type: "POST",
          dataType: "json",
          data: { name: result.results[0].countryName },
          success: function (result) {
            var objCountry = JSON.parse(result);
            function numberWithCommas(x) {
              return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }

            $("#info").append(`
      <hr style="background-color: #05828e;">
      <h5 style='color: rgb(200, 212, 212);'>${
        objCountry[0].name
      }  <img style='max-width:1.5rem;max-height:auto' src="${
              objCountry[0].flag
            }"></h5>
      <hr style="background-color: #05828e;">

      <p style='color: rgb(181, 185, 179);'>Region: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].region
      }</span></p>
      <p style='color: rgb(181, 185, 179);'>Subregion: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].subregion
      }</span></p>
      <p style='color: rgb(181, 185, 179);'>Capital: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].capital
      }</span></p>
      <p style='color: rgb(181, 185, 179);'>Languages: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].languages[0].name
      }</span></p>
      <p style='color: rgb(181, 185, 179);'>Position: <span style='color: rgb(200, 212, 212);font-weight: bold;'> Latitudine: ${
        objCountry[0].latlng[0]
      },Longitudine: ${objCountry[0].latlng[1]}</span></p>
      <p style='color: rgb(181, 185, 179);'>Curencies: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].currencies[0].name
      } ${objCountry[0].currencies[0].symbol}</span></p>
      <p style='color: rgb(181, 185, 179);'>Population: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${numberWithCommas(
        objCountry[0].population
      )}</span></p>

      `);
            $.ajax({
              url: "php/getWeather.php",
              type: "POST",
              dataType: "json",
              data: { q: objCountry[0].capital },
              success: function (response) {
                var cityWeather = JSON.parse(response);
                $("#info").append(`
          <hr style="background-color: #05828e;">
          <p style='color: rgb(181, 185, 179);'>Weather: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${cityWeather.weather[0].main} - ${cityWeather.weather[0].description}</span></p>
          <p style='color: rgb(181, 185, 179);'>Wind speed: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${cityWeather.wind.speed}</span></p>
          
          `);

                L.marker(e.latlng)
                  .addTo(mymap)
                  .bindPopup(
                    `
            <h6 style='color: rgb(200, 212, 212);'>${
              objCountry[0].name
            }  <img style='max-width:1.5rem;max-height:auto' src="${
                      objCountry[0].flag
                    }"></h6>
            <hr style="background-color: #05828e;">
      
            <p style='color: rgb(181, 185, 179);'>Region: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
              objCountry[0].region
            }</span></p>
            <p style='color: rgb(181, 185, 179);'>Subregion: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
              objCountry[0].subregion
            }</span></p>
            <p style='color: rgb(181, 185, 179);'>Capital: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
              objCountry[0].capital
            }</span></p>
            
            <p style='color: rgb(181, 185, 179);'>Curencies: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
              objCountry[0].currencies[0].name
            } ${objCountry[0].currencies[0].symbol}</span></p>
            <p style='color: rgb(181, 185, 179);'>Population: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${numberWithCommas(
              objCountry[0].population
            )}</span></p>
            <hr style="background-color: #05828e;">
          <p style='color: rgb(181, 185, 179);'>Weather: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
            cityWeather.weather[0].main
          } - ${cityWeather.weather[0].description}</span></p>
          <p style='color: rgb(181, 185, 179);'>Wind speed: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
            cityWeather.wind.speed
          } mph</span></p>
          `
                  )
                  .openPopup();
              },
            });
          },
        });

        loadJSONFile(function (response) {
          var countries = JSON.parse(response);
          const arrayList = countries.features;

          jQuery.map(arrayList, function (n) {
            if (n.properties.ADMIN == result.results[0].countryName) {
              L.geoJson(countries).remove(mymap);

              L.geoJson(n).addTo(mymap);
            }
          });
        });
      }

      // -------------------- CREATING THE COUNTRY BORDER
    },
  });
});

$("#weatherSelect").change(function () {
  switch ($("#weatherSelect").val()) {
    case "clouds_new":
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken: "API KEY",
        }
      ).addTo(mymap);
      L.tileLayer(
        "https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=7755785e53bfb8e0b88549629d3a34b5",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken:
            "pk.eyJ1IjoidmFtb3Nyb2JlcnQiLCJhIjoiY2tkdnRsOTh1MGpiODJ6b3NydThkY2NrcSJ9.VxZllR57QTNecjsnZrAPXw",
        }
      ).addTo(mymap);
      break;
    case "precipitation_new":
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken: "API KEY",
        }
      ).addTo(mymap);
      L.tileLayer(
        "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=7755785e53bfb8e0b88549629d3a34b5",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken: "API KEY",
        }
      ).addTo(mymap);
      break;
    case "temp_new":
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken: "API KEY",
        }
      ).addTo(mymap);
      L.tileLayer(
        "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=7755785e53bfb8e0b88549629d3a34b5",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken: "API KEY",
        }
      ).addTo(mymap);
      break;
    case "pressure_new":
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken: "API KEY",
        }
      ).addTo(mymap);
      L.tileLayer(
        "https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=7755785e53bfb8e0b88549629d3a34b5",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken: "API KEY",
        }
      ).addTo(mymap);
      break;
    case "wind_new":
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken: "API KEY",
        }
      ).addTo(mymap);
      L.tileLayer(
        "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=7755785e53bfb8e0b88549629d3a34b5",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken: "API KEY",
        }
      ).addTo(mymap);
      break;
    case "off":
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/satellite-streets-v11",

          tileSize: 512,
          zoomOffset: -1,
          accessToken: "API KEY",
        }
      ).addTo(mymap);
      break;
  }
});

$("#inputValue").keydown(function (e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    $.ajax({
      url: "php/getInfo.php",
      type: "POST",
      dataType: "json",
      data: { name: $("#inputValue").val() },
      success: function (result) {
        var objCountry = JSON.parse(result);

        var position = objCountry[0].latlng;

        //------------------Creating a object with the response
        mymap.setView(L.latLng(position), 5.5);
        // ------------------- CREATING A MARKER

        // -------------------- Adding COUNTRY BORDER ------------------
        loadJSONFile(function (response) {
          var countries = JSON.parse(response);

          const arrayList = countries.features;

          let current = jQuery.map(arrayList, function (n) {
            if (n.properties.ADMIN == $("#inputValue").val()) {
              L.geoJson(countries).remove(mymap);

              L.geoJson(n).addTo(mymap);
            }
          });
        });
        //----------------- Function for settinf ',' for long numbers

        function numberWithCommas(x) {
          return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        //------------------ Append to DOM the response
        const reset = document.getElementById("#info");
        while (info.firstChild) {
          info.removeChild(info.firstChild);
        }
        $("#info").append(`
      <hr style="background-color: #05828e;">
      <h5 style='color: rgb(200, 212, 212);'>${
        objCountry[0].name
      }  <img style='max-width:1.5rem;max-height:auto' src="${
          objCountry[0].flag
        }"></h5>
      <hr style="background-color: #05828e;">

      <p style='color: rgb(181, 185, 179);'>Region: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].region
      }</span></p>
      <p style='color: rgb(181, 185, 179);'>Subregion: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].subregion
      }</span></p>
      <p style='color: rgb(181, 185, 179);'>Capital: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].capital
      }</span></p>
      <p style='color: rgb(181, 185, 179);'>Languages: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].languages[0].name
      }</span></p>
      <p style='color: rgb(181, 185, 179);'>Position: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].latlng[0]
      }, ${objCountry[0].latlng[1]}</span></p>
      <p style='color: rgb(181, 185, 179);'>Curencies: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
        objCountry[0].currencies[0].name
      } ${objCountry[0].currencies[0].symbol}</span></p>
      <p style='color: rgb(181, 185, 179);'>Population: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${numberWithCommas(
        objCountry[0].population
      )}</span></p>

      `);

        // ----------------------- Set WEATHER ------------

        $.ajax({
          url: "php/getWeather.php",
          type: "POST",
          dataType: "json",
          data: { q: objCountry[0].capital },
          success: function (response) {
            var cityWeather = JSON.parse(response);
            L.marker(L.latLng(position))
              .addTo(mymap)
              .bindPopup(
                `
            <h6 style='color: rgb(200, 212, 212);'>${
              objCountry[0].name
            }  <img style='max-width:1.5rem;max-height:auto' src="${
                  objCountry[0].flag
                }"></h6>
            <hr style="background-color: #05828e;">
      
            <p style='color: rgb(181, 185, 179);'>Region: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
              objCountry[0].region
            }</span></p>
            <p style='color: rgb(181, 185, 179);'>Subregion: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
              objCountry[0].subregion
            }</span></p>
            <p style='color: rgb(181, 185, 179);'>Capital: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
              objCountry[0].capital
            }</span></p>
      
            <p style='color: rgb(181, 185, 179);'>Curencies: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
              objCountry[0].currencies[0].name
            } ${objCountry[0].currencies[0].symbol}</span></p>
            <p style='color: rgb(181, 185, 179);'>Population: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${numberWithCommas(
              objCountry[0].population
            )}</span></p>
            <hr style="background-color: #05828e;">
            <p style='color: rgb(181, 185, 179);'>Weather: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
              cityWeather.weather[0].main
            } - ${cityWeather.weather[0].description}</span></p>
            <p style='color: rgb(181, 185, 179);'>Wind speed: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${
              cityWeather.wind.speed
            } mph</span></p>
            
            `
              )
              .openPopup();
            $("#info").append(`
            <hr style="background-color: #05828e;">
            <p style='color: rgb(181, 185, 179);'>Weather: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${cityWeather.weather[0].main} - ${cityWeather.weather[0].description}</span></p>
            <p style='color: rgb(181, 185, 179);'>Wind speed: <span style='color: rgb(200, 212, 212);font-weight: bold;'>${cityWeather.wind.speed}</span></p>
            
            `);
          },
        });
      },
      complete: function () {},
    });
  }
});
