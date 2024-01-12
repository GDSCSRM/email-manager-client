import { minLength, object, parse, string, ValiError } from "valibot";
import type { BaseSchema, Input } from "valibot";

const SignInSchema = object({
  username: string("Username is required", [
    minLength(3, "Username is required"),
  ]),
  password: string("Password is required", [
    minLength(3, "Password is required"),
  ]),
});

type ValidatedForm<Schema extends BaseSchema> =
  | {
      success: true;
      data: Input<Schema>;
    }
  | {
      success: false;
      errors: Record<string, string>;
    };

const validateForm =
  <T extends BaseSchema>(schema: T) =>
  (data: Record<string, any>): ValidatedForm<T> => {
    try {
      const parsed = parse(schema, data);
      return { success: true, data: parsed };
    } catch (error) {
      if (error instanceof ValiError) {
        let errors: Record<string, any> = {};
        error.issues.forEach((issue) => {
          if (issue.path) {
            errors[String(issue.path[0].key)] = issue.message;
          }
        });
        return { success: false, errors: errors };
      }

      return { success: false, errors: {} };
    }
  };

export const validateSignIn = validateForm(SignInSchema);
