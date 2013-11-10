var translations = {
    'You are subscribed to %s': 'Вы подписаны на %s',
    '<center><b>Authorization error!</b></center>&nbsp;&nbsp;Perhaps incorrectly filled fields <b>username/nickname</b> and <b>password</b>. Check for errors and <b>try again</b>.': '<center><b>Ошибка авторизации!</b></center>&nbsp;&nbsp;Возможно неверно заполнены поля <b>логин/никнейм</b> и <b>пароль</b>. Проверьте на наличие ошибок и <b>повторите попытку</b>.',
    '&nbsp;&nbsp;The fields are filled correctly!': '&nbsp;&nbsp;Поля заполнены неверно!',
    '<b>Congratulations</b>': '<b>Поздравляем!</b>',
    '&nbsp;&nbsp;Registration was successful. Check your e-mail. You will be sent an email with an activation code.': '&nbsp;&nbsp;Регистрация прошла успешно. Проверьте вашу почту, на ваш почтовый ящик было отправлено письмо с кодом активации.',
    '&nbsp;&nbsp;User not found. Check the <b>username/nickname</b> for errors and <b>try again</b>.': '&nbsp;&nbsp;Пользователь не найден. Проверьте <b>логин/никнейм</b> на наличие ошибок и <b>повторите попытку</b>.',
    '<b>Password recovery</b>': '<b>Восстановление пароля</b>',
    '&nbsp;&nbsp;At your e-mail has been sent to. Follow the instructions in the letter.': '&nbsp;&nbsp;На Ваш почтовый ящик было отправлено письмо. Следуйте дальнейшим инструкциям, указанным в письме.',
    'It is not possible to disable pet': 'Не возможно отключить питомца',
    'It is not possible to enable pet': 'Не возможно включить питомца',
    'It is not possible to add pet': 'Не возможно добавить питомца',
    'It is not possible to save pet': 'Не возможно сохранить питомца',
    'Error': 'Ошибка',
    'Finish': 'Готово',
    'Photo removed.': 'Фото удалено.',
    'Photo info': 'Информация о фото',
    'Saved.': 'Сохранено.',
    'Not follow': 'Отписаться',
    'You follow ': 'Вы подписаны на ',
    'Follow': 'Подписаться',
    'You not follow ': 'Вы отписаны от ',
    'on the user&#39;s profile': 'к профилю пользователя',
    'Show photo': 'Показать фото',
    'Comment': 'Коментарий',
    'Remove this comment': 'Удалить этот комментарий',
    'Remove': 'Удалить',
    'Dogs': 'Собаки',
    'Butterflies, praying mantises, centipedes, spiders, Madagascar cockroaches, ants and other insects': 'Бабочки, богомолы, многоножки, пауки, мадагаскарские тараканы, муравьи и прочие насекомые',
    'Parakeets, canaries, goldfinches, hawks, falcons, nightingales, quails, pigeons and other birds': 'Попугаи, канарейки, щеглы, ястребы, соколы, соловьи, перепела, голуби и другие пернатые',
    'Cats': 'Кошки',
    'Chinchilla, mice, guinea pigs, rats, rabbits, hamsters, hedgehogs, gerbils, ferrets, etc.': 'Шиншилы, мышки, морские свинки, крысы, кролики, хомячки, ежики, песчанки, хорьки и т.д.',
    'Aquarium fish and snails': 'Аквариумные рыбки и улитки',
    'Snakes, frogs, turtles, etc.': 'Змеи, лягушки, черепахи, и т.п.',
    'Horses and ponies': 'Лошади и пони',
    'Primates, parnokopynye, shestokrylye and other exotic species': 'Приматы, парнокопыные, шестокрылые и остальные экзотические виды',
    'Password changed': 'Пароль изменен',
    'Error when changing password': 'Ошибка при изменении пароля',
    'Data has been modified': 'Данные изменены',
    'Incorrectly editing the data': 'Ошибка при изменении данных',
    'To delete a post?': 'Удалить сообщение?',
    'added a new photo': 'добавил(а) новое фото',
    'Like': 'Лайк',
    'like photo': 'понравилось фото',
    '': ''
};

function trans(key) {
    var translated = translations[key];
    var format = translated ? translated : key;
    var values = [].splice.call(arguments, 1);
    return vsprintf(format, values);
}
