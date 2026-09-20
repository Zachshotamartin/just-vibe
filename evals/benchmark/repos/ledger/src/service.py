import json

def transfer(conn, tenant, key, source, destination, amount, *, after_debit=lambda: None):
    prior = conn.execute('SELECT amount FROM transfers WHERE key=?', (key,)).fetchone()
    if prior:
        return {'tenant': tenant, 'key': key, 'source': source, 'destination': destination, 'amount': prior[0]}
    amount = int(amount)
    conn.execute('UPDATE accounts SET balance=balance-? WHERE tenant=? AND id=?', (amount, tenant, source))
    conn.commit()
    after_debit()
    conn.execute('UPDATE accounts SET balance=balance+? WHERE tenant=? AND id=?', (amount, tenant, destination))
    conn.execute('INSERT INTO transfers VALUES(?,?,?,?,?)', (tenant,key,source,destination,amount))
    conn.commit()
    return {'tenant': tenant, 'key': key, 'source': source, 'destination': destination, 'amount': amount}
