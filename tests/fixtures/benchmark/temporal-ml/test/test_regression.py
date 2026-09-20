import unittest
from src.features import features_for
class Regression(unittest.TestCase):
    def test_late_record(self):
        rows=[dict(example_id='x',entity_id='a',prediction_at='2026-01-08T00:00:00+00:00')]
        events=[dict(event_id='e',entity_id='a',event_at='2026-01-07T00:00:00+00:00',available_at='2026-01-09T00:00:00+00:00',revision=1,value=2)]
        self.assertEqual(features_for(rows,events),[dict(example_id='x',count=0,sum=0)])
