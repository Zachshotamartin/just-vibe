import sqlite3

def connect(path):
    conn = sqlite3.connect(path, timeout=5)
    conn.execute('PRAGMA foreign_keys=ON')
    return conn

def initialize(conn):
    conn.executescript('''
    CREATE TABLE accounts(tenant TEXT, id TEXT, balance INTEGER NOT NULL CHECK(balance>=0), PRIMARY KEY(tenant,id));
    CREATE TABLE transfers(tenant TEXT, key TEXT, source TEXT, destination TEXT, amount INTEGER, PRIMARY KEY(tenant,key));
    ''')
