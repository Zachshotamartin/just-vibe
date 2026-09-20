import sys, json, tempfile, sqlite3, threading, copy, math
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
case, root = sys.argv[1:]
sys.path.insert(0,root)
checks=[]
def check(name,fn):
    try:
        fn(); checks.append({'name':name,'pass':True})
    except Exception as error:
        checks.append({'name':name,'pass':False,'detail':type(error).__name__+': '+str(error)})
def equal(actual,expected):
    assert actual==expected,(actual,expected)
def raises(kind,fn):
    try: fn()
    except kind: return
    raise AssertionError('Expected '+kind.__name__)
if case=='ledger':
    from src.store import connect,initialize
    from src.service import transfer
    def db(path=':memory:'):
        conn=connect(path);initialize(conn)
        conn.executemany('INSERT INTO accounts VALUES(?,?,?)',[('t','a',100),('t','b',0),('other','a',100),('other','b',0)])
        conn.commit();return conn
    def balances(conn): return conn.execute('SELECT tenant,id,balance FROM accounts ORDER BY tenant,id').fetchall()
    def atomic():
        conn=db();before=balances(conn)
        def fail(): raise LookupError('interrupted')
        raises(LookupError,lambda:transfer(conn,'t','k','a','b',25,after_debit=fail))
        equal(balances(conn),before);equal(conn.execute('SELECT count(*) FROM transfers').fetchone()[0],0);equal(conn.in_transaction,False)
        equal(transfer(conn,'t','k','a','b',25)['amount'],25)
    check('interruption rolls back all state and permits retry',atomic)
    def replay():
        conn=db();first=transfer(conn,'t','k','a','b',25);before=balances(conn)
        equal(transfer(conn,'t','k','a','b',25,after_debit=lambda:(_ for _ in ()).throw(AssertionError('replayed effect'))),first)
        equal(balances(conn),before)
        raises(ValueError,lambda:transfer(conn,'t','k','a','b',30));raises(ValueError,lambda:transfer(conn,'t','k','b','a',25))
        equal(balances(conn),before)
        equal(transfer(conn,'other','k','a','b',7)['amount'],7)
    check('payload conflicts and tenant-scoped replay',replay)
    def invalid():
        for amount in [True,False,'3',3.1,0,-1,2**63]:
            conn=db();before=balances(conn);raises(ValueError,lambda:transfer(conn,'t','k','a','b',amount));equal(balances(conn),before);equal(conn.in_transaction,False)
    check('exact integer amount validation without writes',invalid)
    def accounts():
        for source,dest,amount in [('missing','b',1),('a','missing',1),('a','a',1),('a','b',101)]:
            conn=db();before=balances(conn);raises(ValueError,lambda:transfer(conn,'t','k',source,dest,amount));equal(balances(conn),before);equal(conn.in_transaction,False)
        conn=db();conn.execute('UPDATE accounts SET balance=? WHERE tenant=? AND id=?',(2**63-1,'t','b'));conn.commit();before=balances(conn)
        raises(ValueError,lambda:transfer(conn,'t','k','a','b',1));equal(balances(conn),before);equal(conn.in_transaction,False)
    check('account ownership, funds and credit overflow',accounts)
    def caller():
        conn=db();conn.execute('UPDATE accounts SET balance=99 WHERE tenant="t" AND id="a"')
        before=balances(conn);raises(RuntimeError,lambda:transfer(conn,'t','k','a','b',1));equal(balances(conn),before);equal(conn.in_transaction,True)
        conn.rollback();equal(conn.execute('SELECT balance FROM accounts WHERE tenant="t" AND id="a"').fetchone()[0],100)
    check('caller-owned transaction remains untouched',caller)
    def concurrent():
        with tempfile.TemporaryDirectory() as temp:
            path=str(Path(temp)/'ledger.sqlite');conn=db(path);conn.close();barrier=threading.Barrier(4)
            def worker(_):
                c=connect(path);barrier.wait()
                try:return transfer(c,'t','shared','a','b',20)
                finally:c.close()
            with ThreadPoolExecutor(4) as pool:results=list(pool.map(worker,range(4)))
            equal(results,[{'tenant':'t','key':'shared','source':'a','destination':'b','amount':20}]*4)
            c=connect(path);equal(c.execute('SELECT balance FROM accounts WHERE tenant="t" AND id="a"').fetchone()[0],80);equal(c.execute('SELECT count(*) FROM transfers').fetchone()[0],1)
    check('concurrent connections serialize one effect',concurrent)
elif case=='temporal-ml':
    from src.features import features_for
    from src.pipeline import prepare
    from src.report import summarize
    def e(identity,entity,at,available,value,revision=1):
        return dict(event_id=identity,entity_id=entity,event_at=at,available_at=available,value=value,revision=revision)
    def row(identity,entity,at,label=0,observed='2026-01-09T00:00:00Z'):
        return dict(example_id=identity,entity_id=entity,prediction_at=at,label=label,label_observed_at=observed)
    def boundaries():
        examples=[row('x','a','2026-01-08T00:00:00Z')]
        events=[e('lower','a','2026-01-01T00:00:00Z','2026-01-01T00:00:00Z',99),e('upper','a','2026-01-08T00:00:00Z','2026-01-08T00:00:00Z',2),e('future','a','2026-01-08T00:00:01Z','2026-01-08T00:00:00Z',100),e('late','a','2026-01-07T00:00:00Z','2026-01-09T00:00:00Z',100)]
        equal(features_for(examples,events),[{'example_id':'x','count':1,'sum':2}])
    check('window bounds and event availability',boundaries)
    def versions():
        examples=[row('x','a','2026-01-08T00:00:00Z')]
        events=[e('x','a','2026-01-07T00:00:00Z','2026-01-07T00:00:00Z',2),e('x','a','2025-12-20T00:00:00Z','2026-01-07T12:00:00Z',20,2),e('y','a','2026-01-07T00:00:00Z','2026-01-07T00:00:00Z',-2),e('y','b','2026-01-07T00:00:00Z','2026-01-07T00:00:00Z',100)]
        events.append(copy.deepcopy(events[2]));before=copy.deepcopy((examples,events))
        equal(features_for(examples,events),[{'example_id':'x','count':1,'sum':-2}]);equal((examples,events),before)
    check('revision selection before window filtering and deduplication',versions)
    def zones():
        events=[e('x','a','2026-01-07T23:00:00+01:00','2026-01-07T22:00:00Z',3),e('future','a','2026-01-07T23:30:00Z','2026-01-07T20:00:00Z',50)]
        equal(features_for([row('x','a','2026-01-08T00:00:00+02:00')],events),[{'example_id':'x','count':1,'sum':3}])
        raises(ValueError,lambda:features_for([row('x','a','2026-01-08T00:00:00')],events))
    check('offset-aware instant comparisons and naive rejection',zones)
    examples=[row('one','a','2026-01-08T00:00:00Z'),row('two','b','2026-01-09T00:00:00Z',1),row('immature','c','2026-01-09T00:00:00Z',1,'2026-01-11T00:00:00Z'),row('v','a','2026-01-10T00:00:00Z',0,'2026-01-20T00:00:00Z'),row('test','b','2026-01-12T00:00:00Z',0,'2026-01-13T00:00:00Z'),row('future','x','2026-01-20T00:00:00Z',1)]
    events=[e('a','a','2026-01-07T00:00:00Z','2026-01-07T00:00:00Z',2),e('a','a','2026-01-07T00:00:00Z','2026-01-09T00:00:00Z',20,2),e('b','b','2026-01-08T00:00:00Z','2026-01-08T00:00:00Z',4),e('c','c','2026-01-08T00:00:00Z','2026-01-08T00:00:00Z',100)]
    def output():return prepare(examples,events,'2026-01-10T00:00:00Z','2026-01-12T00:00:00Z','2026-01-15T00:00:00Z')
    def training():
        result=output();equal([r['example_id'] for r in result['train']],['one','two']);equal(result['scaler'],{'mean':3,'scale':1});equal([r['normalized'] for r in result['train']],[-1,1]);equal(result['validation'][0]['normalized'],17)
    check('mature training membership and train-only scaler',training)
    def labels():
        result=output();equal(result['train'][0]['label'],0);equal(result['validation'][0]['label'],None);equal(result['test'][0]['label'],0)
        equal(summarize(result),{'train':{'rows':2,'labeled':2},'validation':{'rows':1,'labeled':0},'test':{'rows':1,'labeled':1}})
    check('zero labels, unknown labels and future examples',labels)
    def ordering():
        before=copy.deepcopy((examples,events));original=output()
        reverse=prepare(list(reversed(examples)),list(reversed(events)),'2026-01-10T00:00:00Z','2026-01-12T00:00:00Z','2026-01-15T00:00:00Z')
        equal(reverse['train'],list(reversed(original['train'])));equal(reverse['scaler'],original['scaler']);equal((examples,events),before)
    check('input order and immutability',ordering)
    def empty():
        result=prepare([],[],'2026-01-10T00:00:00Z','2026-01-12T00:00:00Z','2026-01-15T00:00:00Z');equal(result,{'train':[],'validation':[],'test':[],'scaler':{'mean':0,'scale':1}})
        result=prepare(examples[:1],events,'2026-01-10T00:00:00Z','2026-01-12T00:00:00Z','2026-01-15T00:00:00Z');equal(result['scaler'],{'mean':2,'scale':1})
    check('empty and constant training fallback',empty)
else: raise RuntimeError('Unknown oracle')
print(json.dumps({'checks':checks}))
sys.exit(0 if all(c['pass'] for c in checks) else 1)
