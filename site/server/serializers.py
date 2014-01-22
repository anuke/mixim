from django.db.models import Manager
from django.db.models.query import QuerySet
from django.http import HttpResponse

import json
from xml.etree import ElementTree as ET
import datetime


def to_plain(value):
    if value is None:
        return None
    if isinstance(value, (bool, int, long, float, basestring)):
        return value
    if isinstance(value, datetime.datetime):
        return value.strftime("%d/%m/%Y %H:%M:%S")
    if isinstance(value, datetime.date):
        return value.strftime("%d/%m/%Y")
    if isinstance(value, (set, list)):
        return map(to_plain, value)
    if isinstance(value, dict):
        return dict([(k, to_plain(v)) for (k, v) in value.iteritems()])
    if isinstance(value, (Manager, QuerySet)):
        return to_plain(list(value.all()))
    return value.plain_data()


def to_plain_data(data, *props):
    def get_prop(obj, name):
        if obj is None:
            return None

        path = name.split(".")

        for prop in path:
            obj = getattr(obj, prop)
            if obj is None:
                return None

        return to_plain(obj)

    def go(prop):
        splitted = prop.split(":")

        if len(splitted) == 1:
            (key, value) = (prop, prop)
        else:
            (key, value) = (splitted[0], splitted[1])

        return (key, get_prop(data, value))

    return dict([go(prop) for prop in props])


class JsonSerializer:
    def __dump(self, data):
        return HttpResponse(json.dumps(data), 'text/html') # 'application/json'

    def serializeData(self, data, request):
        dumped = None
        if data is not None:
            dumped = to_plain(data)

        return self.__dump({
            "success": True,
            "result": dumped,
        })

    def serializeException(self, exc, request):
        return self.__dump({
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
            },
            "environment": exc.params,
        })


class JsonpSerializer:
    def __dump(self, data, request):
        if request.method == 'GET':
            params = request.GET
        else:
            params = request.POST

        callback = params.get('callback', 'mixim_jsonp_callback')

        return HttpResponse("%s(%s)" % (callback, json.dumps(data)), 'text/javascript')

    def serializeData(self, data, request):
        dumped = None
        if data is not None:
            dumped = to_plain(data)

        return self.__dump({
            "success": True,
            "result": dumped,
        }, request)

    def serializeException(self, exc, request):
        return self.__dump({
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
            },
            "environment": exc.params,
        }, request)


class XmlSerializer:
    def __dump(self, root, value):
        if value is None:
            pass
        elif isinstance(value, (set, list)):
            for item in value:
                el = ET.SubElement(root, "item")
                self.__dump(el, item)
        elif isinstance(value, dict):
            for (k, v) in value.iteritems():
                el = ET.SubElement(root, k)
                self.__dump(el, v)
        else:
            root.text = unicode(value)

    def __response(self, root):
        response = HttpResponse(content_type="text/xml;charset=utf-8")
        ET.ElementTree(root).write(response)
        return response

    def serializeData(self, data, request):
        root = ET.Element("result", {"success": "true"})
        if data is not None:
            self.__dump(root, to_plain(data))

        return self.__response(root)

    def serializeException(self, exc, request):
        root = ET.Element("result", {"success": "false"})
        ET.SubElement(root, "error", {
            "code": str(exc.code),
            "message": exc.message,
        })
        env = ET.SubElement(root, "environment")
        self.__dump(env, exc.params)
        return self.__response(root)


__SERIALIZERS__ = {
    'json': JsonSerializer(),
    'jsonp': JsonpSerializer(),
    'xml': XmlSerializer(),
}


def get_serializer(format):
    return __SERIALIZERS__.get(format, None)
