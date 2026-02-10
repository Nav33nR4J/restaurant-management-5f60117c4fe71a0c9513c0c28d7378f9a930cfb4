import { useCallback } from "react";
import { UserData } from "../store/authSlice";
import {
    validateDOB,
    validateEmail,
    validateMinLength,
    validatePhone,
    validateRequired,
} from "../utils/validation";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dob?: string;
  email?: string;
}

export const useProfileValidation = () => {
  // Validate a single field and return error message if any
  const validateSingleField = useCallback(
    (field: keyof UserData, value: string): string | undefined => {
      switch (field) {
        case "firstName": {
          const requiredResult = validateRequired(value.trim(), "First name");
          if (!requiredResult.isValid) return requiredResult.error;
          const minLengthResult = validateMinLength(value.trim(), "First name", 2);
          if (!minLengthResult.isValid) return minLengthResult.error;
          return undefined;
        }
        case "lastName": {
          const requiredResult = validateRequired(value.trim(), "Last name");
          if (!requiredResult.isValid) return requiredResult.error;
          const minLengthResult = validateMinLength(value.trim(), "Last name", 2);
          if (!minLengthResult.isValid) return minLengthResult.error;
          return undefined;
        }
        case "phone": {
          const phoneResult = validatePhone(value.trim(), "Phone number", 10);
          return phoneResult.isValid ? undefined : phoneResult.error;
        }
        case "address": {
          const requiredResult = validateRequired(value, "Address");
          if (!requiredResult.isValid) return requiredResult.error;
          return undefined;
        }
        case "dob": {
          const dobResult = validateDOB(value.trim());
          return dobResult.isValid ? undefined : dobResult.error;
        }
        case "email": {
          const emailResult = validateEmail(value.trim(), "Email");
          return emailResult.isValid ? undefined : emailResult.error;
        }
        default:
          return undefined;
      }
    },
    []
  );

  // Validate entire form
  const validateForm = useCallback(
    (formData: UserData): FormErrors => {
      const errors: FormErrors = {};

      (Object.keys(formData) as Array<keyof UserData>).forEach((field) => {
        const error = validateSingleField(field, formData[field]);
        if (error) {
          errors[field] = error;
        }
      });

      return errors;
    },
    [validateSingleField]
  );

  return { validateSingleField, validateForm };
};

