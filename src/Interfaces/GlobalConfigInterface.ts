import { Box, ExcludeProps } from "@ludeschersoftware/types";
import InitConfigInterface from "./InitConfigInterface";
import EventHub from "../EventHub";
import Logger from "../Logger";
import Camera2D from "../Camera2D";

interface GlobalConfigInterface extends ExcludeProps<InitConfigInterface, "logger"> {
    Canvas: Box;
    Scale: number;
    EventHub: EventHub;
    Logger: Logger;
    Camera: Camera2D;
}

export default GlobalConfigInterface;