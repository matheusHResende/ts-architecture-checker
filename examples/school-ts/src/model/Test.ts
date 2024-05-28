import { Student } from "./Student"
import { Teacher } from "./Teacher"

export class Test {
    answer?: string[]
    student?: Student
    teacher: Teacher
    questions: string[]

    constructor(teacher: Teacher, questions: string[], answer?: string[], student?: Student) {
        this.teacher = teacher
        this.questions = questions
        this.answer = answer
        this.student = student
    }
}