import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("esnext", "node", "plugin:@typescript-eslint/recommended"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        "accessor-pairs": "warn",
        "arrow-parens": ["warn", "as-needed"],
        "block-spacing": "warn",
        "default-case-last": "error",
        "default-param-last": "error",
        "dot-location": ["warn", "property"],
        eqeqeq: "warn",
        "func-names": ["error", "as-needed"],
        "import/no-unresolved": "off",

        indent: ["error", 4, {
            SwitchCase: 1,
        }],

        "linebreak-style": ["error", "unix"],
        "new-parens": "warn",
        "no-cond-assign": "off",
        "no-constructor-return": "error",
        "no-console": "off",

        "no-magic-numbers": ["warn", {
            ignore: [0, 1, 2],
            ignoreDefaultValues: true,
            ignoreClassFieldInitialValues: true,
        }],

        "no-useless-constructor": "off",
        "class-methods-use-this": "off",
        "no-return-assign": "warn",
        "no-shadow": "warn",
        "no-void": "error",
        "no-whitespace-before-property": "warn",
        "object-shorthand": ["warn", "consistent-as-needed"],
        "operator-assignment": "warn",
        "prefer-object-has-own": "warn",
        "prefer-object-spread": "warn",
        "prefer-promise-reject-errors": "error",
        "prefer-template": "warn",
        "rest-spread-spacing": "warn",
        "require-await": "warn",
        semi: ["warn", "always"],

        "space-before-function-paren": ["warn", {
            anonymous: "never",
            named: "never",
            asyncArrow: "always",
        }],

        "switch-colon-spacing": "warn",
        yoda: "warn",
    },
}, {
    files: ["**/*.ts"],

    rules: {
        "prefer-const": "warn",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-extra-semi": "off",
    },
}]);