import { antfu } from '@antfu/eslint-config'

export default antfu({
  rules: {
    'ts/method-signature-style': ['warn', 'method'],
    'ts/ban-ts-comment': 'off',
    'no-console': 'off',
    'antfu/no-top-level-await': 'off',
  },
})
