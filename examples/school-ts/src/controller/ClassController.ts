import { Class } from "../model/Class"
import { Student } from "../model/Student"
import { Teacher } from "../model/Teacher"

function createClass(studentIds: number[], teacherIds: number[]) {
    const students: Student[] = studentIds.map(id => fetch(`localhost:3000/students/${id}`))
    const teachers: Teacher[] = teacherIds.map(id => fetch(`localhost:3000/teacher/${id}`))
}

function readClass({ }) {

}

function updateClass({ }) {

}

function deleteClass({ }) {

}