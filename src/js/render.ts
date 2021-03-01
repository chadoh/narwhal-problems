export default function render() {
  return Promise.all((window as any).renderers.map(fn => fn()))
}