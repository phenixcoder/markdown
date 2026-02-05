/// <reference types="vite/client" />

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.css?url' {
  const href: string
  export default href
}
