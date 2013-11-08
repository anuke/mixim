var translations = {
};

function trans(key) {
    var translated = translations[key];
    var format = translated ? translated : key;
    var values = [].splice.call(arguments, 1);
    return vsprintf(format, values);
}
