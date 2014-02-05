if (typeof MIXIM_WIDGET_COLS == 'undefined') {
    var MIXIM_WIDGET_COLS = 7;
}
if (typeof MIXIM_WIDGET_ROWS == 'undefined') {
    var MIXIM_WIDGET_ROWS = 1;
}

if (typeof MIXIM_WIDGET_ROWS == 'undefined') {
    var MIXIM_WIDGET_ROWS = 1;
}

var mixim_widget_page_no = 1;

if (typeof(widget_auto_load) === "undefined") {
    var widget_auto_load = true;
}

if (typeof(widget_last_params) === "undefined") {
    var widget_last_params = true;
}

function mixim_prevPage() {
    if (mixim_widget_page_no <= 1) return;
    mixim_widget_page_no--;
    mixim_widget_load();
}

function mixim_nextPage() {
    mixim_widget_page_no++;
    mixim_widget_load();
}

function mixim_widget_load(params) {
    var limit = MIXIM_WIDGET_COLS * MIXIM_WIDGET_ROWS;
    var start = (mixim_widget_page_no - 1) * limit;

    if (!params) params = widget_last_params;
    widget_last_params = params;
    var timestamp = new Date().getTime();
    jQuery.get("http://mixim.ru/jsonp/media/list/" + start + "/" + limit + "/?_=" + timestamp, params,
        function (data) {
            if (!data.success) {
                alert(data.error.message);
                return;
            }

            var images = data.result;
            var len = images.length;
            if (len == 0 && mixim_widget_page_no > 1) {
                mixim_widget_page_no--;
                return;
            }

            // do not refresh if media are same
            var first_id = $('#image_container tr td a:first').attr('id');
            if (first_id) first_id = first_id.match(/\d+/);
            if (first_id) first_id = first_id[0];
            var last_id = $('#image_container tr td a:last').attr('id');
            if (last_id) last_id = last_id.match(/\d+/);
            if (last_id) last_id = last_id[0];
            var loaded_first_id = len > 0 ? images[0].id : undefined;
            var loaded_last_id  = len > 0 ? images[len - 1].id : undefined;
            if ((first_id == loaded_first_id) && (last_id  == loaded_last_id)) return;

            $('#image_container').empty();

            for (var row = 0; row < MIXIM_WIDGET_ROWS; row++) {
                var tr = $('<tr></tr>');

                for (var col = 0; col < MIXIM_WIDGET_COLS; col++) {
                    var i = row*MIXIM_WIDGET_COLS + col;
                    var td = $('<td></td>');

                    if (i < len) {
                        var image = images[i];
                        var img = $('<img>').attr('src', image.thumbnail).attr('title', image.description);
                        var a = $('<a></a>').attr('class', 'finger').attr('id', 'media-' + image.id).attr('target', 'blank').attr('href', 'http://mixim.ru/pic' + image.id);
                        a.append(img);
                        td.append(a);
                    }
                    else {
                        var img = $('<img>').attr('src', "/images/absent.png").attr('title', trans('No photo'));
                        td.attr('align', 'center').attr('valign', 'middle').append(img);
                    }
                    tr.append(td);
                }

                $('#image_container').append(tr);
            }
        }, 'jsonp');
}

function mixim_widget_refresh() {
    if (mixim_widget_page_no != 1) return;
    mixim_widget_load();
}

jQuery(document).ready(function() {
    if (widget_auto_load) {
        mixim_widget_load();
    }
    setInterval(mixim_widget_refresh, 20000);
});
