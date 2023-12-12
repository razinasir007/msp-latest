import * as Yup from "yup";
export const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  number: Yup.string().required("Phone number is required"),
  // .matches(
  //     /^([0]{1}|\+?[234]{3})([7-9]{1})([0|1]{1})([\d]{1})([\d]{7})$/g,
  //     "Invalid phone number"
  // )
  // address: Yup.string()
  //     .min(2, "Too Short!")
  //     .max(50, "Too Long!")
  //     .required("Address is required"),
  website: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Website is required"),
});
