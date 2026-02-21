from dataclasses import dataclass

@dataclass
class Person:
    name: str
    age: int

@dataclass
class Student(Person):
    grade: str

    def get_info(self) -> str:
        return f"{self.name}, {self.age} years old, grade: {self.grade}"