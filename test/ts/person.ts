export interface Person {
  name: string;
  age: number;
}

export class Student implements Person {
  constructor(public name: string, public age: number, public grade: string) {}

  getInfo(): string {
    return `${this.name}, ${this.age} years old, grade: ${this.grade}`;
  }
}