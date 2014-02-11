from serializers import get_serializer
from errors import *


def serialize(f):
    def wrapper(request, out_format, *args, **kwargs):
        serializer = get_serializer(out_format)
        if serializer is None:
            raise ValueError("There is no such format: %s" % out_format)
        try:
            result = f(request, *args, **kwargs)
            return serializer.serialize_data(result, request)
        except ProtoException, ex:
            return serializer.serialize_exception(ex, request)

    wrapper.__name__ = f.__name__
    return wrapper


def require_method(methods):
    if isinstance(methods, basestring):
        methods = [methods]

    def decor(f):
        def wrapper(request, *args, **kwargs):
            if request.method not in methods:
                raise proto_exc(EXC_UNSUPPORTED_METHOD, {"method": request.method})

            return f(request, *args, **kwargs)

        wrapper.__name__ = f.__name__
        return wrapper

    return decor


def require_auth(f):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated():
            raise proto_exc(EXC_UNAUTHORIZED)

        return f(request, *args, **kwargs)

    wrapper.__name__ = f.__name__
    return wrapper


def require_exist(model):
    def decor(f):
        def wrapper(*args, **kwargs):
            try:
                return f(*args, **kwargs)
            except model.DoesNotExist:
                raise proto_exc(EXC_ENTITY_NOT_EXIST, {"model": model.__name__})

        wrapper.__name__ = f.__name__
        return wrapper

    return decor


def require_id(model, enabled=False):
    def decor(f):
        def wrapper(request, entity_id, *args, **kwargs):
            try:
                manager = enabled and model.enabled_objects or model.objects
                entity = manager.get(pk=entity_id)
            except model.DoesNotExist:
                raise proto_exc(EXC_ENTITY_NOT_EXIST, {"model": model.__name__, "id": entity_id})

            return f(request, entity, *args, **kwargs)

        wrapper.__name__ = f.__name__
        return wrapper

    return decor


def require_ownership(model):
    def decor(f):
        def wrapper(request, entity_id, *args, **kwargs):
            try:
                entity = model.objects.get(pk=entity_id)
                if entity.owner != request.user:
                    raise proto_exc(EXC_NOT_OWNER, {"model": model.__name__, "id": entity_id})
            except model.DoesNotExist:
                raise proto_exc(EXC_ENTITY_NOT_EXIST, {"model": model.__name__, "id": entity_id})

            return f(request, entity, *args, **kwargs)

        wrapper.__name__ = f.__name__
        return wrapper

    return decor
