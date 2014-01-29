	$(this).keydown(function(eventObject)
	{
		if (eventObject.which == 27)
		{
			if ($('#photo_window').css('display') == 'block')
			{
				$('#photo_window').hide();
                $( ".code_window" ).hide();
			}
				
			if ($('.about_block').is(':visible'))
			{
                $('body').css('overflow-y', 'auto'); // возвращаем скрол
                $('#overlay').hide(); // освеляем
                $('.about_block').hide(); // скрываем окно
			}

			if ($('.rules_block').is(':visible'))
			{
                $('body').css('overflow-y', 'auto'); // возвращаем скрол
                $('#overlay').hide(); // освеляем
                $('.rules_block').hide(); // скрываем окно
			}

			if ($('.feedback_block').is(':visible'))
			{
                $('body').css('overflow-y', 'auto'); // возвращаем скрол
                $('#overlay').hide(); // освеляем
                $('.feedback_block').hide(); // скрываем окно
			}

			if ($('.sitemap_block').is(':visible'))
			{
                $('body').css('overflow-y', 'auto'); // возвращаем скрол
                $('#overlay').hide(); // освеляем
                $('.sitemap_block').hide(); // скрываем окно
			}
            
            $('#overlay').css('top', '0'); // обнуляем верхнюю точку
		}
	});