from .features import features_for

def prepare(examples, events, train_end, validation_end, as_of, window_days=7):
    features = features_for(examples, events, window_days)
    mean = sum(row['sum'] for row in features) / len(features) if features else 0
    result = {'train': [], 'validation': [], 'test': [], 'scaler': {'mean': mean, 'scale': 1}}
    for example, feature in zip(examples, features):
        split = 'train' if example['prediction_at'] < train_end else 'validation' if example['prediction_at'] < validation_end else 'test'
        result[split].append({**feature, 'normalized': feature['sum'] - mean, 'label': example.get('label') or 0})
    return result
