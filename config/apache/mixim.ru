<VirtualHost *:80>
    ServerAdmin admin@mixim.ru
    ServerName mixim.ru
    ServerAlias www.mixim.ru mixim.us www.mixim.us mixim.co www.mixim.co mixim.us.com www.mixim.us.com
    DocumentRoot /var/www/html/mixim.ru/static
    ErrorDocument 404 /404/

    <Directory /var/www/html/mixim.ru/static/bo/>
        AuthType Basic
        AuthName "Mixim BO"
        AuthUserFile /var/www/html/mixim.ru/static/bo/passwd
        Require user admin
    </Directory>

    Alias /favicon.ico /var/www/html/mixim.ru/static/favicon.ico
    Alias /media/ /var/www/html/mixim.ru/static/media/
    Alias /temp/ /var/www/html/mixim.ru/static/temp/
    AliasMatch ^/(.*?\.(jpg|gif|png|css|js|html|php|apk|txt)) /var/www/html/mixim.ru/static/$1

    WSGIScriptAlias / /var/www/html/mixim.ru/site/wsgi.py
    WSGIDaemonProcess mixim.ru python-path=/var/www/html/mixim.ru/site
    WSGIProcessGroup mixim.ru

    ErrorLog /var/www/logs/mixim.ru/error.log
    CustomLog /var/www/logs/mixim.ru/access.log combined

</VirtualHost>

