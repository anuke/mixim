function on_logged(logged) {
    $('#noauto_block').toggle(!logged);
    $('#auto_block').toggle(logged);
    $('.s__not_logged').toggle(!logged);
    $('.s__logged').toggle(logged);
}

Auth.on("logged", function (logged) {
    show_window(logged ? 'cabinet' : 'login');
    on_logged(logged);
});

Auth.on("login", function () {
    on_logged(true);
    /*document.location.href = '/media.shtml';*/ /*cabinet.shtml*/
    $('body').css('overflow-y', 'auto');
    $('#overlay').hide();
    $('.login_add_block').hide();
});

Auth.on("logout", function () {
    on_logged(false);
});

Auth.on("profile:mine", function (user) {
    $('#sid__username').text(user.username);
    $('#sid__gender_image').attr('src', user.avatar);
});
