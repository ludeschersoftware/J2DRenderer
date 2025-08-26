import CEventType from "../Enum/CEventType";

export function CreateEventName(event: CEventType, id?: string): string {
    if (id === undefined) {
        return event;
    }

    return `${event}-${id}`;
}