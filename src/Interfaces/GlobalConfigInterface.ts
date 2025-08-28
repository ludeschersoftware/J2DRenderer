import { Box } from "@ludeschersoftware/types";
import InitConfigInterface from "./InitConfigInterface";

interface GlobalConfigInterface extends InitConfigInterface {
    Canvas: Box;
    Scale: number;
}

export default GlobalConfigInterface;