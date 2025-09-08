import Ref from "@ludeschersoftware/ref";
import { CreateUniqHash, HashValue } from "@ludeschersoftware/utils";
import Texture2D from "../Texture2D";
import ContentLoadType from "../Enum/ContentLoadType";

class ContentManager {
    private static M_CACHE: Map<number, WeakRef<ImageBitmap>> = new Map();
    private static M_CONTENT_LOAD_COUNT: Map<number, Ref<number>> = new Map();

    private m_loading: Map<string, Promise<void>>;

    constructor() {
        this.m_loading = new Map();
    }

    public LoadFromSrc(src: string, type: ContentLoadType = ContentLoadType.Default): Texture2D {
        const RESULT: Texture2D = new Texture2D(this.getUniqContentId(), src);
        const RESULT_PROMISE: Promise<void> = this.load(RESULT, type === ContentLoadType.Cache);

        if (type !== ContentLoadType.Lazy) {
            this.m_loading.set(RESULT.Id, RESULT_PROMISE);
        }

        return RESULT;
    }

    public async WaitLoadFulfilledAsync(): Promise<PromiseSettledResult<void>[]> {
        return Promise.allSettled(Array.from(this.m_loading.values()));
    }

    private getUniqContentId(): string {
        let result: string = CreateUniqHash(50);

        while (this.m_loading.has(result) === true) {
            result = CreateUniqHash(30);
        }

        return result;
    }

    private load(texture: Texture2D, cache: boolean): Promise<void> {
        const SRC_HASH: number = HashValue(texture.Src);

        if (ContentManager.M_CACHE.has(SRC_HASH) === true) {
            const CACHED_VALUE: ImageBitmap | undefined = ContentManager.M_CACHE.get(SRC_HASH)!.deref();

            if (CACHED_VALUE === undefined) {
                ContentManager.M_CACHE.delete(SRC_HASH);
            } else {
                texture.ContentLoaded(CACHED_VALUE);

                return new Promise((resolve: (value: void | PromiseLike<void>) => void) => resolve());
            }
        }

        return new Promise((resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => {
            const IMAGE: HTMLImageElement = new Image();

            IMAGE.onload = () => {
                createImageBitmap(IMAGE).then((value: ImageBitmap) => {
                    texture.ContentLoaded(value);

                    if (cache === true) {
                        if (ContentManager.M_CACHE.has(SRC_HASH) === false) {
                            ContentManager.M_CACHE.set(SRC_HASH, new WeakRef(value));
                        }
                    } else {
                        if (ContentManager.M_CONTENT_LOAD_COUNT.has(SRC_HASH) === true) {
                            ContentManager.M_CONTENT_LOAD_COUNT.get(SRC_HASH)!.value++;
                        } else {
                            ContentManager.M_CONTENT_LOAD_COUNT.set(SRC_HASH, new Ref<number>(1));
                        }

                        if (ContentManager.M_CONTENT_LOAD_COUNT.get(SRC_HASH)!.value >= 5) {
                            ContentManager.M_CACHE.set(SRC_HASH, new WeakRef(value));
                            ContentManager.M_CONTENT_LOAD_COUNT.delete(SRC_HASH);
                        }
                    }

                    resolve();
                })
                    .catch((e) => {
                        reject(e);
                    });
            };

            IMAGE.src = texture.Src;
        });
    }
}

export default ContentManager;