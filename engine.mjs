import Shiki from '@shikijs/markdown-it';

const mdItShiki = await Shiki({
  themes: {
    dark: 'nord',
    light: 'nord',
  },
});

export default ({ marp }) => marp.use(mdItShiki);
