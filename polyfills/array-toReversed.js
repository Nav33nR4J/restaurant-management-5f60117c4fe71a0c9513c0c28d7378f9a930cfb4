// Polyfill for Array.prototype.toReversed() (ES2023)
// This provides compatibility with Node.js versions below v21

if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return this.slice().reverse();
  };
}

