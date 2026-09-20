def summarize(result):
    return {split: {'rows': len(result[split]), 'labeled': sum(r['label'] is not None for r in result[split])} for split in ('train','validation','test')}
