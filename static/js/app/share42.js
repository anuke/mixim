(function ($) {
    $(function () {
        $('div.share42init').each(function (idx) {
            var el = $(this),
                u = el.attr('data-url'),
                t = el.attr('data-title'),
                i = el.attr('data-image'),
                d = el.attr('data-description'),
                f = el.attr('data-path'),
                z = el.attr("data-zero-counter");
            if (!u) u = location.href;
            if (!z) z = 0;

            function fb_count(url) {
                var shares;
                $.getJSON('http://graph.facebook.com/?callback=?&ids=' + encodeURIComponent(url), function (data) {
                    shares = data[url].shares || 0;
                    if (shares > 0 || z == 1) el.find('a[data-count="fb"]').after('<span class="share42-counter">' + shares + '</span>')
                })
            }
            fb_count(u);

            function odkl_count(url) {
                var shares;
                $.getScript('http://www.odnoklassniki.ru/dk?st.cmd=extLike&uid=' + idx + '&ref=' + url);
                if (!window.ODKL) window.ODKL = {};
                window.ODKL.updateCount = function (idx, number) {
                    shares = number;
                    if (shares > 0 || z == 1) $('div.share42init').eq(idx).find('a[data-count="odkl"]').after('<span class="share42-counter">' + shares + '</span>')
                }
            }
            odkl_count(u);

            function twi_count(url) {
                var shares;
                $.getJSON('http://urls.api.twitter.com/1/urls/count.json?callback=?&url=' + url, function (data) {
                    shares = data.count;
                    if (shares > 0 || z == 1) el.find('a[data-count="twi"]').after('<span class="share42-counter">' + shares + '</span>')
                })
            }
            twi_count(u);

            function vk_count(url) {
                var shares;
                $.getScript('http://vk.com/share.php?act=count&index=' + idx + '&url=' + url);
                if (!window.VK) window.VK = {};
                window.VK.Share = {
                    count: function (idx, number) {
                        shares = number;
                        if (shares > 0 || z == 1) $('div.share42init').eq(idx).find('a[data-count="vk"]').after('<span class="share42-counter">' + shares + '</span>')
                    }
                }
            }
            vk_count(u);
            if (!f) {
                function path(name) {
                    var sc = document.getElementsByTagName('script'),
                        sr = new RegExp('^(.*/|)(' + name + ')([#?]|$)');
                    for (var i = 0, scL = sc.length; i < scL; i++) {
                        var m = String(sc[i].src).match(sr);
                        if (m) {
                            if (m[1].match(/^((https?|file)\:\/{2,}|\w:[\/\\])/)) return m[1];
                            if (m[1].indexOf("/") == 0) return m[1];
                            b = document.getElementsByTagName('base');
                            if (b[0] && b[0].href) return b[0].href + m[1];
                            else return document.location.pathname.match(/(.*[\/\\])/)[0] + m[1];
                        }
                    }
                    return null;
                }
                f = "../images/";
            }
            if (!t) t = document.title;
            if (!d) {
                var meta = $('meta[name="description"]').attr('content');
                if (meta !== undefined) d = meta;
                else d = '';
            }
            u = encodeURIComponent(u);
            t = encodeURIComponent(t);
            t = t.replace(/\'/g, '%27');
            i = encodeURIComponent(i);
            d = encodeURIComponent(d);
            d = d.replace(/\'/g, '%27');
            var fbQuery = 'u=' + u;
            if (i != 'null' && i != '') fbQuery = 's=100&p[url]=' + u + '&p[title]=' + t + '&p[summary]=' + d + '&p[images][0]=' + i;
            var vkImage = '';
            if (i != 'null' && i != '') vkImage = '&image=' + i;
            var s = new Array('"#" data-count="fb" onclick="window.open(\'http://www.facebook.com/sharer.php?' + fbQuery + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться в Facebook"', '"#" onclick="window.open(\'https://plus.google.com/share?url=' + u + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться в Google+"', '"#" data-count="odkl" onclick="window.open(\'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st._surl=' + u + '&title=' + t + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Добавить в Одноклассники"', '"#" data-count="twi" onclick="window.open(\'https://twitter.com/intent/tweet?text=' + t + '&url=' + u + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Добавить в Twitter"', '"#" data-count="vk" onclick="window.open(\'http://vk.com/share.php?url=' + u + '&title=' + t + vkImage + '&description=' + d + '\', \'_blank\', \'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0\');return false" title="Поделиться В Контакте"');
            var l = '';
            for (j = 0; j < s.length; j++) l += '<span class="share42-item" style="display:inline-block;margin:0 6px 6px 0;height:40px;"><a rel="nofollow" style="display:inline-block;width:40px;height:40px;margin:0;padding:0;outline:none;background:url(' + f + 'share42_icons.png) -' + 40 * j + 'px 0 no-repeat" href=' + s[j] + ' target="_blank"></a></span>';
            el.html('<span id="share42">' + l + '</span>');
            //el.html('<span id="share42">' + l + '</span>' + '<style>.share42init{height:40px;} .share42-counter{display:inline-block;vertical-align:top;margin-left:9px;margin-top:4px;position:relative;background:#FFF;color:#666;} .share42-counter:before{content:"";position:absolute;top:0;left:-8px;width:9px;height:100%;} .share42-counter{padding:0 9px 0 4px;font:14px/32px Arial,sans-serif;color:#f24f00;background:url(../images/share42_cloud_100-32.png) no-repeat 100% 0;} .share42-counter:before{background:url(../images/share42_cloud_8-32.png) no-repeat;}</style>');
        })
    })
})(jQuery);