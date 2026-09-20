from datetime import datetime, timedelta

def features_for(examples, events, window_days=7):
    output = []
    for row in examples:
        cutoff = datetime.fromisoformat(row['prediction_at'])
        values = [e['value'] for e in events if e['entity_id'] == row['entity_id'] and datetime.fromisoformat(e['event_at']) <= cutoff]
        output.append({'example_id': row['example_id'], 'count': len(values), 'sum': sum(values)})
    return output
