import { Box, ExcludeProps } from "@ludeschersoftware/types";
import InitConfigInterface from "./InitConfigInterface";
import EventHub from "../EventHub";
import Logger from "../Logger";

interface GlobalConfigInterface extends ExcludeProps<InitConfigInterface, "Logger"> {
    Viewport: Box;
    Scale: number;
    EventHub: EventHub;
    Logger: Logger;
}

export default GlobalConfigInterface;