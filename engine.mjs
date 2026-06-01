import Shiki from '@shikijs/markdown-it';
import { talkMetadataPlugin } from './lib/talk-metadata.mjs';

const mdItShiki = await Shiki({
  themes: {
    dark: 'nord',
    light: 'nord',
  },
});

export default ({ marp }) => marp.use(talkMetadataPlugin).use(mdItShiki);
