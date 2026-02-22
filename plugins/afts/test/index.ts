interface User {
  name: string;
  age: number;
}

function greet(user: User) {
  console.log(user.name);
}
