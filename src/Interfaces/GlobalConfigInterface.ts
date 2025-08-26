import InitConfigInterface from "./InitConfigInterface";
import RectangleInterface from "./RectangleInterface";

interface GlobalConfigInterface extends InitConfigInterface {
    Canvas: RectangleInterface;
    Scale: number;
}

export default GlobalConfigInterface;