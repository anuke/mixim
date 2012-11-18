EXC_UNSUPPORTED_METHOD = (100, "Unsupported method")
EXC_UNAUTHORIZED       = (111, "Unauthorized request")
EXC_AUTH_FAILED        = (112, "Authentication failed")
EXC_INACTIVE_USER      = (113, "Authentication failed")
EXC_ENTITY_NOT_EXIST   = (121, "Entity does not exist")
EXC_NOT_OWNER          = (122, "Ownership violation")
EXC_INVALID_DATA       = (130, "Invalid input data")


class ProtoException(Exception):
    def __init__(self, code, message, params=None):
        Exception.__init__(self, message)
        self.code    = code
        self.params  = params


def proto_exc(kind, params=None):
    (code, msg) = kind
    return ProtoException(code, msg, params)
