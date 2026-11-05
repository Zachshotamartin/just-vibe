fun f() {
    GlobalScope.launch { work() }
    scope.launch { work() }
}
