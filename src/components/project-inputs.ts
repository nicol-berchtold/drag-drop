import Component from "./base-component.js";
import { Validateable, validate } from "../util/validation.js";
import { Autobind } from "../decorators/autoobind.js";
import { projectState } from "../state/project-state.js";



//Klasse Formular Input -----------------------------------------------------
export class ProjectInput extends Component <HTMLDivElement, HTMLFormElement> {


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

