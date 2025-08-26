class Texture2D {
    private m_id: string;
    private m_src: string;
    private m_img: ImageBitmap | undefined;

    public get Id(): string {
        return this.m_id;
    }

    public get Src(): string {
        return this.m_src;
    }

    constructor(id: string, src: string) {
        this.m_id = id;
        this.m_src = src;
        this.m_img = undefined;
    }

    public ContentLoaded(img: ImageBitmap): void {
        this.m_img = img;
    }

    public GetImageBitmap(): ImageBitmap {
        return this.m_img!;
    }
}

export default Texture2D;