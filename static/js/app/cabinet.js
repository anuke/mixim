//
// Storing pet
//

var __PET_FIELDS = ['name', 'breed_index', 'birthday', 'gender', 'color', 'about', 'species'];

function pet_gender_name(gender) {
    if (gender == 'M') {
        return trans('Boy');
    }
    else if (gender == 'F') {
        return trans('Girl');
    }

    return '';
}

////////

function __append_pet_block(pet) {
    _.extend(pet, Backbone.Events);

    pet.on('change:enabled', function (enabled) {
        this.enabled = enabled;

        $('#pet_enable_link_' + this.id).toggle(!enabled);
        $('#pet_disable_link_' + this.id).toggle(enabled);

        gallery_refresh();
    });

    if (!pet.last_picture) {
        pet.last_picture = "/images/absent.png";
    }

    pet.gender_name = pet_gender_name(pet.gender);

    $('#pet_list').append($('#pet_template').populate(pet));

    if (!!pet.last_picture) {
        $('#pet_last_picture_' + pet.id).attr('src', pet.last_picture);
    }

    $('#pet_enable_link_' + pet.id).
        toggle(!pet.enabled).
        click(function() { pet_enable(pet); });
    $('#pet_disable_link_' + pet.id).
        toggle(pet.enabled).
        click(function() { pet_disable(pet); });

    $('#pet_edit_window_link_' + pet.id).click(__show_pet_window(pet));
    $('#pet_upload_photo_link_' + pet.id).click(open_upload(pet.id));
}

function __reset_pet_window_controls() {
    $('#pet_id').val('');
    $('#pet_standard_dog').val('');

    var model = $('#pet_window').data('model');
    var params = !!model ? model.params() : {};

    function get_field(name) {
        var result = params[name];
        if (!!result) return result;
        return '';
    }

    _.each(__PET_FIELDS, function (name) {
        $('#pet_' + name).val(get_field(name));
    });

    select_breed_list(false);
}

function __close_pet_window() {
    __reset_pet_window_controls();

    pw_close(); /* addpet.html */

    $('body').css('overflow-y', 'auto');
    $('#overlay').hide();
    $('#pet_window').hide();
}

function __show_pet_window(pet) {
    return function () {
        function params() {
            function normalize(s) {
                if (typeof s == 'string' || s instanceof String) {
                    return $.trim(s);
                }

                return "";
            }

            function pet_name_and_val(name) {
                return [name, $('#pet_' + name).val()];
            }

            var result = _.chain(__PET_FIELDS).map(pet_name_and_val).object().value();
            var breed = $('#pet_breed_index option:selected').text();
            result.breed = normalize(breed);
            return result;
        }

        function orEmpty(v) {
            return !!v ? v : '';
        }

        var model = {
            id: orEmpty(pet.id),
            pet: pet,
            params: params,
        };

        _.extend(model, Backbone.Events);
        $('#pet_window').data('model', model);

        model.on('saved', function (saved_pet) {
            __close_pet_window();

            _.each(__PET_FIELDS, function (name) {
                model.pet[name] = saved_pet[name];
            });

            // update view: move to pet.listeners['changed']?
            _.each(__PET_FIELDS, function (name) {
                if (name == 'gender') {
                    $('#pet_gender_' + model.id).text(pet_gender_name(pet.gender));
                }
                else {
                    $('#pet_' + name + '_' + model.id).text(saved_pet[name]);
                }
            });
            $('#pet_breed_' + model.id).text(saved_pet.breed);
        });

        model.on('added', function (added_pet) {
            __close_pet_window();

            _.each(__PET_FIELDS, function (name) {
                model.pet[name] = added_pet[name];
            });

            model.pet.id = added_pet.id;
            current_user.pets.push(model.pet);
            __append_pet_block(model.pet);

            // add to photo pet select list
            $('#f_photo_pet').append($('<option>').attr('value', added_pet.id).text(added_pet.name));
        });

        pw_showClusterPetData(model.pet.species)

        // handle breed controls
        $('#pet_standard_dog').val('');
        $("#pet_breed_index").prop('disabled', true);
        $('#pet_breed_index option').toggleOption(false);
        $('#pet_breed_index option:first').toggleOption(true);
        if (pet.breed_index) {
            // Standard is exactly 3 chars!
            var standard = pet.breed_index.substring(0, 3);
            $('#pet_standard_dog').val(standard);
            $('#pet_breed_index option[value^=' + standard + ']').toggleOption(true);
            $("#pet_breed_index").prop('disabled', false);
        }

        // render
        $('body').css('overflow-y', 'hidden');
        $('#overlay').show();
        $('#pet_window').show();

        $('#pet_id').val(orEmpty(pet.id));
        _.each(__PET_FIELDS, function (name) {
            $('#pet_' + name).val(orEmpty(pet[name]));
        });
    }
}

//
// From addpet
//

/* Окно создания и редактирования питомца - pet_window - pw */
var NO_CLUSTER = "0";
var pw_cluster = NO_CLUSTER;
var cluster_names = {
    "dog": trans('Dogs'),
    "insect": trans('Butterflies, praying mantises, centipedes, spiders, Madagascar cockroaches, ants and other insects'),
    "bird": trans('Parakeets, canaries, goldfinches, hawks, falcons, nightingales, quails, pigeons and other birds'),
    "cat": trans('Cats'),
    "rodent": trans('Chinchilla, mice, guinea pigs, rats, rabbits, hamsters, hedgehogs, gerbils, ferrets, etc.'),
    "fish": trans('Aquarium fish and snails'),
    "reptile": trans('Snakes, frogs, turtles, etc.'),
    "horse": trans('Horses and ponies'),
    "other": trans('Primates, parnokopynye, shestokrylye and other exotic species')
};

function pw_showClusterPetData(cluster) {
    if (cluster == pw_cluster) return;

    $('#pet_species').val(cluster);

    $("#pw_name, #pw_breed, #pw_gender, #pw_color, #pw_birthday, #pw_about").hide();
    $("#pw_pet_data").show();
    __reset_pet_window_controls();

    if (_.has(cluster_names, cluster)) {
        $("#pw_id_pets_list").text(cluster_names[cluster]);
        $("#pw_name, #pw_gender, #pw_color, #pw_birthday, #pw_about").show();
        if (_.contains(["dog"], cluster)) {
            $("#pw_standard").show();
            $("#pet_breed_index").css("width", "210px");
            $("#pw_breed").show();
        }
        else {
            $("#pw_standard").hide();
            $("#pet_breed_index").css("width", "301px");
        }
        if (_.contains(["cat"], cluster)) {
            $("#pw_breed").show();
            select_breed_list('CAT');
        }
    }

    if (pw_cluster == NO_CLUSTER) {
        $("#pw_save_button").show();
    }

    $('#pw_cluster_button_img_' + cluster).addClass('opa25');
    if (pw_cluster != NO_CLUSTER) {
        $('#pw_cluster_button_img_' + pw_cluster).removeClass('opa25');
    }
    $('#pet_save_btn').show();
    if (cluster === undefined) {
        $('#pw_pet_data').css('display','none');
        $('#pet_save_btn').hide();
    }

    pw_cluster = cluster;
};

function pw_close() {
    if (pw_cluster != NO_CLUSTER) {
        $('#pw_cluster_button_img_' + pw_cluster).removeClass('opa25');
    }

    $("#pw_id_pets_list").text("");
    pw_cluster = NO_CLUSTER;
    $('#pw_pet_data, #pw_save_button').hide();
}

//
// Handlers
//

if (typeof(gallery_auto_load) === "undefined") {
    var gallery_auto_load = false;
}
else {
    gallery_auto_load = false;
}

Auth.on("logged", function (logged) {
    if (!logged) {
        document.location.href = 'index.shtml';
    }
});

Auth.on("logout", function () {
    document.location.href = 'index.shtml';
})

Auth.on("profile:mine", function (profile) {
    _.each(profile.pets, __append_pet_block);

    function or_blank(v) { return !v ? '' : v }

    $('#f_user_country').val(or_blank(profile.country));
    $('#f_user_city').val(or_blank(profile.city));
    $('#f_user_about').val(or_blank(profile.about));
    $('#f_user_gender').val(or_blank(profile.gender));
    $('#f_user_birthday').val(or_blank(profile.birthday));
    $('#f_user_firstname').val(or_blank(profile.first_name));
    $('#f_user_lastname').val(or_blank(profile.last_name));
    $('#f_user_filter_mycountry').val(profile.filter_mycountry ? 'True' : 'False');

    $('#avatar').attr('src', profile.avatar);

    gallery_load({ author_id: profile.user_id, species: 'all' });
    friends_media_load();
    my_likes_load();
});

Auth.on("change:password:done", function () {
    alert(trans('Password changed'));
    $('#f_new_password').val('');
    $('#f_confirmation').val('');
});

Auth.on("change:password:fail", function () {
    alert(trans('Error when changing password'));
});

Auth.on("change:profile:done", function (props) {
    alert(trans('Data has been modified'));
    for (name in props) {
        current_user[name] = props[name]
    }
});

Auth.on("change:profile:fail", function () {
    alert(trans('Incorrectly editing the data'));
});

Auth.on("change:myfilter:done", function () {
    alert(trans('Your settings had been changed successfully.'));
});

Auth.on("change:myfilter:fail", function () {
    alert(trans('Can not change your settings, sorry.'));
});

function cabinet_change_password() {
    var new_password = $('#f_new_password').val();
    var confirmation = $('#f_confirmation').val();

    change_password(new_password, confirmation);
}

function cabinet_save_myfilter() {
    myfilter_save({
        filter_mycountry: $('#f_user_filter_mycountry').val()
    });
}

function cabinet_update_profile() {
    var country = $('#f_user_country').val();
    var city = $('#f_user_city').val();
    var about = $('#f_user_about').val();
    var gender = $('#f_user_gender').val();
    var birthday = $('#f_user_birthday').val();
    var first_name = $('#f_user_firstname').val();
    var last_name = $('#f_user_lastname').val();

    profile_save({
        country: country,
        city: city,
        about: about,
        gender: gender,
        birthday: birthday,
        first_name: first_name,
        last_name: last_name
    });
}

function confirm_delete_comment(event) {
    var del = confirm(trans('To delete a post?'));
    if (del) {
        delete_comment(event.currentTarget.id.replace("comment_", ""))
    }
}

function inbox_outbox() {
    if ($(this).attr("id") == "outbox_pet_new_window_link") {
        $("#inbox_pet_new_window_link").addClass("on_button");
        $("#outbox_pet_new_window_link").removeClass("on_button");
        last_comments("outbox");
    }
    else {
        $("#outbox_pet_new_window_link").addClass("on_button");
        $("#inbox_pet_new_window_link").removeClass("on_button");
        last_comments("inbox");
    }
}

function friends_media_load() {
    $('#cabinet_follow').empty();

    var view = {};
    _.extend(view, Backbone.Events);

    view.on('load:friend_media', function (media_list) {
        _.each(media_list, function (media) {
            $('#cabinet_follow').append(
                '<table width="600px" border="0" cellspacing="0" cellpadding="0" style="margin-top:10px;">\n' +
                '    <tr>\n' +
                '        <td align="center" class="cabinet_like_box_from">\n' +
                '            <a class="finger">\n' +
                '                <img src="' + media.authorAvatar + '" width="75px" height="75px" border="0">\n' +
                '            </a>\n' +
                '        </td>\n' +
                '        <td align="left" class="cabinet_like_box_username">\n' +
                '            <div style="position:absolute; color:#999999; margin-top:-20px; font-size:9px;">' + media.created + '</div>\n' +
                '            <a href="/@' + media.author + '" target="_blank">' + media.author + '</a> ' + trans('added a new photo') + '\n' +
                '        </td>\n' +
                '        <td align="center" width="100px">\n' +
                '            <img src="/images/cabinet_new_photo.png" width="44px" height="44px" border="0" alt="' + trans('Like') + '">\n' +
                '        </td>\n' +
                '        <td class="cabinet_like_box_photo">\n' +
                '            <a id="cabinet_follow_media_' + media.id + '" class="finger">\n' +
                '                <img src="' + media.thumbnail + '" width="100px" height="75px" border="0" title="' + trans('Comment') + ': ' + media.description + '">\n' +
                '            </a>\n' +
                '        </td>\n' +
                '    </tr>\n' +
                '</table>\n');

            $('#cabinet_follow_media_' + media.id).click(
                    function () { show_photo(media.id); });
        });
    });

    friend_media(view);
}

function my_likes_load() {
    $('#cabinet_like').empty();

    var view = {};
    _.extend(view, Backbone.Events);

    view.on('load:user_likes', function (likes) {
        _.each(likes, function (like, index) {
            $('#cabinet_like').append(
                '<table width="600px" border="0" cellspacing="0" cellpadding="0" class="cabinet_like_box" style="margin-top:10px;">\n' +
                '   <tr>\n' +
                '        <td align="center" class="cabinet_like_box_from">\n' +
                '            <a href="/@' + like.user + '" target="_blank">\n' +
                '                <img src="' + like.userAvatar + '" width="75px" height="75px" border="0">\n' +
                '            </a>\n' +
                '        </td>\n' +
                '        <td align="left" class="cabinet_like_box_username">\n' +
                '            <a href="/@' + like.user + '" target="_blank">' + like.user + '</a> ' + trans('like photo') + '\n' +
                '        </td>\n' +
                '        <td align="center" width="100px">\n' +
                '                <img src="/images/cabinet_like.png" width="44px" height="44px" border="0" alt="' + trans('Like') + '">\n' +
                '        </td>\n' +
                '        <td class="cabinet_like_box_photo">\n' +
                '            <a id="cabinet_like_like_' + index + '" class="finger">\n' +
                '                <img src="' + like.media.thumbnail + '" width="100px" height="75px" border="0">\n' +
                '            </a>\n' +
                '        </td>\n' +
                '    </tr>\n' +
                '</table>\n');

            $('#cabinet_like_like_' + index).click(
                    function () { show_photo(like.media.id); });
        });
    });

    user_likes(view);
}


function load_discussions() {
    $('#cabinet_discussion > div').empty();

    var view = {};
    _.extend(view, Backbone.Events);

    view.on('load:discussions', function (discussions) {
      pager =
            '<div class="pagination">' +
            '<div class="step-links">';
      if (discussions.paginator.has_previous) {
          pager += '<a class="discussion_previous_page pagination_left_page" href="#page=' + ( discussions.paginator.current_page - 1 ) + '">' + trans('« Back') + '</a>';
      }
      else {
          pager += '<a class="pagination_left_page_off" style="padding:3px 5px 4px"></a>';
      }
      pager += '<a class="pagination_current_page">' +
                   trans('Page %s of %s', discussions.paginator.current_page, discussions.paginator.pages) +
               '</a>';
      if (discussions.paginator.has_next ) {
          pager += '<a class="discussion_next_page pagination_right_page" href="#page=' + (discussions.paginator.current_page + 1) + '">' + trans('Forward »') + '</a>';
      }
      else {
          pager += '<a class="pagination_right_page_off" style="padding:3px 5px 4px"></a>';
      }
      pager += '</div></div>';

      $('#cabinet_discussion > div').append(pager);

      _.each(discussions.results, function (discussion, index) {
            $('#cabinet_discussion > div').append(
              '<a id="discussion_photo_' + discussion.id + '" class="cabinet_discussion_box_photo">' +
              '<div class="cabinet_discussion_box_photo_info_bkg opa50"></div>' +
              '<div class="cabinet_discussion_box_photo_info">' + discussion.created.replace(/\//g, '.').substr(0, 10) + '</div>' +
              '<img src="' + discussion.thumbnail + '" height="75px" border="0" width="100px"></a>');
              $('#discussion_photo_' + discussion.id).click(function() { show_photo(discussion.id) } );
        });

      $('#cabinet_discussion > div').append(pager);

      $('.discussion_next_page').click(function() {
          discussion_page += 1;
          load_discussions();
      });

      $('.discussion_previous_page').click(function() {
          discussion_page -= 1;
          load_discussions();
      });

    });
    discussions(view);
}
//
// onload
//

var user_menu_button_name = 'news';

$(document).ready(function() {
    function show_in_cabinet(name) {
        $('#cabinet_' + name + '_link').click(
            function() {
            $('#cabinet_' + user_menu_button_name + '_link').removeClass('cabinet_user_menu_button_off').addClass('cabinet_user_menu_button');
            $('#cabinet_' + name + '_link').removeClass('cabinet_user_menu_button').addClass('cabinet_user_menu_button_off');
            user_menu_button_name = name;
                $('.s__cabinet_block').hide();
                $('#cabinet_' + name).show();
                return false;
            });
    }
    show_in_cabinet('news');
    show_in_cabinet('discussion');
    show_in_cabinet('like');
    show_in_cabinet('follow');
    show_in_cabinet('pets');
    show_in_cabinet('mine');
    show_in_cabinet('settings');

    //
    // pets block
    //

    $('#pet_close_btn').click(function () {
        $('#animals_window').hide();
    });

    $('#pet_close_btn').click(function() {});

    $('#cabinet_discussion_link').click(load_discussions);

    $('#pet_new_window_link').click(__show_pet_window({}));

    $('#pet_window_close_link, #pet_close_btn').click(__close_pet_window);

    $('#inbox_pet_new_window_link, #outbox_pet_new_window_link').click(inbox_outbox);

	$('#pet_save_btn').click(function() {
        var model = $('#pet_window').data('model');
        var save = !!model.id ? pet_save : pet_add;
        save($('#pet_window').data('model'));
    });

    $('#avatar').click(open_uploadavatar);
});
