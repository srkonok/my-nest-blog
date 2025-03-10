import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, getSchemaPath } from '@nestjs/swagger';

interface ApiResponseOptions {
  status?: number;
  description?: string;
  type?: Type<any>;
  isArray?: boolean;
}

/**
 * Custom decorator for standardized API responses
 * @param options Response options
 * @returns Decorator
 */
export const ApiStandardResponse = (options: ApiResponseOptions = {}) => {
  const {
    status = 200,
    description = 'Successful operation',
    type,
    isArray = false,
  } = options;

  // If no type is provided, return a simple ApiResponse
  if (!type) {
    return applyDecorators(
      ApiResponse({
        status,
        description,
        schema: {
          allOf: [
            { $ref: getSchemaPath('SuccessResponse') },
            {
              properties: {
                data: {
                  type: 'object',
                  example: {},
                },
              },
            },
          ],
        },
      }),
    );
  }

  // If type is provided, include it in the response schema
  return applyDecorators(
    ApiExtraModels(type),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath('SuccessResponse') },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(type) },
                  }
                : {
                    $ref: getSchemaPath(type),
                  },
            },
          },
        ],
      },
    }),
  );
};

/**
 * Custom decorator for standardized API error responses
 * @param status HTTP status code
 * @param description Error description
 * @returns Decorator
 */
export const ApiStandardErrorResponse = (
  status: number,
  description: string,
) => {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        $ref: getSchemaPath('ErrorResponse'),
      },
    }),
  );
}; 