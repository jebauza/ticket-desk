// @ts-check
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

// Regla de seguridad compartida: nunca construir SQL con datos interpolados.
// pool.query(`SELECT ... ${x}`) o pool.query('a' + x) deben usar siempre
// placeholders ($1, $2, ...) + array de parámetros (ver pg docs / node-postgres).
const noDynamicSqlRules = {
  'no-restricted-syntax': [
    'error',
    {
      selector:
        "CallExpression[callee.property.name='query'] > TemplateLiteral[expressions.length>0]",
      message:
        'No interpoles valores dentro del string de una query SQL (riesgo de SQL injection). Usa placeholders ($1, $2, ...) y pasa los valores como array de parámetros.',
    },
    {
      selector:
        "CallExpression[callee.property.name='query'] > BinaryExpression[operator='+']",
      message:
        'No concatenes strings para construir una query SQL (riesgo de SQL injection). Usa placeholders ($1, $2, ...) y pasa los valores como array de parámetros.',
    },
  ],
};

module.exports = tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'postgres/**', 'public/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Los ficheros de config del propio tooling corren en Node/CommonJS.
    files: ['eslint.config.js', 'jest.config.js'],
    languageOptions: {
      globals: { require: 'readonly', module: 'writable', process: 'readonly' },
    },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      ...noDynamicSqlRules,
      // Deuda de estilo preexistente: no bloquean el build, pero quedan visibles.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      // Un doble de test suele necesitar un parámetro del puerto que no usa
      // (para cumplir la firma) y algún any puntual al tipar un fake.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
);
