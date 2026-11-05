def a(items=[]):
    pass

def b(m: dict = {}, n=None):
    pass

def c(x=(), y=None):
    pass

try:
    a()
except:
    pass

try:
    a()
except ValueError:
    pass
