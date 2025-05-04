let citiesInput = document.getElementById('cities');
let button = document.getElementById('button');
let weatherCardsContainer = document.getElementById('weather-cards');
let kzb = document.getElementById("kz");
let rub = document.getElementById("ru");
let enb = document.getElementById("en");
let lang = "ru"; 

kzb.addEventListener('click', function(){
    lang = "kz"
})
rub.addEventListener('click', function(){
    lang = "ru"
})
enb.addEventListener('click', function(){
    lang = "en"
})

const translations = {
    kz: {
        placeholder: "Қала атын жазыңыз",
        button: "Таңдау",
        temp: "Температура",
        max: "Макс",
        min: "Мин",
        wind: "Жел",
        humidity: "Ылғалдылық",
        error: "Қала табылмады",
        tryAgain: "Басқа қала атын енгізіп көріңіз",
        kmph: "км/с",
        days: ['Жексенбі', 'Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі']
    },
    ru: {
        placeholder: "Введите название города",
        button: "Выбрать",
        temp: "Температура",
        max: "Макс",
        min: "Мин",
        wind: "Ветер",
        humidity: "Влажность",
        error: "Город не найден",
        tryAgain: "Попробуйте ввести другой город",
        kmph: "км/ч",
        days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    },
    en: {
        placeholder: "Enter city name",
        button: "Select",
        temp: "Temp",
        max: "Max",
        min: "Min",
        wind: "Wind",
        humidity: "Humidity",
        error: "City not found",
        tryAgain: "Try another city",
        kmph: "km/h",
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
};

let swiper = new Swiper('.swiper', {
    slidesPerView: 'auto',
    spaceBetween: 10,
    centeredSlides: true,
    loop: false,
    breakpoints: {
        320: { spaceBetween: 5 },
        600: { spaceBetween: 10 }
    }
});


button.addEventListener('click', function() {
    let city = citiesInput.value.trim();
    if (!city) return;
    let userinfo = [];
    userinfo.push({city:citiesInput.value})
    localStorage.setItem('city', JSON.stringify(userinfo))
        
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=0a447dc803d64e249b192310252903&q=${city}&days=3&aqi=no&alerts=no`)
        .then(response => response.json())
        .then(data => {
            updateWeatherCards(data);
            console.log(data)
        })
        .catch(err => {
            console.error("Error:", err);
            showError();
        });
});

function updateWeatherCards(data) {
    weatherCardsContainer.innerHTML = '';
        
    if (!data.forecast || !data.forecast.forecastday) {
        showError();
        return;
    }
        
    let days = data.forecast.forecastday;
        
    days.forEach((dayData, index) => {
        let date = new Date(dayData.date);
        let dayName = Day(date.getDay());
           
        let card = document.createElement('div');
        card.className = 'swiper-slide';
           
        let dayInfo = dayData.day;
        let condition = dayInfo.condition;
        let tempColor = '';
        if (dayInfo.avgtemp_c > 32) {
            tempColor = 'orange';
        } else if (dayInfo.avgtemp_c > 18) {
            tempColor = 'lightyellow';
        } else if (dayInfo.avgtemp_c > 9) {
            tempColor = 'lightblue';
        } else if(dayInfo.avgtemp_c > 0) {
            tempColor = 'blue';
        }else {
            tempColor = 'rgb(0, 0, 165)';
        }
            
        card.innerHTML = `
            <div class="weathercard">
                <div class="cityname">${data.location.name}</div>
                <div class="date">${dayName}</div>
                <img class="weathericon" src="https:${condition.icon}" alt="${condition.text}">
                <div class="weatherinfo">
                    <div>${translations[lang].temp}: <span class="temphighlight" style="color: ${tempColor}">${dayInfo.avgtemp_c}°C</span></div>
                    <div>${translations[lang].max}: ${dayInfo.maxtemp_c}° | ${translations[lang].min}: ${dayInfo.mintemp_c}°</div>
                    <div>${translations[lang].wind} : ${dayInfo.maxwind_kph} ${translations[lang].kmph} </div>
                    <div>${translations[lang].humidity}: ${dayInfo.avghumidity}%</div>
                </div>
                <div class="astrocontainer">
                    <div class="suntimes">
                        <div class="sunevent">
                            <span class="icon">🌅</span>
                            <span class="time">${dayData.astro.sunrise}</span>
                        </div>
                        <div class="sunevent">
                            <span class="icon">🌇</span>
                            <span class="time">${dayData.astro.sunset}</span>
                        </div>
                    </div>
                    <div class="moonphase">
                        <div class="moonicon">${getMoonIcon(dayData.astro.moon_phase).icon}</div>
                        <div class="moontext">${getMoonIcon(dayData.astro.moon_phase)[lang]}</div>
                    </div>
                </div>
            </div>
        `;
            
        weatherCardsContainer.appendChild(card);
    });
        
    swiper.update();
}

function showError() {
    weatherCardsContainer.innerHTML = `
        <div class="swiper-slide">
            <div class="weathercard">
                <div class="errormessage">Қала табылмады</div>
                <img class="weathericon" src="https://cdn-icons-png.flaticon.com/512/564/564619.png" alt="Error">
                <div>Басқа қала атын енгізіп көріңіз</div>
            </div>
        </div>
    `;}
    swiper.update();

function Day(dayIndex) {
    let days = translations[lang].days;
return days[dayIndex];}

function getMoonIcon(phase) {
    const phases = {
        "New Moon": {icon: "🌑", kz: "Жаңа Ай", ru: "Новолуние", en: "New Moon" },
        "Waxing Crescent": {icon: "🌒", kz: "Қара Ай", ru: "Молодая луна", en: "Waxing Crescent" },
        "First Quarter": {icon: "🌓", kz: "Айдың бірінші ширегі", ru: "Первая четверть", en: "First Quarter"},
        "Waxing Gibbous": {icon: "🌔", kz: "Үлкейген Ай", ru: "Прибывающая луна", en: "Waxing Gibbous"},
        "Full Moon": {icon: "🌕", kz: "Толық Ай", ru: "Полнолуние", en: "Full Moon"},
        "Waning Gibbous": {icon: "🌖", kz: "Кішірейген Ай", ru: "Убывающая луна", en: "Waning Gibbous"},
        "Last Quarter": {icon: "🌗", kz: "Айдың соңғы ширегі", ru: "Последняя четверть", en: "Last Quarter"},
        "Waning Crescent": {icon: "🌘", kz: "Кішкене Ай", ru: "Старая луна", en: "Waning Crescent"}
    };

    return phases[phase] || {icon: "🌙", kz: "Ай", ru: "Луна"};
}