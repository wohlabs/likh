// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
	expoConfig,
	{
		ignores: ['dist/*'],
		rules: {
			'brace-style': ['error', 'allman', { allowSingleLine: true }],
			'indent': ['error', 'tab']
		},
	},
]);
