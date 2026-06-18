// Browser stub for node:stream — only server-side SSR code paths use this.
// Capacitor is a client-only build; these stubs satisfy Rollup's binding
// resolution without ever executing at runtime.
export class Readable {
  static from() { return new Readable(); }
  pipe() { return this; }
  on() { return this; }
}
export class Writable {
  on() { return this; }
  write() {}
  end() {}
}
export class Transform extends Readable {}
export class PassThrough extends Readable {}
export default { Readable, Writable, Transform, PassThrough };
