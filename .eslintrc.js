module.exports = {
    "env": {
        "browser": true,
        "node":true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "warn",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": ["error", "single", {
            avoidEscape: true,
            allowTemplateLiterals: true
        }]
    },
     "parserOptions": {
         "ecmaVersion": 2017
    },
    "globals": {
        "appRoot": true,
        "mongoose": false
    }
 
};