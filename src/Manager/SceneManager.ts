import AbstractComponent from "../Abstract/AbstractComponent";
import AbstractScene from "../Abstract/AbstractScene";
import CEventType from "../Enum/CEventType";
import GlobalConfigInterface from "../Interfaces/GlobalConfigInterface";
import LoadingScene from "../Scene/LoadingScene";
import { ResolveAsync } from "../Utils/PromiseHelper";
import ContentManager from "./ContentManager";

class SceneManager {
    private m_config: GlobalConfigInterface;
    private m_scenes: Map<string, AbstractScene>;
    private m_active_scene: AbstractScene | undefined;
    private m_loading_scene_promise: Promise<AbstractScene> | undefined;
    private m_loading_scene: AbstractScene | undefined;
    private m_next_scene: AbstractScene | undefined;
    private m_currently_initializing_scene_id: string | undefined;

    constructor(config: GlobalConfigInterface) {
        this.m_config = config;
        this.m_scenes = new Map();
        this.m_active_scene = undefined;
        this.m_loading_scene_promise = this.initializeSceneAsync(new LoadingScene());
        this.m_loading_scene = undefined;
        this.m_next_scene = undefined;
        this.m_currently_initializing_scene_id = undefined;



        this.m_config.EventHub.listen(CEventType.LoadScene, this.handleLoadScene);
    }

    public get activeScene(): AbstractScene | undefined {
        return this.m_active_scene;
    }

    public SetLoadingScene(scene: AbstractScene): void {
        this.m_loading_scene_promise = this.initializeSceneAsync(scene);
    }

    public RegisterScene(scene: AbstractScene): void {
        if (this.m_scenes.has(scene.Id) === true) {
            throw new Error(`There is already a scene registered with the given id "${scene.Id}"!`);
        }

        this.m_scenes.set(scene.Id, scene);
    }

    public IsSceneRegistered(scene_id: string): boolean {
        return this.m_scenes.has(scene_id);
    }

    public LoadScene(scene_id: string): void {
        if (scene_id === LoadingScene.GetId()) {
            this.m_next_scene = this.m_loading_scene;
        } else if (this.m_scenes.has(scene_id) === false) {
            throw new Error(`There is no scene registered with the given id "${scene_id}"!`);
        } else if (this.m_currently_initializing_scene_id !== scene_id) {
            this.m_next_scene = this.m_loading_scene;
            this.m_currently_initializing_scene_id = scene_id;

            this.initializeSceneAsync(this.m_scenes.get(scene_id)!)
                .then((scene: AbstractScene) => {
                    this.m_next_scene = scene;
                    this.m_currently_initializing_scene_id = undefined;
                })
                .catch((e: any) => {
                    this.m_config.Logger.error(e);
                });
        }
    }

    public async initializeLoadingScene(): Promise<void> {
        const LOADING_SCENE: any[] | (AbstractScene | null)[] = await ResolveAsync<AbstractScene>(this.m_loading_scene_promise!);

        if (LOADING_SCENE[0] === null) {
            this.m_config.Logger.error(LOADING_SCENE[1]);
            throw new Error(`An unexpected error occurred during "loading-scene" initialization. Please consult the log for details and resolve the issue.`);
        }

        this.m_loading_scene = LOADING_SCENE[0];

        if (this.m_active_scene === undefined) {
            this.m_active_scene = this.m_loading_scene;
        }
    }

    public moveToNextScene(): boolean {
        if (this.m_next_scene === undefined) {
            return false;
        }

        /**
         * Make sure you switch scenes only after the current render loop,
         * otherwise you would change resources update and draw calls for the active scene
         * which could lead to crashes.
         */
        this.m_active_scene = this.m_next_scene;
        this.m_next_scene = undefined;

        return true;
    }

    private async initializeSceneAsync(scene: AbstractScene): Promise<AbstractScene> {
        scene.Initialize(this.m_config);

        /**
         * Initialize all Components
         */

        for (let x = 0; x < scene.Layers.length; x++) {
            const COMPONENTS: AbstractComponent[] = scene.Layers[x].components;

            for (let y = 0; y < COMPONENTS.length; y++) {
                this.initializeComponent(COMPONENTS[y]);
            }
        }

        /**
         * Load all Component Contents
         */

        const CONTENT_MANAGER: ContentManager = new ContentManager();

        for (let x = 0; x < scene.Layers.length; x++) {
            const COMPONENTS: AbstractComponent[] = scene.Layers[x].components;

            for (let y = 0; y < COMPONENTS.length; y++) {
                this.loadContentComponent(CONTENT_MANAGER, COMPONENTS[y]);
            }
        }

        const CONTENT_RESULT: PromiseSettledResult<void>[] = await CONTENT_MANAGER.WaitLoadFulfilledAsync();

        if (CONTENT_RESULT.filter(x => x.status === 'rejected').length > 0) {
            throw new Error(`Initialization failed for scene "${scene.Id}", one or more content elements could not be loaded!`);
        }

        return scene;
    }

    private initializeComponent(component: AbstractComponent): void {
        component.Initialize();

        const COMPONENT_CHILDREN: AbstractComponent[] = component.GetComponents();

        for (let z = 0; z < COMPONENT_CHILDREN.length; z++) {
            this.initializeComponent(COMPONENT_CHILDREN[z]);
        }
    }

    private loadContentComponent(contentManager: ContentManager, component: AbstractComponent): void {
        component.LoadContent(contentManager);

        const COMPONENT_CHILDREN: AbstractComponent[] = component.GetComponents();

        for (let z = 0; z < COMPONENT_CHILDREN.length; z++) {
            this.loadContentComponent(contentManager, COMPONENT_CHILDREN[z]);
        }
    }

    private handleLoadScene = (scene_id: string): void => {
        if (typeof scene_id === "string") {
            this.LoadScene(scene_id);
            return;
        }

        this.m_config.Logger.error(`The load scene event received an invalid scene ID. The ID must be a registered string.`);
    };
}

export default SceneManager;