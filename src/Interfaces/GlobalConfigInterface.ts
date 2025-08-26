import GameConfigInterface from "./GameConfigInterface";
import RectangleInterface from "./RectangleInterface";

interface GlobalConfigInterface extends GameConfigInterface {
    Canvas: RectangleInterface;
    Scale: number;
}

export default GlobalConfigInterface;