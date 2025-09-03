# JSceneRenderer

```cs
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace MyFirstMonoGame
{
    public class Game1 : Game
    {
        private GraphicsDeviceManager _graphics;
        private SpriteBatch _spriteBatch;

        private Texture2D _ballTexture;
        private Vector2 _ballPosition;

        public Game1()
        {
            _graphics = new GraphicsDeviceManager(this);
            Content.RootDirectory = "Content";
            IsMouseVisible = true;
        }

        protected override void Initialize()
        {
            // Set initial game state
            _ballPosition = new Vector2(100, 100);

            base.Initialize();
        }

        protected override void LoadContent()
        {
            _spriteBatch = new SpriteBatch(GraphicsDevice);

            // Load a texture (add "ball.png" to your Content project)
            _ballTexture = Content.Load<Texture2D>("ball");
        }

        protected override void Update(GameTime gameTime)
        {
            // Exit on Esc
            if (Keyboard.GetState().IsKeyDown(Keys.Escape))
                Exit();

            // Move ball with arrow keys
            var keyboard = Keyboard.GetState();
            if (keyboard.IsKeyDown(Keys.Right)) _ballPosition.X += 2f;
            if (keyboard.IsKeyDown(Keys.Left)) _ballPosition.X -= 2f;
            if (keyboard.IsKeyDown(Keys.Up)) _ballPosition.Y -= 2f;
            if (keyboard.IsKeyDown(Keys.Down)) _ballPosition.Y += 2f;

            base.Update(gameTime);
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.CornflowerBlue);

            _spriteBatch.Begin();
            _spriteBatch.Draw(_ballTexture, _ballPosition, Color.White);
            _spriteBatch.End();

            base.Draw(gameTime);
        }
    }
}
```

# 🎮 Scenes as the Core of the Game Loop

In **MonoGame**, the starting point of every project is the `Game` class.  
You inherit from it, and it provides the core game loop: `Initialize → LoadContent → Update → Draw`.  

For our engine, we’re taking a similar approach — but instead of a single `Game` class,  
we introduce a **base `Scene` class**. Every part of the game (main menu, test level, gameplay, etc.)  
will inherit from this base class and build its own logic on top.

---

## 🌱 The Base Scene

The `Scene` class is where our rendering and update journey begins.  
By inheriting from it, we get a few things out of the box:

- **`IsMouseVisible`**  
  A flag to show or hide the cursor.  
  Default: `false`.

- **`Update(GameTime gameTime)`**  
  Runs once per frame.  
  Gives access to the `GameTime` object so we can easily track  
  delta time and frame timing.

- **`Draw(GameTime gameTime)`**  
  Also runs once per frame, but for rendering.  
  The `GameTime` parameter keeps timing info consistent with `Update`.

---

## 🎨 Graphics Device Abstraction

To keep things flexible, we don’t lock ourselves into one rendering API.  
Instead, we introduce a **`GraphicsDevice`** that decides *how* a scene is rendered:

- `Canvas2DContext` → simple 2D rendering.  
- `WebGLContext` → GPU-accelerated rendering with shaders.  
- (Future) `WebGPUContext` → modern GPU pipeline.

This way, scenes don’t care which backend they’re running on —  
they just use the `GraphicsDevice`.

---

## 🖼️ SpriteBatch

Like MonoGame, we can add a **`SpriteBatch`** utility.  
This class helps batch multiple draw calls together, making 2D rendering faster and simpler.

Use it to:  
- Draw textures and sprites.  
- Batch them efficiently to minimize state changes.  
- Keep rendering code clean and easy to read.

---

## 🚀 Putting It Together

- Think of `Scene` as our version of MonoGame’s `Game` class.  
- Each scene is self-contained: it updates logic and renders visuals.  
- The `GraphicsDevice` decides whether we render with Canvas2D or WebGL.  
- `SpriteBatch` makes sprite rendering easy and efficient.

This structure gives us a **flexible, scalable foundation** for building games —  
starting simple, but with room to grow into more advanced rendering pipelines.
