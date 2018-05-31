
var aktCity = "Regensburg";
var cities = [];
cities["Regensburg"] = "2849483";
cities["München"] = "2867714";
cities["Berlin"] = "2950159";
var apikey = '141a1f2e6d8f32c5c68f011d6e28df08';
var URLbase = 'https://api.openweathermap.org/data/2.5/';//weather?id=2849483&units=metric&APPID=141a1f2e6d8f32c5c68f011d6e28df08;
var maxCols = 6;
var count = maxCols;
var rows = 0;
var string = "";
var aktZeile = "#wetterZeile" + rows;
var initLayout = $("#Seite").html();
var forecastTemp = [];
google.charts.load('current', {'packages':['corechart'],'language':'de'});
google.charts.setOnLoadCallback(getWeatherData);
//
//
function getWeatherData(){
	var weatherURL = URLbase + 'weather?id=' + cities[aktCity] + '&units=metric&APPID=' + apikey;
	$("#Seite").html(initLayout);
	$.getJSON(weatherURL, function(data) {
		//$("#test").html(JSON.stringify(data));
		var weatherData = JSON.parse(JSON.stringify(data));
		$("#cityTitle").html('Wetter in '+ aktCity);
		updateWeather(weatherData,"#wetter");
		string = "#wetter";
		$(string).css("padding","0px 0px 0px");
		//
		rows=0;
		count=maxCols;
		updateForecast(weatherData);
	});
}
//
// update the weather data
function updateWeather(weatherData,element){

	$(element).text('');

	var cityName = weatherData.name;
	var temp = weatherData.main.temp;
	var pressure = weatherData.main.pressure;
	var humidity = weatherData.main.humidity;
	var minTemp = weatherData.main.temp_min;
	var maxTemp = weatherData.main.temp_max;
	var windSpeed = weatherData.wind.speed;
	var iconNr = weatherData.weather[0].icon;	
	var iconURL = 'https://openweathermap.org/img/w/' + iconNr + '.png';
	var timestamp = weatherData.dt;
	
	var date = new Date(timestamp*1000);
	var year = "" + date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	// Will display time in 10:30:23 format
	var formattedTime = day + '.' + month + '. - ' + hours + ':' + minutes.substr(-2) + '&nbsp';//:' + seconds.substr(-2);
	
	$(element).append('<div width="100%" class="Zeitpunkt" style="border-bottom: 0.5px solid">' + formattedTime + '</div>');
	$(element).append('<table width="100%"><tr><td style="text-align:center;border-bottom-left-radius:20px"><img src="'+iconURL+'" style="height=100%;vertical-align:middle"></td><td width="50%" style="background-color:#33adff;text-align:left;border-bottom-right-radius:20px;padding:0px 10px 0px 10px"><b>' + parseInt(temp) + '&nbsp&deg;C</b><br>' + parseInt(pressure) + '&nbsphPa<br>' + parseInt(humidity) + '&nbsp%<br>' + parseInt(windSpeed) + '&nbspm/s</td></tr></table>');
}

function updateForecast(wetterAktuell) {
	//
	// Wetter aktuell fuer den Plot
	var timestamp = wetterAktuell.dt;
	var aktTemp = wetterAktuell.main.temp;
	//
	// DataTable fuer den Plot erstellen
	var dataTable = new google.visualization.DataTable();
	// Spalte 1: Datum, Zeit
	dataTable.addColumn('date', 'Zeit');
	// Spalte 2: Temperatur
	dataTable.addColumn('number', 'Temperatur');
	// aktuelles Wetter hinzufuegen
	dataTable.addRow([new Date(timestamp*1000), aktTemp]);
	//
	// Wettervorhersage laden und auslesen
	//
	// URL zum Abruf der Daten
	var forecastURL = URLbase + 'forecast?id=' + cities[aktCity] + '&units=metric&APPID=' + apikey;
	// JSON-Antwort auslesen
	$.getJSON(forecastURL, function(data) {
		// JSON
		var forecastData = JSON.parse(JSON.stringify(data));
		// Fuer jeden Vorhersagezeitpunkt ein Element erstellen und die Werte zur Plot-Tabelle hinzufuegen
		for (iter = 0; iter < forecastData.list.length; iter++) {
			if (count == maxCols) {
				rows += 1;
				$("#Seite").append('<div class="row" id="wetterZeile' + rows + '"><div class="col-sm-2"><div id="wetterVorhersage' + iter + '"></div></div></div>');
				count = 1;
			}
			else {
				aktZeile = "#wetterZeile" + rows;
				$(aktZeile).append('<div class="col-sm-2"><div id="wetterVorhersage' + iter + '"></div></div>');				
				count += 1;
			}
			string = "#wetterVorhersage" + iter;
			$(string).css({"background-color":"#e9e7e2","border-radius":"20px","padding":"0px","margin":"15px 0px 15px"});
			updateWeather(forecastData.list[iter],string);
			
			var timestamp = forecastData.list[iter].dt;			
			dataTable.addRow([new Date(timestamp*1000), forecastData.list[iter].main.temp]);
		}
		// Plot definieren
		var options = {
          title: 'Temperaturen in den nächsten Tagen in °C',
		  titleTextStyle: {fontSize: 20},
          chartArea: {'width': '80%'},
          curveType: 'function',
		  hAxis: {gridlines: {count:-1}, minorGridlines: {units: {hours: {format: ['HH', '']}}}},
		  vAxis: {viewWindowMode: 'maximized'},
          legend: { position: 'none' }
        };

        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
		// Plot erstellen
        chart.draw(dataTable, options);
	});
}

function openMenu()
{
    $("#dropdown").toggle();
}

function changeCity(city) {
    aktCity = city;
    //alert(aktCity);
    $("#aktCity").text(aktCity );
    $("#dropdown").hide();
	$("#cityTitle").html('Wetter in '+ aktCity);
	getWeatherData();
    
}

$(function() {
    $("#dropdown").hide();
	getWeatherData();
	setInterval(function(){getWeatherData()},20*60*1000); // Update-Intervall: 20 min
});