import { ValidationArguments, registerDecorator, ValidationOptions, } from 'class-validator';
import { isPassword } from '../services/functions.service';

export function IsPassword(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isPassword',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return typeof value === 'string' && isPassword(value); // you can return a Promise<boolean> here as well, if you want to make async validation
                },
            },
        });
    };
}
