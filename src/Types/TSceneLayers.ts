import AbstractComponent from "../Abstract/AbstractComponent";

type TSceneLayers = Array<{ applyCamera: boolean, components: Array<AbstractComponent>; }>;

export default TSceneLayers;