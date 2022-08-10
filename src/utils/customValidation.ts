import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'number-or-string-or-boolean', async: false })
export class IsNumberOrStringOrBoolean implements ValidatorConstraintInterface {
    validate(value: any, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
        return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean';
    }
    defaultMessage?(validationArguments?: ValidationArguments): string {
        return '($value) must be number or string or boolean';
    }
}
