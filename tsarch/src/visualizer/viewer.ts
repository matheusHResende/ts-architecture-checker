import { Report, Occurrence } from "../conformancer/conformancer";

export abstract class Viewer{
    divergencies: Occurrence[]
    convergencies: Occurrence[]
    absences: Occurrence[]
    constructor(divergencies: Occurrence[], convergencies: Occurrence[], absences: Occurrence[]) {
        this.absences = absences
        this.divergencies = divergencies
        this.convergencies = convergencies
    }

    abstract generate(): void
}