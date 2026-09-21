# CPU evaluation examples

Run `python3 ranking.py` from this directory. The standard-library implementation is also exercised by the optional Python contract suite.

`ndcg_at_k` compares an observed ranking with the ideal ranking of the **same supplied candidate set**. It returns zero for an all-zero query; aggregate that case separately rather than silently excluding it. It does not measure retrieval recall for relevant items absent from the candidate set. Check duplicate item IDs and relevance-label provenance before constructing this vector.

`temporal_entities` deliberately evaluates new entities after a cutoff. Rows from previously observed entities after that cutoff are reported separately. This is appropriate for a cold-start question; it is not a substitute for a returning-user evaluation. Fit preprocessing only on training rows and construct historical features using information available at each event time.

Compare both fixtures with the [recommender method](../../references/methods/recommender-systems.md). For autograd/device/distributed diagnostics, use the [PyTorch method](../../references/methods/pytorch-debug.md) in the actual installed environment. These CPU examples do not establish CUDA, distributed training or live serving behavior.
