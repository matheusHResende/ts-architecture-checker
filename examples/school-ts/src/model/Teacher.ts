import { Class } from "./Class"

export class Teacher {
    name: string
    specialty: string
    classes: Class[]

    constructor(name: string, specialty: string) {
        this.name = name
        this.specialty = specialty
        this.classes = []
    }
}