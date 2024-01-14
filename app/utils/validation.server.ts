import {
  email,
  minLength,
  object,
  optional,
  parse,
  startsWith,
  string,
  ValiError,
} from "valibot";
import type { BaseSchema, Input } from "valibot";

const SignInSchema = object({
  username: string("Username is required", [
    minLength(3, "Username is required"),
  ]),
  password: string("Password is required", [
    minLength(3, "Password is required"),
  ]),
});

const AddUserSchema = object({
  email: string("Email is required", [
    email("Please enter a valid email address"),
  ]),
  username: string("Username is required", [
    minLength(3, "Username is required"),
  ]),
  password: string("Password is required", [
    minLength(3, "Password is required"),
  ]),
});

const DeleteUserSchema = object({
  email: string("Email is required", [
    email("Please enter a valid email address"),
  ]),
});

const AddEntrySchema = object({
  email: string("Email is required", [
    email("Please enter a valid email address"),
  ]),
  name: optional(string("Name must be a string")),
  registrationNumber: optional(
    string("Registration number must be a string", [
      startsWith("RA", "Enter a valid registration number"),
    ]),
  ),
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
export const validateAddUser = validateForm(AddUserSchema);
export const validateDeleteUser = validateForm(DeleteUserSchema);
export const validateAddEntry = validateForm(AddEntrySchema);
