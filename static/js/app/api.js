//
// UI related functions
//

function toggle_media_like_btns(value) {
    current_photo.favourite = value;
    var hide_like =  value;
    var hide_unlike = !value;
    $('#media_like_btn').toggle(!hide_like);
    $('#media_unlike_btn').toggle(!hide_unlike);
}

//
// Handlers
//

function full_screen() {
    window.open(current_photo.original, 'full_screen_photo');
}

function toggle_attention_block(species) {
    var need_attention = !species;
    $('.attention_empty_partition').toggle(need_attention);
}

function show_photo(picId, show_edit) {
    $('.ss__nocomment_div').hide();

    $.getJSON('/json/media/get/' + picId + '/', {},
            function (data) {
                if (data.success) {
                    var photo = data.result;
                    current_photo = photo;

                    $('#photo_blur_svg').attr('xlink:href', photo.original.replace('original', 'resized/598x598'));

                    $.each(['author', 'pet', 'created', 'description'], function () {
                        var value = photo[this];
                        if (!value) value = "";
                        value = value.replace(" ", "&nbsp;");
                        $('#photo_' + this).html(value);
                    });
                    var tags = photo.tags.join(', ');

                    $('#f_photo_tags').val(tags);
                    $('#f_photo_pet').val(photo.petId || 0);
                    $('#f_photo_species').val(photo.species);
                    $('#f_photo_description').val(photo.description);

                    $('#photo_tags').text(tags);
                    $('#photo_author').attr('href', '/@' + photo.author + '/');
                    $('#photo_pet').attr('href', '/pet' + photo.petId);
                    $('#photo_image').css("background-image", "url(" + photo.original.replace('original', 'resized/598x598') + ")");
                    $('div.full_screen a').first().attr('href', photo.original).attr('title', photo.description).attr('target', 'blank');

                    comment_list();

                    var photo_window_top_position = $(window).height() / 2 - 300 + $(window).scrollTop();
                    if (photo_window_top_position < 0)
                        photo_window_top_position = 0;
                    $('#photo_window').css('top', photo_window_top_position);

                    toggle_attention_block(photo.species);

                    $('.edit_window, .code_window').hide();
                    if (show_edit) $('.edit_window').show();
                    $('#photo_window').show();
                    $('.author_photo_bar').toggle(is_author());
                    $('.viewer_photo_bar').toggle(is_viewer());
                    $('.guest_photo_bar').toggle(is_guest());
                    $('#media_likes').text(current_photo.likes);
                    if (is_viewer()) {
                        toggle_media_like_btns(current_photo.favourite);
                    }

                    // by default: if friend list has not been loaded
                    $('#photo_add_friend').attr('title', trans('Follow')).find('img').attr('src', '../images/favorite_person_add.png');
                    if (_.contains(friendInfo.friends, photo.author)) {
                        $('#photo_add_friend').attr('title', trans('Unfollow')).find('img').attr('src', '../images/favorite_person_remove.png')
                    }

                    $('#code1').attr( "value", photo.original.replace('original', 'resized/598x598'));
                    $('#code2').attr( "value", '<img src="' + photo.original.replace('original', 'resized/598x598') + '">');
                    $('#code3').attr( "value", '<a href="' + photo.original + '" target="_blank"><img src="' + photo.thumbnail + '"/></a>');
                    $('#code4').attr( "value", '[img]' + photo.original + '[/img]');
                    $('#code5').attr( "value", '[url=' + photo.original + '][img]' + photo.thumbnail + '[/img][/url]');
                    $('#code6').attr( "value", 'http://' + window.location.hostname + '/pic' + photo.id );



                    // Share section

                    var shareLink = 'http://' + window.location.hostname + '/pic' + photo.id;
                    var shareTitle = photo.pet || "";
                    var sharePicture = photo.thumbnail;
                    var shareDescription = photo.description;

                    var fbUrl = "https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(shareLink)+"&t="+encodeURIComponent(shareTitle)+"&description="+encodeURIComponent(shareDescription)+"&picture="+encodeURIComponent(sharePicture);
                    var vkUrl = "http://vk.com/share.php?url="+encodeURIComponent(shareLink)+"&title="+encodeURIComponent(shareTitle)+"&description="+encodeURIComponent(shareDescription)+"&image="+encodeURIComponent(sharePicture);
                    var okUrl = "http://www.odnoklassniki.ru/dk?st.cmd=addShare&st._surl="+shareLink+"&title="+shareTitle;
                    var gpUrl = "https://plus.google.com/share?url="+shareLink;
                    var twUrl = "https://twitter.com/intent/tweet?status="+encodeURIComponent(shareTitle)+" "+shareLink;

                    $("#share20_fb").click(function(){
                        window.open(fbUrl, 'share', "height=200,width=400,status=yes,toolbar=no,menubar=no,location=no");
                        return false;
                    });
                    $("#share20_vk").click(function(){
                        window.open(vkUrl, 'share', "height=200,width=400,status=yes,toolbar=no,menubar=no,location=no");
                        return false;
                    });
                    $("#share20_gp").click(function(){
                        window.open(gpUrl, 'share', "height=200,width=400,status=yes,toolbar=no,menubar=no,location=no");
                        return false;
                    });
                    $("#share20_t").click(function(){
                        window.open(twUrl, 'share', "height=200,width=400,status=yes,toolbar=no,menubar=no,location=no");
                        return false;
                    });
                }
                else {
                    my_alert('Media retrieving', data.error.message);
                }
            }
    )
}

//
// Util functions
//

function is_guest() {
    return !is_logged();
}

function is_author() {
    return is_logged() && (current_user.id == current_photo.authorId);
}

function is_viewer() {
    return is_logged() && (current_user.id != current_photo.authorId);
}

function am_i_author() {
    return !!(current_user && (current_user.id == current_photo.authorId));
}

function is_logged() {
    return !!current_user;
}

//
// /auth/ module
//

function auth_login(prefix) {
    if (!prefix) prefix = ''
    else prefix += '_';

    var username = $('#' + prefix + 'login_username').val();
    var password = $('#' + prefix + 'login_password').val();

    $.post("/json/auth/login/", {
        username: username,
        password: password
    },
    function (data) {
        if (!data.success) {
            my_error(trans('<center><b>Authorization error!</b></center>&nbsp;&nbsp;Perhaps incorrectly filled fields <b>username/nickname</b> and <b>password</b>. Check for errors and <b>try again</b>.'));
            return;
        }

        current_user = data.result;
        Auth.trigger("login", current_user);

        if (document.location.href.indexOf('index.shtml') > -1) {
            document.location.href = 'media.shtml';
            return;
        }

        try {
            $('#sid__gender_image').attr('src', current_user.avatar);
            $('#sid__username').html(current_user.username);
        }
        catch(e) {

        }

        $('#noauto_block').hide();
        $('#auto_block').show();

        if (current_photo) {
            show_photo(current_photo.id);
        }
    }, "json");
}

function auth_logout() {
    $.getJSON("/json/user/species/",
            function (data) {
                var saved_species = data.result;


                $.getJSON("/json/auth/logout/",
                    function (data) {
                        current_user = null;
                        Auth.trigger("logout");

                        hide_window('cabinet');
                        show_window('login');

                        if (current_photo) {
                            show_photo(current_photo.id);
                        }
                        $.getJSON("/json/user/species/" + saved_species,
                            function (data) {
                            });
                    });
            });
}

function auth_logged() {
    $.getJSON("/json/auth/logged/", {},
            function (data) {
                Auth.trigger("logged", data.result);

                if (data.result) {
                    $.getJSON("/json/profile/get/my/", {},
                        function (data) {
                            current_user = data.result;
                            Auth.trigger("profile:mine", data.result);
                            $('.f_goto_userpage').attr('href', '@' + data.result.username + '/');
                            $('.f_goto_userpage').html('mixim.ru/@' + data.result.username + '/');
                        });
                }
            });
}

function auth_register(prefix) {
    if (!prefix) prefix = ''
    else prefix += '_';

    $('#' + prefix + 'reg_email').removeClass('invalid');
    $('#' + prefix + 'reg_username').removeClass('invalid');

    var email     = $('#' + prefix + 'reg_email').val();
    var username  = $('#' + prefix + 'reg_username').val();

    $.post("/json/auth/register/", {
        username: username,
        email: email,
    },
    function (data) {
        if (!data.success) {
            console.log(data.environment);
            if (data.environment.errors) {
                for (var prop in data.environment.errors) {
                    $('#reg_' + prop).addClass('invalid');
                }
                if (data.environment.errors.username) {
                    $('#' + prefix + 'reg_email').addClass('invalid');
                }
            }

            my_error(trans('&nbsp;&nbsp;The fields are filled correctly!'));
        }
        else {
            Auth.trigger("register", data.result);
            my_alert(trans('<b>Congratulations</b>'), trans('&nbsp;&nbsp;Registration was successful. Check your e-mail. You will be sent an email with an activation code.'));
            hide_window('register');
            //show_login_window();
            $('body').css('overflow-y', 'auto');
            $('#overlay').hide();
            $('.login_add_block').hide();

            //$('#send_message_login').show();
            $('#send_message_registration').hide();
        }
    }, "json");
}

function auth_resetpassword() {
    var email = $('#resetpassword_email').val();
    $.getJSON("/json/auth/resetpassword/", { email: email },
            function(data) {
                if (!data.success) {
                    var errorMsg = data.error.message;
                    switch (data.error.code) {
                        case 121:
                            errorMsg = trans('&nbsp;&nbsp;User not found. Check the <b>username/nickname</b> for errors and <b>try again</b>.');
                    }
                    $('#resetpassword_email').addClass('invalid');
                    my_error(errorMsg);
                }
                else {
                    Auth.trigger("resetpassword");
                    my_alert(trans('<b>Password recovery</b>'), trans('&nbsp;&nbsp;At your e-mail has been sent to. Follow the instructions in the letter.'));
                    $('body').css('overflow-y', 'auto');
                    $('#overlay').hide();
                    $('.login_add_block').hide();
                }
            });
}

function change_password(new_password, confirmation) {
    $.post('/json/auth/changepassword/', { new_password: new_password, confirmation: confirmation },
            function (data) {
                if (!data.success) {
                    Auth.trigger("change:password:fail");
                    return;
                }
                Auth.trigger("change:password:done");
            }, 'json');
}

//
// /user/ module
//


function user_stat(stat) {
    $.getJSON("/json/user/stat/", {}, function (data) {
        if (data.success) {
            stat.trigger('count', data.result.count);
        }
    });
}


function discussions(model) {
    $.getJSON("/json/discussion/list/", {'page':discussion_page},
            function (data) {
                if (data.success) {
                    model.trigger('load:discussions', data.result);
                }
            },
            "json");
}



function user_likes(model) {
    // TODO: support pagination
    $.getJSON("/json/user/likes/", {},
            function (data) {
                if (data.success) {
                    model.trigger('load:user_likes', data.result);
                }
            },
            "json");
}


function user_species(view, species) {
    var timestamp = new Date().getTime();
    var url = "/json/user/species/" + (species ? (species + "/") : "") + "?_=" + timestamp;
    $.getJSON(url, {}, function (data) {
        if (data.success) {
            var eventName = (species ? 'set' : 'get') + ':species';
            view.trigger(eventName, data.result);
        }
    });
}


//
// /profile/ module
//

function profile_save(properties) {
    $.post('/json/profile/save/', properties,
            function (data) {
                if (!data.success) {
                    Auth.trigger("change:profile:fail");
                    return;
                }
                Auth.trigger("change:profile:done");
            }, 'json');
}

//
// /myfilter/ module
//

function myfilter_save(settings) {
    $.post('/json/myfilter/save/', settings,
            function (data) {
                if (!data.success) {
                    Auth.trigger("change:myfilter:fail");
                    return;
                }
                Auth.trigger("change:myfilter:done");
            }, 'json');
}

//
// /pet/ module
//

function pet_enable(pet) {
    $.getJSON('/json/pet/enable/' + pet.id + '/', function (data) {
        if (!data.success) {
            my_error(trans('It is not possible to disable pet'));
            return;
        }

        pet.trigger('change:enabled', true);
    });
}

function pet_disable(pet) {
    $.getJSON('/json/pet/disable/' + pet.id + '/', function (data) {
        if (!data.success) {
            my_error(trans('It is not possible to enable pet'));
            return;
        }

        pet.trigger('change:enabled', false);
    });
}

function pet_add(model) {
    $.post('/json/pet/add/', model.params(), function (data) {
        if (!data.success) {
            my_error(trans('It is not possible to add pet'));
            return;
        }

        model.trigger('added', data.result);
    }, 'json');
}

function pet_save(model) {
    $.post('/json/pet/save/' + model.id + '/', model.params(), function (data) {
        if (!data.success) {
            my_error(trans('It is not possible to save pet'));
            return;
        }

        model.trigger('saved', data.result);
    }, 'json');
}

//
// /media/ module
//

function media_like() {
    var url = '/json/media/like/' + current_photo.id + '/';
    $.getJSON(url, {}, function (data) {
        if (data.success) {
            if (data.result) {
                current_photo.likes++;
                $('#media_likes').text(current_photo.likes);
                toggle_media_like_btns(true);
            }
        }
        else {
            my_alert(trans('Error'), data.error.message);
        }
    });
}

function media_unlike() {
    var url = '/json/media/unlike/' + current_photo.id + '/';
    $.getJSON(url, {}, function (data) {
        if (data.success) {
            current_photo.likes--;
            $('#media_likes').text(current_photo.likes);
            toggle_media_like_btns(false);
        }
        else {
            my_alert(trans('Error'), data.error.message);
        }
    });
}

function media_disable() {
    var url = '/json/media/disable/' + current_photo.id + '/';
    $.getJSON(url, {}, function (data) {
        if (data.success) {
            my_alert(trans('Finish'), trans('Photo removed.'));
            gallery_refresh();
            hide_window('photo');
        }
        else {
            my_alert(trans('Error'), data.error.message);
        }
    });
}

function media_save() {
    var pet = $('#f_photo_pet').val() || '';
    var species = $('#f_photo_species').val() || '';
    var description = $('#f_photo_description').val();
    var tags = $('#f_photo_tags').val();
    var petName = $('#f_photo_pet :selected').text();

    toggle_attention_block(species);

    var params = {
        pet: pet,
        species: species,
        description: description,
        tags: tags
    };

    $.post("/json/media/save/" + current_photo.id + "/", params,
            function (result) {
                if (result.success) {
                    my_alert(trans('Photo info'), trans('Saved.'));
                    // TODO: change properties of current_photo
                    $('#photo_pet').text(petName);
                    $('#photo_description').text(description);
                    $('#photo_tags').text(tags);
                }
            },
            "json");
}

//
// /friend/ module
//

var friendInfo = {
    "friends": [],
    "friend_of": []
}

function friend_list() {
    $.getJSON('/json/friend/list/', {},
            function (data) {
                if (data.success) {
                    friendInfo = data.result;
                }
            },
            "json");
}

function friend_add(user) {
    $.getJSON('/json/friend/add/' + user + '/', {},
            function (data) {
                if (data.success) {
                    // TODO: design subscription notification
                    friendInfo.friends.push(user);
                    $('#photo_add_friend').attr('title', trans('Not follow')).find('img').attr('src', '../images/favorite_person_remove.png');
                    alert(trans('You follow ') + user);
                }
            },
            "json");
}

function friend_remove(user) {
    $.getJSON('/json/friend/remove/' + user + '/', {},
            function (data) {
                if (data.success) {
                    // TODO: design subscription notification
                    friendInfo.friends = _.filter(friendInfo.friends,
                        function (friend) { return friend != user; });
                    $('#photo_add_friend').attr('title', trans('Follow')).find('img').attr('src', '../images/favorite_person_add.png');
                    alert(trans('You not follow ') + user);
                }
            },
            "json");
}

function friend_media(model) {
    // TODO: support pagination
    $.getJSON("/json/friend/media/0/10/", {},
            function (data) {
                if (data.success) {
                    model.trigger('load:friend_media', data.result);
                }
            },
            "json");
}

//
// /comment/ module
//

function comment_add(text_id) {
    var media_id = current_photo.id;
    var text_field = $('#' + text_id);

    $.post("/json/comment/add/" + media_id + "/", { text: text_field.val() },
            function (result) {
                if (result.success) {
                    text_field.val('');
                    $('.ss__nocomment_div').hide();
                    comment_list();
                }
            },
            "json")
}

function comment_list() {
    var media_id = current_photo.id;
    $.getJSON("/json/comment/list/" + media_id + "/", {},
            function (data) {
                if (data.success) {
                    var html = "";
                    $.each(data.result, function (idx, el) {
                        html +=
                        '<div style="margin:4px;">\n' +
                        '    <a href="/@' + el.author + '/" target="_blank" title="' + trans('on the user&#39;s profile') + '" style="font-weight:normal; text-transform:uppercase;">' + el.author + '</a>\n' +
                        '    <br>\n' +
                        '    &nbsp;&nbsp;&nbsp;' + el.text + '\n' +
                        '</div>\n';
                    });
                    $('.comment_container').html(html);
                    if (html == "") {
                        $('.ss__nocomment_div').show();
                    }
                }
            },
            "json")
}

function delete_comment(comment_id) {
    $.post("/json/comment/delete/", { "comment": comment_id },
            function (result) {
                if (result.success) {
                    $('#cabinet_news > #last_comments_id').empty();
                    last_comments();
                }
            },
            "json")
}

function last_comments(type, page) {
    if (type == undefined) {
        type = "inbox";
    }
    if (page == undefined) {
        page = 1
    }
    per_page = 15
    $.getJSON("/json/user/comments/" + type + "/?page="+page + '&per_page=' + per_page, {},
            function (data) {
                if (data.success) {
                    var html = "";
                    $.each(data.result.items, function (idx, el) {
                        html +=
                                '<div class="cabinet_message_box">' +
                                '    <a id="last_photo_' + el.mediaId + '" class="cabinet_tumbox finger" title="' + trans('Show photo') + '">' +
                                '        <img src="' + el.thumbnail + '">' +
                                '    </a>' +
                                '    <a class="message_delete_button cabinet_message_delete finger" id="comment_' + el.id + '" title="' + trans('Remove this comment') + '">' + trans('Remove') + '</a>' +
                                '    <span class="cabinet_message_info">' + trans('Comment') + ' ' + trans('from') + ' <a href="/@' + el.author + '/" target="_blank">' + el.author + '</a>:</span>' +
                                '    <div class="cabinet_message">' +
                                '        <span class="opa50">' + trans('sent') + ' ' + el.created + '</span>' +
                                '        <p>' + el.text + '</p>' +
                                '    </div>' +
                                '</div>';
                    });
                    pager =
                    '        <div class="comment_paginator_box">';
                    if ( page > 1 ) {
                      pager +=
                    '            <div class="comment_horizontal_box">' +
                    '                <div id="user_comments_previous" class="media_prevpage finger"></div>' +
                    '            </div>';
                    }
                    if (page * per_page < data.result.total) {
                      pager +=
                    '            <div class="comment_horizontal_box">' +
                    '                <div id="user_comments_next" class="media_nextpage finger"></div>' +
                    '            </div>';
                    }
                    pager +=
                    '        </div>';
                    $('#cabinet_news > #last_comments_id').html(html+pager);
                    $('#user_comments_next').click(function(){last_comments(type, page+1)})
                    $('#user_comments_previous').click(function(){last_comments(type, page-1)})
                    $('a[id*=last_photo]').click(function() {show_photo($(this).attr("id").replace("last_photo_", ""))})
                    $('.message_delete_button').bind('click', function(event) {confirm_delete_comment(event)});
                }
            },
            "json")
}

function last_outbox(comments) {
    $.getJSON("/json/comment/last/outbox/", {}, function (data) {
        if (data.success) {
            comments.trigger('comments', data.result);
        }
    });
}

function last_all_comments(comments) {
    $.getJSON("/json/comment/last/all/", {}, function (data) {
        if (data.success) {
            comments.trigger('comments', data.result);
        }
    });
}
