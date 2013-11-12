//
// Global variables
//

var current_photo = null;
var current_user = null;
var current_species = null;

var discussion_page = 1;

var Auth = {};
_.extend(Auth, Backbone.Events);

Auth.on("logged", function (logged) {
    $('.img_login_btn').click(function() {
        $('#send_message_needauth').hide();
        $('#send_message_login').show();
        $('#send_message_registration').hide();
        $('.send_message_speech').removeClass('send_message_speech_registration');
        $('.send_message_speech').addClass('send_message_speech_login');
        return false;
    })

    $('.img_reg_btn').click(function() {
        $('#send_message_needauth').hide();
        $('#send_message_registration').show();
        $('#send_message_login').hide();
        $('.send_message_speech').removeClass('send_message_speech_login');
        $('.send_message_speech').addClass('send_message_speech_registration');
        return false;
    })

    $('#photo_win_close_btn').click(function() {
        $('#photo_window').hide();
        current_photo = null;
        $('#ss__nocomment_div').hide();
    });

    if (logged) {
        friend_list();
    }
});

Auth.on("profile:mine", function (user) {
    $('#avatar').attr("src", user.avatar);
    for (var i = 0; i < user.pets.length; i++) {
        var pet = user.pets[i];
        $('#f_photo_pet').append($('<option>').attr('value', pet.id).text(pet.name));
    }
});

//
// After load
//

jQuery(document).ready(function() {
    function __comment_add(id) {
        return function() {
            comment_add(id);
        }
    }

    $('#author_comment_add_btn').click(__comment_add('author_comment_text'));
    $('#viewer_comment_add_btn').click(__comment_add('viewer_comment_text'));

    $('#noauto_block').hide();
    $('#auto_block').hide();

    auth_logged();
    last_comments();

    $('#photo_add_friend').click(
        function () {
            if (_.contains(friendInfo.friends, current_photo.author)) {
                friend_remove(current_photo.author);
            }
            else {
                friend_add(current_photo.author);
            }
        });

    $( "#f_user_birthday, #pet_birthday" ).datepicker({"yearRange": "-60:+0"});
    $( "#f_user_birthday, #pet_birthday" ).datepicker( "option", "dateFormat", "dd/mm/yy" );
    $( "#f_user_birthday, #pet_birthday" ).datepicker( "option", "changeMonth", "true" );
    $( "#f_user_birthday, #pet_birthday" ).datepicker( "option", "changeYear", "true" );

    // photo species handling

    var f_photo_species = $('#f_photo_species');
    var f_photo_pet = $('#f_photo_pet');
    f_photo_species.change(function () {
        f_photo_pet.val('');
    });
    f_photo_pet.change(function () {
        var pet_id = $(this).val();
        var pets = _.filter(current_user.pets,
            function (pet) { return pet.id == pet_id; });

        if (pets.length == 0) return;

        f_photo_species.val(pets[0].species);
    });

    // load current species

    var species_view = {};
    _.extend(species_view, Backbone.Events);

    species_view.on('get:species', function (species) {
        current_species = species;
        $('#cluster_' + species).show();
    });
    user_species(species_view);
});
