module.exports = {
    env: {
        es6: true,
        node: true
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 6,
        ecmaFeatures: {
            impliedStrict: true
        },
        sourceType: "module"
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    rules: {
        "max-len": ["error", { "code": 150 }],
        "require-await": "off",
        "no-console": "error",
        "semi": "off",
        "@typescript-eslint/semi": ["error"],
        "@typescript-eslint/explicit-function-return-type": ["error"],
        "@typescript-eslint/no-unused-vars": ["error"],
        "@typescript-eslint/require-await": "error",
        "@typescript-eslint/indent": ["error", 4]
    }
};
