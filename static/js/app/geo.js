$(document).ready(function(){
    $('a.sitemap_block_on').click(function() {
        $('.sitemap_block').css('top', $(window).scrollTop()); // устанавливаем значение top = скролу 
        $('#overlay').css('top', $(window).scrollTop()); // устанавливаем значение top = скролу
                    
        $('body').css('overflow-y', 'hidden'); // убираем скрол
        $('#overlay').show(); // заеняем
        $('.sitemap_block').show(); // показываем окно
    });

    $('a.sitemap_block_off').click(function() {
        $('body').css('overflow-y', 'auto'); // возвращаем скрол
        $('#overlay').hide(); // освеляем
        $('.sitemap_block').hide(); // скрываем окно
        
        $('#overlay').css('top', '0'); // обнуляем верхнюю точку
    });
});

var sitemap_language, sitemap_language_last = "Language_RU";
function show_language(sitemap_language) {
    document.getElementById(sitemap_language_last).style.display = "none";
    document.getElementById(sitemap_language).style.display = "block";
    sitemap_language_last = sitemap_language;
};

function show_map_ca() {
    document.getElementById('country').innerHTML = "<a href='http://www.mixim.us' target='_self'>www.mixim.us</a>";
    document.getElementById('country').style.backgroundImage="url(../images/flag-map_ca.png)";
};
function show_map_uk() {
    document.getElementById('country').innerHTML = "<a href='http://www.mixim.co.uk' target='_self'>www.mixim.co.uk</a>";
    document.getElementById('country').style.backgroundImage="url(../images/flag-map_uk.png)";
};
function show_map_us() {
    document.getElementById('country').innerHTML = "<a href='http://www.mixim.us' target='_self'>www.mixim.us</a>";
    document.getElementById('country').style.backgroundImage="url(../images/flag-map_us.png)";
};
function show_map_by() {
    document.getElementById('country').innerHTML = "<a href='http://www.mixim.ru' target='_self'>www.mixim.ru</a>";
    document.getElementById('country').style.backgroundImage="url(../images/flag-map_by.png)";
};
function show_map_ru() {
    document.getElementById('country').innerHTML = "<a href='http://www.mixim.ru' target='_self'>www.mixim.ru</a>";
    document.getElementById('country').style.backgroundImage="url(../images/flag-map_ru.png)";
};
function show_map_ua() {
    document.getElementById('country').innerHTML = "<a href='http://www.mixim.ru' target='_self'>www.mixim.ru</a>";
    document.getElementById('country').style.backgroundImage="url(../images/flag-map_ua.png)";
};            
