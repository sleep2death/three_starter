/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The AlphaMaskFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used to offset the x and the g property of the texture is used to offset the y.
 *
 * @class AlphaMaskFilter
 * @extends AbstractFilter
 * @constructor
 * @param texture {Texture} The texture used for the displacement map * must be power of 2 texture at the moment
 */
PIXI.AlphaMaskFilter = function(texture, offsetX, offsetY, flipped)
{
    PIXI.AbstractFilter.call(this);

    this.passes = [this];
    texture.baseTexture._powerOf2 = true;

    // set the uniforms
    this.uniforms = {
        mask: {type: 'sampler2D', value:texture},
        mapDimensions:   {type: '2f', value:{x:0, y:0}},
        mapOffset:  {type: '2f', value:{x:offsetX, y:offsetY}},
        colorR:  {type: '3f', value:{x:0.8, y:0.4, z: 0.1}},
        flipped: {type: '1f', value: flipped},
        dimensions:   {type: '4fv', value:[0,0,0,0]}
    };

    if (texture.baseTexture.hasLoaded)
    {
        this.uniforms.mapDimensions.value.x = texture.width;
        this.uniforms.mapDimensions.value.y = texture.height;
    }
    else
    {
        this.boundLoadedFunction = this.onTextureLoaded.bind(this);

        texture.baseTexture.on('loaded', this.boundLoadedFunction);
    }

    this.fragmentSrc = [
        'precision mediump float;',
        'varying vec2 vTextureCoord;',

        'uniform sampler2D mask;',
        'uniform sampler2D uSampler;',

        'uniform float flipped;',

        'uniform vec4 dimensions;',

        'uniform vec2 mapDimensions;',
        'uniform vec2 mapOffset;',

        'uniform vec3 colorR;',

        'void main(void) {',
        '   vec2 mapCords = vTextureCoord.xy;',
        '   mapCords *= dimensions.xy / mapDimensions;',
        '   mapCords += mapOffset / mapDimensions;',

        '   mapCords.y *= -1.0;',
        '   mapCords.x *= flipped;',
        '   mapCords.y += -1.0;',

        '   vec4 original =  texture2D(uSampler, vTextureCoord);',
        '   vec4 maskAlpha =  texture2D(mask, mapCords);',
        '   original.a *= maskAlpha.r + maskAlpha.g + maskAlpha.b;',
        '   original.rgb *= (maskAlpha.g * colorR) + maskAlpha.r;',
        '   gl_FragColor =  original;',
        '}'
    ];
};

PIXI.AlphaMaskFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.AlphaMaskFilter.prototype.constructor = PIXI.AlphaMaskFilter;

/**
 * Sets the map dimensions uniforms when the texture becomes available.
 *
 * @method onTextureLoaded
 */
PIXI.AlphaMaskFilter.prototype.onTextureLoaded = function()
{
    this.uniforms.mapDimensions.value.x = this.uniforms.mask.value.width;
    this.uniforms.mapDimensions.value.y = this.uniforms.mask.value.height;

    this.uniforms.mask.value.baseTexture.off('loaded', this.boundLoadedFunction);
};

/**
 * The texture used for the displacement map. Must be power of 2 sized texture.
 *
 * @property map
 * @type Texture
 */
Object.defineProperty(PIXI.AlphaMaskFilter.prototype, 'map', {

    get: function() {
        return this.uniforms.mask.value;
    },

    set: function(value) {
        this.uniforms.mask.value = value;
    }
});

Object.defineProperty(PIXI.AlphaMaskFilter.prototype, 'offset', {

    get: function() {
        return this.uniforms.mapOffset.value;
    },

    set: function(value) {
        this.uniforms.mapOffset.value = value;
    }
});

Object.defineProperty(PIXI.AlphaMaskFilter.prototype, 'flipped', {

    get: function() {
        return this.uniforms.flipped.value;
    },

    set: function(value) {
        this.uniforms.flipped.value = value;
    }
});

Object.defineProperty(PIXI.AlphaMaskFilter.prototype, 'colorR', {

    get: function() {
        return this.uniforms.colorR.value;
    },

    set: function(value) {
        this.uniforms.colorR.value = value;
    }
});
