var myAPIKey = '';
var myAPIKey = localStorage.getItem('APIKey');
var showFahrenheit = localStorage.getItem('Fahrenheit');
if (showFahrenheit === null){
  showFahrenheit = false;
}
var showWeeks = localStorage.getItem('WeekNumbers');
if (showWeeks === null){
  showWeeks = false;
}


var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

function locationSuccess(pos) {
  // Construct URL
  //var url = 'http://api.openweathermap.org/data/2.5/weather?q=oslo,norway'+ '&appid=' + myAPIKey;
  var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
      pos.coords.latitude + '&lon=' + pos.coords.longitude + '&appid=' + myAPIKey;
  console.log("URL to weather:"+url);
  // Send request to OpenWeatherMap
  xhrRequest(url, 'GET', 
    function(responseText) {
      // responseText contains a JSON object with weather info
      var json = JSON.parse(responseText);

      var temperature = json.main.temp;
      
      // Conditions
      var conditions = json.weather[0].main;      
      console.log("Conditions are " + conditions);
      
      // Wind
      var wind = json.wind.speed;
      console.log("Winds are " + wind);
      
      // Wind
      var winddirection = json.wind.deg;
      console.log("Winddirection is " + winddirection);
      
      // Assemble dictionary using our keys
      var dictionary = {
        "KEY_TEMPERATURE": temperature,
        "KEY_CONDITIONS": conditions,
        "KEY_WIND": wind,
        "KEY_WINDDIRECTION": winddirection
      };

      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log("Weather info sent to Pebble successfully!");
        },
        function(e) {
          console.log("Error sending weather info to Pebble!");
        }
      );
    }      
  );
}

function locationError(err) {
  console.log("Error requesting location!");
}

function getWeather() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {timeout: 15000, maximumAge: 60000}
  );
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    console.log("PebbleKit JS ready!");

    // Get the initial weather
    getWeather();
  }
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log("AppMessage received!");
    getWeather();
  }                     
);

// CONFIG
Pebble.addEventListener('showConfiguration', function() {
  var url = 'http://machineboy.com/html/diagoconfig.html?'+Math.random()*200;

  Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function(e) {
  // Decode the user's preferences
  var configData = JSON.parse(decodeURIComponent(e.response));
  console.log("Configdata:"+JSON.stringify(configData));
  myAPIKey = configData.api_key;
  getWeather();
  localStorage.setItem('APIKey', myAPIKey);
  //console.log("F IS " + configData.fahrenheit);
  //check if Fahrenheit is selected in config
  if (configData.fahrenheit == true){
   showFahrenheit = true; 
    console.log("F IS TRUE");
  }
  
  // Send to the watchapp via AppMessage
  var dict = {
    'API': configData.api_key,
    'WEEKS': configData.weeks,
    'FAHRENHEIT': configData.fahrenheit
  };
  // Send to the watchapp
  Pebble.sendAppMessage(dict, function() {
    console.log('Config data sent successfully!');
  }, function(e) {
    console.log('Error sending config data!');
  });

});
 
