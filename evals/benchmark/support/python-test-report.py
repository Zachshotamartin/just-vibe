"""Run ordinary project tests and classify actual regression failure locations."""
import json
import sys
import traceback
import unittest
from pathlib import Path

root = Path.cwd().resolve()
sys.path.insert(0, str(root))

class Result(unittest.TestResult):
    def __init__(self):
        super().__init__()
        self.evidence = []

    def record(self, test, error, assertion):
        frames = traceback.extract_tb(error[2])
        in_test = any(Path(f.filename).resolve().parent == root / 'test'
                      and Path(f.filename).name == 'test_regression.py'
                      and f.name.startswith('test_') for f in frames)
        in_implementation = any(root / 'src' in Path(f.filename).resolve().parents
                                for f in frames)
        setup_error = issubclass(error[0], (ImportError, SyntaxError, NameError))
        evidence=dict(test=str(test), exception=error[0].__name__,
                      behavior_failure=in_test and not setup_error
                      and (assertion or in_implementation))
        self.evidence.append(evidence)
        if '--stream' in sys.argv:
            print(json.dumps(dict(type='regression-failure', **evidence)), flush=True)

    def addFailure(self, test, error):
        super().addFailure(test, error)
        self.record(test, error, True)

    def addError(self, test, error):
        super().addError(test, error)
        self.record(test, error, False)

    def addSubTest(self, test, subtest, error):
        super().addSubTest(test, subtest, error)
        if error:
            self.record(test, error, issubclass(error[0], test.failureException))

result = Result()
unittest.defaultTestLoader.discover('test').run(result)
print(json.dumps(dict(tests=result.testsRun, successful=result.wasSuccessful(),
                      failures=result.evidence)))
sys.exit(0 if result.wasSuccessful() and result.testsRun else 1)
