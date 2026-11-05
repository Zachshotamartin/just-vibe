const user = JSON.parse(body) as User;
export const View = () => <div>{user.id}</div>;
