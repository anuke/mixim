IMG_PER_ROW = 7;
IMG_PER_COL = 1;

var Stat = {};
_.extend(Stat, Backbone.Events);

Stat.on('count', function (count) {
    var cnt = String(count+200);
    for (var i = 0; i < cnt.length; i++) {
        $('div.counter').append(
            $('<img width="40" height="40">').attr('src', 'images/' + cnt.charAt(i) + '.gif'));
    }
});

var MyComments = {};
_.extend(MyComments, Backbone.Events);

MyComments.on('comments', function (comments) {
    $('#sid__my_comments').html('');
    _.each(comments, function (comment) {
        var comment_row = $('<table id="my_comment_' + comment.id + '" class="last_comments" border="0" cellspacing="0" cellpadding="0"></table>').
            append($('<tr></tr>').
                append($('<td width="84px"><img src="' + comment.thumbnail + '" width="80px" height="60px"></td>')).
                append($('<td valign="top" id="my_comment_' + comment.id + '_text"></td>')));
        $('#sid__my_comments').append(comment_row);
        $('#my_comment_' + comment.id + '_text').text(comment.text);
        $('#my_comment_' + comment.id).click(function () { show_photo(comment.photo_id); });
    });
});

Auth.on("logged", function (logged) {
    if (logged) document.location.href = 'media.shtml';
});

Auth.on("login", function () {
    document.location.href = 'media.shtml';
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

function my_alert(title, text) {
    $('#alert_title').html(title);
    $('#alert_text').html(text);
    $('#alert_window').show();
}

function my_error(msg) {
    $('#error_text').html(msg);
    $('#error_window').show();
}

function show_window(name) {
    $('#' + name + '_window').show();
}

function hide_window(name) {
    $('#' + name + '_window').hide();
}

jQuery(document).ready(function ($) {
    $('#alert_window_close').click(function () { hide_window('alert'); });

    $('.text_input').keypress(function() {
        $('.text_input').removeClass('invalid');
        $('#error_window').hide();
    });

    $('#image_window').hover(
        function () { $('.opacible').removeClass('opa25').addClass('opa75'); },
        function () { $('.opacible').removeClass('opa75').addClass('opa25'); }
    );

    // check username
    var stoppedTyping;
    $('#reg_username').keyup(function () {
        if (stoppedTyping) clearTimeout(stoppedTyping)

        var v = $(this).val();
        $('.reg_form_err_container').hide();
        if (v.length < 4)
            $('#err_reg_username_too_short').show()
        else if (/[^A-Za-z0-9\._-]/.test(v))
            $('#err_reg_username_unallowed').show();
        else {
            stoppedTyping = setTimeout(function() {
                $.getJSON('/json/user/check/' + v, function (data) {
                    if (data.success) {
                        $('#err_reg_username_exists').toggle(data.result);
                    }
                });
            }, 1000);
        }
    })

    user_stat(Stat);
    last_all_comments(MyComments);
});
