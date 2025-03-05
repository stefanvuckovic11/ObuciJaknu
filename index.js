var currentForecast = null;

function getDecision(forecast) {
    var temp = forecast ? forecast.main.temp : 7;
    var yesProbability;
    if (temp <= 5) {
        yesProbability = 0.9;
    } else if (temp < 15) {
        yesProbability = 0.9 - ((temp - 5) / 10) * 0.5;
    } else {
        yesProbability = 0.4;
    }
    return yesProbability * 100;
}

$(document).ready(function() {
    $.getJSON("countries.json", function(data) {
        var $select = $("#countryCode");
        $.each(data, function(index, country) {
            $select.append(
                '<option value="' + country.code + '">' + country.name + '</option>'
            );
        });
    });

    $('#submitLocation').click(function() {
        var city = $("#city").val();
        var code = $("#countryCode").val();

        if(city !== '' && code !== '') {
            $.ajax({
                url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + code + "&units=metric&appid=94236dbf2af6dd73656caadb88894756",
                type: "GET",
                dataType: "json",
                success: function(data) {
                    console.log("Forecast data:", data);

                    var now = new Date();
                    var nextForecast = null;
                    $.each(data.list, function(index, forecast) {
                        var forecastTime = new Date(forecast.dt_txt);
                        if (forecastTime > now) {
                            nextForecast = forecast;
                            return false;
                        }
                    });
                    if(nextForecast) {
                        window.currentForecast = nextForecast;

                        var forecastTime = new Date(nextForecast.dt_txt);
                        var forecastHtml = "<h2>Prognoza za " + data.city.name + ", " + data.city.country + "</h2>";
                        forecastHtml += "<div class='page__main__content__forecast__entry'>";
                        forecastHtml += "<p><strong>Datum:</strong> " + forecastTime.toLocaleDateString() + "</p>";
                        forecastHtml += "<p><strong>Vrijeme:</strong> " + forecastTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + "</p>";
                        forecastHtml += "<p><strong>Temperatura:</strong> " + nextForecast.main.temp + "°C</p>";
                        forecastHtml += "<p><strong>Vrijeme:</strong> " + nextForecast.weather[0].description + "</p>";
                        forecastHtml += "</div>";

                        $("#show").html(forecastHtml);

                        var jacketAdvice = getJacketAdvice(nextForecast);
                        if(jacketAdvice !== "") {
                            $("#advice").html("<p>" + jacketAdvice + "</p>");
                            if(jacketAdvice.indexOf("no jacket") !== -1) {
                                $("#advice")
                                    .removeClass("page__main__content__advice__jacket")
                                    .addClass("page__main__content__advice__no-jacket");
                            } else {
                                $("#advice")
                                    .removeClass("page__main__content__advice__no-jacket")
                                    .addClass("page__main__content__advice__jacket");
                            }
                        } else {
                            $("#advice").html("<p>Nije dostupna prognoza za danas.</p>");
                        }
                    } else {
                        $("#show").html("<p>Nije pronađen dostupni forecast.</p>");
                        $("#advice").html("");
                    }

                    $(".page__main__content").css("width", "50%");
                    $(".page__main__wear-jacket").show();
                    $('#error').html('');
                },
                error: function(err) {
                    console.error("Greška", err);
                    $('#error').html('Greška');
                }
            });
        } else {
            $('#error').html('Polje ne smije da bude prazno');
        }
    });

    $('#wear-jacket-button-yes').click(function() {
        var percentageYes = getDecision(window.currentForecast);
        $(".page__main__wear-jacket__give-average").html("<p>Ti i " + percentageYes.toFixed(2) + "% ljudi će obuć jaknu danas</p>");
    });

    $('#wear-jacket-button-no').click(function() {
        var percentageYes = getDecision(window.currentForecast);
        var percentageNo = 100 - percentageYes;
        $(".page__main__wear-jacket__give-average").html("<p>Ti i " + percentageNo.toFixed(2) + "% ljudi se neće danas obuć</p>");
    });
});

function getJacketAdvice(forecast) {
    var temp = forecast.main.temp;
    var weatherDesc = forecast.weather[0].description.toLowerCase();
    var advice = "";

    if (temp < 15 || weatherDesc.includes("rain") || weatherDesc.includes("snow") || weatherDesc.includes("wind")) {
        advice = "Pomet, obuci jaknu.";
    } else if (temp >= 15 && temp < 20) {
        advice = "Ledno je ali nije strašno, može neki lagani prsluk.";
    } else {
        advice = "Lagano je vrijeme, možeš i bez majice.";
    }
    return advice;
}