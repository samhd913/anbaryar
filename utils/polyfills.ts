// Polyfills for React Native
// Note: Buffer is not available in React Native, so we use custom implementations

// For React Native, we need to use a different approach
if (typeof global.Buffer === 'undefined') {
  // Simple base64 encoder/decoder for React Native
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  global.btoa = function(input: string): string {
    let str = input;
    let output = '';
    let chr1: number, chr2: number, chr3: number;
    let enc1: number, enc2: number, enc3: number, enc4: number;
    let i = 0;

    while (i < str.length) {
      chr1 = str.charCodeAt(i++);
      chr2 = i < str.length ? str.charCodeAt(i++) : 0;
      chr3 = i < str.length ? str.charCodeAt(i++) : 0;

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
        chars.charAt(enc1) + chars.charAt(enc2) +
        chars.charAt(enc3) + chars.charAt(enc4);
    }

    return output;
  };

  global.atob = function(input: string): string {
    let str = input.replace(/[^A-Za-z0-9+/]/g, '');
    let output = '';
    let chr1: number, chr2: number, chr3: number;
    let enc1: number, enc2: number, enc3: number, enc4: number;
    let i = 0;

    while (i < str.length) {
      enc1 = chars.indexOf(str.charAt(i++));
      enc2 = chars.indexOf(str.charAt(i++));
      enc3 = chars.indexOf(str.charAt(i++));
      enc4 = chars.indexOf(str.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    }

    return output;
  };
}
