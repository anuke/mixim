function mixim_load_js(src) {
    var head = document.getElementsByTagName('HEAD').item(0);
    var script= document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    head.appendChild(script);
}

function mixim_load_css(src) {
    var head = document.getElementsByTagName('HEAD').item(0);
    var link = document.createElement("link")
    link.setAttribute("rel", "stylesheet")
    link.setAttribute("type", "text/css")
    link.setAttribute("href", src)
    head.appendChild(link);
}

var mixim_old_onload = window.onload;
window.onload = function () {
    if (mixim_old_onload) mixim_old_onload();
    mixim_load_css('http://mixim.ru/css/widget.css');
    if (typeof jQuery == 'undefined') {
        mixim_load_js("http://mixim.ru/js/jquery-1.8.3.min.js");
    }
    setTimeout('mixim_load_js("http://mixim.ru/js/widget/widget.js")', 1);
}

{
    document.write(
        '<div id="mixim_photo">\n' +
        '    <table cellpadding="0" cellspacing="0">\n' +
        '        <tr>\n' +
        '            <td id="mixim_pp"><a href="javascript:mixim_prevPage()" title="&#60; Туда">&#60;</a></td>\n' +
        '            <td>\n' +
        '                <table cellpadding="0" cellspacing="6" id="image_container"></table>\n' +
        '            </td>\n' +
        '            <td id="mixim_np"><a href="javascript:mixim_nextPage()" title="Сюда &#62;">&#62;</a></td>\n' +
        '        </tr>\n' +
        '    </table>\n' +
        '</div>\n');
}
