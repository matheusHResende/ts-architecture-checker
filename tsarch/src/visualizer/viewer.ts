import { Report, Occurrence } from "../conformancer/conformancer";

export abstract class Viewer {
    divergencies: Occurrence[]
    convergencies: Occurrence[]
    absences: Occurrence[]
    alerts: Occurrence[]
    constructor(divergencies: Occurrence[], convergencies: Occurrence[], absences: Occurrence[], alerts: Occurrence[]) {
        this.absences = absences
        this.divergencies = divergencies
        this.convergencies = convergencies
        this.alerts = alerts
    }

    abstract generate(name: string): void
}