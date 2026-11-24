export const logos = import.meta.glob<string>('./logo-marcas/*.png', { eager: true, query: '?url', import: 'default' })
