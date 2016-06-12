localStorage.clear();

var myAPIKey = '-';
var showWeeks = true;
var showFahrenheit = true;
var temperature = 0;
var conditions = "-";
var wind = 0;
var windDirection = 0;

myAPIKey = localStorage.getItem('APIKey');
if (myAPIKey == undefined){
  myAPIKey = "-";
}
showFahrenheit = localStorage.getItem('Fahrenheit');
if (showFahrenheit == undefined){
  showFahrenheit = false;
}
showWeeks = localStorage.getItem('WeekNumbers');
if (showWeeks == undefined){
  showWeeks = true;
}


function sendAllKeysToPebble(){
  
  var allKeys = {
  'API': myAPIKey,
  'WEEKS': showWeeks,
  'FAHRENHEIT': showFahrenheit,
  "KEY_TEMPERATURE": temperature,
  "KEY_CONDITIONS": conditions,
  "KEY_WIND": wind,
  "KEY_WINDDIRECTION": windDirection
  };
  
  Pebble.sendAppMessage(allKeys, function() {
    console.log('Sending all keys to pebble');
      //getWeather();
  }, function(e) {
    console.log('Error sending config data!');
  });
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
  if (myAPIKey !== ''){
    var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
      pos.coords.latitude + '&lon=' + pos.coords.longitude + '&appid=' + myAPIKey;
  console.log("URL to weather:"+url);
  // Send request to OpenWeatherMap
  xhrRequest(url, 'GET', 
    function(responseText) {
      // responseText contains a JSON object with weather info
      var json = JSON.parse(responseText);

      temperature = json.main.temp;
      
      // Conditions
      conditions = json.weather[0].main;      
      console.log("Conditions are " + conditions);
      
      // Wind
      wind = json.wind.speed;
      console.log("Winds are " + wind);
      
      // Wind
      winddirection = json.wind.deg;
      console.log("Winddirection is " + winddirection);
      
      sendAllKeysToPebble();
      
      // Assemble dictionary using our keys
      /*
      var dictionary = {
        "KEY_TEMPERATURE": temperature,
        "KEY_CONDITIONS": conditions,
        "KEY_WIND": wind,
        "KEY_WINDDIRECTION": winddirection
      };
      
      allKeys = {
        "KEY_TEMPERATURE": temperature,
        "KEY_CONDITIONS": conditions,
        "KEY_WIND": wind,
        "KEY_WINDDIRECTION": winddirection
      }
      
      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log("Weather info sent to Pebble successfully!");
        },
        function(e) {
          console.log("Error sending weather info to Pebble!");
        }
      );
      */
    }      
  ); 
  }
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
    //getWeather();
  }                     
);

// CONFIG
Pebble.addEventListener('showConfiguration', function() {
  var url = 'http://machineboy.com/html/diagoconfig.html';

  Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function(e) {
  // Decode the user's preferences
  var configData = JSON.parse(decodeURIComponent(e.response));
  console.log("Configdata:"+JSON.stringify(configData));
  myAPIKey = configData.api_key;
  showWeeks = configData.weeks;
  showFahrenheit = configData.fahrenheit;
  getWeather();
  localStorage.setItem('APIKey', myAPIKey);
  localStorage.setItem('showWeeks', showWeeks);
  localStorage.setItem('showFahrenheit', showFahrenheit);
  //console.log("F IS " + configData.fahrenheit);
  //check if Fahrenheit is selected in config
  // Send to the watchapp via AppMessage 'API': configData.api_key,
  /*
  allKeys = {
    'API': configData.APIKey,
    'WEEKS': configData.weeks,
    'FAHRENHEIT': configData.fahrenheit
  };
  if (configData.fahrenheit == true){
   //showFahrenheit = true; 
    console.log("F IS TRUE");
  }
  
*/
  console.log("VISES DENNE?"+configData.weeks);
  sendAllKeysToPebble();
  // Send to the watchapp
  /*
  if (dict){
    console.log('trying to send from js');
    Pebble.sendAppMessage(dict, function() {
    console.log('Config data sent successfully!');
      //getWeather();
  }, function(e) {
    console.log('Error sending config data!');
  });
  }
  */
});

