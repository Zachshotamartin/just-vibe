def transfer(conn, tenant, key, source, destination, amount, *, after_debit=lambda: None):
    if conn.in_transaction:
        raise RuntimeError('Caller owns transaction')
    if type(amount) is not int or not 0 < amount <= 2**63-1:
        raise ValueError('Invalid amount')
    result=dict(tenant=tenant,key=key,source=source,destination=destination,amount=amount)
    conn.execute('BEGIN IMMEDIATE')
    try:
        prior=conn.execute('SELECT source,destination,amount FROM transfers WHERE tenant=? AND key=?',(tenant,key)).fetchone()
        if prior:
            if prior != (source,destination,amount): raise ValueError('Conflicting payload')
            conn.commit()
            return result
        a=conn.execute('SELECT balance FROM accounts WHERE tenant=? AND id=?',(tenant,source)).fetchone()
        b=conn.execute('SELECT balance FROM accounts WHERE tenant=? AND id=?',(tenant,destination)).fetchone()
        if source==destination or not a or not b or a[0]<amount or b[0]+amount>2**63-1:
            raise ValueError('Invalid transfer')
        conn.execute('UPDATE accounts SET balance=balance-? WHERE tenant=? AND id=?',(amount,tenant,source))
        after_debit()
        conn.execute('UPDATE accounts SET balance=balance+? WHERE tenant=? AND id=?',(amount,tenant,destination))
        conn.execute('INSERT INTO transfers VALUES(?,?,?,?,?)',(tenant,key,source,destination,amount))
        conn.commit()
        return result
    except BaseException:
        conn.rollback()
        raise
