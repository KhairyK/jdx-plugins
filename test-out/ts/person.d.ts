export interface Person {
    name: string;
    age: number;
}
export declare class Student implements Person {
    name: string;
    age: number;
    grade: string;
    constructor(name: string, age: number, grade: string);
    getInfo(): string;
}
