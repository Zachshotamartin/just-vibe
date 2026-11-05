type User = { id: string };
const user = JSON.parse(body) as User;
const old = <User>JSON.parse(body);
const safe = parseUser(JSON.parse(body));
