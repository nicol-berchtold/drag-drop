"use strict";
/**
 *
 * @param _ //not used
 * @param _2 //not used
 * @param descriptor
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function Autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
function validate(validateableInput) {
    let isValid = true;
    const { value, required, minLength, maxLength, min, max } = validateableInput;
    if (required) {
        isValid = isValid && value.toString().trim().length !== 0;
    }
    if (minLength !== null &&
        typeof value === "string" &&
        typeof minLength !== "undefined") {
        isValid = isValid && value.trim().length >= minLength;
    }
    if (maxLength !== null &&
        typeof value === "string" &&
        typeof maxLength !== "undefined") {
        isValid = isValid && value.trim().length <= maxLength;
    }
    if (min != null && typeof value === "number") {
        isValid = isValid && value >= min;
    }
    if (max != null && typeof value === "number") {
        isValid = isValid && value <= max;
    }
    return isValid;
}
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["ACTIVE"] = 0] = "ACTIVE";
    ProjectStatus[ProjectStatus["FINISHED"] = 1] = "FINISHED";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
//Globale State Klasse nach Singelton Pattern-----------------------------------------------
class Projectstate extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new Projectstate();
        return this.instance;
    }
    updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
    moveProject(projectId, newStatus) {
        const project = this.projects.find(prj => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    addProject(title, description, numOfPeople) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.ACTIVE);
        this.projects.push(newProject);
        this.updateListeners();
    }
}
//Abstakte Klasse Komponent
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtBeginning) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element);
    }
}
//Klasse Formular Input -----------------------------------------------------
class ProjectInput extends Component {
    constructor() {
        //consturctor Start
        super("project-input", "app", true, "user-input");
        this.titleInputElement = document.querySelector("#title");
        this.descriptionInputElement = document.querySelector("#description");
        this.peopleInputElemet = document.querySelector("#people");
        // constructor ende
        this.configure();
    }
    renderContent() { }
    saveUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElemet.value;
        //Objekte erstellt
        const titleValidateable = {
            value: enteredTitle,
            required: true,
        };
        const descriptionVaildateable = {
            value: enteredDescription,
            required: true,
            minLength: 5,
        };
        const peopleValidateable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 10,
        };
        if (!validate(titleValidateable) ||
            !validate(descriptionVaildateable) ||
            !validate(peopleValidateable)) {
            alert("Invalid Input,, please try again!");
            return;
        }
        return [enteredTitle, enteredDescription, +enteredPeople];
    }
    clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElemet.value = "";
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.saveUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
//Klasse Projects List (finished, active)
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listEl = this.element.querySelector("ul");
            listEl === null || listEl === void 0 ? void 0 : listEl.classList.add("droppable");
        }
    }
    dragLeaveHandler(event) {
        const listEl = this.element.querySelector("ul");
        listEl === null || listEl === void 0 ? void 0 : listEl.classList.remove("droppable");
    }
    dropHandler(event) {
        var _a;
        const itemId = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
        projectState.moveProject(itemId, this.type === "active" ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED);
    }
    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);
        projectState.addListener((projects) => {
            const relevanProjects = projects.filter((prj) => {
                if (this.type === "active") {
                    return prj.status === ProjectStatus.ACTIVE;
                }
                return prj.status === ProjectStatus.FINISHED;
            });
            this.assignedProjects = relevanProjects;
            this.renderProjects();
        });
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = "";
        this.assignedProjects.forEach(prjItem => {
            new ProjectItem(this.element.querySelector("ul").id, prjItem);
        });
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
}
__decorate([
    Autobind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    Autobind
], ProjectList.prototype, "dragLeaveHandler", null);
__decorate([
    Autobind
], ProjectList.prototype, "dropHandler", null);
//class ProjectItem -------------------------------------------------------------------
class ProjectItem extends Component {
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.renderContent();
        this.configure();
    }
    dragStartHandler(event) {
        var _a;
        (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/plain", this.project.id);
        event.dataTransfer.effectAllowed = "move";
    }
    dragEndHandler(event) {
        console.log(("dragged"));
    }
    get person() {
        if (this.project.people === 1) {
            return `1 person`;
        }
        else {
            return `${this.project.people} persons`;
        }
    }
    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.project.people.toString() + " Persons assigned";
        this.element.querySelector("p").textContent = this.project.description;
    }
}
__decorate([
    Autobind
], ProjectItem.prototype, "dragStartHandler", null);
__decorate([
    Autobind
], ProjectItem.prototype, "dragEndHandler", null);
const projectState = Projectstate.getInstance();
new ProjectInput();
new ProjectList("active"); // Listener Funktion wird ausgeführt
new ProjectList("finished"); //Listener wird übergeben
//# sourceMappingURL=main.js.map