import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'src/main.js',
    context: 'this',
    output: {
        file: 'dist/plugin.js',
        format: 'es'
    },
    plugins: [nodeResolve({
        browser: true
    })]
}
