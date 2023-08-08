import Component from "./base-component.js";
import { Project } from "../models/project.js";
import { Autobind } from "../decorators/autoobind.js";
import { Draggable } from "../models/drag-drop.js";

//class ProjectItem -------------------------------------------------------------------
export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable {
    private project: Project;
    constructor(hostId: string, project: Project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.renderContent();
        this.configure();
    }
    @Autobind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer?.setData("text/plain", this.project.id);
        event.dataTransfer!.effectAllowed = "move";
    }
    @Autobind
    dragEndHandler(event: Event): void {
        console.log(("dragged"));

    }
    get person() {
        if (this.project.people === 1) {
            return `1 person`;
        } else {
            return `${this.project.people} persons`;
        }
    }
    configure(): void {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent(): void {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.project.people.toString() + " Persons assigned";
        this.element.querySelector("p")!.textContent = this.project.description;
    }
}

