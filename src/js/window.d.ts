declare global {
  interface Window {
    renderers: (() => {})[]
    state: { [key: string]: any }
  }
}
