
var aktCity = "Regensburg";
var city = ["Regensburg","Schwarzach","München","Berlin","Hamburg","Lima","Denpasar"];
var code = ["2849483","2835184","2867714","2950159","2911298","3936456","1645528"];
var cities = [];
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
var weatherURL, weatherData;
//
function getWeatherData(){
	weatherURL = URLbase + 'weather?id=' + cities[aktCity] + '&units=metric&APPID=' + apikey;
	$.getJSON(weatherURL, function(data) {
		//$("#test").html(JSON.stringify(data));
		weatherData = JSON.parse(JSON.stringify(data));
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
var cityName, temp, pressure, humidity, minTemp, maxTemp, windSpeed, iconNr, iconURL, timestamp;
var date, year, month, day, hours, minutes, seconds, formattedTime;
// update the weather data
function updateWeather(weatherData,element){

	$(element).text('');

	cityName = weatherData.name;
	temp = weatherData.main.temp;
	pressure = weatherData.main.pressure;
	humidity = weatherData.main.humidity;
	minTemp = weatherData.main.temp_min;
	maxTemp = weatherData.main.temp_max;
	windSpeed = weatherData.wind.speed;
	iconNr = weatherData.weather[0].icon;	
	iconURL = 'https://openweathermap.org/img/w/' + iconNr + '.png';
	timestamp = weatherData.dt;
	
	date = new Date(timestamp*1000);
	year = "" + date.getFullYear();
	month = date.getMonth()+1;
	day = date.getDate();
	hours = date.getHours();
	minutes = "0" + date.getMinutes();
	seconds = "0" + date.getSeconds();
	// Will display time in 10:30:23 format
	formattedTime = day + '.' + month + '. - ' + hours + ':' + minutes.substr(-2) + '&nbsp';//:' + seconds.substr(-2);
	
	$(element).append('<div width="100%" class="Zeitpunkt" style="border-bottom: 0.5px solid">' + formattedTime + '</div>');
	$(element).append('<table width="100%"><tr><td style="text-align:center;border-bottom-left-radius:20px"><img src="'+iconURL+'" style="height=100%;vertical-align:middle"></td><td width="50%" style="background-color:#33adff;text-align:left;border-bottom-right-radius:20px;padding:0px 10px 0px 10px"><b>' + parseInt(temp) + '&nbsp&deg;C</b><br>' + parseInt(pressure) + '&nbsphPa<br>' + parseInt(humidity) + '&nbsp%<br>' + parseInt(windSpeed) + '&nbspm/s</td></tr></table>');
}
//
var aktTemp, dataTable, forecastURL, forecastData, options, chart;
//
function updateForecast(wetterAktuell) {
	//
	// Wetter aktuell fuer den Plot
	timestamp = wetterAktuell.dt;
	aktTemp = wetterAktuell.main.temp;
	//
	// DataTable fuer den Plot erstellen
	dataTable = new google.visualization.DataTable();
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
	forecastURL = URLbase + 'forecast?id=' + cities[aktCity] + '&units=metric&APPID=' + apikey;
	// JSON-Antwort auslesen
	$.getJSON(forecastURL, function(data) {
		// JSON
		forecastData = JSON.parse(JSON.stringify(data));
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
			
			timestamp = forecastData.list[iter].dt;			
			dataTable.addRow([new Date(timestamp*1000), forecastData.list[iter].main.temp]);
		}
		// Plot definieren
		options = {
          title: 'Temperaturen in den nächsten Tagen in °C',
		  titleTextStyle: {fontSize: 20},
          chartArea: {'width': '80%'},
          curveType: 'function',
		  hAxis: {gridlines: {count:-1}, minorGridlines: {units: {hours: {format: ['HH', '']}}}},
		  vAxis: {viewWindowMode: 'maximized'},
          legend: { position: 'none' }
        };

        chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
		// Plot erstellen
        chart.draw(dataTable, options);
	});
}

function openMenu()
{
    $("#dropdown").toggle();
}

function changeCity(city) {
	if (city != aktCity) {
		$("#Seite").html(initLayout);
		$("#loading").show();
		aktCity = city;
		$("#cityTitle").html('Wetter in '+ aktCity);
		getWeatherData();
		//setInterval(function(){getWeatherData()},20*60*1000);
    }
	$("#dropdown").hide();
	$("#loading").hide();
}

$(function() {
	for (i=0; i<city.length; i++) {
		cities[city[i]] = code[i];
		$("#dropdown").append('<button onclick="changeCity(\''+city[i]+'\')">'+city[i]+'</button>');
	}
	$("#loading").hide();
    $("#dropdown").hide();
	getWeatherData();
	setInterval(function(){getWeatherData()},20*60*1000); // Update-Intervall: 20 min
});