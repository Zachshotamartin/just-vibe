"""Small CPU-only evaluation reference; not a production recommender or trainer."""
from math import log2

def ndcg_at_k(relevances, k):
    if not isinstance(k, int) or isinstance(k, bool) or k <= 0:
        raise ValueError('k must be a positive integer')
    if any(not isinstance(r, (int, float)) or not 0 <= r <= 30 for r in relevances):
        raise ValueError('Use finite nonnegative graded relevance, bounded at 30')
    def dcg(values):
        return sum((2 ** relevance - 1) / log2(index + 2)
                   for index, relevance in enumerate(values[:k]))
    ideal = dcg(sorted(relevances, reverse=True))
    return dcg(relevances) / ideal if ideal else 0.0

def temporal_entities(rows, cutoff):
    """Evaluate NEW entities after cutoff; exclude crossing entities deliberately."""
    past_entities = {row['entity'] for row in rows if row['time'] < cutoff}
    train = [row for row in rows if row['time'] < cutoff]
    test = [row for row in rows if row['time'] >= cutoff and row['entity'] not in past_entities]
    excluded = [row for row in rows if row['time'] >= cutoff and row['entity'] in past_entities]
    return train, test, excluded

if __name__ == '__main__':
    print({'perfect_ndcg': ndcg_at_k([3, 2, 1, 0], 3),
           'reordered_ndcg': ndcg_at_k([0, 1, 2, 3], 3)})
