import Component from "./base-component.js";
import { Project, ProjectStatus } from "../models/project.js";
import { Autobind } from "../decorators/autoobind.js";
import { DragTarget } from "../models/drag-drop.js";
import { projectState } from "../state/project-state.js";
import { ProjectItem } from "./project-item.js";


//Klasse Projects List (finished, active)
export class ProjectList extends Component <HTMLDivElement, HTMLFormElement> implements DragTarget{


    assignedProjects: Project[] = []; 
    

    constructor(private type: "active" | "finished") {
        super("project-list", "app", false,`${type}-projects`);
        this.configure();
        this.renderContent();
      
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {
        
        if(event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
        event.preventDefault();
        const listEl = this.element.querySelector("ul")!;
        listEl?.classList.add("droppable");
        }
    }
    @Autobind
    dragLeaveHandler(event: Event): void {
        const listEl = this.element.querySelector("ul")!;
        listEl?.classList.remove("droppable");
    }
    @Autobind
    dropHandler(event: DragEvent): void {
        const itemId = event.dataTransfer?.getData("text/plain")!;
        projectState.moveProject(itemId, this.type === "active" ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED);
    }


    configure(): void {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);

        projectState.addListener((projects: Project[]) => {
            const relevanProjects = projects.filter((prj) => {
                if(this.type === "active") {
                    return prj.status === ProjectStatus.ACTIVE;
                }
                return prj.status === ProjectStatus.FINISHED;
            });
            this.assignedProjects = relevanProjects;
            this.renderProjects();
        });
    } 

    renderProjects() {
        const listEl = document.getElementById(
        `${this.type}-projects-list`
        )! as HTMLUListElement;
        listEl.innerHTML = "";
        this.assignedProjects.forEach(prjItem => {
           new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector(
            "h2"
            )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
    
}
