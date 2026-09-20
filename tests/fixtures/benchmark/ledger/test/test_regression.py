import unittest
from src.service import transfer
from src.store import connect,initialize
class Regression(unittest.TestCase):
    def test_interruption(self):
        conn=connect(':memory:');initialize(conn)
        conn.executemany('INSERT INTO accounts VALUES(?,?,?)',[('t','a',100),('t','b',0)]);conn.commit()
        def fail(): raise ValueError('hook')
        with self.assertRaises(ValueError): transfer(conn,'t','k','a','b',10,after_debit=fail)
        self.assertEqual(conn.execute('SELECT balance FROM accounts WHERE id="a"').fetchone()[0],100)
