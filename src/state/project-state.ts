import { Project, ProjectStatus } from "../models/project.js";

type Listener<T> = (items: T[]) => void;


 class State<T> {
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}


//Globale State Klasse nach Singelton Pattern-----------------------------------------------
class ProjectState extends State<Project> {
    private projects: Project[] = []; 
    private static instance: ProjectState;

    private constructor() {
        super();
    }
    static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new ProjectState();
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

   export const projectState = ProjectState.getInstance();