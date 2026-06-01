import yaml, { FAILSAFE_SCHEMA } from 'js-yaml';

const CANONICAL_BASE_URL = 'https://slides.su8.run';
const SHORT_BASE_URL = 'https://s.su8.run';
const PLACEHOLDER_PATTERN = /{{\s*([A-Za-z0-9_.-]+)\s*}}/g;
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/;

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const hasPlaceholders = (markdown) => {
  PLACEHOLDER_PATTERN.lastIndex = 0;
  return PLACEHOLDER_PATTERN.test(markdown);
};

const parseFrontmatter = (markdown) => {
  const match = FRONTMATTER_PATTERN.exec(markdown);
  if (!match) return undefined;

  const parsed = yaml.load(normalizeTalkFrontmatter(match[1]), { schema: FAILSAFE_SCHEMA });
  if (parsed === null) return { data: {}, end: match[0].length };
  if (!isRecord(parsed)) {
    throw new Error('frontmatter must be a YAML object to use talk metadata');
  }

  return { data: parsed, end: match[0].length };
};

const normalizeTalkFrontmatter = (frontmatter) => {
  const lines = frontmatter.split(/\r?\n/);
  let talkIndent;

  return lines
    .map((line) => {
      const talkMatch = /^(\s*)talk:\s*$/.exec(line);
      if (talkMatch) {
        talkIndent = talkMatch[1].length;
        return line;
      }

      const indent = line.match(/^\s*/)[0].length;
      if (talkIndent !== undefined && indent <= talkIndent && line.trim() !== '') {
        talkIndent = undefined;
      }

      if (talkIndent === undefined || indent <= talkIndent) return line;

      return line.replace(/^(\s*(?:slug|date|event)\s*:\s*)(.+)$/, (original, prefix, value) => {
        const trimmed = value.trim();
        if (trimmed === '' || /^['"[{>|&*!]/.test(trimmed)) return original;
        return `${prefix}${JSON.stringify(trimmed)}`;
      });
    })
    .join('\n');
};

const requiredString = (source, key) => {
  const value = source[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`talk.${key} is required`);
  }
  return value.trim();
};

const getByPath = (source, path) => {
  const value = path.split('.').reduce((current, key) => {
    if (isRecord(current) && Object.hasOwn(current, key)) return current[key];
    return undefined;
  }, source);

  if (value === undefined || value === null || isRecord(value)) {
    throw new Error(`unknown placeholder: ${path}`);
  }

  return String(value);
};

const replacePlaceholders = (markdown, context) =>
  markdown.replace(PLACEHOLDER_PATTERN, (_, path) => getByPath(context, path));

const directiveComment = (directives) => {
  const body = yaml
    .dump(directives, {
      lineWidth: -1,
      noRefs: true,
      schema: FAILSAFE_SCHEMA,
      sortKeys: false,
    })
    .trimEnd();

  return `<!--\n${body}\n-->`;
};

const buildContext = (frontmatter) => {
  if (!Object.hasOwn(frontmatter, 'talk')) return undefined;
  if (!isRecord(frontmatter.talk)) {
    throw new Error('talk must be a YAML object');
  }

  const slug = requiredString(frontmatter.talk, 'slug');
  const date = requiredString(frontmatter.talk, 'date');
  const event = requiredString(frontmatter.talk, 'event');
  const label = `${date} | ${event}`;
  const canonical = `${CANONICAL_BASE_URL}/${slug}`;
  const short = `${SHORT_BASE_URL}/${slug}`;
  const image = `${canonical}/index.jpg`;

  return {
    ...frontmatter,
    description: label,
    footer: label,
    image,
    talk: {
      ...frontmatter.talk,
      date,
      event,
      label,
      slug,
    },
    url: canonical,
    urls: {
      canonical,
      image,
      short,
    },
  };
};

export const transformTalkMetadata = (markdown) => {
  const frontmatter = parseFrontmatter(markdown);
  const includesPlaceholders = hasPlaceholders(markdown);

  if (!frontmatter) {
    if (includesPlaceholders) {
      throw new Error('placeholder requires talk frontmatter');
    }
    return markdown;
  }

  const context = buildContext(frontmatter.data);
  if (!context) {
    if (includesPlaceholders) {
      throw new Error('placeholder requires talk frontmatter');
    }
    return markdown;
  }

  const head = markdown.slice(0, frontmatter.end);
  const body = markdown.slice(frontmatter.end);
  const directives = directiveComment({
    description: context.description,
    footer: context.footer,
    image: context.image,
    url: context.url,
  });

  return `${replacePlaceholders(head, context)}\n\n${directives}${replacePlaceholders(body, context)}`;
};

export const talkMetadataPlugin = (md) => {
  md.core.ruler.before('marpit_directives_front_matter', 'talk_metadata', (state) => {
    state.src = transformTalkMetadata(state.src);
  });
};
