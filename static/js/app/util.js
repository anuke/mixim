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

