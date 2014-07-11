<VirtualHost *:80>
    ServerAdmin admin@mixim.ru
    ServerName dev.mixim.ru
    ServerAlias dev.mixim.us
    DocumentRoot /var/www/html/mixim.dev/static
    ErrorDocument 404 /404/

    <Directory /var/www/html/mixim.dev/static/bo/>
        AuthType Basic
        AuthName "Mixim BO"
        AuthUserFile /var/www/html/mixim.dev/static/bo/passwd
        Require user admin
    </Directory>

    Alias /favicon.ico /var/www/html/mixim.dev/static/favicon.ico
    Alias /media/ /var/www/html/mixim.dev/static/media/
    Alias /temp/ /var/www/html/mixim.dev/static/temp/
    AliasMatch ^/(.*?\.(jpg|gif|png|css|js|html|php|apk|txt)) /var/www/html/mixim.dev/static/$1

    WSGIScriptAlias / /var/www/html/mixim.dev/site/wsgi.py
    WSGIDaemonProcess mixim.dev python-path=/var/www/html/mixim.dev/site
    WSGIProcessGroup mixim.dev

    ErrorLog /var/www/logs/mixim.dev/error.log
    CustomLog /var/www/logs/mixim.dev/access.log combined
</VirtualHost>
