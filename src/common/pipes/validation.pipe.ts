import { ValidationPipe, ValidationPipeOptions, HttpStatus, UnprocessableEntityException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]) => {
    const formattedErrors = formatValidationErrors(errors);
    return new UnprocessableEntityException({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  },
};

function formatValidationErrors(errors: ValidationError[], parentField = ''): Record<string, string[]> {
  return errors.reduce((acc, error) => {
    const field = parentField ? `${parentField}.${error.property}` : error.property;
    
    if (error.constraints) {
      acc[field] = Object.values(error.constraints);
    }
    
    if (error.children && error.children.length > 0) {
      const childErrors = formatValidationErrors(error.children, field);
      Object.assign(acc, childErrors);
    }
    
    return acc;
  }, {});
}

export const createValidationPipe = (): ValidationPipe => {
  return new ValidationPipe(validationPipeOptions);
}; 