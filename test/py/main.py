from math_utils import add, multiply
from person import Student
from logger import log, LogLevel
from api_client import fetch_users

log("Starting app...")

sum_result = add(5, 10)
product_result = multiply(4, 3)

log(f"Sum: {sum_result}, Product: {product_result}")

student = Student("Sholehuddin", 11, "A+")
log(student.get_info())

try:
    users = fetch_users()
    log(f"Fetched {len(users)} users")
except Exception as e:
    log(str(e), LogLevel.ERROR)