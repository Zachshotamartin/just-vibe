import unittest
from src.features import features_for
class Smoke(unittest.TestCase):
    def test_feature(self):
        examples=[{'example_id':'x','entity_id':'u','prediction_at':'2026-01-08T00:00:00+00:00'}]
        events=[{'event_id':'e','entity_id':'u','event_at':'2026-01-07T00:00:00+00:00','available_at':'2026-01-07T00:00:00+00:00','revision':1,'value':3}]
        self.assertEqual(features_for(examples,events),[{'example_id':'x','count':1,'sum':3}])
