import { add, multiply } from "./math";
import { Student } from "./person";
import { log } from "./logger";
import { fetchUsers } from "./api_client";

log("Starting app...");

const sum = add(5, 10);
const product = multiply(4, 3);

log(`Sum: ${sum}, Product: ${product}`);

const student = new Student("Sholehuddin", 11, "A+");
log(student.getInfo());

fetchUsers()
  .then(users => log(`Fetched ${users.length} users`))
  .catch(err => log(err.message, "error"));