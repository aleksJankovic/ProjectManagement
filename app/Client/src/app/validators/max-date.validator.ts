import {AbstractControl, ValidatorFn} from "@angular/forms";

export function maxDateValidator(maxDate: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const inputDate = new Date(control.value);
    if (inputDate > maxDate) {
      return { 'maxDate': true };
    }
    return null;
  };
}
