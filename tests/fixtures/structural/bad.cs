class C {
  int F(Task<int> t) { return t.GetAwaiter().GetResult(); }
  async Task<int> G(Task<int> t) { return await t; }
}
