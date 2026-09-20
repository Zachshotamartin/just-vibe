from datetime import datetime,timedelta
def instant(value):
    parsed=datetime.fromisoformat(value.replace('Z','+00:00'))
    if parsed.utcoffset() is None: raise ValueError('Offset required')
    return parsed
def features_for(examples,events,window_days=7):
    output=[]
    # Parse every supplied timestamp, including records outside the selected window.
    parsed=[(e,instant(e['event_at']),instant(e['available_at'])) for e in events]
    for row in examples:
        cutoff=instant(row['prediction_at']);versions={}
        for event,event_at,available in parsed:
            if event['entity_id']!=row['entity_id'] or available>cutoff: continue
            identity=event['event_id'];rank=(available,event['revision'])
            if identity not in versions or rank>versions[identity][0]:
                versions[identity]=(rank,event_at,event['value'])
        values=[value for _,at,value in versions.values() if cutoff-timedelta(days=window_days)<at<=cutoff]
        output.append(dict(example_id=row['example_id'],count=len(values),sum=sum(values)))
    return output
