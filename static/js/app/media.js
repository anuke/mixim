Auth.on("logged", function (logged) {
    show_window(logged ? 'cabinet' : 'login');
});

function show_login_window() {
    $('#error_window').hide();
    show_window('login');
    hide_window('register');
    hide_window('resetpassword');
    hide_window('photo');
}

function show_register_window() {
    $('#error_window').hide();
    hide_window('login');
    show_window('register');
    hide_window('resetpassword');
    hide_window('photo');
}

function show_resetpassword_window() {
    $('#error_window').hide();
    hide_window('login');
    hide_window('register');
    show_window('resetpassword');
    hide_window('photo');
}

jQuery(document).ready(function ($) {
    // UI
    $('#tags_filter').watermark(trans('search by tag')).autocomplete({
        minLength: 2,
        source: function(request, response) {
            $.getJSON("/json/available/tag/", { term: request.term },
                function(data) {
                    var found = $.map(data.result, function (item) {
                        var tag = item.name;
                        return { id: tag, label: tag, value: tag };
                    });
                    response(found);
                });
        },
        select: function (event, ui) {
            if (ui.item) {
                load_filtered({ tags: ui.item.id });
            }
        }
    });
    $('#breed_filter').watermark(trans('search by breed')).autocomplete({
        minLength: 2,
        source: function(request, response) {
            $.getJSON("/json/available/breed/", { term: request.term },
                function(data) {
                    var found = $.map(data.result, function (item) {
                        var breed = item.breed;
                        return { id: breed, label: breed, value: breed };
                    });
                    response(found);
                });
        },
        select: function (event, ui) {
            if (ui.item) {
                load_filtered({ breed: ui.item.id });
            }
        }
    });

    var __male_filter = false;
    var __female_filter = false;

    $('#male_filter').click(function () {
        __male_filter = !__male_filter;
        $(this).toggleClass('opa50', !__male_filter);
        if (__male_filter) {
            __female_filter = false;
            $('#female_filter').addClass('opa50');
        }
        load_filtered();
    }).blur(function () { load_filtered(); });

    $('#female_filter').click(function () {
        __female_filter = !__female_filter;
        $(this).toggleClass('opa50', !__female_filter);
        if (__female_filter) {
            __male_filter = false;
            $('#male_filter').addClass('opa50');
        }
        load_filtered();
    }).blur(function () { load_filtered(); });

    /*
    $.getJSON("/json/dict/breed/", {}, function (data) {
        $('#breed_filter').append($('<option>').attr('value', '').text(''));
        var breeds = data.result;
        for (var i = 0; i < breeds.length; i++) {
            var breed = breeds[i];
            $('#breed_filter').append($('<option>').attr('value', breed.name).text(breed.name));
        }
    });
    */

    var __media_last_filter_params;

    function load_filtered(params) {
        if (!params) params = {};
        var breed = $('#breed_filter').val();
        var tags  = $('#tags_filter').val();
        if (!params.breed && breed) params.breed = breed;
        if (!params.tags && tags) params.tags = tags;
        if (__male_filter) {
            params.gender = 'M';
        }
        else if (__female_filter) {
            params.gender = 'F';
        }
        if (_.isEqual(__media_last_filter_params, params)) return;
        __media_last_filter_params = params;
        gallery_load(params);
    }

    $('.filter_field').keyup(function (ev) {
        if (ev.keyCode == 13) {
            load_filtered();
        }
    });
    //$('#breed_filter').change(load_filtered);

    // Other stuff
    $('#alert_window_close').click(function () { hide_window('alert'); });

    $('.text_input').keypress(function() {
        $('.text_input').removeClass('invalid');
        $('#error_window').hide();
    });

    $('#image_window').hover(
        function () { $('.opacible').removeClass('opa25').addClass('opa75'); },
        function () { $('.opacible').removeClass('opa75').addClass('opa25'); }
    );

    $('#id_media_speech_tab').click(function() {
        $('#id_media_status_photo').hide();
        $('#id_media_status_speech').show();
        $('#id_media_body_photo').hide();
        $('#id_media_body_speech').show();
        
        $('#id_media_photo_tab').removeClass('media_tab_off').addClass('media_tab_on');
        $('#id_media_speech_tab').removeClass('media_tab_on').addClass('media_tab_off');
    });
    
    $('#id_media_photo_tab').click(function() {
        $('#id_media_status_speech').hide();
        $('#id_media_status_photo').show();
        $('#id_media_body_speech').hide();
        $('#id_media_body_photo').show();

        $('#id_media_speech_tab').removeClass('media_tab_off').addClass('media_tab_on');
        $('#id_media_photo_tab').removeClass('media_tab_on').addClass('media_tab_off');
    });
});

