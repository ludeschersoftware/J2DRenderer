import { Box } from "@ludeschersoftware/types";
import InitConfigInterface from "./InitConfigInterface";
import EventHub from "../EventHub";
import Logger from "../Logger";

interface GlobalConfigInterface extends Omit<InitConfigInterface, "logger"> {
    Canvas: Box;
    Scale: number;
    EventHub: EventHub;
    Logger: Logger;
}

export default GlobalConfigInterface;