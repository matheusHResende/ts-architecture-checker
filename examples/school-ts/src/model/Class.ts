import { Student } from "./Student";
import { Teacher } from "./Teacher";

export class Class {
    students: Student[]
    teacher: Teacher[]

    constructor() {
        this.students = []
        this.teacher = []
    }
}