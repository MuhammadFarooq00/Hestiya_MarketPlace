import * as Yup from "yup";

export const signupInitialValues = {
  company_name: "",
  industry: "",
  country: null,
  countryCode: "",
  company_size: "",
  mobile_no: "",
  first_name: "",
  last_name: "",
  gender: "",
  email: "",
  profile_picture: null,
  terms: false,
  // privacyPolicy: true,
};
export const loginInitialValues = {
  email: "",
  password: "",
}
export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
})
export const signupValidationCompanySchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  company_name: Yup.string().required("Company name is required"),

  industry: Yup.string().required("Industry is required"),
  company_size: Yup.string().required("Company size is required"),

  profile_picture: Yup.mixed()
    .nullable() // Allow null values
    .test(
      "fileType",
      "Unsupported file format. Only jpg or png allowed",
      (value) =>
        !value || (value && ["image/jpeg", "image/png"].includes(value.type)) // Allow empty or valid types
    ),
  email: Yup.string()
    .test("valid-email", "Invalid email format or domain", (value) => {
      // Basic structure check
      if (!value) return false;
      
      // Basic email format check
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) return false;
      
      // Get the TLD (last part after the dot)
      const tld = value.split('.').pop().toLowerCase();
      
      // List of valid TLDs (you can add more as needed)
      const validTLDs = [
        'com', 'net', 'org', 'edu', 'gov', 'mil', 'biz', 'info', 'mobi',
        'name', 'aero', 'asia', 'cat', 'coop', 'int', 'jobs', 'museum',
        'post', 'pro', 'tel', 'travel', 'xxx', 'ac', 'ad', 'ae', 'af',
        'ag', 'ai', 'al', 'am', 'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw',
        'ax', 'az', 'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj',
        'bm', 'bn', 'bo', 'br', 'bs', 'bt', 'bw', 'by', 'bz', 'ca', 'cc',
        'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cr',
        'cu', 'cv', 'cw', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'do',
        'dz', 'ec', 'ee', 'eg', 'es', 'et', 'eu', 'fi', 'fj', 'fk', 'fm',
        'fo', 'fr', 'ga', 'gb', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl',
        'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy', 'hk',
        'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il', 'im', 'in', 'io',
        'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke', 'kg', 'kh',
        'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc',
        'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md',
        'me', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr',
        'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne',
        'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa',
        'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt',
        'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb', 'sc',
        'sd', 'se', 'sg', 'sh', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sr',
        'ss', 'st', 'sv', 'sx', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th',
        'tj', 'tk', 'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz',
        'ua', 'ug', 'uk', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi',
        'vn', 'vu', 'wf', 'ws', 'ye', 'yt', 'za', 'zm', 'zw' , 'xyz'
      ];
      
      return validTLDs.includes(tld);
    })
    .required("Email address is required"),
  terms: Yup.boolean().oneOf(
    [true],
    "You must accept the terms and conditions"
  ),
  // privacyPolicy: Yup.boolean().oneOf(
  //   [true],
  //   "You must accept the privacy policy"
  // ),
  mobile_no: Yup.string()
    .required("Mobile number is required")
    .matches(
      /^\+?(\d{1,4})[-.\s]?(\d{7,10})$/,
      "Please enter a valid mobile number"
    ),
});
export const signupValidationSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  company_name: Yup.string(),
  profile_picture: Yup.mixed()
    .nullable() // Allow null values
    .test(
      "fileType",
      "Unsupported file format. Only jpg or png allowed",
      (value) =>
        !value || (value && ["image/jpeg", "image/png"].includes(value.type)) // Allow empty or valid types
    ),
  email: Yup.string()
    .test("valid-email", "Invalid email format or domain", (value) => {
      // Basic structure check
      if (!value) return false;
      
      // Basic email format check
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) return false;
      
      // Get the TLD (last part after the dot)
      const tld = value.split('.').pop().toLowerCase();
      
      // List of valid TLDs (you can add more as needed)
      const validTLDs = [
        'com', 'net', 'org', 'edu', 'gov', 'mil', 'biz', 'info', 'mobi',
        'name', 'aero', 'asia', 'cat', 'coop', 'int', 'jobs', 'museum',
        'post', 'pro', 'tel', 'travel', 'xxx', 'ac', 'ad', 'ae', 'af',
        'ag', 'ai', 'al', 'am', 'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw',
        'ax', 'az', 'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj',
        'bm', 'bn', 'bo', 'br', 'bs', 'bt', 'bw', 'by', 'bz', 'ca', 'cc',
        'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cr',
        'cu', 'cv', 'cw', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'do',
        'dz', 'ec', 'ee', 'eg', 'es', 'et', 'eu', 'fi', 'fj', 'fk', 'fm',
        'fo', 'fr', 'ga', 'gb', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl',
        'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy', 'hk',
        'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il', 'im', 'in', 'io',
        'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke', 'kg', 'kh',
        'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc',
        'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md',
        'me', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr',
        'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne',
        'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa',
        'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt',
        'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb', 'sc',
        'sd', 'se', 'sg', 'sh', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sr',
        'ss', 'st', 'sv', 'sx', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th',
        'tj', 'tk', 'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz',
        'ua', 'ug', 'uk', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi',
        'vn', 'vu', 'wf', 'ws', 'ye', 'yt', 'za', 'zm', 'zw' , 'xyz'
      ];
      
      return validTLDs.includes(tld);
    })
    .required("Email address is required"),
  terms: Yup.boolean().oneOf(
    [true],
    "You must accept the terms and conditions"
  ),
  // privacyPolicy: Yup.boolean().oneOf(
  //   [true],
  //   "You must accept the privacy policy"
  // ),
  mobile_no: Yup.string()
    .required("Mobile number is required")
    .matches(
      /^\+?(\d{1,4})[-.\s]?(\d{7,10})$/,
      "Please enter a valid mobile number"
    ),
});

export const emailModelInitialValues = {
  email: "",
};
export const emailModelValidationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
});
