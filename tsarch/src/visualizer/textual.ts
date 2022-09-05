import { writeJSON } from "../utils/fileSystem";
import { Viewer } from "./viewer";

export class Textual extends Viewer {
    generate(): void {
        writeJSON({"ABSENCES": this.absences, "DIVERGENCES": this.divergencies}, "results.json")       
    }
}