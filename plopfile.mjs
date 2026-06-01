export default function (plop) {
  plop.setHelper('raw', (options) => options.fn());
  plop.setHelper('json', (value) => JSON.stringify(value));

  plop.setGenerator('slide', {
    description: 'Create a new Marp slide deck',
    prompts: [
      {
        type: 'input',
        name: 'slug',
        message: 'slug',
        filter: (value) => value.trim(),
        validate: (value) =>
          /^\d{6}-[a-z0-9][a-z0-9-]*$/.test(value)
            ? true
            : 'Use a slug like 260603-workers.',
      },
      {
        type: 'input',
        name: 'title',
        message: 'title',
        filter: (value) => value.trim(),
        validate: (value) => (value.trim() === '' ? 'Title is required.' : true),
      },
      {
        type: 'input',
        name: 'date',
        message: 'date',
        default: (answers) => dateFromSlug(answers.slug),
        filter: (value) => value.trim(),
        validate: (value) => (isValidDate(value) ? true : 'Use a valid YYYY-MM-DD date.'),
      },
      {
        type: 'input',
        name: 'event',
        message: 'event',
        filter: (value) => value.trim(),
        validate: (value) => (value.trim() === '' ? 'Event is required.' : true),
      },
      {
        type: 'list',
        name: 'math',
        message: 'math',
        default: '',
        choices: [
          { name: 'none', value: '' },
          { name: 'mathjax', value: 'mathjax' },
        ],
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/{{slug}}/index.md',
        templateFile: 'templates/slide/index.md.hbs',
      },
      {
        type: 'add',
        path: 'src/{{slug}}/images/.gitkeep',
        template: '',
      },
    ],
  });
}

function dateFromSlug(slug) {
  const match = /^(\d{2})(\d{2})(\d{2})-/.exec(slug);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const date = `20${year}-${month}-${day}`;
  return isValidDate(date) ? date : undefined;
}

function isValidDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() + 1 === Number(month) &&
    date.getUTCDate() === Number(day)
  );
}
