package p

import "errors"

func f(err error) bool {
	if err.Error() == "EOF" {
		return true
	}
	return errors.Is(err, errSentinel)
}
