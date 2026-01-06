import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to parse form-data body fields
 * When using FileInterceptor, body fields come as strings and need parsing
 */
export const ParsedBody = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const body = request.body;

    // If body is already an object (JSON request), return as is
    if (typeof body === 'object' && !Array.isArray(body)) {
      // Parse string values that look like JSON
      const parsed: any = {};
      for (const key in body) {
        if (typeof body[key] === 'string') {
          // Try to parse JSON strings
          try {
            parsed[key] = JSON.parse(body[key]);
          } catch {
            // If not JSON, keep as string
            parsed[key] = body[key];
          }
        } else {
          parsed[key] = body[key];
        }
      }
      return parsed;
    }

    return body;
  },
);

