    var IMG_PER_ROW = 7;
    var IMG_PER_COL = 1;
    var gallery_page_no = 1;

    if (typeof(gallery_auto_load) === "undefined") {
        var gallery_auto_load = true;
    }

    if (typeof(gallery_last_params) === "undefined") {
        var gallery_last_params = true;
    }

    function prevPage() {
        if (gallery_page_no <= 1) return;
        gallery_page_no--;
        gallery_load();
    }

    function nextPage() {
        gallery_page_no++;
        gallery_load();
    }

//    var last_img;

    function gallery_load(params) {
        var limit = IMG_PER_ROW * IMG_PER_COL;
        var start = (gallery_page_no - 1) * limit;

        if (!params) params = gallery_last_params;
        gallery_last_params = params;
        var timestamp = new Date().getTime();
        jQuery.getJSON("/json/media/list/" + start + "/" + limit + "/?_="+timestamp, params,
            function (data) {
                if (!data.success) {
                    alert(data.error.message);
                    return;
                }

                var images = data.result;
                var len = images.length;
                if (len == 0 && gallery_page_no > 1) {
                    gallery_page_no--;
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
                console.log(first_id);
                console.log(last_id);
                console.log(loaded_first_id);
                console.log(loaded_last_id);
                if ((first_id == loaded_first_id) && (last_id  == loaded_last_id)) return;

                $('#image_container').empty();

                for (var row = 0; row < IMG_PER_COL; row++) {
                    var tr = $('<tr></tr>');

                    for (var col = 0; col < IMG_PER_ROW; col++) {
                        var i = row*IMG_PER_ROW + col;
                        var td = $('<td></td>');

                        if (i < len) {
                            var image = images[i];
                            function open_image(id) { return function() { show_photo(id); }}
                            var img = $('<img>').attr('src', image.thumbnail).attr('title', image.description);
                            var a = $('<a></a>').attr('class', 'finger').attr('id', 'media-' + image.id).click(open_image(image.id));
                            a.append(img);
                            td.append(a);
                        }
                        else {
                            var img = $('<img>').attr('src', "/media/absent.png").attr('title', trans('No photo'));
                            td.attr('align', 'center').attr('valign', 'middle').append(img);
                        }
                        tr.append(td);
                    }

                    $('#image_container').append(tr);
                }
            });
    }

    function gallery_refresh() {
        if (gallery_page_no != 1) return;
        gallery_load();
    }

    jQuery(document).ready(function() {
        if (gallery_auto_load) {
            gallery_load();
        }
        setInterval(gallery_refresh, 20000);

        $('a.media_disable').click(media_disable);
    });
