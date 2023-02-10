import { writeJSON } from "../utils/fileSystem";
import { Viewer } from "./viewer";

export class Textual extends Viewer {
    generate(name: string): void {
        writeJSON({ "ABSENCES": this.absences, "DIVERGENCES": this.divergencies, "ALERTS": this.alerts }, name)
    }
}