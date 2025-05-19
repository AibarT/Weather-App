let citiesInput = document.getElementById('cities');
let button = document.getElementById('button');
let weatherCardsContainer = document.getElementById('weather-cards');
let kzb = document.getElementById("kz");
let rub = document.getElementById("ru");
let enb = document.getElementById("en");
let lang = "kz"; 
let cardch = document.getElementById('card');
let cityname = document.getElementById('cityname')
let date = document.getElementById('date')
let toggleMapBtn = document.getElementById("toggleMapBtn");

let map = L.map('map').setView([48.0196, 66.9237], 5); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

let marker;

function updateMap(city) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                let lat = parseFloat(data[0].lat);
                let lon = parseFloat(data[0].lon);
                map.setView([lat, lon], 10);

                if (marker) {
                    map.removeLayer(marker);
                }
                marker = L.marker([lat, lon]).addTo(map).bindPopup(city).openPopup();
            }
            
        });
}




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
        days: ['Жексенбі', 'Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі'],
        mapopen: "Картаны көрсету",
        mapclose: "Картаны жасыру"
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
        days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        mapopen: "Показать карту",
        mapclose: "Скрыть карту"
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
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        mapopen: "Show Map",
        mapclose: "Hide Map"
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

swiper.on('slideChange', () => {
    const activeSlide = document.querySelector('.swiper-slide-active');
    if (activeSlide) {
        const condition = activeSlide.getAttribute("data-condition");
        if (condition) changeBackground(condition);
    }
});

button.addEventListener('click', function() {
    let city = citiesInput.value.trim();
    if (!city) return;
    updateMap(city);
    let user_info = [];
    user_info.push({ city: citiesInput.value})
    localStorage.setItem('city', JSON.stringify(user_info))
    
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=0a447dc803d64e249b192310252903&q=${city}&days=3&aqi=no&alerts=no`)
        .then(response => response.json())
        .then(data => {
            updateWeatherCards(data);
            console.log(data)
            setTimeout(() => {
                const activeSlide = document.querySelector('.swiper-slide-active');
                if (activeSlide) {
                    const condition = activeSlide.getAttribute("data-condition");
                    if (condition) changeBackground(condition);
                }
            }, 200);
        })
        .catch(err => {
            console.error("Error:", err);
            showError();
        });
});

function updateWeatherCards(data) {
    weatherCardsContainer.innerHTML = '';
    document.getElementById('toggleMapBtn').onclick = function () {
    const mapDiv = document.getElementById('map');
    if (mapDiv.style.display === 'none') {
        mapDiv.style.display = 'block';
        this.textContent = translations[lang].mapclose;
    } else {
        mapDiv.style.display = 'none';
        this.textContent = translations[lang].mapopen;
    }
};
    
    
    if (!data.forecast || !data.forecast.forecastday) {
        showError();
        return;
    }
    
    cityname.style.backgroundColor = "rgba(114, 114, 255, 0.7)"
    citiesInput.placeholder = translations[lang].placeholder;
    button.innerHTML = translations[lang].button;

    data.forecast.forecastday.forEach((dayData) => {
        const date = new Date(dayData.date);
        const dayName = Day(date.getDay());
        const dayInfo = dayData.day;
        const condition = dayInfo.condition;

        const card = document.createElement('div');
        card.className = 'swiper-slide';
        card.setAttribute("data-condition", condition.text.toLowerCase());

        let tempColor = '';
        if (dayInfo.avgtemp_c > 32) tempColor = 'orange';
        else if (dayInfo.avgtemp_c > 18) tempColor = 'lightyellow';
        else if (dayInfo.avgtemp_c > 9) tempColor = 'lightblue';
        else if (dayInfo.avgtemp_c > 0) tempColor = 'blue';
        else tempColor = 'rgb(0, 0, 165)';
        cityname.innerHTML = data.location.name

        card.innerHTML = `
            <div class="date">${dayName} </div>
            <div class="weathercard" id="card">
                <img class="weathericon" src="https:${condition.icon}" alt="${condition.text}">
                <div class="weatherinfo">
                    <div id="temp">${translations[lang].temp}: <span class="temphighlight" style="color: ${tempColor}">${dayInfo.avgtemp_c}°C</span></div>
                    <div>${translations[lang].max}: ${dayInfo.maxtemp_c}° | ${translations[lang].min}: ${dayInfo.mintemp_c}°</div>
                </div>
                <div class="other">
                    <div>${translations[lang].wind}: ${dayInfo.maxwind_kph} ${translations[lang].kmph}</div>
                    <div>${translations[lang].humidity}: ${dayInfo.avghumidity}%</div>
                </div>
                    <div class="suntimes">
                        <div class="sunevent"><span class="icon">🌅</span><span class="time">${dayData.astro.sunrise}</span></div>
                        <div class="sunevent"><span class="icon">🌇</span><span class="time">${dayData.astro.sunset}</span></div>
                    </div>
                    <div class="moonphase">
                        <div class="moonicon">${getMoonIcon(dayData.astro.moon_phase).icon}</div>
                        <div class="moontext">${getMoonIcon(dayData.astro.moon_phase)[lang]}</div>
                    </div>
            </div>
        `;

        card.querySelector('#temp').addEventListener("click", () => {
            const hours = dayData.hour.map(h => h.time.split(" ")[1]);
            const temps = dayData.hour.map(h => h.temp_c);
            showHourlyChart(hours, temps, dayData.date);
        });

        weatherCardsContainer.appendChild(card);
        swiper.update();
    });
}
toggleMapBtn.onclick = function () {
    const mapDiv = document.getElementById("map");
    if (mapDiv.style.display === "none") {
        mapDiv.style.display = "block";
        toggleMapBtn.textContent = translations[lang].mapclose;
    } else {
        mapDiv.style.display = "none";
        toggleMapBtn.textContent = translations[lang].mapopen;
    }
};


function showError() {
    weatherCardsContainer.innerHTML = `
        <div class="swiper-slide">
            <div class="weathercard">
                <div class="errormessage">${translations[lang].error}</div>
                <img class="weathericon" src="https://cdn-icons-png.flaticon.com/512/564/564619.png" alt="Error">
                <div>${translations[lang].tryAgain}</div>
            </div>
        </div>
    `;
    swiper.update();
}

function Day(index) {
    return translations[lang].days[index];
}

function getMoonIcon(phase) {
    const phases = {
        "New Moon": {icon: "🌑", kz: "Жаңа Ай", ru: "Новолуние", en: "New Moon"},
        "Waxing Crescent": {icon: "🌒", kz: "Қара Ай", ru: "Молодая луна", en: "Waxing Crescent"},
        "First Quarter": {icon: "🌓", kz: "Айдың бірінші ширегі", ru: "Первая четверть", en: "First Quarter"},
        "Waxing Gibbous": {icon: "🌔", kz: "Үлкейген Ай", ru: "Прибывающая луна", en: "Waxing Gibbous"},
        "Full Moon": {icon: "🌕", kz: "Толық Ай", ru: "Полнолуние", en: "Full Moon"},
        "Waning Gibbous": {icon: "🌖", kz: "Кішірейген Ай", ru: "Убывающая луна", en: "Waning Gibbous"},
        "Last Quarter": {icon: "🌗", kz: "Айдың соңғы ширегі", ru: "Последняя четверть", en: "Last Quarter"},
        "Waning Crescent": {icon: "🌘", kz: "Кішкене Ай", ru: "Старая луна", en: "Waning Crescent"}
    };
    return phases[phase] || {icon: "🌙", kz: "Ай", ru: "Луна", en: "Moon"};
}

function changeBackground(condition) {
    const lower = condition.toLowerCase();
    let bg = "default";

    if (lower.includes("sunny") || lower.includes("clear")) bg = "sunny";
    else if (lower.includes("cloud")) bg = "cloudy";
    else if (lower.includes("rain") || lower.includes("drizzle")) bg = "rainy";
    else if (lower.includes("snow") || lower.includes("sleet")) bg = "snowy";
    else if (lower.includes("fog") || lower.includes("mist")) bg = "fog";
    else bg = "default";

    document.body.className = ""; 
    document.body.classList.add(bg);
}

kzb.addEventListener('click', () => {
    lang = "kz"; 
    setActiveLanguageButton(kzb);
    toggleMapBtn.textContent = document.getElementById("map").style.display === "none"
        ? translations.kz.mapopen
        : translations.kz.mapclose;
    button.click();
});

rub.addEventListener('click', () => {
    lang = "ru";
    setActiveLanguageButton(rub);
    toggleMapBtn.textContent = document.getElementById("map").style.display === "none"
        ? translations.ru.mapopen
        : translations.ru.mapclose;
    button.click();
});

enb.addEventListener('click', () => {
    lang = "en";
    setActiveLanguageButton(enb);
    toggleMapBtn.textContent = document.getElementById("map").style.display === "none"
        ? translations.en.mapopen
        : translations.en.mapclose;
    button.click();
});

function setActiveLanguageButton(activeBtn) {
    kzb.classList.remove('active');
    rub.classList.remove('active');
    enb.classList.remove('active');
    
    activeBtn.classList.add('active');
}


let chart;
function showHourlyChart(hours, temps, label) {
    const ctx = document.getElementById("hourlyChart").getContext("2d");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: hours,
            datasets: [{
                label: `Temperature (${label})`,
                data: temps,
                borderColor: "rgb(42, 50, 102)",
                backgroundColor: "rgba(75, 91, 192, 0.2)",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: false }
            }
        }
    });

    document.getElementById("hourlyChart").style.display = "block";
}

