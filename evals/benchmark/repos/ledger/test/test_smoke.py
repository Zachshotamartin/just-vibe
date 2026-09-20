import unittest
from src.store import connect, initialize
from src.service import transfer
class Smoke(unittest.TestCase):
    def test_transfer(self):
        conn = connect(':memory:'); initialize(conn)
        conn.executemany('INSERT INTO accounts VALUES(?,?,?)', [('t','a',100),('t','b',0)]); conn.commit()
        self.assertEqual(transfer(conn,'t','k','a','b',25)['amount'],25)
        self.assertEqual(conn.execute('SELECT balance FROM accounts WHERE id="b"').fetchone()[0],25)
