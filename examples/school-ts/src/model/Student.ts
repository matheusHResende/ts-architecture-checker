import { Class } from "./Class"

export class Student {
    name: string
    class_: Class

    constructor(name: string, class_: Class) {
        this.name = name
        this.class_ = class_
    }
}