var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Component from "./base-component.js";
import { validate } from "../util/validation.js";
import { Autobind } from "../decorators/autoobind.js";
import { projectState } from "../state/project-state.js";
//Klasse Formular Input -----------------------------------------------------
export class ProjectInput extends Component {
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
//# sourceMappingURL=project-inputs.js.map