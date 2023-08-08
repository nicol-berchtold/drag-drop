
export interface Draggable {
    dragStartHandler(event: Event): void;
    dragEndHandler(event: Event): void;
}

export interface DragTarget {
    dragOverHandler(event: Event): void;
    dropHandler(event: Event): void;
    dragLeaveHandler(event: Event): void;
}