[Demo Video](https://youtu.be/fvK2d21TnLY)

# Description

This is a JavaScript plugin for RPG Maker MV that allows the addition
of a video to the title screen above the background image. Blending
options can be tweaked to get several various effects.

# Usage
Place the video files for your target platforms into the project's
"movies" directory and this plugin will automatically select the video 
file using the same criteria RMMV uses to determine video compatibility 
on the current platform.

Make sure the Video Name parameter has the filename WITHOUT EXTENSION. For
example, if you have a video named "TitleMovie.webm" in your movies folder,
the Video Name parameter should be set to "TitleMovie".

RMMV currently supported movie formats are .webm and .mp4. So for wide
distribution you should include both file types.

Width and Height can be set to "auto" (window dimensions), "video" 
(original video dimensions), or a specific number.

For Playback Rate, Values between 0 and 1 cause the video to play in 
slow motion. Values greater than 1 play in fast forward.

See PIXI.js documentation for compatible blend modes:
http://pixijs.download/dev/docs/PIXI.html#.BLEND_MODES

See http://www.color-hex.com/ for hex color samples if you want to
modify the tint for the video sprite

# Multiple Videos
It *is* possible to overlay multiple videos. Simply copy the TitleVideo.js
file to another file in the plugins folder with a new filename, and modify 
the following line inside that file:

```js
var parameters = PluginManager.parameters('TitleVideo');
```
To
```js
var parameters = PluginManager.parameters(NEW_FILENAME);
```
Replacing "NEW_FILENAME" with the filename of the copied js file without 
the ".js" extension.

For example, if I copy TitleVideo.js to TitleVideo2.js, I would change
the line above inside TitleVideo2.js to be
```js
var parameters = PluginManager.parameters('TitleVideo2');
```

Basically this method allows you to add each video as a separate plugin and 
modify the parameters for each video separately as you see fit.

# Terms Of Use

- Credit to the author Ryan Sivek is appreciated but not required
- Plugin is free to use, modify and distribute according to the terms of the license
- Do not claim as your own work

# License

[MIT](https://opensource.org/licenses/MIT)