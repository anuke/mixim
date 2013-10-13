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
    $('#alert_window_close').click(function () { hide_window('alert'); });

    $('.auth_login_btn').click(function(e) { e.preventDefault(); auth_login(); return false; });
    $('.auth_register_btn').click(function(e) { e.preventDefault(); auth_register(); return false; });

    $('.text_input').keypress(function() {
        $('.text_input').removeClass('invalid');
        $('#error_window').hide();
    });

    $('#image_window').hover(
        function () { $('.opacible').removeClass('opa25').addClass('opa75'); },
        function () { $('.opacible').removeClass('opa75').addClass('opa25'); }
    );
});
