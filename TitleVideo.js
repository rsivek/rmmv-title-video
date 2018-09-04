//=============================================================================
// TitleVideo.js v1.2.0
// https://github.com/nanowizard/rmmv-title-video
//=============================================================================

/*
Copyright 2017 Ryan Sivek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*:
 * @plugindesc Adds a video above the static image for the main title screen.
 * @author Ryan Sivek
 *
 * @param Video Name
 * @desc Filename for the video WITHOUT FILE EXTENSION (.webm, .mp4, etc)
 * @default TitleMovie
 *
 * @param Muted
 * @desc Whether video audio should be muted (yes/no)
 * @default no
 *
 * @param Volume
 * @desc Video overlay volume (0-1)
 * @default 1
 *
 * @param Width
 * @desc Width of the video sprite ("auto", "video", or a positive number)
 * @default auto
 *
 * @param Height
 * @desc Height of the video sprite ("auto", "video", or a positive number)
 * @default auto
 *
 * @param X
 * @desc X coordinate of the video in the title scene
 * @default 0
 *
 * @param Y
 * @desc Y coordinate of the video in the title scene
 * @default 0
 *
 * @param Loop
 * @desc Whether to loop the video (yes/no)
 * @default yes
 *
 * @param Playback Rate
 * @desc Playback rate for the video. (Default: 1.0)
 * @default 1.0
 *
 * @param Blend Mode
 * @desc Blend option for the video sprite. (NORMAL, ADD, MULTIPLY, SCREEN, etc.)
 * @default NORMAL
 *
 * @param Opacity
 * @desc Opacity for the video sprite. (0.0 - 1.0)
 * @default 1.0
 *
 * @param Tint
 * @desc Tint for the video sprite as a hex value. (Default: 0xffffff)
 * @default 0xffffff
 *
 * @param Loop Start
 * @desc Time to start the video loop. (Default: 0)
 * @default 0
 *
 * @param Loop End
 * @desc Time to stop the video loop. ("end" or a number)
 * @default end
 *
 * @param Debug
 * @desc Set this to "yes" to print debug statements to the console (F8 during gameplay)
 * @default no
 *
 * @help
 *
 * Place the video files for your target platforms into the project's
 * "movies" directory and this plugin will automatically select the video
 * file using the same criteria RMMV uses to determine video compatibility
 * on the current platform.
 *
 * Make sure the Video Name parameter has the filename WITHOUT EXTENSION. For
 * example, if you have a video named "TitleMovie.webm" in your movies folder,
 * the Video Name parameter should be set to "TitleMovie".
 *
 * RMMV currently supported movie formats are .webm and .mp4. So for wide
 * distribution you should include both file types.
 *
 * Width and Height can be set to "auto" (window dimensions), "video"
 * (original video dimensions), or a specific number.
 *
 * For Playback Rate, Values between 0 and 1 cause the video to play in
 * slow motion. Values greater than 1 play in fast forward.
 *
 * See PIXI.js documentation for compatible blend modes:
 * http://pixijs.download/dev/docs/PIXI.html#.BLEND_MODES
 *
 * See http://www.color-hex.com/ for hex color samples if you want to
 * modify the tint for the video sprite
 *
 */

(function() {
    var parameters = PluginManager.parameters('TitleVideo');
    var filepath = parameters['Video Name'];
    var muted = parameters.Muted;
    var volume = parameters.Volume;
    var w = parameters.Width;
    var h = parameters.Height;
    var x = parameters.X;
    var y = parameters.Y;
    var loop = parameters.Loop;
    var playbackRate = parameters['Playback Rate'];
    var blendMode = parameters['Blend Mode'];
    var opacity = parameters.Opacity;
    var tint = parameters.Tint;
    var loopStart = parameters['Loop Start'];
    var loopEnd = parameters['Loop End'];
    var DEBUG = parameters.Debug === 'yes' ? true : false;

    var ST_createBackground = Scene_Title.prototype.createBackground;
    var ST_terminate = Scene_Title.prototype.terminate;
    var WA_setMasterVolume = WebAudio.setMasterVolume;

    var listeners = {};

    var vidSprite, vid;

    Scene_Title.prototype.createBackground = function() {
        ST_createBackground.call(this);

        if(DEBUG) console.log('TitleVideo parameters:', parameters);

        var ext = Game_Interpreter.prototype.videoFileExt();
        var vidFilePath = 'movies/'+ filepath + ext;

        if(DEBUG) console.log('Loading video as texture:', vidFilePath);
        var vidTexture = PIXI.Texture.fromVideo(vidFilePath);

        vid = vidTexture.baseTexture.source;
        vidSprite = new PIXI.Sprite(vidTexture);

        vid.volume = volume*WebAudio._masterVolume;

        vidSprite.blendMode = PIXI.BLEND_MODES[blendMode.toUpperCase()] || PIXI.BLEND_MODES.NORMAL;

        vid.addEventListener('loadedmetadata', function() {
            if(DEBUG) console.log('Successfully loaded video metadata:');
            if(w === 'video') {
                vidSprite.width = vid.videoWidth;
            }
            if(h === 'video') {
                vidSprite.height = vid.videoHeight;
            }
            if(loopEnd === 'end') {
                loopEnd = vid.duration;
            }
        });

        window.vid = vid;

        vidSprite.width = w === 'auto' ? Graphics.width : (parseInt(w) || Graphics.width);
        vidSprite.height = h === 'auto' ? Graphics.height : (parseInt(h) || Graphics.height);
        vidSprite.x = parseInt(x) || 0;
        vidSprite.y = parseInt(y) || 0;
        vidSprite.alpha = parseFloat(opacity) || 1.0;
        vidSprite.tint = parseInt(tint) || 0xffffff;

        vid.loop = loop === 'no' ? false : true;
        vid.muted = muted === 'yes' ? true : false;
        vid.playbackRate = parseFloat(playbackRate) || 1.0;

        vidSprite.update = function() {
            vidTexture.update();
        };

        if(loop){
            loopStart = parseFloat(loopStart);
            if(loopEnd !== 'end'){
                loopEnd = parseFloat(loopEnd);
            }
            if(loopStart > 0 || loopEnd !== vid.duration) {
                vid.loop = false;
                addListener('timeupdate', doCustomLoop);

                if(DEBUG) console.log('Setting up custom loop from %s to %s:', loopStart.toFixed(3), loopEnd);
            }
        }
        else {
            vid.addEventListener('ended', function() {
                vidSprite.visible = false;
            });
        }

        if(DEBUG){
            vid.addEventListener('error', function() {
                console.error('video element error:', vid.error);
            });
        }

        this.addChild(vidSprite);
    };

    WebAudio.setMasterVolume = function(value) {
        if(DEBUG) console.log('Setting video volume: ', value);
        if(vid) vid.volume = volume*value;
        WA_setMasterVolume(value);
    }

    Scene_Title.prototype.terminate = function() {
        ST_terminate.call(this);
        vidSprite.destroy(true);

        removeListeners();
        vid.pause();
        vid.remove();
        vid = null;
        vidSprite = null
        WebAudio.setMasterVolume = WA_setMasterVolume;
    };

    function doCustomLoop() {
        if(DEBUG) console.log('Time update:', vid.currentTime);
        if(vid.currentTime >= loopEnd){
            if(DEBUG) console.log('Looping back to ', loopStart);
            vid.currentTime = loopStart;
            vid.play();
        }
    }

    function addListener(evt, fn){
        vid.addEventListener(evt, fn);

        if(!listeners[evt]){
            listeners[evt] = [];
        }
        listeners[evt].push(fn);
    }

    function removeListeners() {
        Object.keys(listeners).forEach(function(evt){
            listeners[evt].forEach(function(fn){
                vid.removeEventListener(evt, fn);
            });
        });
    }

})();
