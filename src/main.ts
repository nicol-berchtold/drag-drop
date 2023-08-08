/**
 * 
 * @param _ //not used
 * @param _2 //not used
 * @param descriptor 
 */

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}

interface Draggable {
    dragStartHandler(event: Event): void;
    dragEndHandler(event: Event): void;
}

interface DragTarget {
    dragOverHandler(event: Event): void;
    dropHandler(event: Event): void;
    dragLeaveHandler(event: Event): void;
}



interface Validateable  {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validateableInput: Validateable) {
    let isValid = true;
    const { value, required, minLength, maxLength, min, max } = validateableInput;
    if(required) {
        isValid = isValid && value.toString().trim().length !== 0;
    }
    if(minLength !== null && 
        typeof value === "string" && 
        typeof minLength !== "undefined"
        )  {
        isValid = isValid && value.trim().length >= minLength;
    }
    if(maxLength !== null && 
        typeof value === "string" && 
        typeof maxLength !== "undefined"
        )  {
        isValid = isValid && value.trim().length <= maxLength;
    }
    if(min != null && typeof value === "number") {
        isValid = isValid && value >= min; 
    }
    if(max != null && typeof value === "number") {
        isValid = isValid && value <= max;
    }
    return isValid;
}

enum ProjectStatus {
    ACTIVE,
    FINISHED,
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

type Listener<T> = (items: T[]) => void;


class State<T> {
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}




//Globale State Klasse nach Singelton Pattern-----------------------------------------------
class Projectstate extends State<Project> {
    private projects: Project[] = []; 
    private static instance: Projectstate;

    private constructor() {
        super();
    }
    static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new Projectstate();
            return this.instance;
        }
        private updateListeners() {
            for(const listenerFn of this.listeners) {
                listenerFn(this.projects.slice());
            }
        }
        moveProject(projectId: string, newStatus: ProjectStatus) {
            const project = this.projects.find(prj => prj.id === projectId);
            if(project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListeners();
            }
        }
        addProject(title: string, description: string, numOfPeople: number) {
            const newProject: Project = new Project(
                Math.random().toString(), 
                title, description, numOfPeople, 
                ProjectStatus.ACTIVE
                );
           
            
            this.projects.push(newProject);
            this.updateListeners();
            
        }
    }

    //Abstakte Klasse Komponent
abstract class Component <T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;
    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;
        
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;

        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element);
    }
    abstract configure(): void;
    abstract renderContent(): void; 
}





//Klasse Formular Input -----------------------------------------------------
class ProjectInput extends Component <HTMLDivElement, HTMLFormElement> {


    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElemet: HTMLInputElement;
    
    

    constructor() {
        //consturctor Start
        super("project-input", "app", true, "user-input");
        

        this.titleInputElement = document.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = document.querySelector("#description") as HTMLInputElement;
        this.peopleInputElemet = document.querySelector("#people") as HTMLInputElement;

       // constructor ende
        this.configure();
       
       
    }
 renderContent() {}
    private saveUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElemet.value;

        //Objekte erstellt
        const titleValidateable: Validateable = {
            value: enteredTitle,
            required: true,
        };
        const descriptionVaildateable: Validateable = {
            value: enteredDescription, 
            required: true,
            minLength: 5,
        };
        const peopleValidateable: Validateable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 10,
        };


        if(
            !validate(titleValidateable) || 
            !validate(descriptionVaildateable) || 
            !validate(peopleValidateable)
            ) {
            alert("Invalid Input,, please try again!");
            return;
        }
        return [enteredTitle, enteredDescription, +enteredPeople];
    }

    private clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElemet.value = "";
    }


    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.saveUserInput();
        if(Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
              this.clearInputs();
        }  
        
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
}


//Klasse Projects List (finished, active)
class ProjectList extends Component <HTMLDivElement, HTMLFormElement> {

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

//class ProjectItem -------------------------------------------------------------------
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> 
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
        if(this.project.people === 1) {
        return `1 person`;
    } else {
        return `${this.project.people} persons`;
    }
}

    configure() :void {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent(): void {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.project.people.toString() + " Persons assigned";
        this.element.querySelector("p")!.textContent = this.project.description;
    }
}



const projectState = Projectstate.getInstance();





new ProjectInput();
new ProjectList("active"); // Listener Funktion wird ausgeführt
new ProjectList("finished"); //Listener wird übergeben


