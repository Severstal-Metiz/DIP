//ХЭШ//
/**
 * [js-sha3]{@link https://github.com/emn178/js-sha3}
 *
 * @version 0.8.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2018
 * @license MIT
 */
/*jslint bitwise: true */

(function () {
  'use strict';

  var INPUT_ERROR = 'input is invalid type';
  var FINALIZE_ERROR = 'finalize already called';
  var WINDOW = typeof window === 'object';
  var root = WINDOW ? window : {};
  if (root.JS_SHA3_NO_WINDOW) {
    WINDOW = false;
  }
  var WEB_WORKER = !WINDOW && typeof self === 'object';
  var NODE_JS = !root.JS_SHA3_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
    root = global;
  } else if (WEB_WORKER) {
    root = self;
  }
  var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && typeof module === 'object' && module.exports;
  var AMD = typeof define === 'function' && define.amd;
  var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');
  var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
  var CSHAKE_PADDING = [4, 1024, 262144, 67108864];
  var KECCAK_PADDING = [1, 256, 65536, 16777216];
  var PADDING = [6, 1536, 393216, 100663296];
  var SHIFT = [0, 8, 16, 24];
  var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649,
    0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0,
    2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771,
    2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648,
    2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
  var BITS = [224, 256, 384, 512];
  var SHAKE_BITS = [128, 256];
  var OUTPUT_TYPES = ['hex', 'buffer', 'arrayBuffer', 'array', 'digest'];
  var CSHAKE_BYTEPAD = {
    '128': 168,
    '256': 136
  };

  if (root.JS_SHA3_NO_NODE_JS || !Array.isArray) {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  if (ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
    ArrayBuffer.isView = function (obj) {
      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
    };
  }

  var createOutputMethod = function (bits, padding, outputType) {
    return function (message) {
      return new Keccak(bits, padding, bits).update(message)[outputType]();
    };
  };

  var createShakeOutputMethod = function (bits, padding, outputType) {
    return function (message, outputBits) {
      return new Keccak(bits, padding, outputBits).update(message)[outputType]();
    };
  };

  var createCshakeOutputMethod = function (bits, padding, outputType) {
    return function (message, outputBits, n, s) {
      return methods['cshake' + bits].update(message, outputBits, n, s)[outputType]();
    };
  };

  var createKmacOutputMethod = function (bits, padding, outputType) {
    return function (key, message, outputBits, s) {
      return methods['kmac' + bits].update(key, message, outputBits, s)[outputType]();
    };
  };

  var createOutputMethods = function (method, createMethod, bits, padding) {
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createMethod(bits, padding, type);
    }
    return method;
  };

  var createMethod = function (bits, padding) {
    var method = createOutputMethod(bits, padding, 'hex');
    method.create = function () {
      return new Keccak(bits, padding, bits);
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    return createOutputMethods(method, createOutputMethod, bits, padding);
  };

  var createShakeMethod = function (bits, padding) {
    var method = createShakeOutputMethod(bits, padding, 'hex');
    method.create = function (outputBits) {
      return new Keccak(bits, padding, outputBits);
    };
    method.update = function (message, outputBits) {
      return method.create(outputBits).update(message);
    };
    return createOutputMethods(method, createShakeOutputMethod, bits, padding);
  };

  var createCshakeMethod = function (bits, padding) {
    var w = CSHAKE_BYTEPAD[bits];
    var method = createCshakeOutputMethod(bits, padding, 'hex');
    method.create = function (outputBits, n, s) {
      if (!n && !s) {
        return methods['shake' + bits].create(outputBits);
      } else {
        return new Keccak(bits, padding, outputBits).bytepad([n, s], w);
      }
    };
    method.update = function (message, outputBits, n, s) {
      return method.create(outputBits, n, s).update(message);
    };
    return createOutputMethods(method, createCshakeOutputMethod, bits, padding);
  };

  var createKmacMethod = function (bits, padding) {
    var w = CSHAKE_BYTEPAD[bits];
    var method = createKmacOutputMethod(bits, padding, 'hex');
    method.create = function (key, outputBits, s) {
      return new Kmac(bits, padding, outputBits).bytepad(['KMAC', s], w).bytepad([key], w);
    };
    method.update = function (key, message, outputBits, s) {
      return method.create(key, outputBits, s).update(message);
    };
    return createOutputMethods(method, createKmacOutputMethod, bits, padding);
  };

  var algorithms = [
    { name: 'keccak', padding: KECCAK_PADDING, bits: BITS, createMethod: createMethod },
    { name: 'sha3', padding: PADDING, bits: BITS, createMethod: createMethod },
    { name: 'shake', padding: SHAKE_PADDING, bits: SHAKE_BITS, createMethod: createShakeMethod },
    { name: 'cshake', padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createCshakeMethod },
    { name: 'kmac', padding: CSHAKE_PADDING, bits: SHAKE_BITS, createMethod: createKmacMethod }
  ];

  var methods = {}, methodNames = [];

  for (var i = 0; i < algorithms.length; ++i) {
    var algorithm = algorithms[i];
    var bits = algorithm.bits;
    for (var j = 0; j < bits.length; ++j) {
      var methodName = algorithm.name + '_' + bits[j];
      methodNames.push(methodName);
      methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
      if (algorithm.name !== 'sha3') {
        var newMethodName = algorithm.name + bits[j];
        methodNames.push(newMethodName);
        methods[newMethodName] = methods[methodName];
      }
    }
  }

  function Keccak(bits, padding, outputBits) {
    this.blocks = [];
    this.s = [];
    this.padding = padding;
    this.outputBits = outputBits;
    this.reset = true;
    this.finalized = false;
    this.block = 0;
    this.start = 0;
    this.blockCount = (1600 - (bits << 1)) >> 5;
    this.byteCount = this.blockCount << 2;
    this.outputBlocks = outputBits >> 5;
    this.extraBytes = (outputBits & 31) >> 3;

    for (var i = 0; i < 50; ++i) {
      this.s[i] = 0;
    }
  }

  Keccak.prototype.update = function (message) {
    if (this.finalized) {
      throw new Error(FINALIZE_ERROR);
    }
    var notString, type = typeof message;
    if (type !== 'string') {
      if (type === 'object') {
        if (message === null) {
          throw new Error(INPUT_ERROR);
        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        } else if (!Array.isArray(message)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
            throw new Error(INPUT_ERROR);
          }
        }
      } else {
        throw new Error(INPUT_ERROR);
      }
      notString = true;
    }
    var blocks = this.blocks, byteCount = this.byteCount, length = message.length,
      blockCount = this.blockCount, index = 0, s = this.s, i, code;

    while (index < length) {
      if (this.reset) {
        this.reset = false;
        blocks[0] = this.block;
        for (i = 1; i < blockCount + 1; ++i) {
          blocks[i] = 0;
        }
      }
      if (notString) {
        for (i = this.start; index < length && i < byteCount; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < byteCount; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }
      this.lastByteIndex = i;
      if (i >= byteCount) {
        this.start = i - byteCount;
        this.block = blocks[blockCount];
        for (i = 0; i < blockCount; ++i) {
          s[i] ^= blocks[i];
        }
        f(s);
        this.reset = true;
      } else {
        this.start = i;
      }
    }
    return this;
  };

  Keccak.prototype.encode = function (x, right) {
    var o = x & 255, n = 1;
    var bytes = [o];
    x = x >> 8;
    o = x & 255;
    while (o > 0) {
      bytes.unshift(o);
      x = x >> 8;
      o = x & 255;
      ++n;
    }
    if (right) {
      bytes.push(n);
    } else {
      bytes.unshift(n);
    }
    this.update(bytes);
    return bytes.length;
  };

  Keccak.prototype.encodeString = function (str) {
    var notString, type = typeof str;
    if (type !== 'string') {
      if (type === 'object') {
        if (str === null) {
          throw new Error(INPUT_ERROR);
        } else if (ARRAY_BUFFER && str.constructor === ArrayBuffer) {
          str = new Uint8Array(str);
        } else if (!Array.isArray(str)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(str)) {
            throw new Error(INPUT_ERROR);
          }
        }
      } else {
        throw new Error(INPUT_ERROR);
      }
      notString = true;
    }
    var bytes = 0, length = str.length;
    if (notString) {
      bytes = length;
    } else {
      for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i);
        if (code < 0x80) {
          bytes += 1;
        } else if (code < 0x800) {
          bytes += 2;
        } else if (code < 0xd800 || code >= 0xe000) {
          bytes += 3;
        } else {
          code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(++i) & 0x3ff));
          bytes += 4;
        }
      }
    }
    bytes += this.encode(bytes * 8);
    this.update(str);
    return bytes;
  };

  Keccak.prototype.bytepad = function (strs, w) {
    var bytes = this.encode(w);
    for (var i = 0; i < strs.length; ++i) {
      bytes += this.encodeString(strs[i]);
    }
    var paddingBytes = w - bytes % w;
    var zeros = [];
    zeros.length = paddingBytes;
    this.update(zeros);
    return this;
  };

  Keccak.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
    blocks[i >> 2] |= this.padding[i & 3];
    if (this.lastByteIndex === this.byteCount) {
      blocks[0] = blocks[blockCount];
      for (i = 1; i < blockCount + 1; ++i) {
        blocks[i] = 0;
      }
    }
    blocks[blockCount - 1] |= 0x80000000;
    for (i = 0; i < blockCount; ++i) {
      s[i] ^= blocks[i];
    }
    f(s);
  };

  Keccak.prototype.toString = Keccak.prototype.hex = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
      extraBytes = this.extraBytes, i = 0, j = 0;
    var hex = '', block;
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        block = s[i];
        hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F] +
          HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F] +
          HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F] +
          HEX_CHARS[(block >> 28) & 0x0F] + HEX_CHARS[(block >> 24) & 0x0F];
      }
      if (j % blockCount === 0) {
        f(s);
        i = 0;
      }
    }
    if (extraBytes) {
      block = s[i];
      hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F];
      if (extraBytes > 1) {
        hex += HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F];
      }
      if (extraBytes > 2) {
        hex += HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F];
      }
    }
    return hex;
  };

  Keccak.prototype.arrayBuffer = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
      extraBytes = this.extraBytes, i = 0, j = 0;
    var bytes = this.outputBits >> 3;
    var buffer;
    if (extraBytes) {
      buffer = new ArrayBuffer((outputBlocks + 1) << 2);
    } else {
      buffer = new ArrayBuffer(bytes);
    }
    var array = new Uint32Array(buffer);
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        array[j] = s[i];
      }
      if (j % blockCount === 0) {
        f(s);
      }
    }
    if (extraBytes) {
      array[i] = s[i];
      buffer = buffer.slice(0, bytes);
    }
    return buffer;
  };

  Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;

  Keccak.prototype.digest = Keccak.prototype.array = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
      extraBytes = this.extraBytes, i = 0, j = 0;
    var array = [], offset, block;
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        offset = j << 2;
        block = s[i];
        array[offset] = block & 0xFF;
        array[offset + 1] = (block >> 8) & 0xFF;
        array[offset + 2] = (block >> 16) & 0xFF;
        array[offset + 3] = (block >> 24) & 0xFF;
      }
      if (j % blockCount === 0) {
        f(s);
      }
    }
    if (extraBytes) {
      offset = j << 2;
      block = s[i];
      array[offset] = block & 0xFF;
      if (extraBytes > 1) {
        array[offset + 1] = (block >> 8) & 0xFF;
      }
      if (extraBytes > 2) {
        array[offset + 2] = (block >> 16) & 0xFF;
      }
    }
    return array;
  };

  function Kmac(bits, padding, outputBits) {
    Keccak.call(this, bits, padding, outputBits);
  }

  Kmac.prototype = new Keccak();

  Kmac.prototype.finalize = function () {
    this.encode(this.outputBits, true);
    return Keccak.prototype.finalize.call(this);
  };

  var f = function (s) {
    var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9,
      b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17,
      b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33,
      b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
    for (n = 0; n < 48; n += 2) {
      c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
      c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
      c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
      c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
      c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
      c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
      c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
      c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
      c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
      c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

      h = c8 ^ ((c2 << 1) | (c3 >>> 31));
      l = c9 ^ ((c3 << 1) | (c2 >>> 31));
      s[0] ^= h;
      s[1] ^= l;
      s[10] ^= h;
      s[11] ^= l;
      s[20] ^= h;
      s[21] ^= l;
      s[30] ^= h;
      s[31] ^= l;
      s[40] ^= h;
      s[41] ^= l;
      h = c0 ^ ((c4 << 1) | (c5 >>> 31));
      l = c1 ^ ((c5 << 1) | (c4 >>> 31));
      s[2] ^= h;
      s[3] ^= l;
      s[12] ^= h;
      s[13] ^= l;
      s[22] ^= h;
      s[23] ^= l;
      s[32] ^= h;
      s[33] ^= l;
      s[42] ^= h;
      s[43] ^= l;
      h = c2 ^ ((c6 << 1) | (c7 >>> 31));
      l = c3 ^ ((c7 << 1) | (c6 >>> 31));
      s[4] ^= h;
      s[5] ^= l;
      s[14] ^= h;
      s[15] ^= l;
      s[24] ^= h;
      s[25] ^= l;
      s[34] ^= h;
      s[35] ^= l;
      s[44] ^= h;
      s[45] ^= l;
      h = c4 ^ ((c8 << 1) | (c9 >>> 31));
      l = c5 ^ ((c9 << 1) | (c8 >>> 31));
      s[6] ^= h;
      s[7] ^= l;
      s[16] ^= h;
      s[17] ^= l;
      s[26] ^= h;
      s[27] ^= l;
      s[36] ^= h;
      s[37] ^= l;
      s[46] ^= h;
      s[47] ^= l;
      h = c6 ^ ((c0 << 1) | (c1 >>> 31));
      l = c7 ^ ((c1 << 1) | (c0 >>> 31));
      s[8] ^= h;
      s[9] ^= l;
      s[18] ^= h;
      s[19] ^= l;
      s[28] ^= h;
      s[29] ^= l;
      s[38] ^= h;
      s[39] ^= l;
      s[48] ^= h;
      s[49] ^= l;

      b0 = s[0];
      b1 = s[1];
      b32 = (s[11] << 4) | (s[10] >>> 28);
      b33 = (s[10] << 4) | (s[11] >>> 28);
      b14 = (s[20] << 3) | (s[21] >>> 29);
      b15 = (s[21] << 3) | (s[20] >>> 29);
      b46 = (s[31] << 9) | (s[30] >>> 23);
      b47 = (s[30] << 9) | (s[31] >>> 23);
      b28 = (s[40] << 18) | (s[41] >>> 14);
      b29 = (s[41] << 18) | (s[40] >>> 14);
      b20 = (s[2] << 1) | (s[3] >>> 31);
      b21 = (s[3] << 1) | (s[2] >>> 31);
      b2 = (s[13] << 12) | (s[12] >>> 20);
      b3 = (s[12] << 12) | (s[13] >>> 20);
      b34 = (s[22] << 10) | (s[23] >>> 22);
      b35 = (s[23] << 10) | (s[22] >>> 22);
      b16 = (s[33] << 13) | (s[32] >>> 19);
      b17 = (s[32] << 13) | (s[33] >>> 19);
      b48 = (s[42] << 2) | (s[43] >>> 30);
      b49 = (s[43] << 2) | (s[42] >>> 30);
      b40 = (s[5] << 30) | (s[4] >>> 2);
      b41 = (s[4] << 30) | (s[5] >>> 2);
      b22 = (s[14] << 6) | (s[15] >>> 26);
      b23 = (s[15] << 6) | (s[14] >>> 26);
      b4 = (s[25] << 11) | (s[24] >>> 21);
      b5 = (s[24] << 11) | (s[25] >>> 21);
      b36 = (s[34] << 15) | (s[35] >>> 17);
      b37 = (s[35] << 15) | (s[34] >>> 17);
      b18 = (s[45] << 29) | (s[44] >>> 3);
      b19 = (s[44] << 29) | (s[45] >>> 3);
      b10 = (s[6] << 28) | (s[7] >>> 4);
      b11 = (s[7] << 28) | (s[6] >>> 4);
      b42 = (s[17] << 23) | (s[16] >>> 9);
      b43 = (s[16] << 23) | (s[17] >>> 9);
      b24 = (s[26] << 25) | (s[27] >>> 7);
      b25 = (s[27] << 25) | (s[26] >>> 7);
      b6 = (s[36] << 21) | (s[37] >>> 11);
      b7 = (s[37] << 21) | (s[36] >>> 11);
      b38 = (s[47] << 24) | (s[46] >>> 8);
      b39 = (s[46] << 24) | (s[47] >>> 8);
      b30 = (s[8] << 27) | (s[9] >>> 5);
      b31 = (s[9] << 27) | (s[8] >>> 5);
      b12 = (s[18] << 20) | (s[19] >>> 12);
      b13 = (s[19] << 20) | (s[18] >>> 12);
      b44 = (s[29] << 7) | (s[28] >>> 25);
      b45 = (s[28] << 7) | (s[29] >>> 25);
      b26 = (s[38] << 8) | (s[39] >>> 24);
      b27 = (s[39] << 8) | (s[38] >>> 24);
      b8 = (s[48] << 14) | (s[49] >>> 18);
      b9 = (s[49] << 14) | (s[48] >>> 18);

      s[0] = b0 ^ (~b2 & b4);
      s[1] = b1 ^ (~b3 & b5);
      s[10] = b10 ^ (~b12 & b14);
      s[11] = b11 ^ (~b13 & b15);
      s[20] = b20 ^ (~b22 & b24);
      s[21] = b21 ^ (~b23 & b25);
      s[30] = b30 ^ (~b32 & b34);
      s[31] = b31 ^ (~b33 & b35);
      s[40] = b40 ^ (~b42 & b44);
      s[41] = b41 ^ (~b43 & b45);
      s[2] = b2 ^ (~b4 & b6);
      s[3] = b3 ^ (~b5 & b7);
      s[12] = b12 ^ (~b14 & b16);
      s[13] = b13 ^ (~b15 & b17);
      s[22] = b22 ^ (~b24 & b26);
      s[23] = b23 ^ (~b25 & b27);
      s[32] = b32 ^ (~b34 & b36);
      s[33] = b33 ^ (~b35 & b37);
      s[42] = b42 ^ (~b44 & b46);
      s[43] = b43 ^ (~b45 & b47);
      s[4] = b4 ^ (~b6 & b8);
      s[5] = b5 ^ (~b7 & b9);
      s[14] = b14 ^ (~b16 & b18);
      s[15] = b15 ^ (~b17 & b19);
      s[24] = b24 ^ (~b26 & b28);
      s[25] = b25 ^ (~b27 & b29);
      s[34] = b34 ^ (~b36 & b38);
      s[35] = b35 ^ (~b37 & b39);
      s[44] = b44 ^ (~b46 & b48);
      s[45] = b45 ^ (~b47 & b49);
      s[6] = b6 ^ (~b8 & b0);
      s[7] = b7 ^ (~b9 & b1);
      s[16] = b16 ^ (~b18 & b10);
      s[17] = b17 ^ (~b19 & b11);
      s[26] = b26 ^ (~b28 & b20);
      s[27] = b27 ^ (~b29 & b21);
      s[36] = b36 ^ (~b38 & b30);
      s[37] = b37 ^ (~b39 & b31);
      s[46] = b46 ^ (~b48 & b40);
      s[47] = b47 ^ (~b49 & b41);
      s[8] = b8 ^ (~b0 & b2);
      s[9] = b9 ^ (~b1 & b3);
      s[18] = b18 ^ (~b10 & b12);
      s[19] = b19 ^ (~b11 & b13);
      s[28] = b28 ^ (~b20 & b22);
      s[29] = b29 ^ (~b21 & b23);
      s[38] = b38 ^ (~b30 & b32);
      s[39] = b39 ^ (~b31 & b33);
      s[48] = b48 ^ (~b40 & b42);
      s[49] = b49 ^ (~b41 & b43);

      s[0] ^= RC[n];
      s[1] ^= RC[n + 1];
    }
  };

  if (COMMON_JS) {
    module.exports = methods;
  } else {
    for (i = 0; i < methodNames.length; ++i) {
      root[methodNames[i]] = methods[methodNames[i]];
    }
    if (AMD) {
      define(function () {
        return methods;
      });
    }
  }
})();

//////
class ClassQA{ //КЛАСС объекта ВОПРОСА И ОТВЕТОВ
	answers;
	amount;
	question; //???????????????
	hesh;
	constructor(){
		this.question = "";  //???????????????
		this.answers = [];
		this.amount=0;
		this.hesh="";
	}
	ClearAnswers(){
		this.amount=0;
		this.answers.length=0;
		this.hesh="";
	}	
	get Amount(){
		return this.amount;
	}
	get Question(){
		return this.question;
	}
	set Question(value){
		this.question = value;
	}
	get Answers(){
		return this.answers;
	}
	AddAnswer(answer){ //добавить верный ответ
		if (ClassQA.StringIsEmpty(answer,"ClassQA.AddAnswer(answer)")) return;
		this.amount=this.amount+1;
		this.answers[this.amount-1] = answer;
	}
	CalculateHesh(answers)//генерирует хеш на основании массива всех представленных ответов
	{
		var sa = answers.sort();
		var str = "";
		for (let i = 0; i < sa.length; i++) {
			str = str + sa[i];
		}
		this.hesh = shake128(str,128);
		//console.log(sa);
		//console.log(str);
		if (debug) console.log( "Сгенерирован хеш: " + this.hesh +" от строки: "+ str);
	}	
	static StringIsEmpty(str,w="(нет данных)"){//Проверка на пустую строку (СТРОКА,ПРИМЕЧАНИЕ)
		if (str != null && typeof str !== "undefined") {
			str = str.trim();
		}
		if (!str) { 
			if(debug) console.log("Пустая строка! ошибка в "+ w);
			return true;
		}
		return false;
	}

}
/////////////////////////////////////

console.log(">>> START");
var CurrentQA;
var AElement;
var BElement;
var CElement;
var DElement;
var Input;
var InputFind=false;
const debug = true;
const timeout = 800; //800  - работа   0 - отладка
var DB = [];
CurrentQA = new ClassQA("");

var tmpindxs = [];

var helpDiv;
var helpDivid = "helpDividRomixERR";
var settingsDiv;
var loadbtn;
var savebtn;
function InitialHelpDiv(){
    if (document.getElementById(helpDivid) == null){
		settingsDiv = document.createElement('div');
		settingsDiv.innerHTML = "<div> <button id=\"loadbtn\">load DB</button> <button id=\"savebtn\">save DB</button>";
        helpDiv = document.createElement('div');
        helpDiv.id=helpDivid;    
		//document.body.prepend(settingsDiv);
		//document.body.prepend(helpDiv);
    document.body.append(helpDiv);
    }
}

PrintHelpMessage('<div style="color: brown; font-size: medium;">Привет РАБОТЯГА</div><div style="color: yellowgreen;">РАСШИРЕНИЕ ХАКЕР ЗАПУЩЕНО</div>');

loadbtn = document.getElementById("loadbtn"); //загрузка DB из файла и обновление 
savebtn = document.getElementById("savebtn"); //сохранение DB в файл

function PrintHelpMessage(html){
	if (document.getElementById(helpDivid)==null) InitialHelpDiv();
    if (document.getElementById(helpDivid)!=null) {
		if (helpDiv!=null) {helpDiv.innerHTML = html;}else{console.log("helpDiv!=null, отладка?");};
    }

	//или ТАК
	//document.getElementsByClassName("ant-typography-secondary")[0].innerHTML=html;
}


function ClickScan(){//Сканирование страницы и выявление нужных обьектов
	if (debug) console.log(">>> ClickScan >>>")
	AElement = document.getElementsByClassName('ant-typography'); //массив ВОПРОС, ОТВ1, ОТВ2
	BElement = document.getElementsByClassName('ant-card-body');
	CElement = document.getElementsByClassName('ant-space-item');
	DElement = document.getElementsByClassName('ant-typography w-100');
	if (debug){console.log("AElement: "); console.log(AElement); console.log("BElement"); console.log(BElement); console.log("DElement"); console.log(DElement);};
	var tmpstr3;
	if (timeout==0) {tmpstr3 = " режим отладки!!! timeout==0, должно быть timeout>0"} else {tmpstr3=""};
	PrintHelpMessage('<div style="color: brown; font-size: larger;">Привет РАБОТЯГА</div><div style="color: blue;">'+ Anekdot() +'</div>' + tmpstr3);
}


document.body.addEventListener('mousedown', function () {//ЩЕЛЧЁК МЫШИ
	////////проверка хеша
	/*
	CurrentQA.question="Вопрос";
	CurrentQA.CalculateHesh(["Ответ 2","Ответ беспантовый","Ответ 1","Ответ абалденный"]);
	return;
	 */
	////////проверка
	
	if (timeout>0){
		setTimeout(function() {
			//if (debug){console.log("TimeoutEND");};
			ClickScan();
			GetInput();
			ParserPip();
		}, timeout);
	} else{
			ClickScan();
			GetInput();
			ParserPip();
	}	
}, false);


document.addEventListener('keyup', function(e) {//кнопка клавы была нажата
	if (timeout>0){
		setTimeout(function() {
		if (debug){console.log("TimeoutEND");};
			ClickScan();
			GetInput();
			ParserPip();
		}, timeout);
	} else{
			ClickScan();
			GetInput();
			ParserPip();
	}	
});


function GetInput(){//ЗАБИРАЕТ ЗНАЧЕНИЯ ИЗ ПОЛЯ ВВОДА
		var input = document.querySelector('input');
		//var input = document.getElementsByClassName('ant-input');
		if (input == null){
			Input=null;
			InputFind=false;
			return;
		}
		//if (debug){console.log("input.value = "+input.value+"  input.class="+input.className); console.log(input);};
		Input = input.value;
		if (input.className=="ant-input custom-input") InputFind=true; else InputFind=false;
		//if (debug){if (InputFind) {console.log("Найден импут");};};
}

function ParserPip(){//последовательность парсера
	if (PPWindowWithInputArea()) return;
	if (PPWindowWithButAnswer()) return;
	if (PPWindowWithRight()) return;
	if (PPWindowWithNotTrue()) return;
}


function PPWindowWithNotTrue(){ //Детектор окна с подтверждением неправильного ответа
	TODO: //работают не корректно. Пока отключен
	return true;
	//if (AElement.length!=3) return false;
	if (BElement.length!=0) return false;
	if(AElement[0].innerText != "Неправильный ответ") return false;
	if (debug) console.log(">>> PPWindowWithNotTrue find");
	//проверка на наличие ОТВЕТОВ
	//Delmy debug создаю фиктивный вопрос и ответ для проверки ->>>
		/*
		CurrentQA.Question = "Фиктивный вопрос для проверки 4";
		CurrentQA.ClearAnswers();
		CurrentQA.AddAnswer("Ответ ошибка 1");
		CurrentQA.AddAnswer("Ответ ошибка 2");
		CurrentQA.AddAnswer("Ответ ошибка 3");
		  */
	// <<<-
	if (CurrentQA.Amount == 0) return false;
	CurrentQA.ClearAnswers();

	if (AElement[2].innerText.indexOf("Версия:") == 0) //хз сработает или нет. В Неправильный ответ
	{
		tmpstr = CElement[6].innerText;
		tmpstr2 = tmpstr.slice(tmpstr.indexOf(")")+2);
		CurrentQA.AddAnswer(tmpstr2);
	}else{
		for (let i = 2; i < AElement.length; i++) { //получаем правильные ответы из подсказки
			tmpstr = AElement[i].innerText;
			tmpstr2 = tmpstr.slice(tmpstr.indexOf(")")+2);
			CurrentQA.AddAnswer(tmpstr2);
		}		
	}
	LoadRefrashAndSaveDB();
	return true;
}


function PPWindowWithRight(){ //Детектор окна с подтверждением правильного ответа
	//if (AElement.length!=3) return false;
	if (BElement.length!=0) return false;
	if(AElement[0].innerText != "Правильный ответ") return false;
	if (debug) console.log(">>> PPWindowWithRight find");
	//проверка на наличие ОТВЕТОВ
	//Delmy debug создаю фиктивный вопрос и ответ для проверки ->>>
		//CurrentQA.Question = "У пострадавшего термический ожог кисти, кожа покраснела, появились «водяные» пузыри. Ваши действия по оказанию первой помощи?";
		//CurrentQA.ClearAnswers();
		//CurrentQA.AddAnswer("Необходимо наложить повязку на ожоговую поверхность и приложить холод");
		//CurrentQA.AddAnswer("Ответ 2");
		//CurrentQA.AddAnswer("Ответ 3");
		
	// <<<-
	if (CurrentQA.Amount == 0) return false;
	LoadRefrashAndSaveDB();
	return true;
}


function PPWindowWithInputArea(){//Детектор Окна с строчкой ввода
	if (AElement.length!=3) return false;
	if (BElement.length!=0) return false;
	if (!InputFind) return false;
	if (AElement[1].innerText.indexOf("авторизац")>=0) return false; //окно авторизации пропускаем
	if (ClassQA.StringIsEmpty(Input,"PPWindowWithInputArea"))return false;
	if (debug) console.log(">>> PPWindowWithInputArea find");
	//если вопрос ещё не занесен в обьект вопроса то инициализация
	if (CurrentQA.Amount == 0){
		CurrentQA.Question = AElement[1].innerText; //создание обьекта вопрос и добавление вопроса
		//tmpindxs.length=0; при сохранении чистить
		//tmpindxs.splice(0,tmpindxs.length);
	}
	CurrentQA.ClearAnswers();
	CurrentQA.AddAnswer(Input);
	if (debug) console.log(CurrentQA);
	CurrentQA.hesh = "";
	LoadFindAndPrintAnswers();
	return true;
}

function PPWindowWithButAnswer(){//Детектор Окна одним или несколькими правильным ответом
	var tempElement;
	if (AElement.length<5) return false;
	if (BElement.length<2) return false;
	if (InputFind) return false;
	if (debug) console.log(">>> PPWindowWithButAnswer find");
	if (DElement.length>1) {tempElement = DElement;} else {tempElement = BElement;};
	CurrentQA.Question = AElement[1].innerText; //добавление вопроса
  tmpslc = DetectorSelectedQ(tempElement);
	//console.log(tmpslc);
	this.tmpindxs = refrash(tmpslc,this.tmpindxs );  //позиции выбраных вопросов [0,1,0,0]
	//console.log("tmpindxs:")
	//console.log(this.tmpindxs);
	tmpseq = sequence(this.tmpindxs);
	//console.log(tmpseq);
	AnswersRefrash(tmpseq,tempElement);
	if (debug) console.log(CurrentQA);
	var tempB = [];  //Тут надо генерировать хеш для последующего поиска по базе
	for (let i = 0; i < tempElement.length; i++) {
    tempElement[i]=ReplaceTextInHtml(tempElement[i],CurrentQA,i)
		tempB[i] = RazdetVopros(tempElement[i].innerText);
	}
	CurrentQA.CalculateHesh(tempB);
	LoadFindAndPrintAnswers();
	return true;
}
//детектор выбраных вопросов [0,1,0,0] выбран 2 вопрос; [1,1,0,0] выбран 1 и 2 вопрос.
//принимает BElement
function DetectorSelectedQ(vop){
	var ret = []; 
	for (var i=0;i < vop.length;i++){ //ответы
		//console.log(vop[i].offsetParent.className);
		if (vop[i].offsetParent.className.indexOf("answer-selected") >= 0){
			ret[i] = 1;
		}else{ret[i] = 0;}
	} 
	return ret;
}

//обновляет в текущем обьекте вопросов вопросы
//seq - последовательный индекс вопросов [0,2,1]
//vop - BElement
function AnswersRefrash(seq,vop){
	CurrentQA.ClearAnswers();
	for (var i=0;i < seq.length;i++){ //ответы
		this.CurrentQA.AddAnswer(RazdetVopros(vop[seq[i]].innerText));
	} 
}

/*
loadbtn.addEventListener("click",async () =>{
  var [fileHandle] = await window.showOpenFilePicker()
  var file = await fileHandle.getFile()
  var fileContent = await file.text()
  //console.log(fileContent)
  DB = JSON.parse(fileContent);
  console.log("ЗАГРУЗКА БАЗЫ ДАННЫХ С ДИСКА ВЫПОЛНЕНО");
  console.log(DB);
  if (DB == null) return;
  if (DB.length<1) return;
  chrome.storage.local.set({ key: DB }).then(() => { //сделать обновление базы данных в хранилище на основании текущей загруженной версии базы данных
	  console.log("ОБНОВЛЕНИЕ ЛОКАЛЬНОГО ХРАНИЛИЩА ВЫПОЛНЕНО");
  }); 
});


savebtn.addEventListener("click",async () =>{
	//загрузить базу из хранилища
	await chrome.storage.local.get(["key"]).then((result) => { //загрузка базы данных (из хранилища) 
		if (result.key == null) return;
		if (!Array.isArray(result.key)) return;
		DB = result.key;
		console.log("ЗАГРУЗКА ЛОКАЛЬНОГО ХРАНИЛИЩА ВЫПОЛНЕНА");
	});
	var fileData = await JSON.stringify(DB,null,"\t");
	var fileHandle = await window.showSaveFilePicker()
	var writableStream = await fileHandle.createWritable()
	await writableStream.write(fileData)
	await writableStream.close()
	console.log("СОХРАНЕНИЕ ТЕКУЩЕЙ БАЗЫ ДАННЫХ НА ДИСК ВЫПОЛНЕНО");
});
*/

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//ТАК МОЖНО ВЫПОЛНИТЬ ЗАДЕРЖКУ ВЫПОЛНЕНИЯ (при выключении выполнения скриптов не действует)
/*
function Timeout(time){
	console.log("TimeoutSTART");
	setTimeout(function() {
		console.log("TimeoutEND");
	}, time);
}
*/
function Timeout(time){
	console.log("TimeoutSTART");
	setTimeout(TOfunction,time);
}
function TOfunction(){
	console.log("TimeoutEND");
}

//РАДИ ЧЕГО МЫ ВСЕ ЗДЕСЬ собрались
function LoadFindAndPrintAnswers(){  //асинхронная ёбань с хранилищем Находит вопрос в БД и печатает его для помощи
	chrome.storage.local.get(["key"]).then((result) => { //загрузка базы данных (из хранилища) 
		if (result.key == null) return;
		if (!Array.isArray(result.key)) return;
		if (CurrentQA.question == "") return;
		DB = result.key;
		if (debug) console.log("LoadFindAndPrintAnswers()");
		index = SearchInDB();
		if (index >= 0){ //вопрос найден в БД
			var msg = '<div style="color: blueviolet; font-size: larger;"+++++++++++ВОПРОС НАЙДЕН++++++++++</div>';
			console.log("-------->>>> ВОПРОС НАЙДЕН. <<<<--------" + index + " запись в БД");
			console.log("ОТВЕТЫ:");
			for (let i = 0; i < DB[index].answers.length; i++) {
				console.log( (i+1) + ") " + DB[index].answers[i]);
				msg=msg + "<div>" + ObernutVopros(DB[index].answers[i],i);
        //Hilight(DB[index].answers[i],ObernutVopros(DB[index].answers[i],i))
			}
			PrintHelpMessage(msg);
		}
	});
}

function LoadRefrashAndSaveDB(){ //асинхронная ёбань с хранилищем
	chrome.storage.local.get(["key"]).then((result) => { //загрузка базы данных (из хранилища) 
		if (result.key == null) return;
		if (!Array.isArray(result.key)) return;
		DB = result.key;
		if (debug) console.log("LoadDB()");
		if (debug) console.log(DB);
		RefrashDB();
		SaveDB();
	});
}

function SearchInDB(){//поиск существующего вопроса в базе данных (в памяти)
	if (debug) console.log("SearchInDB()");
	//console.log(DB.length);
	//if (DB.length == 0) return -1;
	for (var i=0;i<DB.length;i++){
		if (DB[i].question == CurrentQA.question){
			if (DB[i].hesh == CurrentQA.hesh) return i; //возвращаем индекс найденой записи. дополнить поиск по хешу. если хеш совпал то заебись, пустой то значит тоже заебись
			if (DB[i].hesh == "") return i; //возвращаем индекс найденой записи
		} 
	}
	return -1;
}

function SaveDB(){//сохранение DB (в хранилище)
	if (DB.length == 0) return;
	chrome.storage.local.set({ key: DB }).then(() => {
		//очистка
		tmpindxs.length=0;
		//CurrentQA.ClearAnswers();
	});
		if (debug) console.log("SaveDB()");
		if (debug) console.log(DB);
}

function RefrashDB() {//обновление Базы (в памяти)
	if(CurrentQA.Amount == 0) return;
	index = SearchInDB();
	if (index >=0 ){ //если есть
		DB[index] = CurrentQA;
		if (debug) console.log("DB имеет запись под индексом "+ index);
	} else {
		DB[DB.length] = CurrentQA;
		if (debug) console.log("DB еще не имеет записи");
	}
	if (debug) console.log("RefrashDB()");
	if (debug) console.log(DB);
}


/*Следующие ф-и работают в паре 
//сначала
var B = []
//потом
B = refrash([1,1,1,0],B)
console.log(B)
sequence(B)
*/

function refrash(srs,output=[]){ //какой пункт был выбран первым srs = [0,1,0,0] ... [1,1,0,0] ... [1,1,1,0]  output = [0,1,0,0] ... [2,1,0,0] ... [2,1,3,0]
    if (output.length==0) output.length = srs.length;
    var max=0;
    for (var i=0;i<output.length;i++){
        if (output[i]>max) max=output[i];
    }
    for (var i=0;i< srs.length;i++){
        if (srs[i] == 0) { output[i] = 0} //сброшен
        if (srs[i] > 0) {
            if ( output[i] == 0 ) output[i] = ++max;
        }
    }
		for (i=0;i<output.length;i++){ //костыль при отладке без скриптов empty = 0
			if (output[i] == null) {output[i] = 0; console.log("Метод refrash содержит null в генерации, отладка?");}
		}
    return output;
}

function sequence(srss){//указывает порядковые ИНДЕКСЫ чисел по возрастанию srss = [0,1,0,0] ... [2,1,0,0] ... [2,1,3,0]  output = [1] ... [1, 0] ... [1, 0, 2]
    var srs = srss.slice(0);
    var output = [];
    output.length == srs.length;
    var max=0;
    for (var i=0;i<srs.length;i++){
        if (srs[i]>max) max=srs[i];
    }
    //var k=0;
    var min;
    var minIndex;
    var oldminIndex;
    for (j=0;j<srs.length;j++){
    min=max+1;
        for (i=0;i<srs.length;i++){
            if(srs[i]==0) continue;
            if (srs[i]<min) {
                min = srs[i];
                minIndex=i;
            }
        }
        if (oldminIndex == minIndex) continue;
        output[j] = minIndex;
        srs[minIndex]=0;
        oldminIndex = minIndex;
    }
    return output;
}
//////////////////////////////////////////


var patternBefore='{{'
var patternAfter='}}'


function BeforeP(number){
	return patternBefore + String("   " + number).slice(-3) + " "
}

function ObernutVopros(vop,number){
  if (vop.length==0) return ''
  if (vop.search(patternBefore) != -1) return vop
	return BeforeP(number+1) + vop + patternAfter
}

function RazdetVopros(vop){
  //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1=======> ' + vop + ':'+patternBefore)
  if (vop.length==0) return ''
  if (vop.search(patternBefore) == -1) return vop
	var lenBefore = BeforeP(0).length
	var lenAfter = patternAfter.length
  var ret = vop.slice(lenBefore-1,vop.length-lenAfter)
  //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!2=======> ' + vop + ':'+ret)
	return ret
}

function RazdetVoproses(voprosesArr){
  for (let i = 0; i < voprosesArr.length; i++) {
    voprosesArr[i] = RazdetVopros(voprosesArr[i])
  }
  return voprosesArr
}

function Hilight(razdetiy,odetiy){
  if (document.body.innerHTML.search(odetiy)!= -1) return
  if (document.body.innerHTML.search(razdetiy)!= -1){
    document.body.innerHTML = document.body.innerHTML.replace(razdetiy, odetiy);  
  }
  
}

function ReplaceTextInHtml(html,q,index){
  chrome.storage.local.get(["key"]).then((result) => { //загрузка базы данных (из хранилища) 
		if (result.key == null) return;
		if (!Array.isArray(result.key)) return;
		if (CurrentQA.question == "") return;
		DB = result.key;
  	i = SearchInDB();
    
	  if (i == -1 ) return html
    console.log('Найдено  i='+i)
    console.log('Найдено  am='+ DB[i].question)
    console.log('Найдено  am='+ DB[i].answers.length)
    console.log(DB[i].answers[0])
    for (var j=0;j< DB[i].amount;j++){
      console.log(html.innerText+'     '+DB[i].answers[j]+ '   ???    ')
     if (html.innerText == DB[i].answers[j]){
        console.log(html.innerText+'     '+DB[i].answers[j]+'  ++++  ')
        html.innerHTML = html.innerHTML.replace(html.innerText, ObernutVopros(html.innerText,j));
        return html
     } else {
        console.log(html.innerText+'     '+DB[i].answers[j]+ '   ---    ')
     }
    }
  return html
});
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Anekdot(){
  names1=['Михалыч','Блохин','Талалаев','Диман','Рома','Иван Сергеевич']
  name1 = names1[getRandomInt(0,names1.length-1)]
  names2=['Михалыча','Блохина','Талалаева','Димана','Романа','Ивана Сергеевича']
  name2 = names2[getRandomInt(0,names2.length-1)]
  angStr=[' В цеху.  '  + 
  '  — У нас правила безопасности написаны кровью!  '  + 
  '  — Я заметил. А нахрена вы это сделали?  '  + 
  '  — Да у нас тут '+name2+' на прошлой неделе на вал намотало. Мы и подумали, чего добру пропадать…  ',
  '  На производстве информируют о несчастных случаях.  '  + 
  '  Хоть бы раз о счастливых проинформировали.  ',
  '  Помни, успешные люди встают до рассвета, или после полудня.  '  + 
  '  Все зависит от смены на заводе.  ',
  '  Поступив на завод сразу после техникума, '+name1+' был неопытный и совсем зеленый.  '  + 
  '  Но вот прошло полгода и теперь он каждый день синий.  ',
  '  Тульский завод медных тазов накрылся готовой продукцией.',
  '  В России сначала завод строится в соответствии с проектными чертежами,'+
  '  а потом чертежи редактируются в соответствии с построенным заводом.',
  '  Со словами: "Я выбираю жить в кайф", работник завода '+name1+' порезал в Доширак сосисочку.',
  '  Ликероводочный завод «Кристалл» предупреждает: Курение, курение и только курение опасно для вашего здоровья!',
  '  Сыктывкарский завод чугунного литья приступил к выпуску детских игрушек:  '  + 
  '  — С этой игрушкой вы всегда найдёте ребёнка там, где его оставили.  ',
  'В результате взрыва на ликероводочном заводе все живое в радиусе 3 км требует продолжения банкета.',
  '   Новость:  '  + 
  '   Завод "Серп и Молот" решил объединить активы с подмосковной птицефабрикой.  '  + 
  '  Новое производственное объединение решено назвать "Серп и Яйца".  ',
  'Пороховой завод сообщает о своей ликвидации',
  'Не суйся в воду возле хим. завода.',
  '   Приказ по заводу:  '  + 
  '  "Лишить работника цеха '+name2+' премии в размере 40% за низкий уровень культуры при разгрузке вагонов с углем".  ',
  '— После взрыва на цементном заводе прошел дождь, и жизнь на предприятии окончательно замерла…',
  'Донецкий паяльниковый завод получил крупный заказ на изготовление детекторов лжи.',
  'После обеда в результате алкогольной интоксикации в тяжелом состоянии был доставлен на завод слесарь '+name1+','+
  'где он, не приходя в сознание… приступил к работе.',
  'Из новостей. Вчера в торжественной обстановке на строительстве нового ликеро-водочного завода' +
  'мэр города '+name1+' заложил первую рюмку.'
  ]
 
  anek = angStr[getRandomInt(0,angStr.length-1)]
  return anek
}


