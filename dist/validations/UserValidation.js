"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const ValidationState_1 = require("./ValidationState");
exports.UserValidation = () => new ValidationState_1.Validation({
    username: [
        {
            errorMessage: "name must be greater than 2 characters",
            validation: (val) => val.length > 2,
        },
    ],
    password: [
        {
            errorMessage: "password cannot be password",
            validation: (val) => val !== 'password',
        }
    ]
});
//# sourceMappingURL=UserValidation.js.map