export class Student {
    constructor(name, age, grade) {
        this.name = name;
        this.age = age;
        this.grade = grade;
    }
    getInfo() {
        return `${this.name}, ${this.age} years old, grade: ${this.grade}`;
    }
}